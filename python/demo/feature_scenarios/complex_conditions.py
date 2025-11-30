__author__ = 'complex_conditions'

"""
Implementation of scenarios with complex mixed AND/OR conditions
Demonstrates priority and precedence of composite conditions
"""

from pyArduinoML.methodchaining.AppBuilder import AppBuilder
from pyArduinoML.model.SIGNAL import HIGH, LOW
from pyArduinoML.model.Condition import SensorCondition, AndCondition, OrCondition, NotCondition


def scenario_access_control_system():
    """
    Scenario: Complex Access Control System

    Access is granted when:
    - (ADMIN_CARD is detected AND ADMIN_PIN is HIGH) OR
    - (USER_CARD is detected AND USER_PIN is HIGH AND BIOMETRIC is HIGH)

    This demonstrates: (A AND B) OR (C AND D AND E)
    """
    app = AppBuilder("Access_Control") \
        .sensor("ADMIN_CARD").on_pin(2) \
        .sensor("ADMIN_PIN").on_pin(3) \
        .sensor("USER_CARD").on_pin(4) \
        .sensor("USER_PIN").on_pin(5) \
        .sensor("BIOMETRIC").on_pin(6) \
        .actuator("DOOR_LOCK").on_pin(11) \
        .actuator("GREEN_LED").on_pin(12) \
        .actuator("RED_LED").on_pin(13) \
        .state("locked") \
            .set("DOOR_LOCK").to(HIGH) \
            .set("GREEN_LED").to(LOW) \
            .set("RED_LED").to(HIGH) \
            .when_condition(lambda bricks: OrCondition(
                AndCondition(
                    SensorCondition(bricks["ADMIN_CARD"], HIGH),
                    SensorCondition(bricks["ADMIN_PIN"], HIGH)
                ),
                AndCondition(
                    SensorCondition(bricks["USER_CARD"], HIGH),
                    SensorCondition(bricks["USER_PIN"], HIGH),
                    SensorCondition(bricks["BIOMETRIC"], HIGH)
                )
            )).go_to_state("unlocked") \
        .state("unlocked") \
            .set("DOOR_LOCK").to(LOW) \
            .set("GREEN_LED").to(HIGH) \
            .set("RED_LED").to(LOW) \
            .when_all(("ADMIN_CARD", LOW), ("USER_CARD", LOW)).go_to_state("locked") \
        .get_contents()

    print("=== Access Control System (Complex Nested Conditions) ===")
    print(app)
    filepath = app.save()
    print(f"\nCondition Logic: (ADMIN_CARD && ADMIN_PIN) || (USER_CARD && USER_PIN && BIOMETRIC)")
    print(f"Saved to: {filepath}\n")
    return app


def scenario_smart_climate_control():
    """
    Scenario: Smart Climate Control

    Heating activates when:
    - ((TEMP_LOW is HIGH AND WINDOW_CLOSED is HIGH) OR FROST_ALERT is HIGH) AND POWER_AVAILABLE is HIGH

    This demonstrates: ((A AND B) OR C) AND D
    Shows priority: nested OR inside AND
    """
    app = AppBuilder("Smart_Climate") \
        .sensor("TEMP_LOW").on_pin(2) \
        .sensor("WINDOW_CLOSED").on_pin(3) \
        .sensor("FROST_ALERT").on_pin(4) \
        .sensor("POWER_AVAILABLE").on_pin(5) \
        .actuator("HEATER").on_pin(11) \
        .actuator("STATUS_LED").on_pin(12) \
        .state("heating_off") \
            .set("HEATER").to(LOW) \
            .set("STATUS_LED").to(LOW) \
            .when_condition(lambda bricks: AndCondition(
                OrCondition(
                    AndCondition(
                        SensorCondition(bricks["TEMP_LOW"], HIGH),
                        SensorCondition(bricks["WINDOW_CLOSED"], HIGH)
                    ),
                    SensorCondition(bricks["FROST_ALERT"], HIGH)
                ),
                SensorCondition(bricks["POWER_AVAILABLE"], HIGH)
            )).go_to_state("heating_on") \
        .state("heating_on") \
            .set("HEATER").to(HIGH) \
            .set("STATUS_LED").to(HIGH) \
            .when_condition(lambda bricks: OrCondition(
                SensorCondition(bricks["TEMP_LOW"], LOW),
                SensorCondition(bricks["POWER_AVAILABLE"], LOW)
            )).go_to_state("heating_off") \
        .get_contents()

    print("=== Smart Climate Control (Nested OR inside AND) ===")
    print(app)
    filepath = app.save()
    print(f"\nCondition Logic: ((TEMP_LOW && WINDOW_CLOSED) || FROST_ALERT) && POWER_AVAILABLE")
    print(f"Saved to: {filepath}\n")
    return app


def scenario_industrial_safety_system():
    """
    Scenario: Industrial Safety System

    Emergency shutdown when:
    - (PRESSURE_HIGH is HIGH OR TEMP_HIGH is HIGH) AND
    - (OPERATOR_OVERRIDE is LOW) AND
    - (SENSOR1 is HIGH OR SENSOR2 is HIGH OR SENSOR3 is HIGH)

    This demonstrates: (A OR B) AND C AND (D OR E OR F)
    Multiple OR groups combined with AND
    """
    app = AppBuilder("Industrial_Safety") \
        .sensor("PRESSURE_HIGH").on_pin(2) \
        .sensor("TEMP_HIGH").on_pin(3) \
        .sensor("OPERATOR_OVERRIDE").on_pin(4) \
        .sensor("SENSOR1").on_pin(5) \
        .sensor("SENSOR2").on_pin(6) \
        .sensor("SENSOR3").on_pin(7) \
        .actuator("MACHINE").on_pin(11) \
        .actuator("ALARM").on_pin(12) \
        .actuator("WARNING_LIGHT").on_pin(13) \
        .state("running") \
            .set("MACHINE").to(HIGH) \
            .set("ALARM").to(LOW) \
            .set("WARNING_LIGHT").to(LOW) \
            .when_condition(lambda bricks: AndCondition(
                OrCondition(
                    SensorCondition(bricks["PRESSURE_HIGH"], HIGH),
                    SensorCondition(bricks["TEMP_HIGH"], HIGH)
                ),
                SensorCondition(bricks["OPERATOR_OVERRIDE"], LOW),
                OrCondition(
                    SensorCondition(bricks["SENSOR1"], HIGH),
                    SensorCondition(bricks["SENSOR2"], HIGH),
                    SensorCondition(bricks["SENSOR3"], HIGH)
                )
            )).go_to_state("emergency_stop") \
        .state("emergency_stop") \
            .set("MACHINE").to(LOW) \
            .set("ALARM").to(HIGH) \
            .set("WARNING_LIGHT").to(HIGH) \
            .when_condition(lambda bricks: AndCondition(
                SensorCondition(bricks["PRESSURE_HIGH"], LOW),
                SensorCondition(bricks["TEMP_HIGH"], LOW),
                SensorCondition(bricks["OPERATOR_OVERRIDE"], HIGH)
            )).go_to_state("running") \
        .get_contents()

    print("=== Industrial Safety System (Multiple OR Groups with AND) ===")
    print(app)
    filepath = app.save()
    print(f"\nCondition Logic: (PRESSURE_HIGH || TEMP_HIGH) && !OPERATOR_OVERRIDE && (SENSOR1 || SENSOR2 || SENSOR3)")
    print(f"Saved to: {filepath}\n")
    return app


def scenario_smart_parking_barrier():
    """
    Scenario: Smart Parking Barrier

    Barrier opens when:
    - (VALID_TICKET is HIGH OR SUBSCRIPTION_CARD is HIGH OR EMERGENCY_BUTTON is HIGH) AND
    - (NO_OBSTACLE is HIGH) AND
    - (PAYMENT_OK is HIGH OR SUBSCRIPTION_CARD is HIGH OR EMERGENCY_BUTTON is HIGH)

    This demonstrates: (A OR B OR C) AND D AND (E OR B OR C)
    Shared conditions in different OR groups
    """
    app = AppBuilder("Smart_Parking") \
        .sensor("VALID_TICKET").on_pin(2) \
        .sensor("SUBSCRIPTION_CARD").on_pin(3) \
        .sensor("EMERGENCY_BUTTON").on_pin(4) \
        .sensor("NO_OBSTACLE").on_pin(5) \
        .sensor("PAYMENT_OK").on_pin(6) \
        .actuator("BARRIER").on_pin(11) \
        .actuator("GREEN_LIGHT").on_pin(12) \
        .actuator("RED_LIGHT").on_pin(13) \
        .state("closed") \
            .set("BARRIER").to(LOW) \
            .set("GREEN_LIGHT").to(LOW) \
            .set("RED_LIGHT").to(HIGH) \
            .when_condition(lambda bricks: AndCondition(
                OrCondition(
                    SensorCondition(bricks["VALID_TICKET"], HIGH),
                    SensorCondition(bricks["SUBSCRIPTION_CARD"], HIGH),
                    SensorCondition(bricks["EMERGENCY_BUTTON"], HIGH)
                ),
                SensorCondition(bricks["NO_OBSTACLE"], HIGH),
                OrCondition(
                    SensorCondition(bricks["PAYMENT_OK"], HIGH),
                    SensorCondition(bricks["SUBSCRIPTION_CARD"], HIGH),
                    SensorCondition(bricks["EMERGENCY_BUTTON"], HIGH)
                )
            )).go_to_state("open") \
        .state("open") \
            .set("BARRIER").to(HIGH) \
            .set("GREEN_LIGHT").to(HIGH) \
            .set("RED_LIGHT").to(LOW) \
            .when_all(("VALID_TICKET", LOW), ("SUBSCRIPTION_CARD", LOW), ("EMERGENCY_BUTTON", LOW)).go_to_state("closed") \
        .get_contents()

    print("=== Smart Parking Barrier (Complex Shared Conditions) ===")
    print(app)
    filepath = app.save()
    print(f"\nCondition Logic: (TICKET || SUBSCRIPTION || EMERGENCY) && NO_OBSTACLE && (PAYMENT || SUBSCRIPTION || EMERGENCY)")
    print(f"Saved to: {filepath}\n")
    return app


def scenario_advanced_alarm_with_zones():
    """
    Scenario: Advanced Alarm System with Zones

    Alarm triggers when ARMED and:
    - ((ZONE1_MOTION is HIGH OR ZONE1_DOOR is HIGH) OR
       (ZONE2_MOTION is HIGH OR ZONE2_GLASS is HIGH)) AND
    - (ZONE3_SAFE is LOW)

    This demonstrates: ((A OR B) OR (C OR D)) AND E
    Nested OR groups with final AND condition
    """
    app = AppBuilder("Advanced_Alarm_Zones") \
        .sensor("ARMED").on_pin(2) \
        .sensor("ZONE1_MOTION").on_pin(3) \
        .sensor("ZONE1_DOOR").on_pin(4) \
        .sensor("ZONE2_MOTION").on_pin(5) \
        .sensor("ZONE2_GLASS").on_pin(6) \
        .sensor("ZONE3_SAFE").on_pin(7) \
        .actuator("SIREN").on_pin(11) \
        .actuator("STROBE").on_pin(12) \
        .actuator("NOTIFICATION").on_pin(13) \
        .state("standby") \
            .set("SIREN").to(LOW) \
            .set("STROBE").to(LOW) \
            .set("NOTIFICATION").to(LOW) \
            .when_condition(lambda bricks: AndCondition(
                SensorCondition(bricks["ARMED"], HIGH),
                OrCondition(
                    OrCondition(
                        SensorCondition(bricks["ZONE1_MOTION"], HIGH),
                        SensorCondition(bricks["ZONE1_DOOR"], HIGH)
                    ),
                    OrCondition(
                        SensorCondition(bricks["ZONE2_MOTION"], HIGH),
                        SensorCondition(bricks["ZONE2_GLASS"], HIGH)
                    )
                ),
                NotCondition(SensorCondition(bricks["ZONE3_SAFE"], HIGH))
            )).go_to_state("alarm_triggered") \
        .state("alarm_triggered") \
            .set("SIREN").to(HIGH) \
            .set("STROBE").to(HIGH) \
            .set("NOTIFICATION").to(HIGH) \
            .when("ARMED").has_value(LOW).go_to_state("standby") \
        .get_contents()

    print("=== Advanced Alarm with Zones (Deeply Nested OR with NOT) ===")
    print(app)
    filepath = app.save()
    print(f"\nCondition Logic: ARMED && ((ZONE1_MOTION || ZONE1_DOOR) || (ZONE2_MOTION || ZONE2_GLASS)) && !ZONE3_SAFE")
    print(f"Saved to: {filepath}\n")
    return app


if __name__ == '__main__':
    print("=" * 80)
    print("GENERATING COMPLEX CONDITION SCENARIOS")
    print("Demonstrating mixed AND/OR logic with proper precedence")
    print("=" * 80)
    print()

    scenario_access_control_system()
    scenario_smart_climate_control()
    scenario_industrial_safety_system()
    scenario_smart_parking_barrier()
    scenario_advanced_alarm_with_zones()

    print("=" * 80)
    print("All complex scenarios generated successfully!")
    print("Check the generated .ino files to see the Arduino code with proper operator precedence")
    print("=" * 80)

