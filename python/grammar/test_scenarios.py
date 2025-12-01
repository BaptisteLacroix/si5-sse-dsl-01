"""
Test script to validate all ArduinoML scenarios
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from grammar.validator import ScenarioValidator

# Import scenario modules
from demo.basic_scenarios import scenarios as basic_scenarios


def test_basic_scenarios():
    """Test all basic scenarios"""
    print("\n" + "=" * 80)
    print("Testing Basic Scenarios")
    print("=" * 80 + "\n")

    validator = ScenarioValidator()

    # Validate each scenario
    scenarios_to_test = [
        (basic_scenarios.scenario1_very_simple_alarm, "Scenario 1: Very Simple Alarm"),
        (basic_scenarios.scenario2_dual_check_alarm, "Scenario 2: Dual-Check Alarm"),
        (basic_scenarios.scenario3_state_based_alarm, "Scenario 3: State-Based Alarm"),
        (basic_scenarios.scenario4_multi_state_alarm, "Scenario 4: Multi-State Alarm"),
    ]

    for func, name in scenarios_to_test:
        validator.validate_function(func, name)

    # Print report
    all_passed = validator.print_report()

    return all_passed


if __name__ == '__main__':
    success = test_basic_scenarios()
    sys.exit(0 if success else 1)

