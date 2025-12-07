
//Wiring code generated from an ArduinoML model
// Application name: RedButton

// Pin Allocation Summary:
//   red_led (Actuator): Pin D12 (12)
//   buzzer (Actuator): Pin D11 (11)
//   button (Sensor): Pin D8 (8)

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            
	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(11, OUTPUT); // buzzer [Actuator]
		pinMode(8, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(12,LOW);
					digitalWrite(11,LOW);
					if( (digitalRead(8) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = on;
					}break;
				case on:
					digitalWrite(12,HIGH);
					digitalWrite(11,HIGH);
					if( (digitalRead(8) == LOW) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = off;
					}break;
		}
	}
	
