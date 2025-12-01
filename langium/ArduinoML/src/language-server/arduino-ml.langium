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
	(Actuator | Sensor | AnalogActuator | AnalogSensor | LCD);

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

LCD:
	{infer LCD}
	'LCD' name=ID;

State:
	name=ID '{'
		(actions+=(Action | LCDAction))*
		transition=Transition
	'}';


Action:
	actuator=[Actuator:ID] '<=' value=Signal |
	analogActuator=[AnalogActuator:ID] '<=' analogValue=AnalogValue;

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
