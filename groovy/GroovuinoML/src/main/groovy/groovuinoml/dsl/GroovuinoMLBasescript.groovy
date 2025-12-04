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
        return new BinaryExpression(e1, Operators.AND, e2)
    }

    def or = { LogicalExpression e1, LogicalExpression e2 ->
        println "Creating OR expression"
        return new BinaryExpression(e1, Operators.OR, e2)
    }

    def initial(state) {
        ((GroovuinoMLBinding) this.binding)
                .getGroovuinoMLModel()
                .setInitialState(resolve(state))
    }

    /**
     * from(state1).to(state2).when(cond) { ... } or .after(delay)
     *
     * - when(cond) accepts either:
     *     * a LogicalExpression (or wrapper exposing .expression)
     *     * or a Sensor reference; in the latter case the returned map contains a 'becomes' closure
     */
    def from(state1) {
        return [
                to: { state2 ->
                    return [
                            when: { cond ->
                                println "Defining transition from $state1 to $state2 with condition $cond"

                                // Try to extract LogicalExpression if it's wrapped (e.g. condition(...) returns wrapper)
                                def expression = null
                                if (cond?.hasProperty('expression')) {
                                    expression = cond.expression
                                } else if (cond instanceof LogicalExpression) {
                                    expression = cond
                                }

                                if (expression != null) {
                                    println "Condition is a LogicalExpression"
                                    ((GroovuinoMLBinding) this.binding)
                                            .getGroovuinoMLModel()
                                            .createTransition(
                                                    (State) resolve(state1),
                                                    (State) resolve(state2),
                                                    expression
                                            )
                                    return null
                                } else {
                                    // cond is expected to be a Sensor (or a string referencing one)
                                    return [
                                            becomes: { signal ->
                                                println "Creating primary expression for inline transition: $cond becomes $signal"
                                                def primaryExpr = new PrimaryExpression(
                                                        (Sensor) resolve(cond),
                                                        (SIGNAL) resolve(signal)
                                                )

                                                // Return a wrapper that allows chaining with and/or operators
                                                return [
                                                        expression: primaryExpr,
                                                        and: { nextCond ->
                                                            return [
                                                                    becomes: { nextSignal ->
                                                                        println "Adding AND condition: $nextCond becomes $nextSignal"
                                                                        def nextPrimaryExpr = new PrimaryExpression(
                                                                                (Sensor) resolve(nextCond),
                                                                                (SIGNAL) resolve(nextSignal)
                                                                        )
                                                                        def combinedExpr = new BinaryExpression(primaryExpr, Operators.AND, nextPrimaryExpr)

                                                                        // Return a new wrapper with the combined expression
                                                                        return createExpressionWrapper(state1, state2, combinedExpr)
                                                                    }
                                                            ]
                                                        },
                                                        or: { nextCond ->
                                                            return [
                                                                    becomes: { nextSignal ->
                                                                        println "Adding OR condition: $nextCond becomes $nextSignal"
                                                                        def nextPrimaryExpr = new PrimaryExpression(
                                                                                (Sensor) resolve(nextCond),
                                                                                (SIGNAL) resolve(nextSignal)
                                                                        )
                                                                        def combinedExpr = new BinaryExpression(primaryExpr, Operators.OR, nextPrimaryExpr)

                                                                        // Return a new wrapper with the combined expression
                                                                        return createExpressionWrapper(state1, state2, combinedExpr)
                                                                    }
                                                            ]
                                                        },
                                                        // Getter methods to allow script completion
                                                        getExpression: { -> primaryExpr }
                                                ]
                                            }
                                    ]
                                }
                            },
                            after: { delay ->
                                println "Defining timed transition from $state1 to $state2 after $delay"
                                ((GroovuinoMLBinding) this.binding)
                                        .getGroovuinoMLModel()
                                        .createTransition(
                                                (State) resolve(state1),
                                                (State) resolve(state2),
                                                (int) delay
                                        )
                                return null
                            }
                    ]
                }
        ]
    }

    // Helper method to create expression wrapper with and/or chaining support
    def createExpressionWrapper(state1, state2, LogicalExpression expr) {
        def scriptRef = this

        // Create the transition immediately with the current expression
        // This will be the final expression if no further chaining occurs
        def createTransition = {
            println "Creating transition with logical expression"
            ((GroovuinoMLBinding) scriptRef.binding)
                    .getGroovuinoMLModel()
                    .createTransition(
                            (State) scriptRef.resolve(state1),
                            (State) scriptRef.resolve(state2),
                            expr
                    )
        }

        // Create immediately, but allow it to be overridden if chaining continues
        createTransition()

        return [
                expression: expr,
                and: { nextCond ->
                    return [
                            becomes: { nextSignal ->
                                println "Adding AND condition: $nextCond becomes $nextSignal"
                                def nextPrimaryExpr = new PrimaryExpression(
                                        (Sensor) resolve(nextCond),
                                        (SIGNAL) resolve(nextSignal)
                                )
                                def combinedExpr = new BinaryExpression(expr, Operators.AND, nextPrimaryExpr)
                                return createExpressionWrapper(state1, state2, combinedExpr)
                            }
                    ]
                },
                or: { nextCond ->
                    return [
                            becomes: { nextSignal ->
                                println "Adding OR condition: $nextCond becomes $nextSignal"
                                def nextPrimaryExpr = new PrimaryExpression(
                                        (Sensor) resolve(nextCond),
                                        (SIGNAL) resolve(nextSignal)
                                )
                                def combinedExpr = new BinaryExpression(expr, Operators.OR, nextPrimaryExpr)
                                return createExpressionWrapper(state1, state2, combinedExpr)
                            }
                    ]
                },
                getExpression: { -> expr }
        ]
    }

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
