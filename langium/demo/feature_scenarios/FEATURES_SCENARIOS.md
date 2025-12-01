## Basic Scenarios

### Feature 1: Remote Communication
> The Arduino Uno board supports serial communication with a host computer. As a user, one can use
ArduinoML (i) to send data from the sketch to the computer and (ii) to receive data from the computer and
use it in the sketch. The Serial Monitor available in the Arduino IDE is a good tool to support such an
interaction.

#### Acceptance Scenario

> Acceptance Scenario: By activating remote communication in her model, Alice uses the
serial port as a sensor and interact with her sketch by entering data on her keyboard.

```
app RedButton initial state off {

}
```

### Feature 1.2: Exception Throwing
> To implement this extension, we assume that a red LED is always connected on a given port (e.g., D12).
One can use ArduinoML to model erroneous situations (e.g., inconsistent data received, functional error)
as special states. These error states are sinks, associated to a given numerical error code. When the sketch
falls in such a state the red LED blinks conformingly to the associated error code to signal the error to the
outside world. For example, in an “error 3” state, the LED will blink 3 times, then a void period, then 3
times again, etc.

#### Acceptance Scenario

> Acceptance Scenario: Consider a sketch with two buttons that must be used exclusively,
for exemple in a double-door entrance system. If the two buttons are activated at the very same
time, the red LED starts to blink and the sketch is blocked in an error state, as the double-door
was violated.

```
app RedButton initial state off {

}
```

### Feature 2: PIN allocation generator
> The ArduinoML kernel assumes that the user knows how a given bricks can be connected to the board.
This assumption is quite strong, as the chassis’ datasheet (see on my website) implies several technical
constraints. For example, analogical bricks can be used as input on pins A1-A5, and pins D9-D11 supports
analogical outputs as well as digital inputs and outputs. Using the BUS pins also impacts the available
other digital or analogical pins.

#### Acceptance Scenario

> Acceptance Scenario: As a user, one can use ArduinoML to only declare the needed bricks
in the sketch, without specifying the associated pins. The ArduinoML environment will perform the pin allocation with respect to the technical constraints, and describe it in the generated
code (e.g., file header comment).

### Feature 2.2: Temporal transitions
> ArduinoML does not support temporal transitions, i.e., transitions that are triggered a specific amount of
time after entering in a state. This extension will allow it. Of course, such extension implies support for
several output transitions from a single state.

#### Acceptance Scenario
> Acceptance scenario: Alan wants to define a state machine where LED1 is switched on
after a push on button B1 and switched off 800ms after, waiting again for a new push on B1.

### Feature 3: Supporting the LCD screen
> The Electronic Bricks kit comes with an LCD screen. As an ArduinoML user, one can use the language
to write text messages on the screen. These messages can be constants (e.g., “Hello, World!”), or built
based on sensors or actuator status (e.g., “push button := ON”, “temperature := 25 deg”, “red light := ON”).
One also expects the language to statically identify messages that cannot be displayed (e.g., too long).
Moreover, using the bus connection prevent the use of several pins on the board (see the bus datasheet, on
my website).

#### Acceptance Scenario
> Acceptance Scenario: The value of a specific sensor or actuator is displayed on the LCD
screen as specified in the model.

```
app LCDDisplay initial state off {
	bricks
		Actuator led : 13
		Sensor button : 9
		LCD screen

	states
	off {
		led <= LOW
		screen << "LED is OFF"
		button is HIGH => on
	}
	on {
		led <= HIGH
		screen << "LED: " + led status
		button is HIGH => off
	}
}
```

### Feature 4: Handling Analogical Bricks
> The kernel only supports digital bricks. As a user, one can use the ArduinoML language to use analogical
bricks. For example, the temperature sensor delivers the room temperature. Thus, analogical values can
be exploited in transitions (e.g., if the room temperature is above 35 Celsius degrees, trigger an alarm).
Analogical values can be set to analogical actuators (e.g., the buzzer or a LED), as constants or as values
transferred from an analogical sensor.

#### Acceptance Scenarios

> Acceptance Scenario: considering a temperature sensor, an alarm is triggered if the sensed
temperature is greater than 57 Celsius degrees (fire detection).

### Feature 5: Parallel periodic Region

### Feature 6: Mealy machine for Arduino
