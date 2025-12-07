// Wiring code generated from an ArduinoML model
// Application name: Switch!

long debounce = 200;

enum STATE {on, off};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(9, INPUT);  // button [Sensor]
  pinMode(12, OUTPUT); // led1 [Actuator]
  pinMode(13, OUTPUT); // led2 [Actuator]
  pinMode(14, OUTPUT); // led3 [Actuator]
}

void loop() {
	switch(currentState){
		case on:
			digitalWrite(12,HIGH);
		break;
		case off:
			digitalWrite(12,LOW);
			digitalWrite(13,LOW);
			digitalWrite(14,LOW);
		break;
	}
}
