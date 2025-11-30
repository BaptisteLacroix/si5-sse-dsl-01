## Basic Scenarios

### Scenario 1: Very Simple Alarm
> Pushing a button activates a LED and a buzzer. Releasing the button switches
the actuators off

```python
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
```

Generated file: `Very_Simple_Alarm.ino`

### Scenario 2: Dual-Check Alarm
> It will trigger a buzzer if and only if two buttons are pushed at the very same
time. Releasing at least one of the button stop the sound.

```python
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
```

Generated file: `Dual_Check_Alarm.ino`

### Scenario 3: State-Based Alarm
> Pushing the button once switches the system in a mode where the LED is
switched on. Pushing it again switches it off.

```python
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
```

Generated file: `State_Based_Alarm.ino`

### Scenario 4: Multi-State Alarm
> Pushing the button starts the buzz noise. Pushing it again stop the buzzer and
switch the LED on. Pushing it again switch the LED off, and makes the system ready to make noise
again after one push, and so on.

```python
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
```

Generated file: `Multi_State_Alarm.ino`

---

## How to Use

To generate all scenarios and automatically save them as `.ino` files:

```bash
cd C:\Users\bapti\OneDrive\Documents\Ecole\Polytech\Semestre9_bis\si5-sse-dsl-01\python
set PYTHONPATH=%CD%
python demo\basic_scenarios\scenarios.py
```

Or run individual scenario functions from the `scenarios.py` file.

All generated `.ino` files are automatically saved to the `demo/generated/` folder.
