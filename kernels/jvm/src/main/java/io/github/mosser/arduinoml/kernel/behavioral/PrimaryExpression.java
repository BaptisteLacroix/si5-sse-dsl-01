package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.structural.Brick;
import io.github.mosser.arduinoml.kernel.structural.SIGNAL;

public class PrimaryExpression implements LogicalExpression {
    private Brick brick;
    private SIGNAL value;

    public PrimaryExpression(Brick brick, SIGNAL value) {
        this.brick = brick;
        this.value = value;
    }

    public Brick getBrick() {
        return brick;
    }

    public SIGNAL getValue() {
        return value;
    }
}
