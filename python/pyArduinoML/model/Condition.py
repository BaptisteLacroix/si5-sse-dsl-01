from pyArduinoML.model import SIGNAL


class Condition:
    """
    Abstract base class for conditions (Composite pattern).
    """

    def evaluate(self):
        """
        Generates Arduino code for the condition evaluation.
        :return: String, Arduino condition code
        """
        raise NotImplementedError("Subclasses must implement evaluate()")


class SensorCondition(Condition):
    """
    Leaf node: Simple sensor condition.
    """

    def __init__(self, sensor, value):
        """
        Constructor.
        :param sensor: Sensor, the sensor to check
        :param value: SIGNAL, the expected value (HIGH or LOW)
        """
        self.sensor = sensor
        self.value = value

    def evaluate(self):
        """
        Generates Arduino code for sensor condition.
        :return: String, e.g., "digitalRead(BUTTON) == HIGH"
        """
        return "digitalRead(%s) == %s" % (self.sensor.name, SIGNAL.value(self.value))


class AndCondition(Condition):
    """
    Composite node: AND of multiple conditions.
    """

    def __init__(self, *conditions):
        """
        Constructor.
        :param conditions: Variable number of Condition objects
        """
        self.conditions = list(conditions)

    def add(self, condition):
        """
        Adds a condition to the AND.
        :param condition: Condition
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
        return "(" + " && ".join([c.evaluate() for c in self.conditions]) + ")"


class OrCondition(Condition):
    """
    Composite node: OR of multiple conditions.
    """

    def __init__(self, *conditions):
        """
        Constructor.
        :param conditions: Variable number of Condition objects
        """
        self.conditions = list(conditions)

    def add(self, condition):
        """
        Adds a condition to the OR.
        :param condition: Condition
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
        return "(" + " || ".join([c.evaluate() for c in self.conditions]) + ")"


class NotCondition(Condition):
    """
    Decorator node: NOT (negation) of a condition.
    """

    def __init__(self, condition):
        """
        Constructor.
        :param condition: Condition to negate
        """
        self.condition = condition

    def evaluate(self):
        """
        Generates Arduino code for NOT condition.
        :return: String, e.g., "!(condition)"
        """
        return "!(%s)" % self.condition.evaluate()
