package groovuinoml.model;

import io.github.mosser.arduinoml.kernel.structural.Brick;
import io.github.mosser.arduinoml.kernel.structural.SIGNAL;

public class PrimaryExpression {
    public Brick brick;
    public SIGNAL value;

    public PrimaryExpression(Brick brick, SIGNAL value) {
        this.brick = brick;
        this.value = value;
    }
}
