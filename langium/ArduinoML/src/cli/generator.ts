import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import {
    Action,
    App,
    BinaryExpression,
    Condition,
    LogicalExpression,
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
import {
    initializeSerial,
    compileSerialAction,
    isSerialCondition,
    compileSerialCondition,
    hasSerialCondition,
    openSerialCheckBlock,
    closeSerialCheckBlock,
} from './serial-bricks-compiler';

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
            `;
bool stateChanged = true;`,
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

    // Initialize serial communication if SerialBrick is present
    initializeSerial(app, fileNode);

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

    // Wrap actions in stateChanged check to execute only on state entry
    if (state.actions.length > 0) {
        fileNode.append(`
					// Execute actions on state entry
					if (stateChanged) {
						stateChanged = false;`);

        for (const action of state.actions) {
            compileAction(action, fileNode, pinAllocator);
        }

        fileNode.append(`
					}`);
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
    } else if (action.serial && action.message) {
        // Serial action - use serial brick compiler
        compileSerialAction(action, fileNode);
    }
}

/**
 * Compiles a transition into Arduino condition checking code with debouncing.
 * Now supports parentheses for logical operator precedence.
 * This handles both digital bricks (with pin allocation) and analog bricks (with threshold comparison).
 *
 * @param transition - The transition to compile
 * @param fileNode - The composite generator node to append code to
 * @param pinAllocator - The pin allocator for getting allocated pins
 *
 * @example
 * Given: button1 is HIGH and (button2 is HIGH or button3 is HIGH) => on
 * Generates:
 * ```cpp
 * if( (digitalRead(8) == HIGH && (digitalRead(10) == HIGH || digitalRead(12) == HIGH)) &&
 *     (millis() - button1LastDebounceTime > debounce) ) {
 *   button1LastDebounceTime = millis();
 *   currentState = on;
 * }
 * ```
 */
function compileTransition(
    transition: Transition,
    fileNode: CompositeGeneratorNode,
    pinAllocator: PinAllocator
) {
    // Check if expression contains serial conditions
    const hasSerial = hasSerialCondition(transition.expression);

    // Collect all unique digital sensors from the expression tree
    const sensors: Sensor[] = []
    collectSensors(transition.expression, sensors)

    // If there are serial conditions, wrap in Serial.available() check
    if (hasSerial) {
        openSerialCheckBlock(fileNode);
    }

    // Build the condition expression recursively
    const conditionCode = compileLogicalExpression(transition.expression, pinAllocator)

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

    // Generate the complete transition code with correct indentation
    const indent = hasSerial ? '\t\t\t\t\t' : '\t\t\t\t\t';
    fileNode.append(`
` + indent + `if( (${conditionCode})${debounceCheck} ) {`);

    // Update debounce times only for digital sensors
    for (const sensor of sensors) {
        fileNode.append(`
` + indent + `\t${sensor.name}LastDebounceTime = millis();`);
    }

    // Change state and set stateChanged flag
    fileNode.append(`
` + indent + `\tcurrentState = ${transition.next.ref?.name};
` + indent + `\tstateChanged = true;
` + indent + `}`);

    // Close Serial.available() block if needed
    if (hasSerial) {
        closeSerialCheckBlock(fileNode);
    }

    fileNode.append(`
		`);
}

/**
 * Recursively compiles a logical expression into Arduino C++ code
 */
function compileLogicalExpression(expr: LogicalExpression, pinAllocator: PinAllocator): string {
    if (expr.$type === 'BinaryExpression') {
        const binExpr = expr as BinaryExpression
        const left = compileLogicalExpression(binExpr.left, pinAllocator)
        const right = compileLogicalExpression(binExpr.right, pinAllocator)
        const operator = binExpr.operator === 'and' ? '&&' : '||'
        // Add parentheses to preserve precedence
        return `(${left} ${operator} ${right})`
    } else if (expr.$type === 'Condition') {
        const condition = expr as Condition
        return compileCondition(condition, pinAllocator)
    }
    return ''
}

/**
 * Compiles a single condition (digital, analog, or serial)
 */
function compileCondition(condition: Condition, pinAllocator: PinAllocator): string {
    if (isAnalogCondition(condition)) {
        return compileAnalogCondition(condition, pinAllocator)
    } else if (isSerialCondition(condition)) {
        return compileSerialCondition(condition)
    } else if (condition.brick) {
        const brick = condition.brick.ref
        if (brick) {
            const pin = pinAllocator.getPin(brick)
            return `digitalRead(${pin}) == ${condition.value?.value}`
        }
    }
    return ''
}

/**
 * Recursively collects all digital sensors from the expression tree for debouncing
 */
function collectSensors(expr: LogicalExpression, sensors: Sensor[]): void {
    if (expr.$type === 'BinaryExpression') {
        const binExpr = expr as BinaryExpression
        collectSensors(binExpr.left, sensors)
        collectSensors(binExpr.right, sensors)
    } else if (expr.$type === 'Condition') {
        const condition = expr as Condition
        if (condition.brick) {
            const brick = condition.brick.ref
            if (brick && brick.$type === 'Sensor' && !sensors.includes(brick)) {
                sensors.push(brick)
            }
        }
    }
}


