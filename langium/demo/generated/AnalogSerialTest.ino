
//Wiring code generated from an ArduinoML model
// Application name: AnalogSerialTest

// Pin Allocation Summary:
//   temperature (AnalogSensor): Pin D1 (1)
//   fan (AnalogActuator): Pin D8 (8)

long debounce = 200;
enum STATE {monitoring, cooling};

STATE currentState = monitoring;
bool stateChanged = true;

	void setup(){
		Serial.begin(9600); // console
		pinMode(1, INPUT); // temperature [AnalogSensor]
		pinMode(8, OUTPUT); // fan [AnalogActuator]
	}
	void loop() {
			switch(currentState){

				case monitoring:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					Serial.println("Monitoring temperature...");
					}
					if( (analogRead(1) > 500) ) {
						currentState = cooling;
						stateChanged = true;
					}break;
				case cooling:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					analogWrite(8,200);
					Serial.println("Cooling activated! Type 'reset' to stop.");
					}
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\n');
						serialInput.trim();
					if( (serialInput == "reset") ) {
						currentState = monitoring;
						stateChanged = true;
					}
					}break;
		}
	}
	
