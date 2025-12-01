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
    isAction,
    isLCDAction,
    Transition,
} from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import { PinAllocator } from './pin-allocator';
import { PITCHES_DEFINITIONS, compileBuzzer, compileBeep, compilePlayNote } from './buzzer';
import {
    compileAnalogActuator,
    compileAnalogSensor,
    compileAnalogAction,
    compileAnalogCondition,
    isAnalogCondition,
} from './analog-bricks-compiler';
import {compileLCDAction} from "./lcd";

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
        fs.mkdirSync(data.destination, {recursive: true})
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode))
    return generatedFilePath
}

function compile(app: App, fileNode: CompositeGeneratorNode) {
    // Check if app uses LCD
    const hasLCD = app.bricks.some((brick) => brick.$type === 'LCD');

    if (hasLCD) {
        fileNode.append(`
#include <LiquidCrystal.h>

// LCD pins: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
`, NL);
    }

    // Initialize pin allocator and allocate pins for bricks without manual assignment
    const pinAllocator = new PinAllocator(hasLCD);
    pinAllocator.allocatePins(app.bricks);

    if (app.bricks.some((brick) => brick.$type === 'Buzzer')) {
        fileNode.append(PITCHES_DEFINITIONS, NL);
    }

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

    if (hasLCD) {
        fileNode.append(`
		lcd.begin(16, 2); // Initialize LCD 16x2
		lcd.clear();`);
    }

    // Generate pinMode setup for all bricks (both digital and analog)
    for (const brick of app.bricks) {
        if (brick.$type === 'AnalogSensor') {
            compileAnalogSensor(brick, fileNode, pinAllocator);
        } else if (brick.$type === 'AnalogActuator') {
            compileAnalogActuator(brick, fileNode, pinAllocator);
        } else if (brick.$type === 'Buzzer') {
            compileBuzzer(brick, fileNode);
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
				case `+state.name+`:`)
    for(const action of state.actions){
        if (isAction(action)) {
            compileAction(action, fileNode, pinAllocator);
        } else if (action.$type === "Beep") {
            compileBeep(action, fileNode);
        } else if (action.$type === "PlayNote") {
            compilePlayNote(action, fileNode);
        } else if (isLCDAction(action)) {
            compileLCDAction(action, fileNode);
        }
    }
    if (state.transitions !== null){
        for (const transition of state.transitions) {
            compileTransition(transition, fileNode, pinAllocator);
        }
    }
    fileNode.append(`break;`)
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
    // Collect all unique digital sensors from the expression tree
    const sensors: Sensor[] = []
    collectSensors(transition.expression, sensors)

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
 * Compiles a single condition (digital or analog)
 */
function compileCondition(condition: Condition, pinAllocator: PinAllocator): string {
    if (isAnalogCondition(condition)) {
        return compileAnalogCondition(condition, pinAllocator)
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
