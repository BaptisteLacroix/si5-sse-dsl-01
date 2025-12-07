grammar ArduinoMl

entry App:
	'app' name=ID ('initial' 'state' initial=[State:ID])?
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)*

		('states'
		states+=State
		( states+=State)*)?

		('machines'
        machines+=StateMachine
        (machines+=StateMachine)*)?
	'}';

StateMachine:
    'machine' name=ID 'period' period=INT 'ms' 'initial' 'state' initial=[State:ID]
    '{'
       'states'
       states+=State
       (states+=State)*
    '}';

Brick:
	(Actuator | Sensor | AnalogActuator | AnalogSensor | TemperatureSensor | SerialBrick | Buzzer | LCD);

Actuator:
	{infer Actuator}
	'Actuator' name=ID (':' outputPin=INT)? ('type' actuatorType=('digital' | 'analog'))?;

Sensor:
	{infer Sensor}
	'Sensor'  name=ID (':' inputPin=INT)? ('type' sensorType=('digital' | 'analog'))?;

AnalogActuator:
	{infer AnalogActuator}
	'AnalogActuator' name=ID (':' outputPin=INT)?;

AnalogSensor:
	{infer AnalogSensor}
	'AnalogSensor' name=ID (':' inputPin=INT)?;

TemperatureSensor:
	{infer TemperatureSensor}
	'TemperatureSensor' name=ID (':' inputPin=INT)?;

SerialBrick:
	{infer SerialBrick}
	'Serial' name=ID ':' baudRate=INT;

LCD:
	{infer LCD}
	'LCD' name=ID;

Buzzer:
	{infer Buzzer}
	'Buzzer' name=ID ':' outputPin=INT;

State:
	name=ID '{'
		(actions+=(Action | LCDAction| Beep | PlayNote))*
		transitions+=Transition (transitions+=Transition)*
	'}';

Action:
	actuator=[Actuator:ID] '<=' value=Signal |
	analogActuator=[AnalogActuator:ID] '<=' analogValue=AnalogValue |
	serial=[SerialBrick:ID] '<=' message=STRING;

Beep :
	buzzer=[Buzzer:ID] 'makes' repetition=INT duration=BeepDuration 'bips';

PlayNote :
	buzzer=[Buzzer:ID] 'plays' note=NOTE 'for' duration=INT 'ms';

LCDAction :
	lcd=[LCD:ID] '<<' parts+=MessagePart ('+' parts+=MessagePart)*;

MessagePart:
	ConstantPart | BrickStatusPart;

ConstantPart:
	text=STRING;

BrickStatusPart:
	brick=[Brick:ID] 'status';

Transition:
	expression=LogicalExpression '=>' next=[State:ID];

LogicalExpression:
	PrimaryExpression ({infer BinaryExpression.left=current} operator=('and' | 'or') right=PrimaryExpression)*;

PrimaryExpression infers LogicalExpression:
	'(' LogicalExpression ')' | Condition;

Condition:
	brick=[Brick:ID] 'is' value=Signal |
	brick=[Brick:ID] operator=('>' | '<' | '>=' | '<=' | '==' | '!=') threshold=INT |
	serial=[SerialBrick:ID] 'is' message=STRING;

Signal:
	value=(HIGH | LOW);

AnalogValue:
	intValue=INT | sensorValue=[AnalogSensor:ID];

BeepDuration :
	value=(LONG | SHORT);

terminal HIGH: 'HIGH';
terminal LOW: 'LOW';
terminal LONG: 'LONG';
terminal SHORT: 'SHORT';
terminal NOTE: /[A-G]S?[0-8]/;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
