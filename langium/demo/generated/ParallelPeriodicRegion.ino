
//Wiring code generated from an ArduinoML model
// Application name: ParallelPeriodicButtons

long debounce = 200;


enum STATE_TOGGLEMACHINE {led1Off, led1On};

STATE_TOGGLEMACHINE currentState_toggleMachine = led1Off;
unsigned long lastExecution_toggleMachine = 0;


enum STATE_PUSHMACHINE {led2Off, led2On};

STATE_PUSHMACHINE currentState_pushMachine = led2Off;
unsigned long lastExecution_pushMachine = 0;

// Pin Allocation Summary:
//   LED1 (Actuator): Pin D10 (10)
//   LED2 (Actuator): Pin D11 (11)
//   button1 (Sensor): Pin D8 (8)
//   button2 (Sensor): Pin D9 (9)
