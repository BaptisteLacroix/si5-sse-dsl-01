
//Wiring code generated from an ArduinoML model
// Application name: FireDetection

// Pin Allocation Summary:
//   tempSensor (AnalogSensor): Pin D1 (1)
//   buzzer (Actuator): Pin D8 (8)

long debounce = 200;
enum STATE {monitoring, alarm};

STATE currentState = monitoring;

	void setup(){
		pinMode(1, INPUT); // tempSensor [AnalogSensor]
		pinMode(8, OUTPUT); // buzzer [Actuator]
	}
	void loop() {
			switch(currentState){

				case monitoring:
					digitalWrite(8,LOW);
					if( (analogRead(1) > 300) ) {
						currentState = alarm;
					}break;
				case alarm:
					digitalWrite(8,HIGH);
					if( (analogRead(1) <= 300) ) {
						currentState = monitoring;
					}break;
		}
	}
	
