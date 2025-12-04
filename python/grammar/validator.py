"""
Validator for ArduinoML DSL Scenarios
This module provides validation functionality for ArduinoML scenario files.
"""

import sys
import inspect
from bnf_parser import ArduinoMLBNFParser
from semantic_validator import validate_semantics


class ScenarioValidator:
    """Validator for ArduinoML scenarios"""

    def __init__(self, check_semantics=True):
        self.parser = ArduinoMLBNFParser()
        self.results = []
        self.check_semantics = check_semantics

    def validate_function(self, func, scenario_name=None):
        """
        Validate a single scenario function

        Args:
            func: The function to validate
            scenario_name: Optional name for the scenario

        Returns:
            Tuple of (success: bool, name: str, message: str)
        """
        name = scenario_name or func.__name__

        try:
            # Extract DSL code from function
            source = inspect.getsource(func)
            dsl_code = self.parser.extract_dsl_from_python(source)

            # Validate the DSL code (syntax)
            success, message, tree = self.parser.validate(dsl_code)

            # If syntax is valid and semantic checking is enabled
            semantic_errors = []
            semantic_warnings = []
            if success and self.check_semantics and tree:
                is_valid, errors, warnings = validate_semantics(tree)
                semantic_errors = errors
                semantic_warnings = warnings

                if not is_valid:
                    success = False
                    error_list = "\n  - ".join(errors)
                    message = f"Semantic validation failed:\n  - {error_list}"

            result = {
                'name': name,
                'success': success,
                'message': message,
                'dsl_code': dsl_code,
                'tree': tree,
                'semantic_errors': semantic_errors,
                'semantic_warnings': semantic_warnings
            }
            self.results.append(result)

            return success, name, message

        except Exception as e:
            error_msg = f"Error extracting/parsing function: {e}"
            result = {
                'name': name,
                'success': False,
                'message': error_msg,
                'dsl_code': None,
                'tree': None,
                'semantic_errors': [],
                'semantic_warnings': []
            }
            self.results.append(result)
            return False, name, error_msg

    def validate_module(self, module):
        """
        Validate all scenario functions in a module

        Args:
            module: Python module containing scenario functions

        Returns:
            List of validation results
        """
        results = []

        # Find all functions that start with 'scenario'
        for name, obj in inspect.getmembers(module):
            if inspect.isfunction(obj) and name.startswith('scenario'):
                success, func_name, message = self.validate_function(obj, name)
                results.append((success, func_name, message))

        return results

    def print_report(self):
        """Print a detailed validation report"""
        print("=" * 80)
        print("ArduinoML DSL Validation Report")
        print("=" * 80)
        print()

        total = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = total - passed

        for result in self.results:
            status = "✓ PASS" if result['success'] else "✗ FAIL"
            print(f"{status} - {result['name']}")
            print(f"  Message: {result['message']}")

            if not result['success']:
                print(f"  DSL Code: {result['dsl_code'][:100]}..." if result['dsl_code'] else "  DSL Code: N/A")

            # Show warnings even for passing tests
            if result.get('semantic_warnings'):
                for warning in result['semantic_warnings']:
                    print(f"  ⚠ Warning: {warning}")

            print()

        print("=" * 80)
        print(f"Summary: {passed}/{total} scenarios passed, {failed}/{total} failed")
        print("=" * 80)

        return passed == total


def validate_scenario_file(filepath):
    """
    Validate all scenarios in a Python file

    Args:
        filepath: Path to the Python file containing scenarios

    Returns:
        True if all scenarios pass validation, False otherwise
    """
    validator = ScenarioValidator()

    # Import the module
    import importlib.util
    spec = importlib.util.spec_from_file_location("scenarios", filepath)
    module = importlib.util.module_from_spec(spec)
    sys.modules["scenarios"] = module
    spec.loader.exec_module(module)

    # Validate all scenarios
    validator.validate_module(module)

    # Print report
    return validator.print_report()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Validate specific file
        filepath = sys.argv[1]
        success = validate_scenario_file(filepath)
        sys.exit(0 if success else 1)
    else:
        print("Usage: python validator.py <scenario_file.py>")
        print("Example: python validator.py ../demo/basic_scenarios/scenarios.py")
        sys.exit(1)
