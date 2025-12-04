package io.github.mosser.arduinoml.kernel.behavioral;

public enum Operators {
    AND("&&"),
    OR("||");

    String operator;

    Operators(String operator) {
        this.operator = operator;
    }

    public String getOperator() {
        return operator;
    }
}
