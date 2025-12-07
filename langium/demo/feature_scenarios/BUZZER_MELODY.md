# Buzzer & Melody Player - Implementation

## Overview

ArduinoML now supports buzzer-based sound features for signaling and melody playing. This extension allows users to create beep patterns for alerts and play musical notes with specific durations.

## Grammar Extensions

### New Brick Type

- **`Buzzer`**: Output device for sound generation via PWM
    ```
    Buzzer name : pin
    ```

### Actions with Buzzer

#### Beep Action
Create beep patterns with repetition and duration:
```
buzzer makes 3 SHORT bips
buzzer makes 1 LONG bips
```
- **Repetition**: Number of beeps (integer)
- **Duration**: `SHORT` (100ms) or `LONG` (500ms)

#### PlayNote Action
Play musical notes with specific octave and duration:
```
buzzer plays C4 for 500 ms
buzzer plays DS5 for 200 ms
buzzer plays FS3 for 1000 ms
```
- **Note**: C, CS, D, DS, E, F, FS, G, GS, A, AS, B (S = sharp)
- **Octave**: 0-8
- **Duration**: Time in milliseconds

### Multiple Transitions

States can now have multiple outgoing transitions for interactive applications:
```
wait {
    button1 is HIGH => playMelodyA
    button2 is HIGH => playMelodyB
}
```

## Code Generation

### Setup Phase
- Buzzer: `pinMode(pin, OUTPUT)`

### Loop Phase

#### Beep Generation
```cpp
for(int i = 0; i < 3; i++) {
    tone(8, 1000, 100);
    delay(200);
}
noTone(8);
```

#### Note Generation
```cpp
tone(8, NOTE_C4, 500);
delay(650);  // duration * 1.3
noTone(8);
```

## Example 1: Alert System

```aml
app AlertSystem initial state wait {
    bricks
    Buzzer buzzer : 8
    Sensor button : 2

    states
    wait {
        button is HIGH => alert
    }
    alert {
        buzzer makes 3 SHORT bips
        buzzer makes 1 LONG bips
        button is LOW => wait
    }
}
```

## Example 2: Melody Player

```aml
app MelodyPlayer initial state wait {
    bricks
    Buzzer buzzer : 8
    Sensor button1 : 2
    Sensor button2 : 3

    states
    wait {
        button1 is HIGH => playA
        button2 is HIGH => playB
    }
    playA {
        buzzer plays C4 for 300 ms
        buzzer plays E4 for 300 ms
        buzzer plays G4 for 500 ms
        button1 is LOW => wait
    }
    playB {
        buzzer plays A4 for 200 ms
        buzzer plays B4 for 200 ms
        buzzer plays C5 for 400 ms
        button2 is LOW => wait
    }
}
```

## Generated Arduino Code

```cpp
// Pitch definitions
#define NOTE_C4 262
#define NOTE_E4 330
#define NOTE_G4 392
// ... other notes

void loop() {
    switch(currentState){
        case wait:
            if( (digitalRead(2) == HIGH) && (millis() - button1LastDebounceTime > debounce) ) {
                button1LastDebounceTime = millis();
                currentState = playA;
            }
            if( (digitalRead(3) == HIGH) && (millis() - button2LastDebounceTime > debounce) ) {
                button2LastDebounceTime = millis();
                currentState = playB;
            }
        break;
        case playA:
            tone(8, NOTE_C4, 300);
            delay(390);
            noTone(8);
            tone(8, NOTE_E4, 300);
            delay(390);
            noTone(8);
            tone(8, NOTE_G4, 500);
            delay(650);
            noTone(8);
            if( (digitalRead(2) == LOW) && (millis() - button1LastDebounceTime > debounce) ) {
                button1LastDebounceTime = millis();
                currentState = wait;
            }
        break;
    }
}
```

## Hardware Setup

- **Buzzer/Piezo speaker**: Connect to pin 8 (or any PWM-capable pin)
- **Buttons**: Connect to pins 2, 3 with pull-down resistors

## Acceptance Tests

### Signaling (Beeps)
✅ User can define short beeps (100ms)  
✅ User can define long beeps (500ms)  
✅ User can specify number of repetitions  
✅ Beeps are emitted when entering a state

### Melody Player
✅ User can define notes with specific frequencies  
✅ User can specify note duration in milliseconds  
✅ Multiple transitions allow different melody paths  
✅ Different buttons trigger different melodies
