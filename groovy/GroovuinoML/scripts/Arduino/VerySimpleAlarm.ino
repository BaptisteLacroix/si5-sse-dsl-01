
long debounce = 200;

enum STATE {off, on};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

void setup(){
  pinMode(12, OUTPUT); // red_led [Actuator]
  pinMode(11, OUTPUT); // buzzer [Actuator]
  pinMode(8, INPUT);  // button [Sensor]
}

void loop() {
        switch(currentState){
                case off:
                        digitalWrite(12,LOW);
                        digitalWrite(11,LOW);
                case on:
                        digitalWrite(12,HIGH);
                        digitalWrite(11,HIGH);
        }
}