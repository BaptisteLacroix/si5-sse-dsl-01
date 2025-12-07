import { CompositeGeneratorNode } from 'langium'
import {
    Condition,
    TemperatureSensor,
} from '../language-server/generated/ast'
import { PinAllocator } from './pin-allocator'

export function compileTemperatureSensor(
    sensor: TemperatureSensor,
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
            ` [TemperatureSensor TMP36]`
    )
}

export function generateTemperatureConversionFunction(fileNode: CompositeGeneratorNode): void {
    fileNode.append(`
// Temperature conversion function for TMP36 sensor
// Returns temperature in Celsius
float readTemperature(int pin) {
	int reading = analogRead(pin);
	float voltage = reading * 5.0 / 1024.0;
	float temperatureC = (voltage - 0.5) * 100.0;
	return temperatureC;
}
`)
}

/**
 * Compiles a temperature condition (comparison in Celsius)
 * Example: temperature > 25 (in °C)
 */
export function compileTemperatureCondition(condition: Condition, pinAllocator: PinAllocator): string {
    if (
        condition.brick &&
        condition.operator &&
        condition.threshold !== undefined
    ) {
        const brick = condition.brick.ref;
        if (brick && brick.$type === 'TemperatureSensor') {
            const pin = pinAllocator.getPin(brick);
            return `readTemperature(${pin}) ${condition.operator} ${condition.threshold}`
        }
    }
    return ''
}

export function isTemperatureCondition(condition: Condition): boolean {
    return !!(
        condition.brick &&
        condition.brick.ref &&
        condition.brick.ref.$type === 'TemperatureSensor' &&
        condition.operator &&
        condition.threshold !== undefined
    )
}

export function hasTemperatureSensor(bricks: any[]): boolean {
    return bricks.some(brick => brick.$type === 'TemperatureSensor')
}
