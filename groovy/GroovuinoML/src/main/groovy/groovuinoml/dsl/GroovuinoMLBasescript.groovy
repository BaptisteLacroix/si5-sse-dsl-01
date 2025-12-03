package groovuinoml.dsl


import io.github.mosser.arduinoml.kernel.behavioral.Action
import io.github.mosser.arduinoml.kernel.behavioral.BinaryExpression
import io.github.mosser.arduinoml.kernel.behavioral.LogicalExpression
import io.github.mosser.arduinoml.kernel.behavioral.Operators
import io.github.mosser.arduinoml.kernel.behavioral.PrimaryExpression
import io.github.mosser.arduinoml.kernel.behavioral.State
import io.github.mosser.arduinoml.kernel.structural.Actuator
import io.github.mosser.arduinoml.kernel.structural.Sensor
import io.github.mosser.arduinoml.kernel.structural.SIGNAL
import sun.security.jgss.GSSUtil

abstract class GroovuinoMLBasescript extends Script {


	def resolve(obj) {
		if (obj instanceof String) {
			return ((GroovuinoMLBinding) this.binding).getVariable(obj)
		}
		return obj
	}


	def sensor(String name) {
		println "Defining sensor: $name"
		return [
				pin: { n ->
					((GroovuinoMLBinding) this.binding)
							.getGroovuinoMLModel()
							.createSensor(name, n)
				},
				onPin: { n ->
					((GroovuinoMLBinding) this.binding)
							.getGroovuinoMLModel()
							.createSensor(name, n)
				}
		]
	}

	def actuator(String name) {
		println "Defining actuator: $name"
		return [
				pin: { n ->
					((GroovuinoMLBinding) this.binding)
							.getGroovuinoMLModel()
							.createActuator(name, n)
				}
		]
	}

	def state(String name) {
		println "Defining state: $name"
		List<Action> actions = new ArrayList<Action>()
		((GroovuinoMLBinding) this.binding)
				.getGroovuinoMLModel()
				.createState(name, actions)

		def closure
		closure = { actuator ->
			return [
					becomes: { signal ->
						println "Adding action to state $name: set $actuator to $signal"
						Action action = new Action()
						action.setActuator(actuator instanceof String ?
								(Actuator) resolve(actuator) :
								actuator)
						action.setValue(signal instanceof String ?
								(SIGNAL) resolve(signal) :
								signal)
						println "Action created: set ${action.getActuator().getName()} to ${action.getValue()}"
						actions.add(action)
						return [and: closure]
					}
			]
		}

		return [means: closure]
	}

	def condition = { brick ->
		return [
				becomes: { signal ->
					println "Creating primary expression: $brick becomes $signal"
					def b = resolve(brick)
					println "Resolved brick: $b"
					def s = resolve(signal)
					println "Resolved signal: $s"
					return new PrimaryExpression(b, s)
				}
		]
	}

	def and = { LogicalExpression e1, LogicalExpression e2 ->
		println "Creating AND expression"
		return new BinaryExpression(e1, Operators.AND,  e2)
	}

	def or = { LogicalExpression e1, LogicalExpression e2 ->
		println "Creating OR expression"
		return new BinaryExpression(e1, Operators.OR,  e2)
	}


	def initial(state) {
		((GroovuinoMLBinding) this.binding)
				.getGroovuinoMLModel()
				.setInitialState(resolve(state))
	}

	def from(state1) {
		return [
				to: { state2 ->
					return [

							when: { cond ->
								println "Defining transition from $state1 to $state2 with condition $cond"
								if (cond instanceof LogicalExpression) {
									println "Condition is a LogicalExpression"
									((GroovuinoMLBinding) this.binding)
											.getGroovuinoMLModel()
											.createTransition(
													(State) resolve(state1),
													(State) resolve(state2),
													cond
											)
								}

								else {
									return [
											becomes: { signal ->
												println "Defining transition from $state1 to $state2 when $cond becomes $signal"
												((GroovuinoMLBinding) this.binding)
														.getGroovuinoMLModel()
														.createTransition(
																(State) resolve(state1),
																(State) resolve(state2),
																(Sensor) resolve(cond),
																(SIGNAL) resolve(signal)
														)
											}
									]
								}
							},
							after: { delay ->
								println "Defining transition from $state1 to $state2 after delay $delay"
								((GroovuinoMLBinding) this.binding)
										.getGroovuinoMLModel()
										.createTransition(
												(State) resolve(state1),
												(State) resolve(state2),
												delay
										)
							}
					]
				}
		]
	}

	def export(String name) {
		println(
				((GroovuinoMLBinding) this.binding)
						.getGroovuinoMLModel()
						.generateCode(name)
						.toString()
		)
	}
	int count = 0
	abstract void scriptBody()
	def run() {
		if (count == 0) {
			count++
			scriptBody()
		} else {
			println "Run method is disabled"
		}
	}
}
