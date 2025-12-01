import { CompositeGeneratorNode } from 'langium'
import {
    Action,
    AnalogActuator,
    AnalogSensor,
    Condition,
} from '../language-server/generated/ast'
import { PinAllocator } from './pin-allocator'

/**
 * Compiles an analog actuator setup (pinMode)
 */
export function compileAnalogActuator(
    actuator: AnalogActuator,
    fileNode: CompositeGeneratorNode,
    pinAllocator: PinAllocator
): void {
    const pin = pinAllocator.getPin(actuator);
    fileNode.append(
        `
		pinMode(` +
            pin +
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
    fileNode: CompositeGeneratorNode,
    pinAllocator: PinAllocator
): void {
    const pin = pinAllocator.getPin(sensor);
    fileNode.append(
        `
		pinMode(` +
            pin +
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
    fileNode: CompositeGeneratorNode,
    pinAllocator: PinAllocator
): void {
    if (action.analogActuator && action.analogValue) {
        const actuatorPin = pinAllocator.getPin(action.analogActuator.ref!);
        if (action.analogValue.intValue !== undefined) {
            // Direct integer value
            fileNode.append(
                `
					analogWrite(` +
                    actuatorPin +
                    `,` +
                    action.analogValue.intValue +
                    `);`
            )
        } else if (action.analogValue.sensorValue) {
            // Value from another analog sensor
            const sensorPin = pinAllocator.getPin(action.analogValue.sensorValue.ref!);
            fileNode.append(
                `
					analogWrite(` +
                    actuatorPin +
                    `, analogRead(` +
                    sensorPin +
                    `));`
            )
        }
    }
}

/**
 * Compiles an analog condition (threshold comparison with analogRead)
 */
export function compileAnalogCondition(condition: Condition, pinAllocator: PinAllocator): string {
    if (
        condition.analogBrick &&
        condition.operator &&
        condition.threshold !== undefined
    ) {
        const analogSensor = condition.analogBrick.ref;
        const pin = pinAllocator.getPin(analogSensor!);
        return `analogRead(${pin}) ${condition.operator} ${condition.threshold}`
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
