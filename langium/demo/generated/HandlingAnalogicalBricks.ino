
//Wiring code generated from an ArduinoML model
// Application name: FireDetection

// Pin Allocation Summary:
//   tempSensor (Sensor): Pin D1 (1)
//   buzzer (Actuator): Pin D9 (9)

long debounce = 200;
enum STATE {monitoring, alarm};

STATE currentState = monitoring;

	void setup(){
		pinMode(1, INPUT); // tempSensor [AnalogSensor]
		pinMode(9, OUTPUT); // buzzer [Actuator]
	}
	void loop() {
			switch(currentState){

				case monitoring:
					digitalWrite(9,LOW);
					if( (analogRead(1) > 300) ) {
						currentState = alarm;
					}
		
				break;
				case alarm:
					digitalWrite(9,HIGH);
					if( (analogRead(1) <= 300) ) {
						currentState = monitoring;
					}
		
				break;
		}
	}
	
