"""
Test script to validate invalid ArduinoML scenarios
This demonstrates what errors the validator catches
"""

import sys
import os

# Add grammar directory to path
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from validator import ScenarioValidator

# Import invalid scenarios
import importlib.util
spec = importlib.util.spec_from_file_location(
    "invalid_scenarios",
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo", "basic_scenarios", "invalid_scenarios.py")
)
invalid_scenarios = importlib.util.module_from_spec(spec)
spec.loader.exec_module(invalid_scenarios)


def test_invalid_scenarios():
    """Test all invalid scenarios to see what errors they produce"""
    print("\n" + "=" * 80)
    print("Testing INVALID Scenarios - Expecting Failures")
    print("=" * 80 + "\n")

    validator = ScenarioValidator()

    # Get all invalid scenario functions
    invalid_funcs = [
        (invalid_scenarios.invalid_scenario1_missing_get_contents, "Invalid 1: Missing get_contents()"),
        (invalid_scenarios.invalid_scenario2_missing_state, "Invalid 2: No states defined"),
        (invalid_scenarios.invalid_scenario3_state_without_transition, "Invalid 3: State without transition"),
        (invalid_scenarios.invalid_scenario4_state_without_action, "Invalid 4: State without action"),
        (invalid_scenarios.invalid_scenario5_wrong_signal, "Invalid 5: Wrong signal value"),
        (invalid_scenarios.invalid_scenario6_missing_pin_number, "Invalid 6: Missing pin number"),
        (invalid_scenarios.invalid_scenario7_invalid_pin_number, "Invalid 7: Invalid pin type"),
        (invalid_scenarios.invalid_scenario8_misspelled_keyword, "Invalid 8: Misspelled keyword"),
        (invalid_scenarios.invalid_scenario9_wrong_method_order, "Invalid 9: Wrong method order"),
        (invalid_scenarios.invalid_scenario10_missing_go_to_state, "Invalid 10: Missing go_to_state()"),
        (invalid_scenarios.invalid_scenario11_empty_app_name, "Invalid 11: Empty app name"),
        (invalid_scenarios.invalid_scenario12_duplicate_brick_names, "Invalid 12: Duplicate brick names"),
    ]

    for func, name in invalid_funcs:
        validator.validate_function(func, name)

    # Print report
    validator.print_report()

    # Count how many failed (which is what we expect!)
    failed = sum(1 for r in validator.results if not r['success'])
    print(f"\n✓ Successfully caught {failed} invalid scenarios!")


if __name__ == '__main__':
    test_invalid_scenarios()
