"""
Test script to validate invalid ArduinoML scenarios
This demonstrates what errors the validator catches
"""

from invalid_scenarios import (
    invalid_scenario1_missing_get_contents,
    invalid_scenario2_missing_state,
    invalid_scenario3_state_without_transition,
    invalid_scenario4_state_without_action,
    invalid_scenario5_wrong_signal,
    invalid_scenario6_missing_pin_number,
    invalid_scenario7_invalid_pin_number,
    invalid_scenario8_misspelled_keyword,
    invalid_scenario9_wrong_method_order,
    invalid_scenario10_missing_go_to_state,
    invalid_scenario11_empty_app_name,
    invalid_scenario12_duplicate_brick_names,
)
from validator import ScenarioValidator


def test_invalid_scenarios():
    """Test all invalid scenarios to see what errors they produce"""
    print("\n" + "=" * 80)
    print("Testing INVALID Scenarios - Expecting Failures")
    print("=" * 80 + "\n")

    validator = ScenarioValidator()

    # Get all invalid scenario functions
    invalid_funcs = [
        (invalid_scenario1_missing_get_contents, "Invalid 1: Missing get_contents()"),
        (invalid_scenario2_missing_state, "Invalid 2: No states defined"),
        (invalid_scenario3_state_without_transition, "Invalid 3: State without transition"),
        (invalid_scenario4_state_without_action, "Invalid 4: State without action"),
        (invalid_scenario5_wrong_signal, "Invalid 5: Wrong signal value"),
        (invalid_scenario6_missing_pin_number, "Invalid 6: Missing pin number"),
        (invalid_scenario7_invalid_pin_number, "Invalid 7: Invalid pin type"),
        (invalid_scenario8_misspelled_keyword, "Invalid 8: Misspelled keyword"),
        (invalid_scenario9_wrong_method_order, "Invalid 9: Wrong method order"),
        (invalid_scenario10_missing_go_to_state, "Invalid 10: Missing go_to_state()"),
        (invalid_scenario11_empty_app_name, "Invalid 11: Empty app name"),
        (invalid_scenario12_duplicate_brick_names, "Invalid 12: Duplicate brick names"),
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
