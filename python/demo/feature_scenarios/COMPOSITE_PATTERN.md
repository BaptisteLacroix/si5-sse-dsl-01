# Composite Pattern for Conditions

This document describes the Composite Pattern implementation for AND/OR conditions in the ArduinoML DSL.

## Architecture

### Class Hierarchy

```
Condition (Abstract Base)
├── SensorCondition (Leaf)
├── AndCondition (Composite)
├── OrCondition (Composite)
└── NotCondition (Decorator)
```

### Key Components

1. **Condition**: Abstract base class for all conditions
2. **SensorCondition**: Leaf node representing a single sensor check
3. **AndCondition**: Composite node for logical AND operations
4. **OrCondition**: Composite node for logical OR operations
5. **NotCondition**: Decorator for logical NOT operations

## DSL API

### Simple Condition (Backward Compatible)

```python
.when("BUTTON").has_value(HIGH).go_to_state("on")
```

### AND Condition (`when_all`)

All conditions must be true for the transition to occur.

```python
.when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("on")
```

Generates Arduino code:
```cpp
if ((digitalRead(BUTTON1) == HIGH && digitalRead(BUTTON2) == HIGH) && guard)
```

### OR Condition (`when_any`)

At least one condition must be true for the transition to occur.

```python
.when_any(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("on")
```

Generates Arduino code:
```cpp
if ((digitalRead(BUTTON1) == HIGH || digitalRead(BUTTON2) == HIGH) && guard)
```

## Example Scenarios

### 1. Dual-Check Alarm (AND)

Requires both buttons to be pressed simultaneously:

```python
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
```

### 2. Emergency Alarm (OR)

Any button can trigger the alarm:

```python
app = AppBuilder("Emergency_Alarm") \
    .sensor("BUTTON1").on_pin(9) \
    .sensor("BUTTON2").on_pin(10) \
    .sensor("BUTTON3").on_pin(11) \
    .actuator("BUZZER").on_pin(13) \
    .state("off") \
        .set("BUZZER").to(LOW) \
        .when_any(("BUTTON1", HIGH), ("BUTTON2", HIGH), ("BUTTON3", HIGH)).go_to_state("alarm") \
    .state("alarm") \
        .set("BUZZER").to(HIGH) \
        .when_all(("BUTTON1", LOW), ("BUTTON2", LOW), ("BUTTON3", LOW)).go_to_state("off") \
    .get_contents()
```

### 3. Security System (Complex Logic)

Demonstrates mixing AND/OR conditions in different states:

```python
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
```

## Benefits

1. **Cleaner Code**: Complex conditions are expressed declaratively
2. **Type Safety**: Compile-time validation of sensor names
3. **Extensibility**: Easy to add new condition types (XOR, NAND, etc.)
4. **Backward Compatibility**: Existing code using `.when()` continues to work
5. **Optimized Code Generation**: Generates efficient Arduino C code

## Implementation Details

### Transition Class Enhancement

The `Transition` class now supports both simple and composite conditions:

```python
class Transition:
    def __init__(self, sensor, value, nextstate, condition=None):
        if condition is None and sensor is not None:
            self.condition = SensorCondition(sensor, value)
        else:
            self.condition = condition
```

### State Code Generation

The `State.setup()` method uses `transition.evaluate_condition()` to generate Arduino code:

```python
condition_code = transition.evaluate_condition()
rtr += "\tif (%s && guard) { ... }" % condition_code
```

## Running Examples

To generate all composite pattern examples:

```bash
cd C:\Users\bapti\OneDrive\Documents\Ecole\Polytech\Semestre9_bis\si5-sse-dsl-01\python
set PYTHONPATH=%CD%
python demo\feature_scenarios\composite_conditions.py
```

Generated `.ino` files will be saved to `demo/generated/`.

## Future Extensions

Potential enhancements:
- **NOT condition support** in DSL API (already implemented in model)
- **Nested conditions**: `when_all(and_cond1, or_cond2)`
- **Custom operators**: XOR, NAND, NOR
- **Temporal conditions**: Timeouts, delays

