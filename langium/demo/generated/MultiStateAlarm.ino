
//Wiring code generated from an ArduinoML model
// Application name: MultiStateAlarm

// Pin Allocation Summary:
//   buzzer (Actuator): Pin D11 (11)
//   led (Actuator): Pin D12 (12)
//   button (Sensor): Pin D9 (9)

long debounce = 200;
enum STATE {ready, buzzing, led_on};

STATE currentState = ready;

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
					digitalWrite(11,LOW);
					digitalWrite(12,LOW);
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = buzzing;
					}
		break;
				case buzzing:
					digitalWrite(11,HIGH);
					digitalWrite(12,LOW);
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = led_on;
					}
		break;
				case led_on:
					digitalWrite(11,LOW);
					digitalWrite(12,HIGH);
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = ready;
					}
		break;
		}
	}
	
