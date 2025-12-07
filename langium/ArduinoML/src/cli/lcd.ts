import {LCDAction} from "../language-server/generated/ast";
import {CompositeGeneratorNode} from "langium";

export function compileLCDAction(lcdAction: LCDAction, fileNode: CompositeGeneratorNode) {
    fileNode.append(`
			lcd.clear();
			lcd.setCursor(0, 0);`);

    for (const part of lcdAction.parts) {
        if ('text' in part) {
            // ConstantPart
            fileNode.append(`
			lcd.print("${part.text}");`);
        } else {
            // BrickStatusPart
            const brick = part.brick.ref;
            if (brick && 'inputPin' in brick) {
                // Sensor
                fileNode.append(`
			lcd.print(digitalRead(${brick.inputPin}) == HIGH ? "HIGH" : "LOW");`);
            } else if (brick && 'outputPin' in brick) {
                // Actuator
                fileNode.append(`
			lcd.print(digitalRead(${brick.outputPin}) == HIGH ? "ON" : "OFF");`);
            }
        }
    }
}