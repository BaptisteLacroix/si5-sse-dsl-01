package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

/**
 * A transition based on a logical expression (composite pattern for AND/OR conditions)
 */
public class LogicalTransition extends Transition {

    private LogicalExpression expression;

    public LogicalExpression getExpression() {
        return expression;
    }

    public void setExpression(LogicalExpression expression) {
        this.expression = expression;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}

