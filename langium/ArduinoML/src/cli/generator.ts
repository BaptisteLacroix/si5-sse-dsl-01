import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Action, Actuator, App, Sensor, State, Transition } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { PinAllocator } from './pin-allocator';

export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    compile(app,fileNode)
    
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}


function compile(app:App, fileNode:CompositeGeneratorNode){
	// Check if app uses LCD (not implemented in current grammar)
	const hasLCD = false;
	
	// Initialize pin allocator and allocate pins for bricks without manual assignment
	const pinAllocator = new PinAllocator(hasLCD);
	pinAllocator.allocatePins(app.bricks);
	
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`

`+pinAllocator.getAllocationSummary()+`

long debounce = 200;
enum STATE {`+app.states.map(s => s.name).join(', ')+`};

STATE currentState = `+app.initial.ref?.name+`;`
    ,NL);
	
    for(const brick of app.bricks){
        if (brick.$type === 'Sensor'){
            fileNode.append(`
bool `+brick.name+`BounceGuard = false;
long `+brick.name+`LastDebounceTime = 0;

            `,NL);
        }
    }
    fileNode.append(`
	void setup(){`);
    for(const brick of app.bricks){
        if (brick.$type === 'Sensor'){
       		compileSensor(brick as Sensor, fileNode, pinAllocator);
		} else if (brick.$type === 'Actuator'){
            compileActuator(brick as Actuator, fileNode, pinAllocator);
        }
	}


    fileNode.append(`
	}
	void loop() {
			switch(currentState){`,NL)
			for(const state of app.states){
				compileState(state, fileNode, pinAllocator)
            }
	fileNode.append(`
		}
	}
	`,NL);




    }

	function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode, pinAllocator: PinAllocator) {
		const pin = pinAllocator.getPin(actuator);
        fileNode.append(`
		pinMode(`+pin+`, OUTPUT); // `+actuator.name+` [Actuator]`)
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode, pinAllocator: PinAllocator) {
		const pin = pinAllocator.getPin(sensor);
    	fileNode.append(`
		pinMode(`+pin+`, INPUT); // `+sensor.name+` [Sensor]`)
	}

    function compileState(state: State, fileNode: CompositeGeneratorNode, pinAllocator: PinAllocator) {
        fileNode.append(`
				case `+state.name+`:`)
		for(const action of state.actions){
			compileAction(action, fileNode, pinAllocator)
		}
		if (state.transition !== null){
			compileTransition(state.transition, fileNode, pinAllocator)
		}
		fileNode.append(`
				break;`)
    }
	

	function compileAction(action: Action, fileNode:CompositeGeneratorNode, pinAllocator: PinAllocator) {
		const pin = pinAllocator.getPin(action.actuator.ref!);
		fileNode.append(`
					digitalWrite(`+pin+`,`+action.value.value+`);`)
	}

/**
 * Compiles a transition into Arduino condition checking code with debouncing.
 * This simplified version handles flat lists of conditions with 'and'/'or' operators.
 * 
 * @param transition - The transition to compile
 * @param fileNode - The composite generator node to append code to
 * 
 * @example
 * Given: button1 is HIGH and button2 is HIGH => on
 * Generates:
 * ```cpp
 * if( (digitalRead(8) == HIGH && digitalRead(10) == HIGH) && 
 *     (millis() - button1LastDebounceTime > debounce && 
 *      millis() - button2LastDebounceTime > debounce) ) {
 *   button1LastDebounceTime = millis();
 *   button2LastDebounceTime = millis();
 *   currentState = on;
 * }
 * ```
 */
	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode, pinAllocator: PinAllocator) {
		// Collect all unique sensors from conditions (only sensors need debouncing)
		const sensors: Sensor[] = [];
		for (const condition of transition.conditions) {
			const brick = condition.brick?.ref;
			if (brick && brick.$type === 'Sensor' && !sensors.includes(brick as Sensor)) {
				sensors.push(brick as Sensor);
			}
		}
		
		// Build the condition expression
		let conditionCode = '';
		for (let i = 0; i < transition.conditions.length; i++) {
			const condition = transition.conditions[i];
			const brick = condition.brick.ref;
			
			if (!brick) continue;
			
			// Get the allocated pin
			const pin = pinAllocator.getPin(brick);
			
			// Generate condition based on brick type
			let condStr = '';
			if (brick.$type === 'Sensor') {
				// Sensor
				condStr = `digitalRead(${pin}) == ${condition.value.value}`;
			} else if (brick.$type === 'Actuator') {
				// Actuator
				condStr = `digitalRead(${pin}) == ${condition.value.value}`;
			}
			
			if (i === 0) {
				conditionCode = condStr;
			} else {
				const operator = transition.operator[i - 1] === 'and' ? '&&' : '||';
				conditionCode += ` ${operator} ${condStr}`;
			}
		}
		
		// Build debounce checks only for sensors
		let debounceCheck = '';
		if (sensors.length > 0) {
			const debounceChecks = sensors.map(sensor => 
				`millis() - ${sensor.name}LastDebounceTime > debounce`
			).join(' && ');
			debounceCheck = ` && (${debounceChecks})`;
		}
		
		// Generate the complete transition code
		fileNode.append(`
					if( (${conditionCode})${debounceCheck} ) {`);
		
		// Update debounce times only for sensors
		for (const sensor of sensors) {
			fileNode.append(`
						${sensor.name}LastDebounceTime = millis();`);
		}
		
		// Change state
		fileNode.append(`
						currentState = ${transition.next.ref?.name};
					}
		`);
	}

