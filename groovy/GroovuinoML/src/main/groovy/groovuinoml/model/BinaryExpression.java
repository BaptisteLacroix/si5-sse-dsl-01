package groovuinoml.model;

public class BinaryExpression {
    public LogicalExpression left;
    public LogicalExpression right;
    public String operator;  

    public BinaryExpression(LogicalExpression left, String op, LogicalExpression right) {
        this.left = left;
        this.operator = op;
        this.right = right;
    }
}
