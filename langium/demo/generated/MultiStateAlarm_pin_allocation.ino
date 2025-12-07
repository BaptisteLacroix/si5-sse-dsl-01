
//Wiring code generated from an ArduinoML model
// Application name: MultiStateAlarm

// Pin Allocation Summary:
//   buzzer (Actuator): Pin D8 (8)
//   led (Actuator): Pin D9 (9)
//   button (Sensor): Pin D10 (10)

long debounce = 200;
enum STATE {ready, buzzing, led_on};

STATE currentState = ready;
bool stateChanged = true;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            
	void setup(){
		pinMode(8, OUTPUT); // buzzer [Actuator]
		pinMode(9, OUTPUT); // led [Actuator]
		pinMode(10, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case ready:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(8,LOW);
					digitalWrite(9,LOW);
					}
					if( (digitalRead(10) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = buzzing;
						stateChanged = true;
					}break;
				case buzzing:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(8,HIGH);
					digitalWrite(9,LOW);
					}
					if( (digitalRead(10) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = led_on;
						stateChanged = true;
					}break;
				case led_on:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(8,LOW);
					digitalWrite(9,HIGH);
					}
					if( (digitalRead(10) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = ready;
						stateChanged = true;
					}break;
		}
	}
	
