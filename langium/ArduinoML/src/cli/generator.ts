import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Action, App, State, Transition } from '../language-server/generated/ast';
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
	
	// Generate debounce variables for sensors
	pinAllocator.generateDebounceVariables(app.bricks, fileNode);
	
	fileNode.append(`
	void setup(){`);
	
	// Generate pinMode setup for all bricks
	pinAllocator.generatePinModeSetup(app.bricks, fileNode);

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
		pinAllocator.generateDigitalWrite(action.actuator.ref!, action.value.value, fileNode);
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
		// Generate transition condition and get involved sensors
		const { conditionCode, sensors } = pinAllocator.generateTransitionCondition(
			transition.conditions,
			transition.operator
		);
		
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

