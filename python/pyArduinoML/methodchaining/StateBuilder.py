__author__ = 'pascalpoizat'

from pyArduinoML.model.State import State
from pyArduinoML.model.Transition import Transition
from pyArduinoML.model.Condition import SensorCondition, AndCondition, OrCondition
from pyArduinoML.methodchaining.TransitionBuilder import TransitionBuilder
from pyArduinoML.methodchaining.StateActionBuilder import StateActionBuilder
from pyArduinoML.methodchaining.UndefinedBrick import UndefinedBrick
from pyArduinoML.methodchaining.UndefinedState import UndefinedState

class StateBuilder:
    """
    Builder for states.
    """

    def __init__(self, root, state):
        """
        Constructor.

        :param root: BehaviorBuilder, root builder
        :param state: String, state name
        :return:
        """
        self.root = root
        self.state = state
        self.actions = []  # List[StateActionBuilder], builders for the state actions
        self.transition = None  # TransitionBuilder, builder for the state transition (unique in the current meta-model)

    def set(self, actuator):
        """
        Adds an action to the state.

        :param actuator: String, brink the action operates on
        :return: StateActionBuilder, the builder for the action
        """
        action = StateActionBuilder(self, actuator)
        self.actions = self.actions + [action]
        return action

    def when(self, sensor):
        """
        Sets the transition of the state (unique in the current meta-model)

        :param sensor: String, brick to operate on
        :return: TransitionBuilder, the builder for the transition
        """
        transition = TransitionBuilder(self, sensor)
        self.transition = transition
        return transition

    def when_all(self, *sensor_conditions):
        """
        Sets a transition with AND condition (all conditions must be true).

        :param sensor_conditions: Tuple of (sensor_name, value) pairs or Condition objects
        :return: TransitionBuilder, the builder for the transition
        Example: .when_all(("BUTTON1", HIGH), ("BUTTON2", HIGH))
        """
        transition = TransitionBuilder(self, None)
        transition.composite_conditions = sensor_conditions
        transition.composite_type = "AND"
        self.transition = transition
        return transition

    def when_any(self, *sensor_conditions):
        """
        Sets a transition with OR condition (at least one condition must be true).

        :param sensor_conditions: Tuple of (sensor_name, value) pairs or Condition objects
        :return: TransitionBuilder, the builder for the transition
        Example: .when_any(("BUTTON1", HIGH), ("BUTTON2", HIGH))
        """
        transition = TransitionBuilder(self, None)
        transition.composite_conditions = sensor_conditions
        transition.composite_type = "OR"
        self.transition = transition
        return transition

    def when_condition(self, condition_builder_fn):
        """
        Sets a transition with a custom complex condition.

        :param condition_builder_fn: Function that takes bricks dict and returns a Condition
        :return: TransitionBuilder, the builder for the transition
        Example: .when_condition(lambda bricks: AndCondition(
                     OrCondition(SensorCondition(bricks["B1"], HIGH), SensorCondition(bricks["B2"], HIGH)),
                     SensorCondition(bricks["B3"], HIGH)
                 ))
        """
        transition = TransitionBuilder(self, None)
        transition.condition_builder = condition_builder_fn
        self.transition = transition
        return transition

    def get_contents(self, bricks):
        """
        Builds the state (step 1)

        :param bricks: Map[String, Brick], the bricks of the application
        :return: State, the state to build

        This method does not builds the transition attribute.
        A 2-step build is required (due to the meta-model) to get references right while avoiding bad typing tricks
        such as passing a TransitionBuilder instead of a Transition.
        """
        return State(self.state, list(map(lambda builder: builder.get_contents(bricks), self.actions)), None)

    def get_contents2(self, bricks, states):
        """
         Builds the state (step 2)

        :param bricks: Map[String,Brick], the bricks of the application
        :param states: Map[String, State], the states of the application
        :return:
        :raises: UndefinedBrick, if the brick the transition operates on is not defined
        :raises: UndefinedState, if the target state is not defined

        This method builds the transition attribute.
        A 2-step build is required (due to the meta-model) to get references right while avoiding bad typing tricks
        such as passing a TransitionBuilder instead of a Transition.
        """
        # Handle custom complex condition
        if hasattr(self.transition, 'condition_builder') and self.transition.condition_builder:
            if self.state not in states.keys():
                raise UndefinedState()
            if self.transition.next_state not in states.keys():
                raise UndefinedState()

            # Build the condition using the provided function
            composite_condition = self.transition.condition_builder(bricks)
            transition = Transition(None, None, states[self.transition.next_state], condition=composite_condition)
            states[self.state].transition = transition
        # Handle composite conditions
        elif hasattr(self.transition, 'composite_conditions') and self.transition.composite_conditions:
            # Validate all sensors exist
            for sensor_name, value in self.transition.composite_conditions:
                if sensor_name not in bricks.keys():
                    raise UndefinedBrick()

            if self.state not in states.keys():
                raise UndefinedState()
            if self.transition.next_state not in states.keys():
                raise UndefinedState()

            # Create composite condition
            conditions = [SensorCondition(bricks[sensor_name], value)
                         for sensor_name, value in self.transition.composite_conditions]

            if self.transition.composite_type == "AND":
                composite_condition = AndCondition(*conditions)
            else:  # OR
                composite_condition = OrCondition(*conditions)

            transition = Transition(None, None, states[self.transition.next_state], condition=composite_condition)
            states[self.state].transition = transition
        else:
            # Handle simple condition (backward compatibility)
            if self.transition.sensor not in bricks.keys():
                raise UndefinedBrick()
            if self.state not in states.keys():
                raise UndefinedState()
            if self.transition.next_state not in states.keys():
                raise UndefinedState()
            transition = Transition(bricks[self.transition.sensor],
                                    self.transition.value,
                                    states[self.transition.next_state])
            states[self.state].transition = transition
