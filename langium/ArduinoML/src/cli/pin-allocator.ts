import { Actuator, Sensor, Brick } from '../language-server/generated/ast';

/**
 * Arduino Uno Pin Allocation Strategy
 * 
 * Pin Constraints:
 * - Digital pins: D2-D13 (12 pins)
 * - Analog input pins: A0-A5 (6 pins, can also be used as digital D14-D19)
 * - PWM/Analog output pins: D3, D5, D6, D9, D10, D11 (6 pins with ~ symbol)
 * - Reserved: D0, D1 (Serial/USB communication)
 * - Reserved for LCD if present: D2-D5, D11, D12 (6 pins)
 */

export interface PinAllocation {
    brick: Brick;
    pin: number;
}

export class PinAllocator {
    // Available digital pins (excluding serial pins 0-1)
    private static readonly DIGITAL_PINS = [8, 9, 10, 11, 12];
    
    // PWM pins that support analog output
    private static readonly PWM_PINS = [1, 2, 3, 4];
    
    // Analog input pins (A0-A5)
    private static readonly ANALOG_INPUT_PINS = [1, 2, 3, 4, 5]; // A0-A5 as digital equivalents
    
    // Pins reserved for LCD (if LCD is present)
    private static readonly LCD_RESERVED_PINS = [2, 3, 4, 5, 11, 12];

    private availableDigitalPins: number[];
    private availablePWMPins: number[];
    private availableAnalogPins: number[];
    private allocations: Map<Brick, number>;

    constructor(hasLCD: boolean = false) {
        this.allocations = new Map();
        
        if (hasLCD) {
            // If LCD is present, remove reserved pins
            this.availableDigitalPins = PinAllocator.DIGITAL_PINS.filter(
                pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin)
            );
            this.availablePWMPins = PinAllocator.PWM_PINS.filter(
                pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin)
            );
        } else {
            this.availableDigitalPins = [...PinAllocator.DIGITAL_PINS];
            this.availablePWMPins = [...PinAllocator.PWM_PINS];
        }
        
        this.availableAnalogPins = [...PinAllocator.ANALOG_INPUT_PINS];
    }

    /**
     * Allocates pins for all bricks that don't have pins specified.
     * Returns a map of brick to pin number, including both pre-assigned and auto-allocated pins.
     */
    allocatePins(bricks: Brick[]): Map<Brick, number> {
        // First, register all manually assigned pins to avoid conflicts
        for (const brick of bricks) {
            if ('outputPin' in brick && brick.outputPin !== undefined) {
                this.allocations.set(brick, brick.outputPin);
                this.markPinAsUsed(brick.outputPin);
            } else if ('inputPin' in brick && brick.inputPin !== undefined) {
                this.allocations.set(brick, brick.inputPin);
                this.markPinAsUsed(brick.inputPin);
            }
        }

        // Then allocate pins for bricks without manual assignment
        for (const brick of bricks) {
            if (!this.allocations.has(brick)) {
                const pin = this.allocatePin(brick);
                if (pin === -1) {
                    throw new Error(`Unable to allocate pin for brick: ${brick.name}`);
                }
                this.allocations.set(brick, pin);
            }
        }

        return this.allocations;
    }

    /**
     * Get the pin allocation summary as a formatted string for code comments
     */
    getAllocationSummary(): string {
        const lines: string[] = [];
        lines.push('// Pin Allocation Summary:');
        
        for (const [brick, pin] of this.allocations) {
            const pinName = pin >= 14 ? `A${pin - 14}` : `D${pin}`;
            const brickType = brick.$type === 'Actuator' ? 'Actuator' : 'Sensor';
            const typeInfo = this.getBrickTypeInfo(brick);
            lines.push(`//   ${brick.name} (${brickType}${typeInfo}): Pin ${pinName} (${pin})`);
        }
        
        return lines.join('\n');
    }

    private getBrickTypeInfo(brick: Brick): string {
        if ('actuatorType' in brick && brick.actuatorType) {
            return `, ${brick.actuatorType}`;
        } else if ('sensorType' in brick && brick.sensorType) {
            return `, ${brick.sensorType}`;
        }
        return '';
    }

    private allocatePin(brick: Brick): number {
        if (brick.$type === 'Actuator') {
            // It's an Actuator
            const actuator = brick as Actuator;
            
            if (actuator.actuatorType === 'analog') {
                // Analog actuators need PWM pins
                return this.allocateFromPool(this.availablePWMPins);
            } else {
                // Digital actuators can use any digital pin
                return this.allocateFromPool(this.availableDigitalPins);
            }
        } else if (brick.$type === 'Sensor') {
            // It's a Sensor
            const sensor = brick as Sensor;
            
            if (sensor.sensorType === 'analog') {
                // Analog sensors need analog input pins
                return this.allocateFromPool(this.availableAnalogPins);
            } else {
                // Digital sensors can use any digital pin
                return this.allocateFromPool(this.availableDigitalPins);
            }
        }
        
        return -1;
    }

    private allocateFromPool(pool: number[]): number {
        if (pool.length === 0) {
            return -1;
        }
        return pool.shift()!;
    }

    private markPinAsUsed(pin: number): void {
        // Remove the pin from all available pools
        this.availableDigitalPins = this.availableDigitalPins.filter(p => p !== pin);
        this.availablePWMPins = this.availablePWMPins.filter(p => p !== pin);
        this.availableAnalogPins = this.availableAnalogPins.filter(p => p !== pin);
    }

    /**
     * Get the allocated pin for a brick
     */
    getPin(brick: Brick): number {
        return this.allocations.get(brick) || -1;
    }
}
