"""
Semantic Validator for ArduinoML DSL
This module performs semantic validation beyond syntax checking.
"""

from bnf_parser import ParseNode


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
            parse_tree: ParseNode from BNF parser

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
        if not isinstance(node, ParseNode):
            return

        method_name = f'_visit_{node.type}'
        if hasattr(self, method_name):
            getattr(self, method_name)(node)
        else:
            # Visit children by default
            for child in node.children:
                self._visit(child)

    def _visit_application(self, node):
        """Visit application node and extract app name"""
        # Extract app name
        for child in node.children:
            if child.type == 'app_name':
                self.app_name = child.value
                if not self.app_name:
                    self.errors.append("Application name cannot be empty")
                break

        # Visit all children to collect bricks and states
        for child in node.children:
            self._visit(child)

    def _visit_bricks(self, node):
        """Visit bricks container"""
        for child in node.children:
            self._visit(child)

    def _visit_sensor(self, node):
        """Visit sensor declaration"""
        name = None
        pin = None

        for child in node.children:
            if child.type == 'name':
                name = child.value
            elif child.type == 'pin':
                pin = child.value

        if name:
            if name in self.bricks:
                self.errors.append(
                    f"Duplicate brick name '{name}': already declared as {self.bricks[name]}"
                )
            else:
                self.bricks[name] = 'sensor'

    def _visit_actuator(self, node):
        """Visit actuator declaration"""
        name = None
        pin = None

        for child in node.children:
            if child.type == 'name':
                name = child.value
            elif child.type == 'pin':
                pin = child.value

        if name:
            if name in self.bricks:
                self.errors.append(
                    f"Duplicate brick name '{name}': already declared as {self.bricks[name]}"
                )
            else:
                self.bricks[name] = 'actuator'

    def _visit_states(self, node):
        """Visit states container"""
        for child in node.children:
            self._visit(child)

    def _visit_state(self, node):
        """Visit state declaration"""
        state_name = None

        for child in node.children:
            if child.type == 'name':
                state_name = child.value
                if state_name in self.states:
                    self.errors.append(f"Duplicate state name '{state_name}'")
                else:
                    self.states.add(state_name)
                break

        # Visit children to check actions and transitions
        for child in node.children:
            self._visit(child)

    def _visit_actions(self, node):
        """Visit actions container"""
        for child in node.children:
            self._visit(child)

    def _visit_action(self, node):
        """Visit action node and check if actuator exists"""
        actuator_name = None
        signal_value = None

        for child in node.children:
            if child.type == 'actuator':
                actuator_name = child.value
            elif child.type == 'signal':
                signal_value = child.value

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

        for child in node.children:
            if child.type == 'sensor':
                sensor_name = child.value
            elif child.type == 'signal':
                signal_value = child.value
            elif child.type == 'next_state':
                target_state = child.value

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
            if child.type == 'next_state':
                target_state = child.value
            else:
                self._visit(child)

        if target_state:
            self.target_states.append(target_state)

    def _visit_conditions(self, node):
        """Visit conditions container"""
        for child in node.children:
            self._visit(child)

    def _visit_condition(self, node):
        """Visit condition tuple in AND/OR transitions"""
        sensor_name = None
        signal_value = None

        for child in node.children:
            if child.type == 'sensor':
                sensor_name = child.value
            elif child.type == 'signal':
                signal_value = child.value

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
        parse_tree: ParseNode from BNF parser

    Returns:
        Tuple of (is_valid: bool, errors: list, warnings: list)
    """
    validator = SemanticValidator()
    return validator.validate(parse_tree)
