"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinAllocator = void 0;
class PinAllocator {
    constructor(hasLCD = false) {
        this.allocations = new Map();
        if (hasLCD) {
            // If LCD is present, remove reserved pins
            this.availableDigitalPins = PinAllocator.DIGITAL_PINS.filter(pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin));
            this.availablePWMPins = PinAllocator.PWM_PINS.filter(pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin));
        }
        else {
            this.availableDigitalPins = [...PinAllocator.DIGITAL_PINS];
            this.availablePWMPins = [...PinAllocator.PWM_PINS];
        }
        this.availableAnalogPins = [...PinAllocator.ANALOG_INPUT_PINS];
    }
    /**
     * Allocates pins for all bricks that don't have pins specified.
     * Returns a map of brick to pin number, including both pre-assigned and auto-allocated pins.
     */
    allocatePins(bricks) {
        // First, register all manually assigned pins to avoid conflicts
        for (const brick of bricks) {
            if ('outputPin' in brick && brick.outputPin !== undefined) {
                this.allocations.set(brick, brick.outputPin);
                this.markPinAsUsed(brick.outputPin);
            }
            else if ('inputPin' in brick && brick.inputPin !== undefined) {
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
    getAllocationSummary() {
        const lines = [];
        lines.push('// Pin Allocation Summary:');
        for (const [brick, pin] of this.allocations) {
            const pinName = pin >= 14 ? `A${pin - 14}` : `D${pin}`;
            const brickType = brick.$type === 'Actuator' ? 'Actuator' : 'Sensor';
            const typeInfo = this.getBrickTypeInfo(brick);
            lines.push(`//   ${brick.name} (${brickType}${typeInfo}): Pin ${pinName} (${pin})`);
        }
        return lines.join('\n');
    }
    getBrickTypeInfo(brick) {
        if ('actuatorType' in brick && brick.actuatorType) {
            return `, ${brick.actuatorType}`;
        }
        else if ('sensorType' in brick && brick.sensorType) {
            return `, ${brick.sensorType}`;
        }
        return '';
    }
    allocatePin(brick) {
        if (brick.$type === 'Actuator') {
            // It's an Actuator
            const actuator = brick;
            if (actuator.actuatorType === 'analog') {
                // Analog actuators need PWM pins
                return this.allocateFromPool(this.availablePWMPins);
            }
            else {
                // Digital actuators can use any digital pin
                return this.allocateFromPool(this.availableDigitalPins);
            }
        }
        else if (brick.$type === 'Sensor') {
            // It's a Sensor
            const sensor = brick;
            if (sensor.sensorType === 'analog') {
                // Analog sensors need analog input pins
                return this.allocateFromPool(this.availableAnalogPins);
            }
            else {
                // Digital sensors can use any digital pin
                return this.allocateFromPool(this.availableDigitalPins);
            }
        }
        return -1;
    }
    allocateFromPool(pool) {
        if (pool.length === 0) {
            return -1;
        }
        return pool.shift();
    }
    markPinAsUsed(pin) {
        // Remove the pin from all available pools
        this.availableDigitalPins = this.availableDigitalPins.filter(p => p !== pin);
        this.availablePWMPins = this.availablePWMPins.filter(p => p !== pin);
        this.availableAnalogPins = this.availableAnalogPins.filter(p => p !== pin);
    }
    /**
     * Get the allocated pin for a brick
     */
    getPin(brick) {
        return this.allocations.get(brick) || -1;
    }
}
exports.PinAllocator = PinAllocator;
// Available digital pins (excluding serial pins 0-1)
PinAllocator.DIGITAL_PINS = [8, 9, 10, 11, 12];
// PWM pins that support analog output
PinAllocator.PWM_PINS = [1, 2, 3, 4];
// Analog input pins (A0-A5)
PinAllocator.ANALOG_INPUT_PINS = [1, 2, 3, 4, 5]; // A0-A5 as digital equivalents
// Pins reserved for LCD (if LCD is present)
PinAllocator.LCD_RESERVED_PINS = [2, 3, 4, 5, 11, 12];
//# sourceMappingURL=pin-allocator.js.map