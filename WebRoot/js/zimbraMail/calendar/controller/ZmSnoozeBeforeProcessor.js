/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Helper class for applying snooze 'before' times to a set of appointments that
 * were handled en-masse in the reminder dialog.
 *
 * For each appointment
 *  - If the appointment has already started (whether in-progress or completed) then the
 *    before value is not applied, and we store this appt for later processing.
 *  - For appointments that have not started yet:
 *     - If the appointment startTime + snoozeTime is in the future (> now) then
 *       set the appt reminder untilTime.
 *     - If the startTime + snoozeTime is in the past (< now), loop over the
 *       standard set of 'before' snooze times and find the max before time that we can
 *       apply and still have the reminder occur in the future.
 *    Once a time for the appointment's reminder is calculated, save the minimum one (i.e. the
 *    reminder for the earlier occuring appt) as earliestUntilTime.
 *
 * Finally, loop over each of the appointments whose start time is past.
 *  - Set their snooze time to the soonestUntilTime.  When the soonest appt reminder goes off,
 *    any past appointments will appear too.  The user should dismiss them, but till then they
 *    are dragged along
 *
 */
ZmSnoozeBeforeProcessor = function(apptType) {
    this._apptType = apptType;
}
ZmSnoozeBeforeProcessor.prototype.constructor = ZmSnoozeBeforeProcessor;


ZmSnoozeBeforeProcessor.prototype.execute =
function(apptList, chosenSnoozeMilliseconds, appts) {
    var added = false;
    var untilTime;
    var earliestUntilTime = 0;
    var pastAppts = [];
    var actionNode;
    var now = (new Date()).getTime();
    for (var i = 0; i < apptList.size(); i++) {
        var appt = apptList.get(i);
        var apptStartTime = appt.getAlarmInstStart();
        var snoozeMilliseconds = chosenSnoozeMilliseconds;
        if (apptStartTime <= now) {
            // Past or in progress appt.  Once we determine the earliest untilTime,
            // we will apply it to these appts, to 'drag them along'
            pastAppts.push(appt);
        } else {
            // Only apply snooze reminder for appts that have not already started
            snoozeMilliseconds = -snoozeMilliseconds
            untilTime = apptStartTime + snoozeMilliseconds;
            // Test that the chosen 'before' time is valid for this appt.  The user may
            // have entered a value that would cause a reminder to be scheduled for the past.
            // So check the user specified snoozeTime (untilTime = apptStart + snoozeTime); if it
            // is in the past, loop over the standard 'before' snooze intervals and choose the
            // first that results in a reminder scheduled for the future.
            for (var iSnooze = 0; iSnooze < ZmReminderDialog.SNOOZE_MSEC.length; iSnooze++) {
                if ((untilTime >= now) || (snoozeMilliseconds >= 0)) break;
                snoozeMilliseconds = ZmReminderDialog.SNOOZE_MSEC[iSnooze];
                untilTime = apptStartTime + snoozeMilliseconds;
            }

            if (snoozeMilliseconds < 0) {
                // Found a valid untilTime
                var apptInfo = { id: appt.id, until: untilTime};
                appts.push(apptInfo)


                added = true;
                if ((earliestUntilTime ==0) || (earliestUntilTime > untilTime)) {
                    // Keep track of the earliest reminder that will occur
                    earliestUntilTime = untilTime;
                }
            }
        }
    }

    if (added) {
        // At least one future appt was added.  Take the one with the earliest reminder
        // and apply it to past appointments
        for (var i = 0; i < pastAppts.length; i++) {
           var apptInfo = { id: pastAppts[i].id, until: earliestUntilTime};
            appts.push(apptInfo)
        }
    }
    return added;
}

