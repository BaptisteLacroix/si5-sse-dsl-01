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

Brick :
	(Actuator | Sensor | LCD);

Actuator:
	{infer Actuator}
	'Actuator' name=ID ':' outputPin=INT;

Sensor :
	{infer Sensor}
	'Sensor'  name=ID ':' inputPin=INT;

LCD:
	{infer LCD}
	'LCD' name=ID;
	
State :
	name=ID '{'
		(actions+=(Action | LCDAction))*
		transition=Transition
	'}';


Action :
	actuator=[Actuator:ID] '<=' value=Signal;

LCDAction :
	lcd=[LCD:ID] '<<' parts+=MessagePart ('+' parts+=MessagePart)*;

MessagePart:
	ConstantPart | BrickStatusPart;

ConstantPart:
	text=STRING;

BrickStatusPart:
	brick=[Brick:ID] 'status';

Transition:
	conditions+=Condition (operator+=('and' | 'or') conditions+=Condition)* '=>' next=[State:ID];

Condition:
	brick=[Brick:ID] 'is' value=Signal;

Signal:
    value=(HIGH | LOW);

terminal HIGH : 'HIGH';
terminal LOW : 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
