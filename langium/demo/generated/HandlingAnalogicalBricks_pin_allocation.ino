
//Wiring code generated from an ArduinoML model
// Application name: FireDetection

// Pin Allocation Summary:
//   tempSensor (AnalogSensor): Pin D1 (1)
//   buzzer (Actuator): Pin D8 (8)

long debounce = 200;
enum STATE {monitoring, alarm};

STATE currentState = monitoring;
bool stateChanged = true;

	void setup(){
		pinMode(1, INPUT); // tempSensor [AnalogSensor]
		pinMode(8, OUTPUT); // buzzer [Actuator]
	}
	void loop() {
			switch(currentState){

				case monitoring:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(8,LOW);
					}
					if( (analogRead(1) > 300) ) {
						currentState = alarm;
						stateChanged = true;
					}break;
				case alarm:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(8,HIGH);
					}
					if( (analogRead(1) <= 300) ) {
						currentState = monitoring;
						stateChanged = true;
					}break;
		}
	}
	
