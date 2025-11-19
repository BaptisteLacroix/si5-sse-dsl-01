"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInoFile = void 0;
const fs_1 = __importDefault(require("fs"));
const langium_1 = require("langium");
const path_1 = __importDefault(require("path"));
const cli_util_1 = require("./cli-util");
const pin_allocator_1 = require("./pin-allocator");
function generateInoFile(app, filePath, destination) {
    const data = (0, cli_util_1.extractDestinationAndName)(filePath, destination);
    const generatedFilePath = `${path_1.default.join(data.destination, data.name)}.ino`;
    const fileNode = new langium_1.CompositeGeneratorNode();
    compile(app, fileNode);
    if (!fs_1.default.existsSync(data.destination)) {
        fs_1.default.mkdirSync(data.destination, { recursive: true });
    }
    fs_1.default.writeFileSync(generatedFilePath, (0, langium_1.toString)(fileNode));
    return generatedFilePath;
}
exports.generateInoFile = generateInoFile;
function compile(app, fileNode) {
    var _a;
    // Check if app uses LCD (not implemented in current grammar)
    const hasLCD = false;
    // Initialize pin allocator and allocate pins for bricks without manual assignment
    const pinAllocator = new pin_allocator_1.PinAllocator(hasLCD);
    pinAllocator.allocatePins(app.bricks);
    fileNode.append(`
//Wiring code generated from an ArduinoML model
// Application name: ` + app.name + `

` + pinAllocator.getAllocationSummary() + `

long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    for (const brick of app.bricks) {
        if (brick.$type === 'Sensor') {
            fileNode.append(`
bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;

            `, langium_1.NL);
        }
    }
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if (brick.$type === 'Sensor') {
            compileSensor(brick, fileNode, pinAllocator);
        }
        else if (brick.$type === 'Actuator') {
            compileActuator(brick, fileNode, pinAllocator);
        }
    }
    fileNode.append(`
	}
	void loop() {
			switch(currentState){`, langium_1.NL);
    for (const state of app.states) {
        compileState(state, fileNode, pinAllocator);
    }
    fileNode.append(`
		}
	}
	`, langium_1.NL);
}
function compileActuator(actuator, fileNode, pinAllocator) {
    const pin = pinAllocator.getPin(actuator);
    fileNode.append(`
		pinMode(` + pin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode, pinAllocator) {
    const pin = pinAllocator.getPin(sensor);
    fileNode.append(`
		pinMode(` + pin + `, INPUT); // ` + sensor.name + ` [Sensor]`);
}
function compileState(state, fileNode, pinAllocator) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode, pinAllocator);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode, pinAllocator);
    }
    fileNode.append(`
				break;`);
}
function compileAction(action, fileNode, pinAllocator) {
    const pin = pinAllocator.getPin(action.actuator.ref);
    fileNode.append(`
					digitalWrite(` + pin + `,` + action.value.value + `);`);
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
function compileTransition(transition, fileNode, pinAllocator) {
    var _a, _b;
    // Collect all unique sensors from conditions (only sensors need debouncing)
    const sensors = [];
    for (const condition of transition.conditions) {
        const brick = (_a = condition.brick) === null || _a === void 0 ? void 0 : _a.ref;
        if (brick && brick.$type === 'Sensor' && !sensors.includes(brick)) {
            sensors.push(brick);
        }
    }
    // Build the condition expression
    let conditionCode = '';
    for (let i = 0; i < transition.conditions.length; i++) {
        const condition = transition.conditions[i];
        const brick = condition.brick.ref;
        if (!brick)
            continue;
        // Get the allocated pin
        const pin = pinAllocator.getPin(brick);
        // Generate condition based on brick type
        let condStr = '';
        if (brick.$type === 'Sensor') {
            // Sensor
            condStr = `digitalRead(${pin}) == ${condition.value.value}`;
        }
        else if (brick.$type === 'Actuator') {
            // Actuator
            condStr = `digitalRead(${pin}) == ${condition.value.value}`;
        }
        if (i === 0) {
            conditionCode = condStr;
        }
        else {
            const operator = transition.operator[i - 1] === 'and' ? '&&' : '||';
            conditionCode += ` ${operator} ${condStr}`;
        }
    }
    // Build debounce checks only for sensors
    let debounceCheck = '';
    if (sensors.length > 0) {
        const debounceChecks = sensors.map(sensor => `millis() - ${sensor.name}LastDebounceTime > debounce`).join(' && ');
        debounceCheck = ` && (${debounceChecks})`;
    }
    // Generate the complete transition code
    fileNode.append(`
					if( (${conditionCode})${debounceCheck} ) {`);
    // Update debounce times only for sensors
    for (const sensor of sensors) {
        fileNode.append(`
						${sensor.name}LastDebounceTime = millis();`);
    }
    // Change state
    fileNode.append(`
						currentState = ${(_b = transition.next.ref) === null || _b === void 0 ? void 0 : _b.name};
					}
		`);
}
//# sourceMappingURL=generator.js.map