import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import {
    Action,
    App,
    Sensor,
    State,
    Transition,
} from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { PinAllocator } from './pin-allocator';
import {
    compileAnalogActuator,
    compileAnalogSensor,
    compileAnalogAction,
    compileAnalogCondition,
    isAnalogCondition,
} from './analog-bricks-compiler';

export function generateInoFile(
    app: App,
    filePath: string,
    destination: string | undefined
): string {
    const data = extractDestinationAndName(filePath, destination)
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`

    const fileNode = new CompositeGeneratorNode()
    compile(app, fileNode)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true })
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode))
    return generatedFilePath
}

function compile(app: App, fileNode: CompositeGeneratorNode) {
    // Check if app uses LCD (not implemented in current grammar)
    const hasLCD = false;

    // Initialize pin allocator and allocate pins for bricks without manual assignment
    const pinAllocator = new PinAllocator(hasLCD);
    pinAllocator.allocatePins(app.bricks);

    fileNode.append(
        `
//Wiring code generated from an ArduinoML model
// Application name: ` +
            app.name +
            `

` + pinAllocator.getAllocationSummary() + `

long debounce = 200;
enum STATE {` +
            app.states.map((s) => s.name).join(', ') +
            `};

STATE currentState = ` +
            app.initial.ref?.name +
            `;`,
        NL
    );

    // Generate debounce variables only for digital sensors (analog sensors don't need debouncing)
    for (const brick of app.bricks) {
        if (brick.$type === 'Sensor') {
            // Digital sensor needs debounce
            fileNode.append(`
bool ${brick.name}BounceGuard = false;
long ${brick.name}LastDebounceTime = 0;

            `);
        }
    }

    fileNode.append(`
	void setup(){`);

    // Generate pinMode setup for all bricks (both digital and analog)
    for (const brick of app.bricks) {
        if (brick.$type === 'AnalogSensor') {
            compileAnalogSensor(brick, fileNode, pinAllocator);
        } else if (brick.$type === 'AnalogActuator') {
            compileAnalogActuator(brick, fileNode, pinAllocator);
        } else if (brick.$type === 'Sensor' || brick.$type === 'Actuator') {
            // Use pin allocator for digital bricks
            const pin = pinAllocator.getPin(brick);
            if (brick.$type === 'Sensor') {
                fileNode.append(`
		pinMode(${pin}, INPUT); // ${brick.name} [Sensor]`);
            } else {
                fileNode.append(`
		pinMode(${pin}, OUTPUT); // ${brick.name} [Actuator]`);
            }
        }
    }

    fileNode.append(`
	}
	void loop() {
			switch(currentState){`, NL);

    for (const state of app.states) {
        compileState(state, fileNode, pinAllocator);
    }

    fileNode.append(`
		}
	}
	`, NL);
}

function compileState(state: State, fileNode: CompositeGeneratorNode, pinAllocator: PinAllocator) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode, pinAllocator);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode, pinAllocator);
    }
    fileNode.append(`
				break;`);
}

function compileAction(action: Action, fileNode: CompositeGeneratorNode, pinAllocator: PinAllocator) {
    if (action.actuator && action.value) {
        // Digital actuator - use pin allocator
        pinAllocator.generateDigitalWrite(action.actuator.ref!, action.value.value, fileNode);
    } else if (action.analogActuator && action.analogValue) {
        // Analog actuator - use analog brick compiler
        compileAnalogAction(action, fileNode, pinAllocator);
    }
}

/**
 * Compiles a transition into Arduino condition checking code with debouncing.
 * This handles both digital bricks (with pin allocation) and analog bricks (with threshold comparison).
 *
 * @param transition - The transition to compile
 * @param fileNode - The composite generator node to append code to
 * @param pinAllocator - The pin allocator for getting allocated pins
 *
 * @example
 * Digital: button1 is HIGH and button2 is HIGH => on
 * Analog: tempSensor > 25 => alarm
 */
function compileTransition(
    transition: Transition,
    fileNode: CompositeGeneratorNode,
    pinAllocator: PinAllocator
) {
    // Collect all unique digital sensors from conditions (only digital sensors need debouncing)
    const sensors: Sensor[] = [];

    // Build the condition expression
    let conditionCode = '';
    for (let i = 0; i < transition.conditions.length; i++) {
        const condition = transition.conditions[i];

        // Generate condition based on type
        let condStr = '';
        if (isAnalogCondition(condition)) {
            // Analog sensor with threshold comparison
            condStr = compileAnalogCondition(condition, pinAllocator);
        } else if (condition.brick) {
            const brick = condition.brick.ref;
            if (brick && brick.$type === 'Sensor') {
                // Digital Sensor - collect for debouncing and use allocated pin
                if (!sensors.includes(brick)) {
                    sensors.push(brick);
                }
                const pin = pinAllocator.getPin(brick);
                condStr = `digitalRead(${pin}) == ${condition.value?.value}`;
            } else if (brick && brick.$type === 'Actuator') {
                // Digital Actuator - use allocated pin
                const pin = pinAllocator.getPin(brick);
                condStr = `digitalRead(${pin}) == ${condition.value?.value}`;
            }
        }

        if (i === 0) {
            conditionCode = condStr;
        } else {
            const operator = transition.operator[i - 1] === 'and' ? '&&' : '||';
            conditionCode += ` ${operator} ${condStr}`;
        }
    }

    // Build debounce checks only for digital sensors
    let debounceCheck = '';
    if (sensors.length > 0) {
        const debounceChecks = sensors
            .map(
                (sensor) =>
                    `millis() - ${sensor.name}LastDebounceTime > debounce`
            )
            .join(' && ');
        debounceCheck = ` && (${debounceChecks})`;
    }

    // Generate the complete transition code
    fileNode.append(`
					if( (${conditionCode})${debounceCheck} ) {`);

    // Update debounce times only for digital sensors
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
