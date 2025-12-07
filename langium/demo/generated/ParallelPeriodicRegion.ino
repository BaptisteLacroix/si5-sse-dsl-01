
//Wiring code generated from an ArduinoML model
// Application name: ParallelPeriodicButtons

long debounce = 200;


enum STATE_toggleMachine {led1Off_toggleMachine, led1On_toggleMachine};
STATE_toggleMachine currentState_toggleMachine = led1Off_toggleMachine;
unsigned long lastRun_toggleMachine = 0;


enum STATE_pushMachine {led2Off_pushMachine, led2On_pushMachine};
STATE_pushMachine currentState_pushMachine = led2Off_pushMachine;
unsigned long lastRun_pushMachine = 0;


bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

            
bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            
	void setup(){
		pinMode(10, OUTPUT); // LED1 [Actuator]
		pinMode(11, OUTPUT); // LED2 [Actuator]
		pinMode(8, INPUT); // button1 [Sensor]
		pinMode(9, INPUT); // button2 [Sensor]
	}
	void loop() {
		unsigned long currentMillis = millis();
	


        if (currentMillis - lastRun_toggleMachine >= 400) {
            lastRun_toggleMachine = currentMillis;
            switch(currentState_toggleMachine) {

				case led1Off_toggleMachine:
					digitalWrite(10,LOW);
					if( (digitalRead(8) == HIGH) && (millis() - button1LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						currentState_toggleMachine = led1On_toggleMachine;
					}break;
				case led1On_toggleMachine:
					digitalWrite(10,HIGH);
					if( (digitalRead(8) == HIGH) && (millis() - button1LastDebounceTime > debounce) ) {
						button1LastDebounceTime = millis();
						currentState_toggleMachine = led1Off_toggleMachine;
					}break;
			}
		}
		


        if (currentMillis - lastRun_pushMachine >= 50) {
            lastRun_pushMachine = currentMillis;
            switch(currentState_pushMachine) {

				case led2Off_pushMachine:
					digitalWrite(11,LOW);
					if( (digitalRead(9) == HIGH) && (millis() - button2LastDebounceTime > debounce) ) {
						button2LastDebounceTime = millis();
						currentState_pushMachine = led2On_pushMachine;
					}break;
				case led2On_pushMachine:
					digitalWrite(11,HIGH);
					if( (digitalRead(9) == LOW) && (millis() - button2LastDebounceTime > debounce) ) {
						button2LastDebounceTime = millis();
						currentState_pushMachine = led2Off_pushMachine;
					}break;
			}
		}
		

	}
	
