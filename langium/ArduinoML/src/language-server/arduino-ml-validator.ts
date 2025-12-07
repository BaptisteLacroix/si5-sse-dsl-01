import { ValidationAcceptor, ValidationChecks } from 'langium';
import { ArduinoMlAstType, App, LCDAction } from './generated/ast';
import type { ArduinoMlServices } from './arduino-ml-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ArduinoMlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlValidator;
    const checks: ValidationChecks<ArduinoMlAstType> = {
        App: validator.checkNothing,
        LCDAction: validator.checkLCDMessageLength
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ArduinoMlValidator {

    checkNothing(app: App, accept: ValidationAcceptor): void {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }

    /**
     * Validates that LCD messages don't exceed 16 characters (standard LCD 16x2 display).
     * Estimates the maximum possible length for messages with dynamic parts.
     */
    checkLCDMessageLength(lcdAction: LCDAction, accept: ValidationAcceptor): void {
        const MAX_LCD_LENGTH = 16;
        
        // Estimate maximum length for all message parts
        let estimatedLength = 0;
        for (const part of lcdAction.parts) {
            if ('text' in part) {
                // ConstantPart - remove quotes
                const text = part.text.slice(1, -1);
                estimatedLength += text.length;
            } else {
                // BrickStatusPart - assume max 10 chars for "name := HIGH" format
                estimatedLength += 10;
            }
        }
        
        if (estimatedLength > MAX_LCD_LENGTH) {
            accept('warning', 
                `LCD message may be too long (estimated ${estimatedLength} chars). Maximum is ${MAX_LCD_LENGTH} characters.`, 
                { node: lcdAction, property: 'parts' }
            );
        }
    }

}
