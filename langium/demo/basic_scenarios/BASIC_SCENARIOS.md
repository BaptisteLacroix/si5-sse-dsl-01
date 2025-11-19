## Basic Scenarios

### Scenario 1: Very Simple Alarm
> Pushing a button activates a LED and a buzzer. Releasing the button switches
the actuators off
```
app RedButton initial state off {
	bricks
		Actuator red_led : 12
		Actuator buzzer : 11
		Sensor button : 8
	
    off {
        red_led <= LOW
        buzzer <= LOW
        button is HIGH => on
    }
    on {
        red_led <= HIGH
        buzzer <= HIGH
        button is LOW => off
    }
}
```

### Scenario 2: Dual-Check Alarm
> It will trigger a buzzer if and only if two buttons are pushed at the very same
time. Releasing at least one of the button stop the sound.

```
app RedButton initial state off {
	bricks
		Actuator buzzer : 11
		Sensor button1 : 8
		Sensor button2 : 10
		
    off {
        buzzer <= LOW
        button1 is HIGH and button2 is HIGH => on
    }
    on {
        buzzer <= HIGH
        button1 is LOW or button2 is LOW => off
    }
}
```

### Scenario 3: State-Based Alarm
> Pushing the button once switches the system in a mode where the LED is
switched on. Pushing it again switches it off.
```
app RedButton initial state off {
	bricks
		Actuator red_led : 12
		Sensor button : 8

	states
		off {
			red_led <= LOW
			button is HIGH => on
		}
		on {
			red_led <= HIGH
			button is LOW => off
		}
}
```

### Scenario 4: Multi-State Alarm
> Pushing the button starts the buzz noise. Pushing it again stop the buzzer and
switch the LED on. Pushing it again switch the LED off, and makes the system ready to make noise
again after one push, and so on.
```
app MultiStateAlarm initial state ready {
	bricks
		Actuator buzzer : 11
		Actuator led : 12
		Sensor button : 9
		
	states
	ready {
		buzzer <= LOW
		led <= LOW
		button is HIGH => buzzing
	}
	buzzing {
		buzzer <= HIGH
		led <= LOW
		button is HIGH => led_on
	}
	led_on {
		buzzer <= LOW
		led <= HIGH
		button is HIGH => ready
	}
}

```