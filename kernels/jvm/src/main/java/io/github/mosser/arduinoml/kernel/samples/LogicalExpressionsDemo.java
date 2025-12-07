package io.github.mosser.arduinoml.kernel.samples;

import io.github.mosser.arduinoml.kernel.App;
import io.github.mosser.arduinoml.kernel.behavioral.*;
import io.github.mosser.arduinoml.kernel.generator.ToWiring;
import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.*;

import java.util.Arrays;

/**
 * Demonstrates the composite pattern for logical expressions (AND/OR)
 * Scenario: A security alarm system
 * - LED turns ON when both motion sensor AND door sensor are triggered (intruder detected)
 * - LED turns OFF when either motion sensor OR door sensor is not triggered (safe)
 */
public class LogicalExpressionsDemo {

	public static void main(String[] args) {

		// Declaring sensors
		Sensor motionSensor = new Sensor();
		motionSensor.setName("motion");
		motionSensor.setPin(9);

		Sensor doorSensor = new Sensor();
		doorSensor.setName("door");
		doorSensor.setPin(10);

		Sensor resetButton = new Sensor();
		resetButton.setName("reset");
		resetButton.setPin(11);

		// Declaring actuator
		Actuator alarmLED = new Actuator();
		alarmLED.setName("alarm");
		alarmLED.setPin(12);

		// Declaring states
		State safe = new State();
		safe.setName("safe");

		State alarm = new State();
		alarm.setName("alarm");

		// Creating actions
		Action turnAlarmOn = new Action();
		turnAlarmOn.setActuator(alarmLED);
		turnAlarmOn.setValue(SIGNAL.HIGH);

		Action turnAlarmOff = new Action();
		turnAlarmOff.setActuator(alarmLED);
		turnAlarmOff.setValue(SIGNAL.LOW);

		// Binding actions to states
		safe.setActions(Arrays.asList(turnAlarmOff));
		alarm.setActions(Arrays.asList(turnAlarmOn));

		// Creating logical expressions using the Composite Pattern

		// Primary expressions (leaf nodes)
		PrimaryExpression motionDetected = new PrimaryExpression(motionSensor, SIGNAL.HIGH);
		PrimaryExpression doorOpened = new PrimaryExpression(doorSensor, SIGNAL.HIGH);
		PrimaryExpression resetPressed = new PrimaryExpression(resetButton, SIGNAL.HIGH);

		// Binary expression: motion AND door (both must be true)
		BinaryExpression motionAndDoor = new BinaryExpression(
			motionDetected,
			Operators.AND,
			doorOpened
		);

		// Transition from safe to alarm: motion AND door
		LogicalTransition safeToAlarm = new LogicalTransition();
		safeToAlarm.setNext(alarm);
		safeToAlarm.setExpression(motionAndDoor);

		// Primary expressions for alarm to safe transition
		PrimaryExpression noMotion = new PrimaryExpression(motionSensor, SIGNAL.LOW);
		PrimaryExpression doorClosed = new PrimaryExpression(doorSensor, SIGNAL.LOW);

		// Binary expression: noMotion OR doorClosed OR resetPressed
		BinaryExpression noMotionOrDoorClosed = new BinaryExpression(
			noMotion,
			Operators.OR,
			doorClosed
		);

		BinaryExpression fullResetCondition = new BinaryExpression(
			noMotionOrDoorClosed,
			Operators.OR,
			resetPressed
		);

		// Transition from alarm to safe: (noMotion OR doorClosed) OR resetPressed
		LogicalTransition alarmToSafe = new LogicalTransition();
		alarmToSafe.setNext(safe);
		alarmToSafe.setExpression(fullResetCondition);

		// Binding transitions to states
		safe.setTransition(safeToAlarm);
		alarm.setTransition(alarmToSafe);

		// Building the App
		App securitySystem = new App();
		securitySystem.setName("SecuritySystem");
		securitySystem.setBricks(Arrays.asList(motionSensor, doorSensor, resetButton, alarmLED));
		securitySystem.setStates(Arrays.asList(safe, alarm));
		securitySystem.setInitial(safe);

		// Generating Code
		Visitor codeGenerator = new ToWiring();
		securitySystem.accept(codeGenerator);

		// Printing the generated code on the console
		System.out.println(codeGenerator.getResult());
	}

}

