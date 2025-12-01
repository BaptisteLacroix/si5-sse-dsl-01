
//Wiring code generated from an ArduinoML model
// Application name: RedButton

// Pin Allocation Summary:
//   buzzer (Actuator): Pin D8 (8)
//   button1 (Sensor): Pin D9 (9)
//   button2 (Sensor): Pin D10 (10)

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

            
bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            
	void setup(){
		pinMode(8, OUTPUT); // buzzer [Actuator]
		pinMode(9, INPUT); // button1 [Sensor]
		pinMode(10, INPUT); // button2 [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(8,LOW);
					if( ((digitalRead(9) == HIGH && digitalRead(10) == HIGH)) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = on;
					}
		break;
				case on:
					digitalWrite(8,HIGH);
					if( ((digitalRead(9) == LOW || digitalRead(10) == LOW)) && (millis() - button1LastDebounceTime > debounce && millis() - button2LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						button2LastDebounceTime = millis();
						currentState = off;
					}
		break;
		}
	}
	
