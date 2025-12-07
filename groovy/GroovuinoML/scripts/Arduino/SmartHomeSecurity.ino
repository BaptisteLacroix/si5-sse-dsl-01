// Wiring code generated from an ArduinoML model
// Application name: Smart_Home_Security

long debounce = 200;

enum STATE {disarmed, armed, checking_intrusion, intrusion_detected};
STATE currentState = disarmed;

boolean MOTION_DETECTORBounceGuard = false;
long MOTION_DETECTORLastDebounceTime = 0;

boolean DOOR_SENSORBounceGuard = false;
long DOOR_SENSORLastDebounceTime = 0;

boolean WINDOW_SENSORBounceGuard = false;
long WINDOW_SENSORLastDebounceTime = 0;

boolean ARM_SWITCHBounceGuard = false;
long ARM_SWITCHLastDebounceTime = 0;

void setup(){
  pinMode(2, INPUT);  // MOTION_DETECTOR [Sensor]
  pinMode(3, INPUT);  // DOOR_SENSOR [Sensor]
  pinMode(4, INPUT);  // WINDOW_SENSOR [Sensor]
  pinMode(5, INPUT);  // ARM_SWITCH [Sensor]
  pinMode(10, OUTPUT); // ALARM_LED [Actuator]
  pinMode(11, OUTPUT); // SIREN [Actuator]
  pinMode(12, OUTPUT); // NOTIFICATION_LED [Actuator]
}

void loop() {
	switch(currentState){
		case disarmed:
			digitalWrite(10,LOW);
			digitalWrite(11,LOW);
			digitalWrite(12,LOW);
		break;
		case armed:
			digitalWrite(10,LOW);
			digitalWrite(11,LOW);
			digitalWrite(12,HIGH);
			if((digitalRead(5) == HIGH && digitalRead(3) == HIGH)) {
				currentState = checking_intrusion;
			}
		break;
		case checking_intrusion:
			digitalWrite(10,LOW);
			digitalWrite(11,LOW);
			digitalWrite(12,HIGH);
			if((digitalRead(2) == HIGH || digitalRead(4) == HIGH)) {
				currentState = intrusion_detected;
			}
		break;
		case intrusion_detected:
			digitalWrite(10,HIGH);
			digitalWrite(11,HIGH);
			digitalWrite(12,HIGH);
		break;
	}
}
