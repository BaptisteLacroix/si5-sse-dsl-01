import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Action, Actuator, App, Sensor, State, Transition, LCDAction, isAction, isLCDAction } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

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
	// Check if app uses LCD
	const hasLCD = app.bricks.some(brick => !('inputPin' in brick) && !('outputPin' in brick));
	
	if (hasLCD) {
		fileNode.append(`
#include <LiquidCrystal.h>

// LCD pins: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
`, NL);
	}
	
    fileNode.append(
	`
//Wiring code generated from an ArduinoML model
// Application name: `+app.name+`

long debounce = 200;
enum STATE {`+app.states.map(s => s.name).join(', ')+`};

STATE currentState = `+app.initial.ref?.name+`;`
    ,NL);
	
    for(const brick of app.bricks){
        if ("inputPin" in brick){
            fileNode.append(`
bool `+brick.name+`BounceGuard = false;
long `+brick.name+`LastDebounceTime = 0;

            `,NL);
        }
    }
    fileNode.append(`
	void setup(){`);
	
	// Initialize LCD if present
	if (hasLCD) {
		fileNode.append(`
		lcd.begin(16, 2); // Initialize LCD 16x2
		lcd.clear();`);
	}
	
    for(const brick of app.bricks){
        if ("inputPin" in brick){
       		compileSensor(brick,fileNode);
		} else if ("outputPin" in brick){
            compileActuator(brick,fileNode);
        }
        // LCD bricks don't need pinMode setup
	}


    fileNode.append(`
	}
	void loop() {
			switch(currentState){`,NL)
			for(const state of app.states){
				compileState(state, fileNode)
            }
	fileNode.append(`
		}
	}
	`,NL);




    }

	function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
		pinMode(`+actuator.outputPin+`, OUTPUT); // `+actuator.name+` [Actuator]`)
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		pinMode(`+sensor.inputPin+`, INPUT); // `+sensor.name+` [Sensor]`)
	}

    function compileState(state: State, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
				case `+state.name+`:`)
		for(const action of state.actions){
			if (isAction(action)) {
				compileAction(action, fileNode);
			} else if (isLCDAction(action)) {
				compileLCDAction(action, fileNode);
			}
		}
		if (state.transition !== null){
			compileTransition(state.transition, fileNode)
		}
		fileNode.append(`
				break;`)
    }
	

	function compileAction(action: Action, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
					digitalWrite(`+action.actuator.ref?.outputPin+`,`+action.value.value+`);`)
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
	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
		// Collect all unique sensors from conditions
		const sensors: Sensor[] = [];
		for (const condition of transition.conditions) {
			if (condition.sensor?.ref && !sensors.includes(condition.sensor.ref)) {
				sensors.push(condition.sensor.ref);
			}
		}
		
		// Build the condition expression
		let conditionCode = '';
		for (let i = 0; i < transition.conditions.length; i++) {
			const condition = transition.conditions[i];
			const condStr = `digitalRead(${condition.sensor.ref?.inputPin}) == ${condition.value.value}`;
			
			if (i === 0) {
				conditionCode = condStr;
			} else {
				const operator = transition.operator[i - 1] === 'and' ? '&&' : '||';
				conditionCode += ` ${operator} ${condStr}`;
			}
		}
		
		// Build debounce checks
		const debounceChecks = sensors.map(sensor => 
			`millis() - ${sensor.name}LastDebounceTime > debounce`
		).join(' && ');
		
		// Generate the complete transition code
		fileNode.append(`
					if( (${conditionCode}) && (${debounceChecks}) ) {`);
		
		// Update debounce times for all sensors
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

	function compileLCDAction(lcdAction: LCDAction, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
					lcd.clear();
					lcd.setCursor(0, 0);`);
		
		for (const part of lcdAction.parts) {
			if ('text' in part) {
				// ConstantPart
				fileNode.append(`
					lcd.print('${part.text}');`);
			} else {
				// BrickStatusPart
				const brick = part.brick.ref;
				if (brick && 'inputPin' in brick) {
					// Sensor
					fileNode.append(`
					lcd.print(digitalRead(${brick.inputPin}) == HIGH ? "HIGH" : "LOW");`);
				} else if (brick && 'outputPin' in brick) {
					// Actuator
					fileNode.append(`
					lcd.print(digitalRead(${brick.outputPin}) == HIGH ? "ON" : "OFF");`);
				}
			}
		}
	}

