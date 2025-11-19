
#include <LiquidCrystal.h>

// LCD pins: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);


//Wiring code generated from an ArduinoML model
// Application name: LCDDisplay

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		lcd.begin(16, 2); // Initialize LCD 16x2
		lcd.clear();
		pinMode(13, OUTPUT); // led [Actuator]
		pinMode(9, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(13,LOW);
					lcd.clear();
					lcd.setCursor(0, 0);
					lcd.print('LED is OFF');
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = on;
					}
		
				break;
				case on:
					digitalWrite(13,HIGH);
					lcd.clear();
					lcd.setCursor(0, 0);
					lcd.print('LED: ');
					lcd.print(digitalRead(13) == HIGH ? "ON" : "OFF");
					if( (digitalRead(9) == HIGH) && (millis() - buttonLastDebounceTime > debounce) ) {
						buttonLastDebounceTime = millis();
						currentState = off;
					}
		
				break;
		}
	}
	
