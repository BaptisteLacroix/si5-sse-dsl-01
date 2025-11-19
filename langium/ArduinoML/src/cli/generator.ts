import fs from 'fs'
import { CompositeGeneratorNode, NL, toString } from 'langium'
import path from 'path'
import {
    Action,
    Actuator,
    AnalogActuator,
    AnalogSensor,
    App,
    Sensor,
    State,
    Transition,
} from '../language-server/generated/ast'
import { extractDestinationAndName } from './cli-util'

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
    fileNode.append(
        `
//Wiring code generated from an ArduinoML model
// Application name: ` +
            app.name +
            `

long debounce = 200;
enum STATE {` +
            app.states.map((s) => s.name).join(', ') +
            `};

STATE currentState = ` +
            app.initial.ref?.name +
            `;`,
        NL
    )

    for (const brick of app.bricks) {
        if ('inputPin' in brick) {
            if (brick.$type === 'AnalogSensor') {
                // Analog sensors don't need debounce guards
            } else {
                fileNode.append(
                    `
bool ` +
                        brick.name +
                        `BounceGuard = false;
long ` +
                        brick.name +
                        `LastDebounceTime = 0;

                `,
                    NL
                )
            }
        }
    }
    fileNode.append(`
	void setup(){`)
    for (const brick of app.bricks) {
        if ('inputPin' in brick) {
            if (brick.$type === 'AnalogSensor') {
                compileAnalogSensor(brick, fileNode)
            } else {
                compileSensor(brick, fileNode)
            }
        } else {
            if (brick.$type === 'AnalogActuator') {
                compileAnalogActuator(brick, fileNode)
            } else {
                compileActuator(brick, fileNode)
            }
        }
    }

    fileNode.append(
        `
	}
	void loop() {
			switch(currentState){`,
        NL
    )
    for (const state of app.states) {
        compileState(state, fileNode)
    }
    fileNode.append(
        `
		}
	}
	`,
        NL
    )
}

function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
    fileNode.append(
        `
		pinMode(` +
            actuator.outputPin +
            `, OUTPUT); // ` +
            actuator.name +
            ` [Actuator]`
    )
}

function compileAnalogActuator(
    actuator: AnalogActuator,
    fileNode: CompositeGeneratorNode
) {
    fileNode.append(
        `
		pinMode(` +
            actuator.outputPin +
            `, OUTPUT); // ` +
            actuator.name +
            ` [AnalogActuator]`
    )
}

function compileSensor(sensor: Sensor, fileNode: CompositeGeneratorNode) {
    fileNode.append(
        `
		pinMode(` +
            sensor.inputPin +
            `, INPUT); // ` +
            sensor.name +
            ` [Sensor]`
    )
}

function compileAnalogSensor(
    sensor: AnalogSensor,
    fileNode: CompositeGeneratorNode
) {
    fileNode.append(
        `
		pinMode(` +
            sensor.inputPin +
            `, INPUT); // ` +
            sensor.name +
            ` [AnalogSensor]`
    )
}

function compileState(state: State, fileNode: CompositeGeneratorNode) {
    fileNode.append(
        `
				case ` +
            state.name +
            `:`
    )
    for (const action of state.actions) {
        compileAction(action, fileNode)
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode)
    }
    fileNode.append(`
				break;`)
}

function compileAction(action: Action, fileNode: CompositeGeneratorNode) {
    if (action.actuator) {
        // Digital actuator
        fileNode.append(
            `
					digitalWrite(` +
                action.actuator.ref?.outputPin +
                `,` +
                action.value?.value +
                `);`
        )
    } else if (action.analogActuator && action.analogValue) {
        // Analog actuator
        if (action.analogValue.intValue !== undefined) {
            // Direct integer value
            fileNode.append(
                `
					analogWrite(` +
                    action.analogActuator.ref?.outputPin +
                    `,` +
                    action.analogValue.intValue +
                    `);`
            )
        } else if (action.analogValue.sensorValue) {
            // Value from another analog sensor
            fileNode.append(
                `
					analogWrite(` +
                    action.analogActuator.ref?.outputPin +
                    `, analogRead(` +
                    action.analogValue.sensorValue.ref?.inputPin +
                    `));`
            )
        }
    }
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
function compileTransition(
    transition: Transition,
    fileNode: CompositeGeneratorNode
) {
    // Collect all unique digital sensors from conditions (only digital sensors need debouncing)
    const sensors: Sensor[] = []
    for (const condition of transition.conditions) {
        if (condition.brick) {
            const brick = condition.brick.ref
            if (brick && brick.$type === 'Sensor' && !sensors.includes(brick)) {
                sensors.push(brick)
            }
        }
    }

    // Build the condition expression
    let conditionCode = ''
    for (let i = 0; i < transition.conditions.length; i++) {
        const condition = transition.conditions[i]

        // Generate condition based on type
        let condStr = ''
        if (
            condition.analogBrick &&
            condition.operator &&
            condition.threshold !== undefined
        ) {
            // Analog sensor with threshold comparison
            const analogSensor = condition.analogBrick.ref
            condStr = `analogRead(${analogSensor?.inputPin}) ${condition.operator} ${condition.threshold}`
        } else if (condition.brick) {
            const brick = condition.brick.ref
            if (brick && 'inputPin' in brick) {
                // Digital Sensor
                condStr = `digitalRead(${brick.inputPin}) == ${condition.value?.value}`
            } else if (brick && 'outputPin' in brick) {
                // Actuator
                condStr = `digitalRead(${brick.outputPin}) == ${condition.value?.value}`
            }
        }

        if (i === 0) {
            conditionCode = condStr
        } else {
            const operator = transition.operator[i - 1] === 'and' ? '&&' : '||'
            conditionCode += ` ${operator} ${condStr}`
        }
    }

    // Build debounce checks only for digital sensors
    let debounceCheck = ''
    if (sensors.length > 0) {
        const debounceChecks = sensors
            .map(
                (sensor) =>
                    `millis() - ${sensor.name}LastDebounceTime > debounce`
            )
            .join(' && ')
        debounceCheck = ` && (${debounceChecks})`
    }

    // Generate the complete transition code
    fileNode.append(`
					if( (${conditionCode})${debounceCheck} ) {`)

    // Update debounce times only for digital sensors
    for (const sensor of sensors) {
        fileNode.append(`
						${sensor.name}LastDebounceTime = millis();`)
    }

    // Change state
    fileNode.append(`
						currentState = ${transition.next.ref?.name};
					}
		`)
}
