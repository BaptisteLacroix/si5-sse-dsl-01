# Complex Conditions with Priority and Precedence

## Operator Precedence

The generated Arduino code uses parentheses to ensure correct evaluation order:

1. **Innermost conditions** are evaluated first
2. **AND operators** bind more tightly than OR operators (when mixed at the same level)
3. **NOT operators** apply to their immediate argument
4. **Parentheses** override default precedence

## API Methods

### 1. Simple Conditions (Backward Compatible)
```python
.when("BUTTON").has_value(HIGH).go_to_state("on")
```

### 2. Simple AND/OR Conditions
```python
.when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("on")
.when_any(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("on")
```

### 3. Complex Nested Conditions
```python
.when_condition(lambda bricks: AndCondition(
    OrCondition(...),
    SensorCondition(...),
    NotCondition(...)
)).go_to_state("target")
```

## Real-World Scenarios

### Scenario 1: Access Control System

**Business Logic:**  
Access granted when:
- **(Admin card AND admin PIN)** OR
- **(User card AND user PIN AND biometric)**

**DSL Code:**
```python
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
)).go_to_state("unlocked")
```

**Generated Arduino:**
```cpp
if (((digitalRead(ADMIN_CARD) == HIGH && digitalRead(ADMIN_PIN) == HIGH) || 
     (digitalRead(USER_CARD) == HIGH && digitalRead(USER_PIN) == HIGH && 
      digitalRead(BIOMETRIC) == HIGH)) && guard)
```

**Precedence:** `(A && B) || (C && D && E)`

### Scenario 2: Smart Climate Control

**Business Logic:**  
Heating activates when:
- **((Temperature low AND window closed) OR frost alert) AND power available**

**DSL Code:**
```python
.when_condition(lambda bricks: AndCondition(
    OrCondition(
        AndCondition(
            SensorCondition(bricks["TEMP_LOW"], HIGH),
            SensorCondition(bricks["WINDOW_CLOSED"], HIGH)
        ),
        SensorCondition(bricks["FROST_ALERT"], HIGH)
    ),
    SensorCondition(bricks["POWER_AVAILABLE"], HIGH)
)).go_to_state("heating_on")
```

**Generated Arduino:**
```cpp
if ((((digitalRead(TEMP_LOW) == HIGH && digitalRead(WINDOW_CLOSED) == HIGH) || 
      digitalRead(FROST_ALERT) == HIGH) && 
      digitalRead(POWER_AVAILABLE) == HIGH) && guard)
```

**Precedence:** `((A && B) || C) && D`  
Shows OR nested inside AND

### Scenario 3: Industrial Safety System

**Business Logic:**  
Emergency shutdown when:
- **(Pressure high OR temperature high) AND**
- **(Operator override is OFF) AND**
- **(Sensor1 OR sensor2 OR sensor3)**

**DSL Code:**
```python
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
)).go_to_state("emergency_stop")
```

**Generated Arduino:**
```cpp
if (((digitalRead(PRESSURE_HIGH) == HIGH || digitalRead(TEMP_HIGH) == HIGH) && 
     digitalRead(OPERATOR_OVERRIDE) == LOW && 
     (digitalRead(SENSOR1) == HIGH || digitalRead(SENSOR2) == HIGH || 
      digitalRead(SENSOR3) == HIGH)) && guard)
```

**Precedence:** `(A || B) && C && (D || E || F)`  
Multiple OR groups combined with AND

### Scenario 4: Smart Parking Barrier

**Business Logic:**  
Barrier opens when:
- **(Valid ticket OR subscription OR emergency) AND**
- **(No obstacle detected) AND**
- **(Payment OK OR subscription OR emergency)**

**DSL Code:**
```python
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
)).go_to_state("open")
```

**Generated Arduino:**
```cpp
if (((digitalRead(VALID_TICKET) == HIGH || digitalRead(SUBSCRIPTION_CARD) == HIGH || 
      digitalRead(EMERGENCY_BUTTON) == HIGH) && 
     digitalRead(NO_OBSTACLE) == HIGH && 
     (digitalRead(PAYMENT_OK) == HIGH || digitalRead(SUBSCRIPTION_CARD) == HIGH || 
      digitalRead(EMERGENCY_BUTTON) == HIGH)) && guard)
```

**Precedence:** `(A || B || C) && D && (E || B || C)`  
Demonstrates shared conditions in multiple OR groups

### Scenario 5: Advanced Alarm with Zones

**Business Logic:**  
Alarm triggers when armed and:
- **((Zone1 motion OR zone1 door) OR (zone2 motion OR zone2 glass)) AND**
- **(Safe zone is NOT secure)**

**DSL Code:**
```python
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
)).go_to_state("alarm_triggered")
```

**Generated Arduino:**
```cpp
if ((digitalRead(ARMED) == HIGH && 
     ((digitalRead(ZONE1_MOTION) == HIGH || digitalRead(ZONE1_DOOR) == HIGH) || 
      (digitalRead(ZONE2_MOTION) == HIGH || digitalRead(ZONE2_GLASS) == HIGH)) && 
     !(digitalRead(ZONE3_SAFE) == HIGH)) && guard)
```

**Precedence:** `A && ((B || C) || (D || E)) && !F`  
Deeply nested OR with NOT operator

## Precedence Rules Summary

### Table of Operator Precedence (Highest to Lowest)

| Priority | Operator | Example | Arduino Output |
|----------|----------|---------|----------------|
| 1 | NOT | `NotCondition(A)` | `!(A)` |
| 2 | AND | `AndCondition(A, B)` | `(A && B)` |
| 3 | OR | `OrCondition(A, B)` | `(A \|\| B)` |

**Note:** Parentheses in the DSL code control precedence explicitly. Each composite condition generates its own parentheses in the Arduino code.

### Nesting Examples

| DSL Structure | Precedence | Arduino Code |
|---------------|------------|--------------|
| `And(Or(A,B), C)` | OR then AND | `((A \|\| B) && C)` |
| `Or(And(A,B), C)` | AND then OR | `((A && B) \|\| C)` |
| `And(A, Or(B,C), D)` | OR inside AND | `(A && (B \|\| C) && D)` |
| `Or(And(A,B), And(C,D))` | Two ANDs in OR | `((A && B) \|\| (C && D))` |

## Architecture Benefits

1. **Type Safety**: Compile-time validation using Python type system
2. **Composability**: Build complex conditions from simple ones
3. **Readability**: DSL code mirrors business logic
4. **Maintainability**: Easy to modify condition structure
5. **Correctness**: Automatic parentheses ensure proper precedence
6. **Extensibility**: Easy to add new operators (XOR, NAND, etc.)

## Comparison: Before vs After

### Before (Manual State Management)
```python
.state("off")
    .when("BUTTON1").has_value(HIGH).go_to_state("button1_pressed")
.state("button1_pressed")
    .when("BUTTON2").has_value(HIGH).go_to_state("both_pressed")
.state("both_pressed")
    .when("BUTTON1").has_value(LOW).go_to_state("off")
```
**Issues:** 3 states needed, complex to maintain, prone to errors

### After (Composite Pattern)
```python
.state("off")
    .when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH)).go_to_state("both_pressed")
.state("both_pressed")
    .when_any(("BUTTON1", LOW), ("BUTTON2", LOW)).go_to_state("off")
```
**Benefits:** 2 states only, clear intent, easier to maintain
