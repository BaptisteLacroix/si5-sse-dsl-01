import { CompositeGeneratorNode } from 'langium'
import {
    Action,
    App,
    Condition,
    SerialBrick,
} from '../language-server/generated/ast'

/**
 * Initializes serial communication in setup() if SerialBrick is present
 */
export function initializeSerial(
    app: App,
    fileNode: CompositeGeneratorNode
): void {
    const serialBrick = app.bricks.find(
        (brick) => brick.$type === 'SerialBrick'
    ) as SerialBrick | undefined
    if (serialBrick) {
        fileNode.append(
            `
		Serial.begin(` +
                serialBrick.baudRate +
                `); // ` +
                serialBrick.name
        )
    }
}

/**
 * Compiles a serial action (Serial.println)
 */
export function compileSerialAction(
    action: Action,
    fileNode: CompositeGeneratorNode
): void {
    if (action.serial && action.message) {
        const message = action.message.replace(/^["']|["']$/g, '') // Remove quotes
        fileNode.append(
            `
					Serial.println("` +
                message +
                `");`
        )
    }
}

/**
 * Checks if a condition is a serial condition
 */
export function isSerialCondition(condition: Condition): boolean {
    return !!(condition.serial && condition.message)
}

/**
 * Compiles a serial condition (string comparison with serial input)
 */
export function compileSerialCondition(condition: Condition): string {
    if (condition.serial && condition.message) {
        const message = condition.message.replace(/^["']|["']$/g, '') // Remove quotes
        return `serialInput == "` + message + `"`
    }
    return ''
}

/**
 * Checks if a logical expression tree contains any serial condition
 */
export function hasSerialCondition(expr: any): boolean {
    if (expr.$type === 'BinaryExpression') {
        return hasSerialCondition(expr.left) || hasSerialCondition(expr.right)
    } else if (expr.$type === 'Condition') {
        return isSerialCondition(expr)
    }
    return false
}

/**
 * Opens the Serial.available() check block
 */
export function openSerialCheckBlock(fileNode: CompositeGeneratorNode): void {
    fileNode.append(
        `
					if (Serial.available()) {
						String serialInput = Serial.readStringUntil('\\n');
						serialInput.trim();`
    )
}

/**
 * Closes the Serial.available() check block
 */
export function closeSerialCheckBlock(fileNode: CompositeGeneratorNode): void {
    fileNode.append(
        `
					}`
    )
}
