actuator "buzzer" pin 11
sensor   "button1" pin 8
sensor   "button2" pin 9

state "off" means buzzer becomes low

state "on" means buzzer becomes high

initial "off"

from "off" to "on" when button1 becomes high and button2 becomes high
from "on"  to "off" when button1 becomes low  or  button2 becomes low

export "DualCheckAlarm"
