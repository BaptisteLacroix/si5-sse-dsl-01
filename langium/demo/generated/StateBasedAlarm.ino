
//Wiring code generated from an ArduinoML model
// Application name: ActuatorCheck

long debounce = 200;
enum STATE {init, waiting, turnOn, done};

STATE currentState = init;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(12, OUTPUT); // led [Actuator]
		pinMode(8, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case init:
					digitalWrite(12,LOW);
					if( (digitalRead(12) == LOW) ) {
						currentState = waiting;
					}
		
				break;
				case waiting:
					if( (digitalRead(8) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = turnOn;
					}
		
				break;
				case turnOn:
					digitalWrite(12,HIGH);
					if( (digitalRead(12) == HIGH) ) {
						currentState = done;
					}
		
				break;
				case done:
					if( (digitalRead(8) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = init;
					}
		
				break;
		}
	}
	
