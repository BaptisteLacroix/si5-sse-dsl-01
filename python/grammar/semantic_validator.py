"""
Semantic Validator for ArduinoML DSL
This module performs semantic validation beyond syntax checking.
"""

from lark import Tree, Token


class SemanticValidator:
    """Validates semantic rules for ArduinoML DSL"""

    def __init__(self):
        self.errors = []
        self.warnings = []
        self.bricks = {}  # name -> type (sensor/actuator)
        self.states = set()
        self.app_name = None
        self.target_states = []

    def validate(self, parse_tree):
        """
        Perform semantic validation on a parse tree

        Args:
            parse_tree: Lark parse tree from successful syntax parsing

        Returns:
            Tuple of (is_valid: bool, errors: list, warnings: list)
        """
        self.errors = []
        self.warnings = []
        self.bricks = {}
        self.states = set()
        self.app_name = None
        self.target_states = []

        # Visit the tree and collect information
        self._visit(parse_tree)

        # Validate target states exist
        self.validate_target_states()

        return len(self.errors) == 0, self.errors, self.warnings

    def _visit(self, node):
        """Visit a node in the parse tree"""
        if isinstance(node, Tree):
            method_name = f'_visit_{node.data}'
            if hasattr(self, method_name):
                getattr(self, method_name)(node)
            else:
                # Visit children by default
                for child in node.children:
                    self._visit(child)
        # Token nodes don't need visiting

    def _visit_application(self, node):
        """Visit application node and extract app name"""
        # Extract app name from first string token
        for child in node.children:
            if isinstance(child, Tree) and child.data == 'string':
                for token in child.children:
                    if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                        self.app_name = token.value.strip('"\'')
                        if not self.app_name:
                            self.errors.append("Application name cannot be empty")
                        break
                break

        # Visit all children to collect bricks and states
        for child in node.children:
            self._visit(child)

    def _visit_sensor_decl(self, node):
        """Visit sensor declaration"""
        name = None
        pin = None

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            name = token.value.strip('"\'')
                elif child.data == 'number':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'NUMBER':
                            pin = int(token.value)

        if name:
            if name in self.bricks:
                self.errors.append(
                    f"Duplicate brick name '{name}': already declared as {self.bricks[name]}"
                )
            else:
                self.bricks[name] = 'sensor'

    def _visit_actuator_decl(self, node):
        """Visit actuator declaration"""
        name = None
        pin = None

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            name = token.value.strip('"\'')
                elif child.data == 'number':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'NUMBER':
                            pin = int(token.value)

        if name:
            if name in self.bricks:
                self.errors.append(
                    f"Duplicate brick name '{name}': already declared as {self.bricks[name]}"
                )
            else:
                self.bricks[name] = 'actuator'

    def _visit_state_decl(self, node):
        """Visit state declaration"""
        state_name = None

        for child in node.children:
            if isinstance(child, Tree) and child.data == 'string':
                for token in child.children:
                    if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                        state_name = token.value.strip('"\'')
                        if state_name in self.states:
                            self.errors.append(f"Duplicate state name '{state_name}'")
                        else:
                            self.states.add(state_name)
                        break
                break

        # Visit children to check actions and transitions
        for child in node.children:
            self._visit(child)

    def _visit_action(self, node):
        """Visit action node and check if actuator exists"""
        actuator_name = None
        signal_value = None

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            actuator_name = token.value.strip('"\'')
                elif child.data == 'signal':
                    for token in child.children:
                        if isinstance(token, Token):
                            signal_value = token.value

        if actuator_name:
            if actuator_name not in self.bricks:
                self.errors.append(
                    f"Undefined brick '{actuator_name}' in action"
                )
            elif self.bricks[actuator_name] != 'actuator':
                self.errors.append(
                    f"Cannot set '{actuator_name}': it is a {self.bricks[actuator_name]}, not an actuator"
                )

        if signal_value and signal_value not in ['HIGH', 'LOW']:
            self.errors.append(
                f"Invalid signal value '{signal_value}': must be HIGH or LOW"
            )

    def _visit_simple_transition(self, node):
        """Visit simple transition and check sensor and target state"""
        sensor_name = None
        target_state = None
        signal_value = None
        string_count = 0

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            value = token.value.strip('"\'')
                            if string_count == 0:
                                sensor_name = value
                            elif string_count == 1:
                                target_state = value
                            string_count += 1
                elif child.data == 'signal':
                    for token in child.children:
                        if isinstance(token, Token):
                            signal_value = token.value

        if sensor_name:
            if sensor_name not in self.bricks:
                self.errors.append(
                    f"Undefined brick '{sensor_name}' in transition"
                )
            elif self.bricks[sensor_name] != 'sensor':
                self.errors.append(
                    f"Cannot check '{sensor_name}' in transition: it is an {self.bricks[sensor_name]}, not a sensor"
                )

        if signal_value and signal_value not in ['HIGH', 'LOW']:
            self.errors.append(
                f"Invalid signal value '{signal_value}': must be HIGH or LOW"
            )

        if target_state:
            self.target_states.append(target_state)

    def _visit_and_transition(self, node):
        """Visit AND transition"""
        self._visit_compound_transition(node)

    def _visit_or_transition(self, node):
        """Visit OR transition"""
        self._visit_compound_transition(node)

    def _visit_compound_transition(self, node):
        """Visit compound transition (AND/OR)"""
        target_state = None

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            target_state = token.value.strip('"\'')
                else:
                    self._visit(child)

        if target_state:
            self.target_states.append(target_state)

    def _visit_condition_tuple(self, node):
        """Visit condition tuple in AND/OR transitions"""
        sensor_name = None
        signal_value = None

        for child in node.children:
            if isinstance(child, Tree):
                if child.data == 'string':
                    for token in child.children:
                        if isinstance(token, Token) and token.type == 'ESCAPED_STRING':
                            sensor_name = token.value.strip('"\'')
                elif child.data == 'signal':
                    for token in child.children:
                        if isinstance(token, Token):
                            signal_value = token.value

        if sensor_name:
            if sensor_name not in self.bricks:
                self.errors.append(
                    f"Undefined brick '{sensor_name}' in condition"
                )
            elif self.bricks[sensor_name] != 'sensor':
                self.errors.append(
                    f"Cannot check '{sensor_name}' in condition: it is an {self.bricks[sensor_name]}, not a sensor"
                )

        if signal_value and signal_value not in ['HIGH', 'LOW']:
            self.errors.append(
                f"Invalid signal value '{signal_value}': must be HIGH or LOW"
            )

    def validate_target_states(self):
        """Validate that all target states are defined"""
        for target in self.target_states:
            if target not in self.states:
                self.errors.append(
                    f"Undefined state '{target}' referenced in transition"
                )


def validate_semantics(parse_tree):
    """
    Convenience function to validate semantics

    Args:
        parse_tree: Lark parse tree

    Returns:
        Tuple of (is_valid: bool, errors: list, warnings: list)
    """
    validator = SemanticValidator()
    return validator.validate(parse_tree)
