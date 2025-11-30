__author__ = 'composite_scenarios'

"""
Implementation of scenarios using the Composite Pattern for AND/OR conditions
"""

from pyArduinoML.methodchaining.AppBuilder import AppBuilder
from pyArduinoML.model.SIGNAL import HIGH, LOW


def scenario_dual_check_alarm_with_and():
    """
    Scenario: Dual-Check Alarm (using composite AND condition)
    It will trigger a buzzer if and only if two buttons are pushed at the very same time.
    Releasing at least one of the button stops the sound.

    This version uses the Composite Pattern with when_all() for cleaner code.
    """
    app = AppBuilder("Dual_Check_Alarm_AND") \
        .sensor("BUTTON1").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .actuator("BUZZER").on_pin(12) \
        .state("off") \
            .set("BUZZER").to(LOW) \
            .when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("buzzing") \
        .state("buzzing") \
            .set("BUZZER").to(HIGH) \
            .when_any(("BUTTON1", LOW), ("BUTTON2", LOW)).go_to_state("off") \
        .get_contents()

    print("=== Dual-Check Alarm (Composite AND/OR Pattern) ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario_triple_check_alarm():
    """
    Scenario: Triple-Check Alarm
    Requires all three buttons to be pressed simultaneously to activate the buzzer.
    """
    app = AppBuilder("Triple_Check_Alarm") \
        .sensor("BUTTON1").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .sensor("BUTTON3").on_pin(11) \
        .actuator("BUZZER").on_pin(12) \
        .state("off") \
            .set("BUZZER").to(LOW) \
            .when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH), ("BUTTON3", HIGH)).go_to_state("buzzing") \
        .state("buzzing") \
            .set("BUZZER").to(HIGH) \
            .when_any(("BUTTON1", LOW), ("BUTTON2", LOW), ("BUTTON3", LOW)).go_to_state("off") \
        .get_contents()

    print("=== Triple-Check Alarm (3-Button AND) ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario_emergency_alarm():
    """
    Scenario: Emergency Alarm
    Any one of multiple buttons can trigger the alarm (OR condition).
    All buttons must be released to stop it.
    """
    app = AppBuilder("Emergency_Alarm") \
        .sensor("BUTTON1").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .sensor("BUTTON3").on_pin(11) \
        .actuator("LED").on_pin(12) \
        .actuator("BUZZER").on_pin(13) \
        .state("off") \
            .set("LED").to(LOW) \
            .set("BUZZER").to(LOW) \
            .when_any(("BUTTON1", HIGH), ("BUTTON2", HIGH), ("BUTTON3", HIGH)).go_to_state("alarm") \
        .state("alarm") \
            .set("LED").to(HIGH) \
            .set("BUZZER").to(HIGH) \
            .when_all(("BUTTON1", LOW), ("BUTTON2", LOW), ("BUTTON3", LOW)).go_to_state("off") \
        .get_contents()

    print("=== Emergency Alarm (Multi-Button OR) ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario_security_system():
    """
    Scenario: Security System
    Demonstrates complex AND/OR logic:
    - System arms when both arm buttons are pressed
    - Alarm triggers if any sensor detects intrusion while armed
    - System disarms when both disarm buttons are pressed
    """
    app = AppBuilder("Security_System") \
        .sensor("ARM_BUTTON1").on_pin(2) \
        .sensor("ARM_BUTTON2").on_pin(3) \
        .sensor("MOTION_SENSOR").on_pin(4) \
        .sensor("DOOR_SENSOR").on_pin(5) \
        .actuator("STATUS_LED").on_pin(11) \
        .actuator("ALARM_BUZZER").on_pin(12) \
        .state("disarmed") \
            .set("STATUS_LED").to(LOW) \
            .set("ALARM_BUZZER").to(LOW) \
            .when_all(("ARM_BUTTON1", HIGH), ("ARM_BUTTON2", HIGH)).go_to_state("armed") \
        .state("armed") \
            .set("STATUS_LED").to(HIGH) \
            .set("ALARM_BUZZER").to(LOW) \
            .when_any(("MOTION_SENSOR", HIGH), ("DOOR_SENSOR", HIGH)).go_to_state("alarm") \
        .state("alarm") \
            .set("STATUS_LED").to(HIGH) \
            .set("ALARM_BUZZER").to(HIGH) \
            .when_all(("ARM_BUTTON1", HIGH), ("ARM_BUTTON2", HIGH)).go_to_state("disarmed") \
        .get_contents()

    print("=== Security System (Complex AND/OR Logic) ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


if __name__ == '__main__':
    print("Generating composite pattern scenarios...\n")
    scenario_dual_check_alarm_with_and()
    scenario_triple_check_alarm()
    scenario_emergency_alarm()
    scenario_security_system()
    print("All composite scenarios generated successfully!")

