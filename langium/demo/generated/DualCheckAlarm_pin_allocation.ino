
//Wiring code generated from an ArduinoML model
// Application name: RedButton

// Pin Allocation Summary:
//   red_led (Actuator): Pin D8 (8)
//   buzzer (Actuator): Pin D9 (9)
//   button1 (Sensor): Pin D10 (10)
//   button2 (Sensor): Pin D11 (11)

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

            

bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            

	void setup(){
		pinMode(9, OUTPUT); // buzzer [Actuator]
		pinMode(10, INPUT); // button1 [Sensor]
		pinMode(11, INPUT); // button2 [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(9,LOW);
					if( (digitalRead(10) == HIGH && digitalRead(11) == HIGH) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = on;
					}
		
				break;
				case on:
					digitalWrite(9,HIGH);
					if( (digitalRead(10) == LOW || digitalRead(11) == LOW) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = off;
					}
		
				break;
		}
	}
	
