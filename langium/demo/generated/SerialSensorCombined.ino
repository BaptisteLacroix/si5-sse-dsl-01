
//Wiring code generated from an ArduinoML model
// Application name: SerialSensorCombined

// Pin Allocation Summary:
//   led (Actuator): Pin D13 (13)
//   button (Sensor): Pin D8 (8)

long debounce = 200;
enum STATE {idle, active};

STATE currentState = idle;
bool stateChanged = true;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            
	void setup(){
		Serial.begin(9600); // console
		pinMode(13, OUTPUT); // led [Actuator]
		pinMode(8, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case idle:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(13,LOW);
					Serial.println("System idle. Press button AND type 'start' to begin.");
					}
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\n');
						serialInput.trim();
					if( ((digitalRead(8) == HIGH && serialInput == "start")) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = active;
						stateChanged = true;
					}
					}break;
				case active:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(13,HIGH);
					Serial.println("System active! Press button OR type 'stop' to end.");
					}
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\n');
						serialInput.trim();
					if( ((digitalRead(8) == HIGH || serialInput == "stop")) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = idle;
						stateChanged = true;
					}
					}break;
		}
	}
	
