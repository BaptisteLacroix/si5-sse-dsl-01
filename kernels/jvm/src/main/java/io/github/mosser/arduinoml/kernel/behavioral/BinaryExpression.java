package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class BinaryExpression implements LogicalExpression {
    public LogicalExpression left;
    public LogicalExpression right;
    public Operators operator;

    public BinaryExpression(LogicalExpression left, Operators op, LogicalExpression right) {
        this.left = left;
        this.operator = op;
        this.right = right;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    public LogicalExpression getLeft() {
        return left;
    }

    public LogicalExpression getRight() {
        return right;
    }
    public Operators getOperator() {
        return operator;
    }
}
