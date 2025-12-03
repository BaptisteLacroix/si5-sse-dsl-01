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

    public static Operators fromString(String text) {
        for (Operators b : Operators.values()) {
            if (b.operator.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}
