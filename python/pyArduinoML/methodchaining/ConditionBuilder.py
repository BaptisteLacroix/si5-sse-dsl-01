from pyArduinoML.model.Condition import (
    SensorCondition, AndCondition, OrCondition, NotCondition
)


class ConditionBuilder:
    """
    Builder for composite conditions using method chaining.
    """

    def __init__(self, root):
        """
        Constructor.
        :param root: TransitionBuilder or StateBuilder, the root builder
        """
        self.root = root
        self.condition = None

    def sensor(self, sensor_name, value):
        """
        Creates a simple sensor condition.
        :param sensor_name: String, name of the sensor
        :param value: SIGNAL, expected value
        :return: self for chaining
        """
        self.sensor_name = sensor_name
        self.value = value
        return self

    def and_condition(self, *conditions):
        """
        Creates an AND condition.
        :param conditions: Variable number of Condition objects
        :return: self for chaining
        """
        self.condition = AndCondition(*conditions)
        return self

    def or_condition(self, *conditions):
        """
        Creates an OR condition.
        :param conditions: Variable number of Condition objects
        :return: self for chaining
        """
        self.condition = OrCondition(*conditions)
        return self

    def not_condition(self, condition):
        """
        Creates a NOT condition.
        :param condition: Condition to negate
        :return: self for chaining
        """
        self.condition = NotCondition(condition)
        return self

    def build(self, bricks):
        """
        Builds the actual condition object.
        :param bricks: Map[String, Brick], available bricks
        :return: Condition object
        """
        if self.condition:
            return self.condition
        # Simple sensor condition for backward compatibility
        if hasattr(self, 'sensor_name') and hasattr(self, 'value'):
            return SensorCondition(bricks[self.sensor_name], self.value)
        return None
