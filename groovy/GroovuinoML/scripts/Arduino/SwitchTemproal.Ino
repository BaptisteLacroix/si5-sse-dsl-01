// Wiring code generated from an ArduinoML model
// Application name: Switch!

long debounce = 200;

enum STATE {on, off};
STATE currentState = off;

boolean B1BounceGuard = false;
long B1LastDebounceTime = 0;

void setup(){
  pinMode(9, INPUT);  // B1 [Sensor]
  pinMode(12, OUTPUT); // LED1 [Actuator]
}

void loop() {
	switch(currentState){
		case on:
			digitalWrite(12,HIGH);
			delay(800);
			currentState = off;
		break;
		case off:
			digitalWrite(12,LOW);
		break;
	}
}
