
//Wiring code generated from an ArduinoML model
// Application name: RedButton

// Pin Allocation Summary:
//   buzzer (Actuator): Pin D11 (11)
//   button1 (Sensor): Pin D8 (8)
//   button2 (Sensor): Pin D9 (9)

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;
bool stateChanged = true;

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

            
bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            
	void setup(){
		pinMode(11, OUTPUT); // buzzer [Actuator]
		pinMode(8, INPUT); // button1 [Sensor]
		pinMode(9, INPUT); // button2 [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(11,LOW);
					}
					if( ((digitalRead(8) == HIGH && digitalRead(9) == HIGH)) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = on;
						stateChanged = true;
					}break;
				case on:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(11,HIGH);
					}
					if( ((digitalRead(8) == LOW || digitalRead(9) == LOW)) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = off;
						stateChanged = true;
					}break;
		}
	}
	
