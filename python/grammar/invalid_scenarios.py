"""
Invalid ArduinoML DSL Examples
These scenarios contain intentional syntax errors to demonstrate
what fails validation and why.
"""

from pyArduinoML.methodchaining.AppBuilder import AppBuilder
from pyArduinoML.model.SIGNAL import HIGH, LOW


def invalid_scenario1_missing_get_contents():
    """
    ERROR: Missing .get_contents() at the end
    This will fail because the DSL chain must end with .get_contents()
    """
    app = AppBuilder("Invalid_Missing_End") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off")
    # Missing .get_contents() here!

    return app


def invalid_scenario2_missing_state():
    """
    ERROR: No states defined
    An application must have at least one state
    """
    app = AppBuilder("Invalid_No_States") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .get_contents()

    return app


def invalid_scenario3_state_without_transition():
    """
    ERROR: State has no transition
    Every state must have exactly one transition
    """
    app = AppBuilder("Invalid_No_Transition") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
        .get_contents()

    return app


def invalid_scenario4_state_without_action():
    """
    ERROR: State has transition but no action
    Every state must have at least one action before the transition
    """
    app = AppBuilder("Invalid_No_Action") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario5_wrong_signal():
    """
    ERROR: Invalid signal value
    Signal must be HIGH or LOW (case-sensitive)
    """
    app = AppBuilder("Invalid_Wrong_Signal") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(low) \
            .when("BUTTON").has_value(high).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario6_missing_pin_number():
    """
    ERROR: Sensor/Actuator declared without pin number
    All bricks must have a pin number
    """
    app = AppBuilder("Invalid_No_Pin") \
        .sensor("BUTTON") \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario7_invalid_pin_number():
    """
    ERROR: Pin number is not a number
    Pin numbers must be integers
    """
    app = AppBuilder("Invalid_Pin_Type") \
        .sensor("BUTTON").on_pin("nine") \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario8_misspelled_keyword():
    """
    ERROR: Misspelled method name
    'states' instead of 'state'
    """
    app = AppBuilder("Invalid_Misspelled") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .states("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario9_wrong_method_order():
    """
    ERROR: Methods in wrong order
    States must come after brick declarations
    """
    app = AppBuilder("Invalid_Wrong_Order") \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario10_missing_go_to_state():
    """
    ERROR: Transition without target state
    .when().has_value() must be followed by .go_to_state()
    """
    app = AppBuilder("Invalid_Incomplete_Transition") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH) \
        .get_contents()

    return app


def invalid_scenario11_empty_app_name():
    """
    ERROR: Empty application name
    Application name must be a non-empty string
    """
    app = AppBuilder() \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


def invalid_scenario12_duplicate_brick_names():
    """
    ERROR: Two bricks with the same name
    Brick names must be unique
    """
    app = AppBuilder("Invalid_Duplicate_Names") \
        .sensor("BTN").on_pin(9) \
        .sensor("BTN").on_pin(10) \
        .actuator("LED").on_pin(11) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BTN").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BTN").has_value(LOW).go_to_state("off") \
        .get_contents()

    return app


if __name__ == '__main__':
    print("These scenarios contain intentional errors and should fail validation!")
    print("Run the validator to see the specific error messages for each one.\n")

    invalid_scenarios = [
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
    ]

    for scenario in invalid_scenarios:
        print(f"- {scenario.__name__}: {scenario.__doc__.strip().split(chr(10))[0]}")

