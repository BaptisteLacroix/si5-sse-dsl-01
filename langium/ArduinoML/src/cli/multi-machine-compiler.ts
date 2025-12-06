import { CompositeGeneratorNode, NL } from 'langium';
import { App, State } from '../language-server/generated/ast';

export function hasMultipleMachines(app: App): boolean {
    return app.machines !== undefined && app.machines.length > 0;
}

export function hasSingleMachine(app: App): boolean {
    return app.states !== undefined && app.states.length > 0;
}

export function validateMachineConfiguration(app: App): void {
    const single = hasSingleMachine(app);
    const multiple = hasMultipleMachines(app);

    if (single && multiple) {
        throw new Error(
            "Cannot mix 'states' and 'machines' sections in the same app"
        );
    }

    if (!single && !multiple) {
        throw new Error(
            "App must have either 'states' section or 'machines' section"
        );
    }
}

export function generateMultiMachineHeader(
    app: App,
    fileNode: CompositeGeneratorNode
): void {
    fileNode.append(`
//Wiring code generated from an ArduinoML model
// Application name: ${app.name}

long debounce = 200;
`, NL);

    for (const machine of app.machines) {
        fileNode.append(`
enum STATE_${machine.name} {${machine.states
            .map((s) => `${s.name}_${machine.name}`)
            .join(', ')}};
STATE_${machine.name} currentState_${machine.name} = ${
            machine.initial.ref?.name
        }_${machine.name};
unsigned long lastRun_${machine.name} = 0;
`, NL);
    }
}

export function generateMultiMachineLoop(
    app: App,
    fileNode: CompositeGeneratorNode,
    compileStateCallback: (state: State, machineName?: string) => void
): void {
    fileNode.append(`
	void loop() {
		unsigned long currentMillis = millis();
	`, NL);

    for (const machine of app.machines) {
        fileNode.append(`

        if (currentMillis - lastRun_${machine.name} >= ${machine.period}) {
            lastRun_${machine.name} = currentMillis;
            switch(currentState_${machine.name}) {`, NL);

        for (const state of machine.states) {
            compileStateCallback(state, machine.name);
        }

        fileNode.append(`
			}
		}
		`, NL);
    }

    fileNode.append(`
	}
	`, NL);
}

export function generateMachineStateTransition(
    machineName: string,
    nextStateName: string,
    fileNode: CompositeGeneratorNode
): void {
    fileNode.append(`
						currentState_${machineName} = ${nextStateName};`);
}