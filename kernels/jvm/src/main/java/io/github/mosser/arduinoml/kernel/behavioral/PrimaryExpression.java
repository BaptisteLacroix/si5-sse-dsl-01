package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.Brick;
import io.github.mosser.arduinoml.kernel.structural.SIGNAL;

public class PrimaryExpression implements LogicalExpression {
    public Brick brick;
    public SIGNAL value;

    public PrimaryExpression(Brick brick, SIGNAL value) {
        this.brick = brick;
        this.value = value;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    public Brick getBrick() {
        return brick;
    }

    public SIGNAL getValue() {
        return value;
    }
}
