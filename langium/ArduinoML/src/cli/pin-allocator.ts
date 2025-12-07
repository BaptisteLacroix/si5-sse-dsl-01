import { Actuator, Sensor, Brick } from '../language-server/generated/ast';
import { CompositeGeneratorNode } from 'langium';

export interface PinAllocation {
    brick: Brick;
    pin: number;
}

export class PinAllocator {
    // Available digital pins (excluding serial pins 0-1)
    private static readonly DIGITAL_PINS = [8, 9, 10, 11, 12];
    
    // PWM pins that support analog output
    private static readonly PWM_PINS = [8, 9, 10, 11, 12];
    
    // Analog input pins (A0-A5)
    private static readonly ANALOG_INPUT_PINS = [1, 2, 3, 4, 5]; // A0-A5 as digital equivalents
    
    // Pins reserved for LCD (if LCD is present)
    private static readonly LCD_RESERVED_PINS = [10, 11, 12, 13, 14, 15, 16];

    private availableDigitalPins: number[];
    private availablePWMPins: number[];
    private availableAnalogPins: number[];
    private allocations: Map<Brick, number>;

    constructor(hasLCD: boolean = false) {
        this.allocations = new Map();
        console.log('[PinAllocator] Initializing PinAllocator');
        if (hasLCD) {
            // If LCD is present, remove reserved pins
            this.availableDigitalPins = PinAllocator.DIGITAL_PINS.filter(
                pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin)
            );
            this.availablePWMPins = PinAllocator.PWM_PINS.filter(
                pin => !PinAllocator.LCD_RESERVED_PINS.includes(pin)
            );
            console.log(`[PinAllocator] LCD present, reserved pins: ${PinAllocator.LCD_RESERVED_PINS.join(', ')}`);
        } else {
            this.availableDigitalPins = [...PinAllocator.DIGITAL_PINS];
            this.availablePWMPins = [...PinAllocator.PWM_PINS];
        }
        this.availableAnalogPins = [...PinAllocator.ANALOG_INPUT_PINS];
        console.log(`[PinAllocator] Available digital pins: ${this.availableDigitalPins.join(', ')}`);
        console.log(`[PinAllocator] Available PWM pins: ${this.availablePWMPins.join(', ')}`);
        console.log(`[PinAllocator] Available analog pins: ${this.availableAnalogPins.join(', ')}`);
    }

    /**
     * Allocates pins for all bricks that don't have pins specified.
     * Returns a map of brick to pin number, including both pre-assigned and auto-allocated pins.
     */
    allocatePins(bricks: Brick[]): Map<Brick, number> {
        console.log('[PinAllocator] Starting pin allocation for bricks:', bricks.map(b => b.name));
        // First, register all manually assigned pins to avoid conflicts
        for (const brick of bricks) {
            if ('outputPin' in brick && brick.outputPin !== undefined) {
                this.allocations.set(brick, brick.outputPin);
                this.markPinAsUsed(brick.outputPin);
                console.log(`[PinAllocator] Manually assigned outputPin ${brick.outputPin} to brick ${brick.name}`);
            } else if ('inputPin' in brick && brick.inputPin !== undefined) {
                this.allocations.set(brick, brick.inputPin);
                this.markPinAsUsed(brick.inputPin);
                console.log(`[PinAllocator] Manually assigned inputPin ${brick.inputPin} to brick ${brick.name}`);
            }
        }

        // Then allocate pins for bricks without manual assignment
        for (const brick of bricks) {
            if (!this.allocations.has(brick)) {
                // Skip SerialBrick - it uses hardware serial pins (0-1) and doesn't need allocation
                if (brick.$type === 'SerialBrick') {
                    console.log(`[PinAllocator] Skipping pin allocation for SerialBrick: ${brick.name} (uses hardware serial pins 0-1)`);
                    continue;
                }

                // Skip LCD - it uses hardcoded pins in the generator
                if (brick.$type === 'LCD') {
                    console.log(`[PinAllocator] Skipping pin allocation for LCD: ${brick.name} (uses hardcoded pins 2-12)`);
                    continue;
                }

                const pin = this.allocatePin(brick);
                if (pin === -1) {
                    console.error(`[PinAllocator] ERROR: Unable to allocate pin for brick: ${brick.name}`);
                    throw new Error(`Unable to allocate pin for brick: ${brick.name}`);
                }
                console.log(`[] ${this.allocations.forEach((p, b) => console.log(`  - ${b.name}: Pin ${p}`))}`);
                this.allocations.set(brick, pin);
                console.log(`[] ${this.allocations.forEach((p, b) => console.log(`  - ${b.name}: Pin ${p}`))}`);
                console.log(`[PinAllocator] Auto-allocated pin ${pin} to brick ${brick.name}`);
            }
        }

        console.log('[PinAllocator] Final allocations:');
        for (const [brick, pin] of this.allocations) {
            console.log(`  - ${brick.name} (${brick.$type}): Pin ${pin}`);
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
            let brickType = brick.$type;
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
        console.log(`[PinAllocator] Allocating pin for brick: ${brick.name} of type ${brick.$type}`);
        if (brick.$type === 'Actuator') {
            // It's an Actuator
            const actuator = brick as Actuator;
            if (actuator.actuatorType === 'analog') {
                console.log(`[PinAllocator] Allocating PWM pin for analog actuator: ${brick.name}`);
                // Analog actuators need PWM pins
                return this.allocateFromPool(this.availablePWMPins, `[PinAllocator] No available PWM pins for analog actuator: ${brick.name}`);
            } else {
                // Digital actuators can use any digital pin
                console.log(`[PinAllocator] Allocating digital pin for digital actuator: ${brick.name}`);
                return this.allocateFromPool(this.availableDigitalPins, `[PinAllocator] No available digital pins for digital actuator: ${brick.name}`);
            }
        } else if (brick.$type === 'AnalogActuator') {
            console.log(`[PinAllocator] Allocating PWM pin for AnalogActuator: ${brick.name}`);
            // AnalogActuator always needs PWM pins
            return this.allocateFromPool(this.availablePWMPins, `[PinAllocator] No available PWM pins for AnalogActuator: ${brick.name}`);
        } else if (brick.$type === 'Sensor') {
            console.log(`[PinAllocator] Allocating pin for Sensor: ${brick.name}`);
            // It's a Sensor
            const sensor = brick as Sensor;
            if (sensor.sensorType === 'analog') {
                console.log(`[PinAllocator] Allocating analog pin for analog sensor: ${brick.name}`);
                // Analog sensors need analog input pins
                return this.allocateFromPool(this.availableAnalogPins, `[PinAllocator] No available analog pins for analog sensor: ${brick.name}`);
            } else {
                // Digital sensors can use any digital pin
                console.log(`[PinAllocator] Allocating digital pin for digital sensor: ${brick.name}`);
                return this.allocateFromPool(this.availableDigitalPins, `[PinAllocator] No available digital pins for digital sensor: ${brick.name}`);
            }
        } else if (brick.$type === 'AnalogSensor') {
            console.log(`[PinAllocator] Allocating analog pin for AnalogSensor: ${brick.name}`);
            // AnalogSensor always needs analog input pins
            return this.allocateFromPool(this.availableAnalogPins, `[PinAllocator] No available analog pins for AnalogSensor: ${brick.name}`);
        }
        const unknownBrick = brick as Brick;
        console.warn(`[PinAllocator] Unknown brick type for allocation: ${unknownBrick.name} (${unknownBrick.$type})`);
        return -1;
    }

    private allocateFromPool(pool: number[], errorMsg?: string): number {
        if (pool.length === 0) {
            if (errorMsg) {
                console.error(errorMsg);
            }
            return -1;
        }
        const pin = pool.shift()!;
        console.log(`[PinAllocator] Allocated pin ${pin} from pool. Remaining: ${pool.join(', ')}`);
        return pin;
    }

    private markPinAsUsed(pin: number): void {
        // Remove the pin from all available pools
        this.availableDigitalPins = this.availableDigitalPins.filter(p => p !== pin);
        this.availablePWMPins = this.availablePWMPins.filter(p => p !== pin);
        this.availableAnalogPins = this.availableAnalogPins.filter(p => p !== pin);
        console.log(`[PinAllocator] Marked pin ${pin} as used. Digital: [${this.availableDigitalPins.join(', ')}], PWM: [${this.availablePWMPins.join(', ')}], Analog: [${this.availableAnalogPins.join(', ')}]`);
    }

    /**
     * Get the allocated pin for a brick
     */
    getPin(brick: Brick): number {
        const pin = this.allocations.get(brick) || -1;
        console.log(`[PinAllocator] getPin for brick ${brick.name}: ${pin}`);
        return pin;
    }

    /**
     * Generate debounce variable declarations for all sensors
     */
    generateDebounceVariables(bricks: Brick[], fileNode: CompositeGeneratorNode): void {
        for (const brick of bricks) {
            // Only digital sensors need debouncing, not AnalogSensor
            if (brick.$type === 'Sensor') {
                fileNode.append(`
bool ${brick.name}BounceGuard = false;
long ${brick.name}LastDebounceTime = 0;

            `);
            }
        }
    }

    /**
     * Generate pinMode setup calls for all bricks
     */
    generatePinModeSetup(bricks: Brick[], fileNode: CompositeGeneratorNode): void {
        for (const brick of bricks) {
            const pin = this.getPin(brick);
            if (brick.$type === 'Sensor') {
                fileNode.append(`
		pinMode(${pin}, INPUT); // ${brick.name} [Sensor]`);
            } else if (brick.$type === 'AnalogSensor') {
                fileNode.append(`
		pinMode(${pin}, INPUT); // ${brick.name} [AnalogSensor]`);
            } else if (brick.$type === 'Actuator') {
                fileNode.append(`
		pinMode(${pin}, OUTPUT); // ${brick.name} [Actuator]`);
            } else if (brick.$type === 'AnalogActuator') {
                fileNode.append(`
		pinMode(${pin}, OUTPUT); // ${brick.name} [AnalogActuator]`);
            }
        }
    }

    /**
     * Generate digitalWrite call for an actuator action
     */
    generateDigitalWrite(actuator: Brick, value: string, fileNode: CompositeGeneratorNode): void {
        const pin = this.getPin(actuator);
        fileNode.append(`
					digitalWrite(${pin},${value});`);
    }

    /**
     * Generate condition code for a transition with debouncing
     * Returns the condition expression and list of sensors involved
     */
    generateTransitionCondition(conditions: any[], operators: string[]): { conditionCode: string; sensors: Sensor[] } {
        const sensors: Sensor[] = [];
        let conditionCode = '';

        // Collect unique sensors and build condition
        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            const brick = condition.brick?.ref;
            
            if (!brick) continue;

            // Collect sensors for debouncing
            if (brick.$type === 'Sensor' && !sensors.includes(brick as Sensor)) {
                sensors.push(brick as Sensor);
            }

            // Get the allocated pin
            const pin = this.getPin(brick);

            // Generate condition string
            const condStr = `digitalRead(${pin}) == ${condition.value.value}`;

            if (i === 0) {
                conditionCode = condStr;
            } else {
                const operator = operators[i - 1] === 'and' ? '&&' : '||';
                conditionCode += ` ${operator} ${condStr}`;
            }
        }

        return { conditionCode, sensors };
    }
}
