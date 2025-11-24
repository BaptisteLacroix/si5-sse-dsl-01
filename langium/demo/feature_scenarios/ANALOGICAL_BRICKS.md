# Handling Analogical Bricks - Implementation

## Overview

ArduinoML now supports analogical bricks (sensors and actuators) in addition to digital bricks. This allows for threshold-based detection and PWM control.

## Grammar Extensions

### New Brick Types

-   **`AnalogSensor`**: Reads analog values (0-1023) from analog pins

    ```
    AnalogSensor name : pin
    ```

-   **`AnalogActuator`**: Writes analog values (0-255) to PWM pins
    ```
    AnalogActuator name : pin
    ```

### Actions with Analog Actuators

Analog actuators can be set to:

1. **Constant integer values** (0-255 for PWM):

    ```
    buzzer <= 200
    ```

2. **Values from analog sensors**:
    ```
    led <= potentiometer
    ```

### Conditions with Analog Sensors

Analog sensors support threshold comparisons:

```
tempSensor > 300 => alarm
potentiometer <= 512 => normal
```

Supported operators: `>`, `<`, `>=`, `<=`, `==`, `!=`

## Code Generation

### Setup Phase

-   Analog sensors: `pinMode(pin, INPUT)`
-   Analog actuators: `pinMode(pin, OUTPUT)`

### Loop Phase

-   Reading analog sensors: `analogRead(pin)` returns 0-1023
-   Writing to analog actuators: `analogWrite(pin, value)` expects 0-255
-   No debouncing for analog sensors (continuous readings)

## Example: Fire Detection System

```aml
app FireDetection initial state monitoring {
    bricks
        AnalogSensor tempSensor : 0      // Potentiometer on A0
        AnalogActuator buzzer : 9         // PWM buzzer on pin 9

    states
        monitoring {
            buzzer <= 0                   // Buzzer off
            tempSensor > 300 => alarm     // Threshold detection
        }
        alarm {
            buzzer <= 200                 // Buzzer at medium intensity
            tempSensor <= 300 => monitoring
        }
}
```

## Generated Arduino Code

```cpp
void loop() {
    switch(currentState){
        case monitoring:
            analogWrite(9,0);
            if( (analogRead(0) > 300) ) {
                currentState = alarm;
            }
        break;
        case alarm:
            analogWrite(9,200);
            if( (analogRead(0) <= 300) ) {
                currentState = monitoring;
            }
        break;
    }
}
```

## Hardware Setup

-   **Potentiometer**: Connect to A0 (analog pin 0) to simulate temperature sensor
-   **Buzzer**: Connect to pin 9 (PWM-capable) with appropriate resistor
-   Rotate potentiometer to increase analog value
-   When value exceeds 300 (~1.5V), buzzer sounds at intensity 200/255

## Acceptance Test

✅ Potentiometer simulates temperature sensor  
✅ Threshold-based alarm detection (> 300 ≈ 57°C)  
✅ Buzzer sounds when threshold exceeded  
✅ System returns to monitoring when temperature drops
