
//Wiring code generated from an ArduinoML model
// Application name: SerialAlarm

// Pin Allocation Summary:
//   red_led (Actuator): Pin D12 (12)
//   buzzer (Actuator): Pin D11 (11)

long debounce = 200;
enum STATE {waiting, on};

STATE currentState = waiting;
bool stateChanged = true;

	void setup(){
		Serial.begin(9600); // console
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(11, OUTPUT); // buzzer [Actuator]
	}
	void loop() {
			switch(currentState){

				case waiting:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,LOW);
					digitalWrite(11,LOW);
					Serial.println("System ready. Type 'alarm' to activate.");
					}
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\n');
						serialInput.trim();
					if( (serialInput == "alarm") ) {
						currentState = on;
						stateChanged = true;
					}
					}break;
				case on:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,HIGH);
					digitalWrite(11,HIGH);
					Serial.println("ALARM ACTIVATED! Type 'stop' to deactivate.");
					}
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\n');
						serialInput.trim();
					if( (serialInput == "stop") ) {
						currentState = waiting;
						stateChanged = true;
					}
					}break;
		}
	}
	
