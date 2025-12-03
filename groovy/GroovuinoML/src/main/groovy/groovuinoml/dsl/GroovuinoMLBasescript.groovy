package groovuinoml.dsl

import groovuinoml.model.LogicalExpression

import groovuinoml.model.PrimaryExpression
import io.github.mosser.arduinoml.kernel.behavioral.Action
import io.github.mosser.arduinoml.kernel.behavioral.State
import io.github.mosser.arduinoml.kernel.structural.Actuator
import io.github.mosser.arduinoml.kernel.structural.Sensor
import io.github.mosser.arduinoml.kernel.structural.SIGNAL

abstract class GroovuinoMLBasescript extends Script {
//	public static Number getDuration(Number number, TimeUnit unit) throws IOException {
//		return number * unit.inMillis;
//	}

	// sensor "name" pin n
	def sensor(String name) {
		[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n) },
		onPin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n)}]
	}
	
	// actuator "name" pin n
	def actuator(String name) {
		[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createActuator(name, n) }]
	}
	
	// state "name" means actuator becomes signal [and actuator becomes signal]*n
	def state(String name) {
		List<Action> actions = new ArrayList<Action>()
		((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().createState(name, actions)
		// recursive closure to allow multiple and statements
		def closure
		closure = { actuator -> 
			[becomes: { signal ->
				Action action = new Action()
				action.setActuator(actuator instanceof String ? (Actuator)((GroovuinoMLBinding)this.getBinding()).getVariable(actuator) : (Actuator)actuator)
				action.setValue(signal instanceof String ? (SIGNAL)((GroovuinoMLBinding)this.getBinding()).getVariable(signal) : (SIGNAL)signal)
				actions.add(action)
				[and: closure]
			}]
		}
		[means: closure]
	}

	def condition = { brick ->
    return [
        becomes: { signal ->
            def b = brick instanceof String ?
                    (Sensor)((GroovuinoMLBinding)this.binding).getVariable(brick) :
                    brick

            def s = signal instanceof String ?
                    (SIGNAL)((GroovuinoMLBinding)this.binding).getVariable(signal) :
                    signal

            return new PrimaryExpression(b, s)
        }
    ]
}

	
	// initial state
	def initial(state) {
		((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().setInitialState(state instanceof String ? (State)((GroovuinoMLBinding)this.getBinding()).getVariable(state) : (State)state)
	}
	
// =======================================================
// from <state1> to <state2> when <condition>
// from <state1> to <state2> when <sensor> becomes <signal>
// from <state1> to <state2> after <delay>
// =======================================================

def resolve(obj) {
    if (obj instanceof String)
        return ((GroovuinoMLBinding)this.binding).getVariable(obj)
    return obj
}

def from(state1) {
    return [
        to: { state2 ->
            return [
                when: { cond ->
                    if (cond instanceof LogicalExpression) {

                        ((GroovuinoMLBinding) this.binding)
                            .getGroovuinoMLModel()
                            .createTransition(
                                (State) resolve(state1),
                                (State) resolve(state2),
                                cond
                            )

                    } else {
                        return [
                            becomes: { signal ->

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

	
	// export name
	def export(String name) {
		println(((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().generateCode(name).toString())
	}
	
	// disable run method while running
	int count = 0
	abstract void scriptBody()
	def run() {
		if(count == 0) {
			count++
			scriptBody()
		} else {
			println "Run method is disabled"
		}
	}
}
