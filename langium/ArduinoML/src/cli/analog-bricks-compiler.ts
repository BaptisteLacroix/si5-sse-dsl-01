import { CompositeGeneratorNode } from 'langium'
import {
    Action,
    AnalogActuator,
    AnalogSensor,
    Condition,
} from '../language-server/generated/ast'

/**
 * Compiles an analog actuator setup (pinMode)
 */
export function compileAnalogActuator(
    actuator: AnalogActuator,
    fileNode: CompositeGeneratorNode
): void {
    fileNode.append(
        `
		pinMode(` +
            actuator.outputPin +
            `, OUTPUT); // ` +
            actuator.name +
            ` [AnalogActuator]`
    )
}

/**
 * Compiles an analog sensor setup (pinMode)
 */
export function compileAnalogSensor(
    sensor: AnalogSensor,
    fileNode: CompositeGeneratorNode
): void {
    fileNode.append(
        `
		pinMode(` +
            sensor.inputPin +
            `, INPUT); // ` +
            sensor.name +
            ` [AnalogSensor]`
    )
}

/**
 * Compiles an analog action (analogWrite)
 * Handles both direct integer values and sensor value transfers
 */
export function compileAnalogAction(
    action: Action,
    fileNode: CompositeGeneratorNode
): void {
    if (action.analogActuator && action.analogValue) {
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
 * Compiles an analog condition (threshold comparison with analogRead)
 */
export function compileAnalogCondition(condition: Condition): string {
    if (
        condition.analogBrick &&
        condition.operator &&
        condition.threshold !== undefined
    ) {
        const analogSensor = condition.analogBrick.ref
        return `analogRead(${analogSensor?.inputPin}) ${condition.operator} ${condition.threshold}`
    }
    return ''
}

/**
 * Checks if a condition is an analog condition
 */
export function isAnalogCondition(condition: Condition): boolean {
    return !!(
        condition.analogBrick &&
        condition.operator &&
        condition.threshold !== undefined
    )
}
