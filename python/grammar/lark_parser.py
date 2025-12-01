"""
Lark Parser for ArduinoML DSL
This module provides functionality to parse and validate ArduinoML DSL code.
"""

import inspect
import os
from pathlib import Path
from lark import Lark, LarkError
from lark.exceptions import UnexpectedInput, UnexpectedCharacters, UnexpectedToken


class ArduinoMLParser:
    """Parser for ArduinoML DSL using Lark"""

    def __init__(self, use_earley=False):
        """
        Initialize the Lark parser

        Args:
            use_earley: If True, use Earley parser (slower but handles ambiguity)
                       If False, use LALR parser (faster)
        """
        parser_type = 'earley' if use_earley else 'lalr'

        # Load grammar from .lark file
        grammar_path = os.path.join(os.path.dirname(__file__), 'arduinoml.lark')

        self.parser = Lark.open(
            grammar_path,
            parser=parser_type,
            start='start'
        )

    def parse(self, code):
        """
        Parse ArduinoML DSL code and return AST

        Args:
            code: String containing ArduinoML DSL code

        Returns:
            Dictionary representing the AST
        """
        return self.parser.parse(code)

    def validate(self, code):
        """
        Validate ArduinoML DSL code

        Args:
            code: String containing the DSL code to parse

        Returns:
            Tuple of (success: bool, message: str, tree: Optional[Tree])
        """
        try:
            tree = self.parse(code)
            return True, "Parsing successful!", tree
        except UnexpectedInput as e:
            return False, f"Syntax error at line {e.line}, column {e.column}: {e}", None
        except LarkError as e:
            return False, f"Parse error: {e}", None
        except Exception as e:
            return False, f"Unexpected error: {e}", None

    def extract_dsl_from_python(self, python_code):
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

        return ' '.join(dsl_lines)

    def validate_function(self, func):
        """
        Validate a Python function that returns an ArduinoML app

        Args:
            func: Python function to validate

        Returns:
            Tuple of (success: bool, message: str, tree: Optional[Tree])
        """
        source = inspect.getsource(func)
        dsl_code = self.extract_dsl_from_python(source)
        return self.validate(dsl_code)


# Convenience function for quick parsing
def parse_arduinoml(code, use_earley=False):
    """
    Parse ArduinoML DSL code and return AST

    Args:
        code: String containing ArduinoML DSL code
        use_earley: If True, use Earley parser instead of LALR

    Returns:
        Dictionary representing the AST
    """
    parser = ArduinoMLParser(use_earley=use_earley)
    return parser.parse(code)


if __name__ == '__main__':
    # Example usage
    parser = ArduinoMLParser()

    example_dsl = '''
    AppBuilder("Test")
        .sensor("BTN").on_pin(9)
        .actuator("LED").on_pin(11)
        .state("off")
            .set("LED").to(LOW)
            .when("BTN").has_value(HIGH).go_to_state("on")
        .state("on")
            .set("LED").to(HIGH)
            .when("BTN").has_value(LOW).go_to_state("off")
        .get_contents()
    '''

    success, message, tree = parser.validate(example_dsl)
    print(f"Validation: {message}")
    if success and tree:
        print(f"\nParse Tree:\n{tree.pretty()}")
