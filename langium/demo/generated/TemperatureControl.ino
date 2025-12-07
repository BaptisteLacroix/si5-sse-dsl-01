
//Wiring code generated from an ArduinoML model
// Application name: TemperatureControl

// Pin Allocation Summary:
//   heater (Actuator): Pin D12 (12)
//   cooler (Actuator): Pin D11 (11)
//   roomTemp (TemperatureSensor): Pin D1 (1)

long debounce = 200;
enum STATE {comfortable, toohot};

STATE currentState = comfortable;
bool stateChanged = true;

// Temperature conversion function for TMP36 sensor
// Returns temperature in Celsius
float readTemperature(int pin) {
	int reading = analogRead(pin);
	float voltage = reading * 5.0 / 1024.0;
	float temperatureC = (voltage - 0.5) * 100.0;
	return temperatureC;
}

	void setup(){
		Serial.begin(9600); // console
		pinMode(1, INPUT); // roomTemp [TemperatureSensor TMP36]
		pinMode(12, OUTPUT); // heater [Actuator]
		pinMode(11, OUTPUT); // cooler [Actuator]
	}
	void loop() {
			switch(currentState){

				case comfortable:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,LOW);
					digitalWrite(11,LOW);
					Serial.println("Temperature comfortable (18-25°C)");
					}
					if( (readTemperature(1) > 25) ) {
						currentState = toohot;
						stateChanged = true;
					}
		break;
				case toohot:
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;
					digitalWrite(12,LOW);
					digitalWrite(11,HIGH);
					Serial.println("Cooling: temperature above 25°C");
					}
					if( (readTemperature(1) < 23) ) {
						currentState = comfortable;
						stateChanged = true;
					}
		break;
		}
	}
	
