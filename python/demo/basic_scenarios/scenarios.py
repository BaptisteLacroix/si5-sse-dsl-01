"""
Implementation of the 4 basic scenarios using the ArduinoML DSL
"""

from pyArduinoML.methodchaining.AppBuilder import AppBuilder
from pyArduinoML.model.SIGNAL import HIGH, LOW


def scenario1_very_simple_alarm():
    """
    Scenario 1: Very Simple Alarm
    Pushing a button activates a LED and a buzzer.
    Releasing the button switches the actuators off.
    """
    app = AppBuilder("Very_Simple_Alarm") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .actuator("BUZZER").on_pin(12) \
        .state("off") \
            .set("LED").to(LOW) \
            .set("BUZZER").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .set("BUZZER").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()

    print("=== Scenario 1: Very Simple Alarm ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario2_dual_check_alarm():
    """
    Scenario 2: Dual-Check Alarm
    It will trigger a buzzer if and only if two buttons are pushed at the very same time.
    Releasing at least one of the button stops the sound.

    Note: This scenario requires both buttons to be HIGH to activate the buzzer.
    In the current DSL, we implement this by checking one button in each state.
    """
    app = AppBuilder("Dual_Check_Alarm") \
        .sensor("BUTTON1").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .actuator("BUZZER").on_pin(12) \
        .state("off") \
            .set("BUZZER").to(LOW) \
            .when("BUTTON1").has_value(HIGH).go_to_state("button1_pressed") \
        .state("button1_pressed") \
            .set("BUZZER").to(LOW) \
            .when("BUTTON2").has_value(HIGH).go_to_state("both_pressed") \
        .state("both_pressed") \
            .set("BUZZER").to(HIGH) \
            .when("BUTTON1").has_value(LOW).go_to_state("off") \
        .get_contents()

    print("=== Scenario 2: Dual-Check Alarm ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario3_state_based_alarm():
    """
    Scenario 3: State-Based Alarm
    Pushing the button once switches the system in a mode where the LED is switched on.
    Pushing it again switches it off.
    """
    app = AppBuilder("State_Based_Alarm") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(12) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .get_contents()

    print("=== Scenario 3: State-Based Alarm ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app


def scenario4_multi_state_alarm():
    """
    Scenario 4: Multi-State Alarm
    Pushing the button starts the buzz noise.
    Pushing it again stops the buzzer and switches the LED on.
    Pushing it again switches the LED off, and makes the system ready to make noise again.
    """
    app = AppBuilder("Multi_State_Alarm") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(11) \
        .actuator("BUZZER").on_pin(12) \
        .state("off") \
            .set("LED").to(LOW) \
            .set("BUZZER").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("buzzing") \
        .state("buzzing") \
            .set("LED").to(LOW) \
            .set("BUZZER").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("led_on") \
        .state("led_on") \
            .set("LED").to(HIGH) \
            .set("BUZZER").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .get_contents()

    print("=== Scenario 4: Multi-State Alarm ===")
    print(app)
    filepath = app.save()
    print(f"\nSaved to: {filepath}\n")
    return app

def scenario5_smart_home_security():
    """
    Scénario 5 : Sécurité Intelligente d'une Maison

    Système de sécurité simplifié utilisant le matériel disponible :
    - BUTTON1 (pin 9) : Interrupteur d'armement/désarmement
    - BUTTON2 (pin 10) : Capteur de porte (simulé par un bouton)
    - POTENTIOMETER (pin A1) : Capteur de mouvement (seuil de détection)
    - LED1 (pin 11) : Voyant d'état du système (éteint = désarmé, allumé = armé)
    - LED2 (pin 12) : LED d'alarme
    - BUZZER (pin 8) : Sirène d'alarme

    États :
    - désarmé : Le système est désactivé
    - armé : Le système surveille la porte
    - porte_ouverte : La porte est ouverte, vérification du mouvement
    - intrusion_détectée : Alarme complète activée
    """
    app = AppBuilder("Smart_Home_Security") \
        .sensor("ARM_BUTTON").on_pin(8) \
        .sensor("DOOR_SENSOR").on_pin(9) \
        .sensor("MOTION_DETECTOR").on_pin(1) \
        .actuator("STATUS_LED").on_pin(10) \
        .actuator("ALARM_LED").on_pin(11) \
        .actuator("SIREN").on_pin(12) \
        .state("disarmed") \
            .set("STATUS_LED").to(LOW) \
            .set("ALARM_LED").to(LOW) \
            .set("SIREN").to(LOW) \
            .when("ARM_BUTTON").has_value(HIGH).go_to_state("armed") \
        .state("armed") \
            .set("STATUS_LED").to(HIGH) \
            .set("ALARM_LED").to(LOW) \
            .set("SIREN").to(LOW) \
            .when("DOOR_SENSOR").has_value(HIGH).go_to_state("door_open") \
        .state("door_open") \
            .set("STATUS_LED").to(HIGH) \
            .set("ALARM_LED").to(LOW) \
            .set("SIREN").to(LOW) \
            .when("MOTION_DETECTOR").has_value(HIGH).go_to_state("intrusion_detected") \
        .state("intrusion_detected") \
            .set("STATUS_LED").to(HIGH) \
            .set("ALARM_LED").to(HIGH) \
            .set("SIREN").to(HIGH) \
            .when("ARM_BUTTON").has_value(HIGH).go_to_state("disarmed") \
        .get_contents()

    print("=== Scénario 5 : Sécurité Intelligente d'une Maison ===")
    print(app)
    filepath = app.save()
    print(f"\nSauvegardé dans : {filepath}\n")
    return app




if __name__ == '__main__':
    print("Generating all basic scenarios...\n")
    scenario1_very_simple_alarm()
    scenario2_dual_check_alarm()
    scenario3_state_based_alarm()
    scenario4_multi_state_alarm()
    scenario5_smart_home_security()
    print("All scenarios generated successfully!")

