"""
Custom BNF Parser for ArduinoML DSL
This module provides a recursive descent parser based on the BNF grammar
defined in PROJECT_REPORT.md Section 5.1
"""

import re
from typing import List, Tuple, Optional, Dict, Any


class Token:
    """Represents a token in the DSL"""
    def __init__(self, type: str, value: str, position: int):
        self.type = type
        self.value = value
        self.position = position

    def __repr__(self):
        return f"Token({self.type}, {self.value!r}, {self.position})"


class Lexer:
    """Tokenizer for ArduinoML DSL"""

    TOKEN_PATTERNS = [
        ('KEYWORD', r'\b(AppBuilder|get_contents|sensor|actuator|on_pin|state|set|to|when|has_value|go_to_state|when_all|when_any|when_condition)\b'),
        ('SIGNAL', r'\b(HIGH|LOW)\b'),
        ('STRING', r'"[^"]*"'),
        ('NUMBER', r'\d+'),
        ('DOT', r'\.'),
        ('LPAREN', r'\('),
        ('RPAREN', r'\)'),
        ('COMMA', r','),
        ('WHITESPACE', r'\s+'),
    ]

    def __init__(self, code: str):
        self.code = code
        self.position = 0
        self.tokens = []
        self._tokenize()

    def _tokenize(self):
        """Convert the input code into a list of tokens"""
        while self.position < len(self.code):
            matched = False

            for token_type, pattern in self.TOKEN_PATTERNS:
                regex = re.compile(pattern)
                match = regex.match(self.code, self.position)

                if match:
                    value = match.group(0)
                    if token_type != 'WHITESPACE':  # Skip whitespace
                        self.tokens.append(Token(token_type, value, self.position))
                    self.position = match.end()
                    matched = True
                    break

            if not matched:
                raise SyntaxError(f"Unexpected character at position {self.position}: {self.code[self.position]}")

    def get_tokens(self) -> List[Token]:
        """Return the list of tokens"""
        return self.tokens


class ParseNode:
    """Represents a node in the parse tree"""
    def __init__(self, type: str, value: Any = None, children: List['ParseNode'] = None):
        self.type = type
        self.value = value
        self.children = children or []

    def __repr__(self):
        if self.value:
            return f"ParseNode({self.type}, {self.value!r})"
        return f"ParseNode({self.type}, children={len(self.children)})"

    def to_dict(self) -> Dict:
        """Convert to dictionary representation"""
        result = {'type': self.type}
        if self.value:
            result['value'] = self.value
        if self.children:
            result['children'] = [child.to_dict() for child in self.children]
        return result


class BNFParser:
    """
    Recursive Descent Parser for ArduinoML DSL

    Grammar (from PROJECT_REPORT.md Section 5.1):

    <application> ::= AppBuilder(<app_name>)
                      <brick_decl>*
                      <state_decl>+
                      .get_contents()

    <brick_decl> ::= <sensor_decl> | <actuator_decl>
    <sensor_decl> ::= .sensor(<name>).on_pin(<pin_number>)
    <actuator_decl> ::= .actuator(<name>).on_pin(<pin_number>)

    <state_decl> ::= .state(<state_name>)
                     <action>+
                     <transition>

    <action> ::= .set(<actuator_name>).to(<signal>)

    <transition> ::= <simple_transition>
                   | <and_transition>
                   | <or_transition>

    <simple_transition> ::= .when(<sensor_name>)
                            .has_value(<signal>)
                            .go_to_state(<state_name>)

    <and_transition> ::= .when_all(<condition_list>)
                         .go_to_state(<state_name>)

    <or_transition> ::= .when_any(<condition_list>)
                        .go_to_state(<state_name>)
    """

    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.position = 0

    def current_token(self) -> Optional[Token]:
        """Get current token without consuming it"""
        if self.position < len(self.tokens):
            return self.tokens[self.position]
        return None

    def consume(self, expected_type: str = None, expected_value: str = None) -> Token:
        """Consume and return the current token"""
        token = self.current_token()

        if token is None:
            raise SyntaxError(f"Unexpected end of input, expected {expected_type or expected_value}")

        if expected_type and token.type != expected_type:
            raise SyntaxError(f"Expected token type {expected_type}, got {token.type} at position {token.position}")

        if expected_value and token.value != expected_value:
            raise SyntaxError(f"Expected '{expected_value}', got '{token.value}' at position {token.position}")

        self.position += 1
        return token

    def peek(self, offset: int = 0) -> Optional[Token]:
        """Look ahead at token without consuming"""
        pos = self.position + offset
        if pos < len(self.tokens):
            return self.tokens[pos]
        return None

    def parse(self) -> ParseNode:
        """Parse the entire application"""
        return self.parse_application()

    def parse_application(self) -> ParseNode:
        """
        <application> ::= AppBuilder(<app_name>)
                          <brick_decl>*
                          <state_decl>+
                          .get_contents()
        """
        node = ParseNode('application')

        # AppBuilder
        self.consume('KEYWORD', 'AppBuilder')
        self.consume('LPAREN')
        app_name = self.consume('STRING')
        node.children.append(ParseNode('app_name', app_name.value.strip('"')))
        self.consume('RPAREN')

        # Brick declarations (sensor/actuator)*
        bricks = []
        while self.current_token() and self.current_token().type == 'DOT':
            # Peek ahead to see if it's a sensor/actuator or state
            next_token = self.peek(1)
            if next_token and next_token.value in ['sensor', 'actuator']:
                bricks.append(self.parse_brick_decl())
            else:
                break

        if bricks:
            brick_node = ParseNode('bricks', children=bricks)
            node.children.append(brick_node)

        # State declarations (must have at least one)
        states = []
        while self.current_token() and self.current_token().type == 'DOT':
            # Peek ahead to see if it's a state
            next_token = self.peek(1)
            if next_token and next_token.value == 'state':
                states.append(self.parse_state_decl())
            else:
                break

        if not states:
            raise SyntaxError("At least one state declaration is required")

        states_node = ParseNode('states', children=states)
        node.children.append(states_node)

        # .get_contents()
        self.consume('DOT')
        self.consume('KEYWORD', 'get_contents')
        self.consume('LPAREN')
        self.consume('RPAREN')

        return node

    def parse_brick_decl(self) -> ParseNode:
        """
        <brick_decl> ::= <sensor_decl> | <actuator_decl>
        """
        self.consume('DOT')
        keyword = self.current_token()

        if keyword.value == 'sensor':
            return self.parse_sensor_decl()
        elif keyword.value == 'actuator':
            return self.parse_actuator_decl()
        else:
            raise SyntaxError(f"Expected 'sensor' or 'actuator', got '{keyword.value}'")

    def parse_sensor_decl(self) -> ParseNode:
        """
        <sensor_decl> ::= .sensor(<name>).on_pin(<pin_number>)
        """
        node = ParseNode('sensor')

        # Already consumed DOT in parse_brick_decl
        self.consume('KEYWORD', 'sensor')
        self.consume('LPAREN')
        name = self.consume('STRING')
        node.children.append(ParseNode('name', name.value.strip('"')))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'on_pin')
        self.consume('LPAREN')
        pin = self.consume('NUMBER')
        node.children.append(ParseNode('pin', int(pin.value)))
        self.consume('RPAREN')

        return node

    def parse_actuator_decl(self) -> ParseNode:
        """
        <actuator_decl> ::= .actuator(<name>).on_pin(<pin_number>)
        """
        node = ParseNode('actuator')

        # Already consumed DOT in parse_brick_decl
        self.consume('KEYWORD', 'actuator')
        self.consume('LPAREN')
        name = self.consume('STRING')
        node.children.append(ParseNode('name', name.value.strip('"')))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'on_pin')
        self.consume('LPAREN')
        pin = self.consume('NUMBER')
        node.children.append(ParseNode('pin', int(pin.value)))
        self.consume('RPAREN')

        return node

    def parse_state_decl(self) -> ParseNode:
        """
        <state_decl> ::= .state(<state_name>)
                         <action>+
                         <transition>
        """
        node = ParseNode('state')

        self.consume('DOT')
        self.consume('KEYWORD', 'state')
        self.consume('LPAREN')
        state_name = self.consume('STRING')
        node.children.append(ParseNode('name', state_name.value.strip('"')))
        self.consume('RPAREN')

        # Actions (at least one)
        actions = []
        while self.current_token() and self.current_token().type == 'DOT':
            # Peek ahead to see if it's an action (set)
            next_token = self.peek(1)
            if next_token and next_token.value == 'set':
                actions.append(self.parse_action())
            else:
                break

        if not actions:
            raise SyntaxError(f"State must have at least one action")

        actions_node = ParseNode('actions', children=actions)
        node.children.append(actions_node)

        # Transition (exactly one)
        transition = self.parse_transition()
        node.children.append(transition)

        return node

    def parse_action(self) -> ParseNode:
        """
        <action> ::= .set(<actuator_name>).to(<signal>)
        """
        node = ParseNode('action')

        self.consume('DOT')
        self.consume('KEYWORD', 'set')
        self.consume('LPAREN')
        actuator = self.consume('STRING')
        node.children.append(ParseNode('actuator', actuator.value.strip('"')))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'to')
        self.consume('LPAREN')
        signal = self.consume('SIGNAL')
        node.children.append(ParseNode('signal', signal.value))
        self.consume('RPAREN')

        return node

    def parse_transition(self) -> ParseNode:
        """
        <transition> ::= <simple_transition>
                       | <and_transition>
                       | <or_transition>
        """
        self.consume('DOT')
        keyword = self.current_token()

        if keyword.value == 'when':
            return self.parse_simple_transition()
        elif keyword.value == 'when_all':
            return self.parse_and_transition()
        elif keyword.value == 'when_any':
            return self.parse_or_transition()
        else:
            raise SyntaxError(f"Expected transition keyword (when/when_all/when_any), got '{keyword.value}'")

    def parse_simple_transition(self) -> ParseNode:
        """
        <simple_transition> ::= .when(<sensor_name>)
                                .has_value(<signal>)
                                .go_to_state(<state_name>)
        """
        node = ParseNode('simple_transition')

        # Already consumed DOT in parse_transition
        self.consume('KEYWORD', 'when')
        self.consume('LPAREN')
        sensor = self.consume('STRING')
        node.children.append(ParseNode('sensor', sensor.value.strip('"')))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'has_value')
        self.consume('LPAREN')
        signal = self.consume('SIGNAL')
        node.children.append(ParseNode('signal', signal.value))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'go_to_state')
        self.consume('LPAREN')
        next_state = self.consume('STRING')
        node.children.append(ParseNode('next_state', next_state.value.strip('"')))
        self.consume('RPAREN')

        return node

    def parse_and_transition(self) -> ParseNode:
        """
        <and_transition> ::= .when_all(<condition_list>)
                             .go_to_state(<state_name>)
        """
        node = ParseNode('and_transition')

        # Already consumed DOT in parse_transition
        self.consume('KEYWORD', 'when_all')
        self.consume('LPAREN')
        conditions = self.parse_condition_list()
        node.children.append(ParseNode('conditions', children=conditions))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'go_to_state')
        self.consume('LPAREN')
        next_state = self.consume('STRING')
        node.children.append(ParseNode('next_state', next_state.value.strip('"')))
        self.consume('RPAREN')

        return node

    def parse_or_transition(self) -> ParseNode:
        """
        <or_transition> ::= .when_any(<condition_list>)
                            .go_to_state(<state_name>)
        """
        node = ParseNode('or_transition')

        # Already consumed DOT in parse_transition
        self.consume('KEYWORD', 'when_any')
        self.consume('LPAREN')
        conditions = self.parse_condition_list()
        node.children.append(ParseNode('conditions', children=conditions))
        self.consume('RPAREN')

        self.consume('DOT')
        self.consume('KEYWORD', 'go_to_state')
        self.consume('LPAREN')
        next_state = self.consume('STRING')
        node.children.append(ParseNode('next_state', next_state.value.strip('"')))
        self.consume('RPAREN')

        return node

    def parse_condition_list(self) -> List[ParseNode]:
        """
        Parse condition list: (<sensor>, <signal>), (<sensor>, <signal>), ...
        """
        conditions = []

        # First condition
        conditions.append(self.parse_condition_tuple())

        # Additional conditions
        while self.current_token() and self.current_token().type == 'COMMA':
            self.consume('COMMA')
            conditions.append(self.parse_condition_tuple())

        return conditions

    def parse_condition_tuple(self) -> ParseNode:
        """
        Parse a single condition tuple: (<sensor>, <signal>)
        """
        node = ParseNode('condition')

        self.consume('LPAREN')
        sensor = self.consume('STRING')
        node.children.append(ParseNode('sensor', sensor.value.strip('"')))
        self.consume('COMMA')
        signal = self.consume('SIGNAL')
        node.children.append(ParseNode('signal', signal.value))
        self.consume('RPAREN')

        return node


class ArduinoMLBNFParser:
    """Main parser interface for ArduinoML DSL using custom BNF parser"""

    def __init__(self):
        pass

    def parse(self, code: str) -> ParseNode:
        """
        Parse ArduinoML DSL code and return parse tree

        Args:
            code: String containing ArduinoML DSL code

        Returns:
            ParseNode representing the parse tree
        """
        # Tokenize
        lexer = Lexer(code)
        tokens = lexer.get_tokens()

        # Parse
        parser = BNFParser(tokens)
        tree = parser.parse()

        return tree

    def validate(self, code: str) -> Tuple[bool, str, Optional[ParseNode]]:
        """
        Validate ArduinoML DSL code

        Args:
            code: String containing the DSL code to parse

        Returns:
            Tuple of (success: bool, message: str, tree: Optional[ParseNode])
        """
        try:
            tree = self.parse(code)
            return True, "Parsing successful!", tree
        except SyntaxError as e:
            return False, f"Syntax error: {e}", None
        except Exception as e:
            return False, f"Parse error: {e}", None

    def extract_dsl_from_python(self, python_code: str) -> str:
        """
        Extract DSL code from Python function source code

        Args:
            python_code: Python source code containing AppBuilder chain

        Returns:
            String containing just the DSL chain
        """
        lines = python_code.strip().split('\n')
        dsl_lines = []
        in_chain = False

        for line in lines:
            stripped = line.strip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                continue

            if 'AppBuilder(' in stripped:
                in_chain = True
                # Remove everything before AppBuilder
                start_idx = stripped.find('AppBuilder(')
                stripped = stripped[start_idx:]

            if in_chain:
                # Remove trailing backslashes used for line continuation
                stripped = stripped.rstrip('\\').strip()
                if stripped:
                    dsl_lines.append(stripped)

                if '.get_contents()' in stripped:
                    break

        return ''.join(dsl_lines)


# Convenience function
def parse_dsl(code: str) -> ParseNode:
    """Parse ArduinoML DSL code"""
    parser = ArduinoMLBNFParser()
    return parser.parse(code)


def validate_dsl(code: str) -> Tuple[bool, str, Optional[ParseNode]]:
    """Validate ArduinoML DSL code"""
    parser = ArduinoMLBNFParser()
    return parser.validate(code)
