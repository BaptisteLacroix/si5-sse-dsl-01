// Smart Home Security System
sensor "MOTION_DETECTOR" pin 2
sensor "DOOR_SENSOR" pin 3
sensor "WINDOW_SENSOR" pin 4
sensor "ARM_SWITCH" pin 5

actuator "ALARM_LED" pin 10
actuator "SIREN" pin 11
actuator "NOTIFICATION_LED" pin 12

state "disarmed" means ALARM_LED becomes low and SIREN becomes low and NOTIFICATION_LED becomes low

state "armed" means ALARM_LED becomes low and SIREN becomes low and NOTIFICATION_LED becomes high

state "checking_intrusion" means ALARM_LED becomes low and SIREN becomes low and NOTIFICATION_LED becomes high

state "intrusion_detected" means ALARM_LED becomes high and SIREN becomes high and NOTIFICATION_LED becomes high

initial "disarmed"

from "disarmed" to "armed" when ARM_SWITCH becomes high

from "armed" to "checking_intrusion" when ARM_SWITCH becomes high and DOOR_SENSOR becomes high

from "checking_intrusion" to "intrusion_detected" when MOTION_DETECTOR becomes high or WINDOW_SENSOR becomes high

from "intrusion_detected" to "disarmed" when ARM_SWITCH becomes low

export "Smart_Home_Security"

