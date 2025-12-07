__author__ = 'pascalpoizat'

from pyArduinoML.model.Condition import SensorCondition


class Transition:
    """
    A transition between two states.
    """

    def __init__(self, sensor, value, nextstate, condition=None):
        """
        Constructor.

        :param sensor: Sensor, sensor which value is checked to trigger the transition (deprecated if condition is used)
        :param value: SIGNAL, value that the sensor must have to trigger the transition (deprecated if condition is used)
        :param nextstate: State, state to change to when the transition is triggered
        :param condition: Condition, composite condition to evaluate (optional, overrides sensor/value)
        :return:
        """
        self.sensor = sensor
        self.value = value
        self.nextstate = nextstate
        # If no condition provided, create a simple SensorCondition for backward compatibility
        if condition is None and sensor is not None:
            self.condition = SensorCondition(sensor, value)
        else:
            self.condition = condition

    def evaluate_condition(self):
        """
        Generates Arduino code for the transition condition.
        :return: String, Arduino condition code
        """
        return self.condition.evaluate()
