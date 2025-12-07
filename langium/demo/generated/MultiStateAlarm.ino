
//Wiring code generated from an ArduinoML model
// Application name: MultiStateAlarm

// Pin Allocation Summary:
//   buzzer (Actuator): Pin D11 (11)
//   led (Actuator): Pin D12 (12)
//   button (Sensor): Pin D9 (9)

long debounce = 200;
enum STATE {ready, buzzing, led_on};

STATE currentState = ready;
bool stateChanged = true;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            
	void setup(){
		pinMode(11, OUTPUT); // buzzer [Actuator]
		pinMode(12, OUTPUT); // led [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case ready:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(11,LOW);
					digitalWrite(12,LOW);
					}
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = buzzing;
						stateChanged = true;
					}break;
				case buzzing:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(11,HIGH);
					digitalWrite(12,LOW);
					}
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = led_on;
						stateChanged = true;
					}break;
				case led_on:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(11,LOW);
					digitalWrite(12,HIGH);
					}
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = ready;
						stateChanged = true;
					}break;
		}
	}
	
