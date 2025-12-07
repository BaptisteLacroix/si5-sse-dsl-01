package io.github.mosser.arduinoml.kernel.behavioral;

public class BinaryExpression implements LogicalExpression {
    private LogicalExpression left;
    private LogicalExpression right;
    private Operators operator;

    public BinaryExpression(LogicalExpression left, Operators op, LogicalExpression right) {
        this.left = left;
        this.right = right;
        this.operator = op;
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
