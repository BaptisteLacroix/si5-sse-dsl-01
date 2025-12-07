
//Wiring code generated from an ArduinoML model
// Application name: PrecedenceTest

// Pin Allocation Summary:
//   buttonA (Sensor): Pin D8 (8)
//   buttonB (Sensor): Pin D9 (9)
//   buttonC (Sensor): Pin D10 (10)
//   led (Actuator): Pin D12 (12)

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;
bool stateChanged = true;

bool buttonABounceGuard = false;
long buttonALastDebounceTime = 0;

            
bool buttonBBounceGuard = false;
long buttonBLastDebounceTime = 0;

            
bool buttonCBounceGuard = false;
long buttonCLastDebounceTime = 0;

            
	void setup(){
		pinMode(8, INPUT); // buttonA [Sensor]
		pinMode(9, INPUT); // buttonB [Sensor]
		pinMode(10, INPUT); // buttonC [Sensor]
		pinMode(12, OUTPUT); // led [Actuator]
	}
	void loop() {
			switch(currentState){

				case off:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,LOW);
					}
					if( ((digitalRead(8) == HIGH && (digitalRead(9) == HIGH || digitalRead(10) == HIGH))) && (millis() - buttonALastDebounceTime > debounce && millis() - buttonBLastDebounceTime > debounce && millis() - buttonCLastDebounceTime > debounce) ) {
						buttonALastDebounceTime = millis();
						buttonBLastDebounceTime = millis();
						buttonCLastDebounceTime = millis();
						currentState = on;
						stateChanged = true;
					}break;
				case on:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,HIGH);
					}
					if( (digitalRead(8) == LOW) && (millis() - buttonALastDebounceTime > debounce) ) {
						buttonALastDebounceTime = millis();
						currentState = off;
						stateChanged = true;
					}break;
		}
	}
	
