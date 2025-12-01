from pyArduinoML.model import SIGNAL


class LogicalExpression:
    """
    Interface for logical expressions (matches PlantUML interface).
    """

    def evaluate(self):
        """
        Generates Arduino code for the expression evaluation.
        :return: String, Arduino condition code
        """
        raise NotImplementedError("Subclasses must implement evaluate()")


class BinaryExpression(LogicalExpression):
    """
    Binary expression for AND/OR operations.
    Matches PlantUML: operator: String <<and/or>>
    """

    def __init__(self, operator, left, right):
        """
        Constructor.
        :param operator: String, "and" or "or"
        :param left: LogicalExpression, left operand
        :param right: LogicalExpression, right operand
        """
        self.operator = operator
        self.left = left
        self.right = right

    def evaluate(self):
        """
        Generates Arduino code for binary expression.
        :return: String, e.g., "(left && right)" or "(left || right)"
        """
        operator_map = {
            "and": "&&",
            "or": "||"
        }
        arduino_op = operator_map.get(self.operator.lower(), "&&")
        return "(%s %s %s)" % (self.left.evaluate(), arduino_op, self.right.evaluate())


class PrimaryExpression(LogicalExpression):
    """
    Primary expression for sensor conditions.
    Matches PlantUML: brick: Integer, value: Signal, inner: LogicalExpression (0..1)
    """

    def __init__(self, brick, value, inner=None):
        """
        Constructor.
        :param brick: Sensor, the sensor brick to check
        :param value: SIGNAL, the expected value (HIGH or LOW)
        :param inner: LogicalExpression (optional), for negation support
        """
        self.brick = brick
        self.value = value
        self.inner = inner

    def evaluate(self):
        """
        Generates Arduino code for primary expression.
        :return: String, e.g., "digitalRead(BUTTON) == HIGH"
        """
        if self.inner:
            return "!(%s)" % self.inner.evaluate()
        return "digitalRead(%s) == %s" % (self.brick.name, SIGNAL.value(self.value))


# Legacy aliases for backward compatibility
class Condition(LogicalExpression):
    """
    Legacy abstract base class for conditions (kept for backward compatibility).
    """
    pass


class SensorCondition(PrimaryExpression):
    """
    Legacy sensor condition (wraps PrimaryExpression for backward compatibility).
    """

    def __init__(self, sensor, value):
        super().__init__(sensor, value, None)
        self.sensor = sensor


class AndCondition(LogicalExpression):
    """
    Legacy AND condition (composite pattern for backward compatibility).
    """

    def __init__(self, *conditions):
        """
        Constructor.
        :param conditions: Variable number of LogicalExpression objects
        """
        self.conditions = list(conditions)

    def add(self, condition):
        """
        Adds a condition to the AND.
        :param condition: LogicalExpression
        """
        self.conditions.append(condition)

    def evaluate(self):
        """
        Generates Arduino code for AND condition.
        :return: String, e.g., "(condition1 && condition2)"
        """
        if not self.conditions:
            return "true"
        if len(self.conditions) == 1:
            return self.conditions[0].evaluate()

        # Convert to BinaryExpression chain
        result = self.conditions[0]
        for i in range(1, len(self.conditions)):
            result = BinaryExpression("and", result, self.conditions[i])
        return result.evaluate()


class OrCondition(LogicalExpression):
    """
    Legacy OR condition (composite pattern for backward compatibility).
    """

    def __init__(self, *conditions):
        """
        Constructor.
        :param conditions: Variable number of LogicalExpression objects
        """
        self.conditions = list(conditions)

    def add(self, condition):
        """
        Adds a condition to the OR.
        :param condition: LogicalExpression
        """
        self.conditions.append(condition)

    def evaluate(self):
        """
        Generates Arduino code for OR condition.
        :return: String, e.g., "(condition1 || condition2)"
        """
        if not self.conditions:
            return "false"
        if len(self.conditions) == 1:
            return self.conditions[0].evaluate()

        # Convert to BinaryExpression chain
        result = self.conditions[0]
        for i in range(1, len(self.conditions)):
            result = BinaryExpression("or", result, self.conditions[i])
        return result.evaluate()


class NotCondition(LogicalExpression):
    """
    Decorator node: NOT (negation) of a condition.
    Can be represented as PrimaryExpression with inner.
    """

    def __init__(self, condition):
        """
        Constructor.
        :param condition: LogicalExpression to negate
        """
        self.condition = condition

    def evaluate(self):
        """
        Generates Arduino code for NOT condition.
        :return: String, e.g., "!(condition)"
        """
        return "!(%s)" % self.condition.evaluate()
