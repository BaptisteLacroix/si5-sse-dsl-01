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
    fileNode.append(`
//Wiring code generated from an ArduinoML model
// Application name: ` + app.name + `

long debounce = 200;
enum STATE {` + app.states.map(s => s.name).join(', ') + `};

STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            fileNode.append(`
bool ` + brick.name + `BounceGuard = false;
long ` + brick.name + `LastDebounceTime = 0;

            `, langium_1.NL);
        }
    }
    fileNode.append(`
	void setup(){`);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            compileSensor(brick, fileNode);
        }
        else {
            compileActuator(brick, fileNode);
        }
    }
    fileNode.append(`
	}
	void loop() {
			switch(currentState){`, langium_1.NL);
    for (const state of app.states) {
        compileState(state, fileNode);
    }
    fileNode.append(`
		}
	}
	`, langium_1.NL);
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`
		pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`
		pinMode(` + sensor.inputPin + `, INPUT); // ` + sensor.name + ` [Sensor]`);
}
function compileState(state, fileNode) {
    fileNode.append(`
				case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode);
    }
    fileNode.append(`
				break;`);
}
function compileAction(action, fileNode) {
    var _a;
    fileNode.append(`
					digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
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
function compileTransition(transition, fileNode) {
    var _a, _b;
    // Collect all unique sensors from conditions (only sensors need debouncing)
    const sensors = [];
    for (const condition of transition.conditions) {
        const brick = (_a = condition.brick) === null || _a === void 0 ? void 0 : _a.ref;
        if (brick && 'inputPin' in brick && !sensors.includes(brick)) {
            sensors.push(brick);
        }
    }
    // Build the condition expression
    let conditionCode = '';
    for (let i = 0; i < transition.conditions.length; i++) {
        const condition = transition.conditions[i];
        const brick = condition.brick.ref;
        // Generate condition based on brick type
        let condStr = '';
        if (brick && 'inputPin' in brick) {
            // Sensor
            condStr = `digitalRead(${brick.inputPin}) == ${condition.value.value}`;
        }
        else if (brick && 'outputPin' in brick) {
            // Actuator
            condStr = `digitalRead(${brick.outputPin}) == ${condition.value.value}`;
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