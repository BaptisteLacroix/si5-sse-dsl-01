# Parallel Periodic Region - Implementation

## Overview

ArduinoML now supports the definition of multiple parallel state machines, each running with a specific period. This extension solves the problem of expressing orthogonal periodic behaviors where interleaving all actions and timings in a single state machine becomes unmanageable. The generated code leverages multi-tasking libraries like SimpleTimer or TaskScheduler for Arduino.

## Grammar Extensions

### App Structure

The app structure now contains `machines` instead of a single state machine:
```
app name {
    bricks
        ...

    machines
        machine name1 period X ms initial state stateA { ... }
        machine name2 period Y ms initial state stateB { ... }
}
```

### State Machine Definition

Each state machine has its own execution period:
```
machine machineName period 400 ms initial state initialStateName {
    states
        stateName1 { ... }
        stateName2 { ... }
}
```

- **name**: Unique identifier for the state machine
- **period**: Execution interval in milliseconds
- **initial state**: Reference to the starting state

## Code Generation

### Library Integration

The generated code uses the SimpleTimer library:
```cpp
#include <SimpleTimer.h>

SimpleTimer timer;
```

### Setup Phase

Each state machine is registered with its period:
```cpp
void setup() {
    // Pin modes
    pinMode(10, OUTPUT);  // LED1
    pinMode(11, OUTPUT);  // LED2
    pinMode(8, INPUT);    // B1
    pinMode(9, INPUT);    // B2

    // Register periodic tasks
    timer.setInterval(400, toggleMachineLoop);
    timer.setInterval(50, pushMachineLoop);
}
```

### Loop Phase

Main loop delegates to timer:
```cpp
void loop() {
    timer.run();
}
```

### State Machine Functions

Each machine has its own loop function:
```cpp
enum toggleMachineState { led1Off, led1On };
toggleMachineState toggleMachineCurrent = led1Off;

void toggleMachineLoop() {
    switch(toggleMachineCurrent) {
        case led1Off:
            digitalWrite(10, LOW);
            if(digitalRead(8) == HIGH) {
                toggleMachineCurrent = led1On;
            }
            break;
        case led1On:
            digitalWrite(10, HIGH);
            if(digitalRead(8) == HIGH) {
                toggleMachineCurrent = led1Off;
            }
            break;
    }
}
```

## Example: Dual Button Controller

```aml
app ParallelPeriodicButtons {
    bricks
        Actuator LED1 : 10
        Actuator LED2 : 11
        Sensor B1 : 8
        Sensor B2 : 9

    machines
        machine toggleMachine period 400 ms initial state led1Off {
            states
                led1Off {
                    LED1 <= LOW
                    B1 is HIGH => led1On
                }
                led1On {
                    LED1 <= HIGH
                    B1 is HIGH => led1Off
                }
        }

        machine pushMachine period 50 ms initial state led2Off {
            states
                led2Off {
                    LED2 <= LOW
                    B2 is HIGH => led2On
                }
                led2On {
                    LED2 <= HIGH
                    B2 is LOW => led2Off
                }
        }
}
```

## Generated Arduino Code

```cpp
#include <SimpleTimer.h>

SimpleTimer timer;

// Toggle Machine
enum toggleMachineState { led1Off, led1On };
toggleMachineState toggleMachineCurrent = led1Off;

// Push Machine
enum pushMachineState { led2Off, led2On };
pushMachineState pushMachineCurrent = led2Off;

void setup() {
    // Actuators
    pinMode(10, OUTPUT);  // LED1
    pinMode(11, OUTPUT);  // LED2

    // Sensors
    pinMode(8, INPUT);    // B1
    pinMode(9, INPUT);    // B2

    // Register machines with their periods
    timer.setInterval(400, toggleMachineLoop);
    timer.setInterval(50, pushMachineLoop);
}

void loop() {
    timer.run();
}

void toggleMachineLoop() {
    switch(toggleMachineCurrent) {
        case led1Off:
            digitalWrite(10, LOW);
            if(digitalRead(8) == HIGH) {
                toggleMachineCurrent = led1On;
            }
            break;
        case led1On:
            digitalWrite(10, HIGH);
            if(digitalRead(8) == HIGH) {
                toggleMachineCurrent = led1Off;
            }
            break;
    }
}

void pushMachineLoop() {
    switch(pushMachineCurrent) {
        case led2Off:
            digitalWrite(11, LOW);
            if(digitalRead(9) == HIGH) {
                pushMachineCurrent = led2On;
            }
            break;
        case led2On:
            digitalWrite(11, HIGH);
            if(digitalRead(9) == LOW) {
                pushMachineCurrent = led2Off;
            }
            break;
    }
}
```

## Hardware Setup

- **LED1**: Connect to pin 10 with appropriate resistor
- **LED2**: Connect to pin 11 with appropriate resistor
- **B1**: Connect to pin 8 with pull-down resistor
- **B2**: Connect to pin 9 with pull-down resistor

## Library Dependencies

Install one of the following libraries via Arduino Library Manager:
- **SimpleTimer**: https://playground.arduino.cc/Code/SimpleTimer
- **TaskScheduler**: https://playground.arduino.cc/Code/TaskScheduler

## Acceptance Tests

### Parallel Execution
- User can define multiple independent state machines
- Each machine runs at its specified period
- Machines operate concurrently without interference

### Period Configuration
- User can specify different periods for each machine (e.g., 400ms, 50ms)
- Periods are respected by the timer library

### State Machine Independence
- Each machine maintains its own state
- Transitions in one machine don't affect others
- Each machine can reference shared sensors/actuators

### Acceptance Scenario
- B1 checked every 400ms to toggle LED1
- B2 checked every 50ms to control LED2 (on when pressed, off when released)
- Both behaviors execute in parallel without complex state interleaving
