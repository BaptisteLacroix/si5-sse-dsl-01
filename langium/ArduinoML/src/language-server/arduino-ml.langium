grammar ArduinoMl

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)* 		
	'}';

Brick:
	(Actuator | Sensor | AnalogActuator | AnalogSensor);

Actuator:
	{infer Actuator}
	'Actuator' name=ID ':' outputPin=INT;

Sensor:
	{infer Sensor}
	'Sensor'  name=ID ':' inputPin=INT;

AnalogActuator:
	{infer AnalogActuator}
	'AnalogActuator' name=ID ':' outputPin=INT;

AnalogSensor:
	{infer AnalogSensor}
	'AnalogSensor' name=ID ':' inputPin=INT;

State:
	name=ID '{'
		(actions+=Action)* 
		transition=Transition
	'}';


Action:
	actuator=[Actuator:ID] '<=' value=Signal |
	analogActuator=[AnalogActuator:ID] '<=' analogValue=AnalogValue;

Transition:
	conditions+=Condition (operator+=('and' | 'or') conditions+=Condition)* '=>' next=[State:ID];

Condition:
	brick=[Brick:ID] 'is' value=Signal |
	analogBrick=[AnalogSensor:ID] operator=('>' | '<' | '>=' | '<=' | '==' | '!=') threshold=INT;

Signal:
	value=(HIGH | LOW);

AnalogValue:
	intValue=INT | sensorValue=[AnalogSensor:ID];

terminal HIGH: 'HIGH';
terminal LOW: 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
