__author__ = 'pascalpoizat'

from pyArduinoML.model.NamedElement import NamedElement
from pyArduinoML.model import SIGNAL

class State(NamedElement):
    """
    A state in the application.

    """

    def __init__(self, name, actions=(), transition=None):
        """
        Constructor.

        :param name: String, name of the state
        :param actions: List[Action], sequence of actions to do when entering the state (size should be > 0)
        :param transition: Transition, unique outgoing transition
        :return:
        """
        NamedElement.__init__(self, name)
        self.transition = transition
        self.actions = actions

    def settransition(self, transition):
        """
        Sets the transition of the state
        :param transition: Transition
        :return:
        """
        self.transition = transition

    def setup(self):
        """
        Arduino code for the state.

        :return: String
        """
        rtr = ""
        rtr += "void state_%s() {\n" % self.name
        # generate code for state actions
        for action in self.actions:
            rtr += "\tdigitalWrite(%s, %s);\n" % (action.brick.name, SIGNAL.value(action.value))
        rtr += "\tboolean guard = millis() - time > debounce;\n"
        transition = self.transition
        condition_code = transition.evaluate_condition()
        rtr += "\tif (%s && guard) {\n\t\ttime = millis(); state_%s();\n\t} else {\n\t\tstate_%s();\n\t}" \
               % (condition_code, transition.nextstate.name, self.name)
        # end of state
        rtr += "\n}\n"
        return rtr
