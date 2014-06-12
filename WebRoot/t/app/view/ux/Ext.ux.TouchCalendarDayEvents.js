/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * Ext.ux.TouchCalendarDayEvents
 */
Ext.define('Ext.ux.TouchCalendarDayEvents', {

    extend: 'Ext.ux.TouchCalendarEventsBase',

	config: {
		/**
		 * Sort the generated events early to late so they appear Left to Right, early to late.
		 */
		eventSortDirection: 'ASC'
	},

	eventFilterFn: function(record, id, currentDateTime){
		var startDate   = this.getRoundedTime(record.get(this.getPlugin().getStartEventField())).getTime(),
			endDate     = this.getRoundedTime(record.get(this.getPlugin().getEndEventField())).getTime();

		return (startDate <= currentDateTime) && (endDate >= currentDateTime);
	},

	renderEventBars: function(store){
		var me                  = this,
			allDayApptRow       = this.getCalendar().element.select('tr.allDayApptRow', this.getCalendar().element.dom).first(),
			allDayApptContainer = this.getCalendar().element.select('div.allDayApptDiv', this.getCalendar().element.dom).first(),
			hasAllDay           = false,
			allDayCount         = 0,
			eventBarLeft        = 0,
			pivotEventBars      = [];

		store.each(function(record) {
			if (record.get('Record').get('isAllDay')) {

				allDayCount++;

				var eventRecord = record.data.Record,
					eventBar    = me.createEventBar(record, eventRecord),
					verticalPos = me.getVerticalDayPosition(record),
					eventWidth  = me.getEventBarWidth(record, 50 + 10), // 50 = left margin, 10 = right margin TODO: make configurable
					eventBarTopPos,
					eventBarTop;

				if (allDayCount === 1) {
					eventBarLeft = me.getHorizontalDayPosition(record, eventWidth, true);
				}

				eventBarTopPos = verticalPos - me.getCalendar().element.getY() + 4;
				// Keeping a distance of 3px between every event bar.
				eventBarTop = allDayCount > 1 ? pivotEventBars[pivotEventBars.length - 1].getTop() + ((eventBar.getHeight()) + 3) : eventBarTopPos;

				pivotEventBars.push(eventBar);

				hasAllDay = true;
				allDayApptRow.show();
				allDayApptContainer.setHeight((eventBar.getHeight() * allDayCount) + 8);

				eventBar.setTop(eventBarTop);
				eventBar.setLeft(eventBarLeft);
				eventBar.setWidth(eventWidth);
			}
		});

		store.each(function(record) {
			if (!record.get('Record').get('isAllDay')) {
				var eventRecord = record.data.Record,
					eventBar    = me.createEventBar(record, eventRecord),
					eventWidth,
					verticalPos,
					horizontalPos,
					eventHeight;

				eventWidth = me.getEventBarWidth(record, 50 + 10); // 50 = left margin, 10 = right margin TODO: make configurable
				verticalPos = me.getVerticalDayPosition(record);

				horizontalPos = me.getHorizontalDayPosition(record, eventWidth, false);
				eventHeight = me.getEventBarHeight(record) + 1;

				if (horizontalPos > 50) {
					eventWidth = (eventWidth - horizontalPos) + 50;
				}

				eventBar.setLeft(horizontalPos);
				eventBar.setTop(verticalPos - me.getCalendar().element.getY());

				eventBar.setHeight(eventHeight);
				eventBar.setWidth(eventWidth);
			}
		});

		if (!hasAllDay) {
			allDayApptRow.hide();
		}
	},

	getEventBarWidth: function(event, offset) {
		var eventsInTimeSlot    = 1,
			calendarWidth       = this.getCalendar().element.getWidth();

		offset                  = offset || 0;

		return Math.floor((calendarWidth - offset) / eventsInTimeSlot);
	},

	getEventBarHeight: function(event) {
		var eventHeight = this.getPlugin().getEventHeight();

		if(Ext.isNumeric(eventHeight)){
			return eventHeight;
		} else if(eventHeight === 'duration'){
			return this.getEventBarHeightDuration(event);
		} else {
			return 'auto';
		}
	},

	getEventBarHeightDuration: function(event) {
		var startDate           = event.data.Record.get(this.getPlugin().getStartEventField()),
			endDate             = event.data.Record.get(this.getPlugin().getEndEventField()),
			isMultiDay          = ZCS.util.isMultiDay(startDate, endDate),
			isStartDay          = this.getCalendar().currentDate.getDate() === startDate.getDate(),
			isEndDay            = this.getCalendar().currentDate.getDate() === endDate.getDate(),
			fakeStartDate       = null,
			fakeEndDate         = null;

		// ZCS - Add fake days to adjust multiday appointments
		/*
		 * When appointment spans across 2, on the start day we need a fake end date, for second day we
		 * need a fake start date. If appointment spans across 2+ days, we need fake start and end days
		 * for day(s) between start and end day.
		 */
		if (isMultiDay && isStartDay) {
			fakeEndDate = new Date(startDate.getTime());
			fakeEndDate.setHours(23); // Day ends at 11:59:59 PM
			fakeEndDate.setMinutes(59);
			fakeEndDate.setSeconds(59);
		}
		else if (isMultiDay && !isStartDay && !isEndDay) {
			fakeStartDate = new Date(this.getCalendar().currentDate);
			fakeStartDate.setHours(00); // Day starts at 12:00:00 AM
			fakeStartDate.setMinutes(00);
			fakeStartDate.setSeconds(00);

			fakeEndDate = new Date(this.getCalendar().currentDate);
			fakeEndDate.setHours(23);
			fakeEndDate.setMinutes(59);
			fakeEndDate.setSeconds(59);
		}
		else if (isMultiDay && isEndDay) {
			fakeStartDate = new Date(endDate.getTime());
			fakeStartDate.setHours(00);
			fakeStartDate.setMinutes(00);
			fakeStartDate.setSeconds(00);
		}

		var roundedStartDate    = this.getRoundedTime(fakeStartDate !== null ? fakeStartDate : startDate),
			minutesLength       = ((fakeEndDate !== null ? fakeEndDate.getTime() : endDate.getTime()) - (fakeStartDate !== null ? fakeStartDate.getTime() : startDate.getTime())) / 1000 / 60,
			timeSlotEl          = this.getCalendar().getDateCell(roundedStartDate),
			timeSlotRowEl       = timeSlotEl && timeSlotEl.parent('tr', false), // ZCS - Fix for JS error. Occurs in case of all day appointments.
			heightPixels        = 0;

		if(timeSlotRowEl) {
			var timeSlotHeight  = timeSlotEl.getHeight(),
				minutesPerPixel = timeSlotHeight / 30;

            // ZCS - Minimum height of any appointment set to 15 minutes
			heightPixels = minutesLength <= 15 ? 15 :(minutesLength * minutesPerPixel);
		}

		return heightPixels;
	},

	getVerticalDayPosition: function(event) {
		var startDate           = event.data.Record.get(this.getPlugin().getStartEventField()),
			endDate             = event.data.Record.get(this.getPlugin().getEndEventField()),
			isMultiDay          = ZCS.util.isMultiDay(startDate, endDate),
			isStartDay          = this.getCalendar().currentDate.getDate() === startDate.getDate(),
			fakeStartDate       = null;

		// ZCS - Add fake days to adjust multiday appointments
		if (isMultiDay && !isStartDay) {
			fakeStartDate = new Date(endDate.getTime());
			fakeStartDate.setHours(00); // Day starts at 12:00:00 AM
			fakeStartDate.setMinutes(00);
			fakeStartDate.setSeconds(00);
		}

		var	roundedStartDate    = this.getRoundedTime(fakeStartDate !== null ? fakeStartDate : startDate),
			timeSlotCount       = (roundedStartDate.getHours() * 2) + (roundedStartDate.getMinutes() === 30 ? 1 : 0),
			minutesDiff         = ((fakeStartDate !== null ? fakeStartDate.getTime() : startDate.getTime()) - roundedStartDate.getTime()) / 1000 / 60,
			firstTimeSlotEl     = this.getCalendar().element.select('table.time-slot-table td', this.getCalendar().element.dom).first(),
			verticalPosition    = 0;

		if (firstTimeSlotEl) {
			var firstTimeSlotHeight = firstTimeSlotEl.getHeight(),
				firstTimeSlotY      = firstTimeSlotEl.getY(), // first time slot position - needed so we take the header row into account
				minutesPerPixel     = firstTimeSlotHeight / 30,
				extraMinutesY       = minutesDiff * minutesPerPixel;

			verticalPosition = firstTimeSlotY + (timeSlotCount * firstTimeSlotHeight) + extraMinutesY;
		}

		return verticalPosition;
	},

	getHorizontalDayPosition: function(event, eventBarWidth, isAllDay){
		var barPos           = event.get('BarPosition'),
			leftMargin       = 50,
			spacing          = this.getPlugin().getEventBarSpacing(),
			eventsInTimeSlot = this.getEventsPerTimeSlot()[event.get('Date').getTime()];

		// If for current event there are other 0 or less than 2 other events in same timeslot
		// or overlapping then, discard event's bar position which can be misleading.
		if (isAllDay || eventsInTimeSlot <= 2) {
			barPos = 0;
			return leftMargin + (barPos * eventBarWidth) + (barPos * spacing);
		}
		else {
			return leftMargin + (barPos * eventBarWidth / eventsInTimeSlot) + (barPos * spacing);
		}
	},

	/**
	 * Returns the specified date rounded to the nearest minute block.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getRoundedTime: function(date) {
		date = Ext.Date.clone(date);

		var minutes = date.getMinutes();

		date.setMinutes(minutes - (minutes % this.getCalendar().getDayTimeSlotSize()));

		date.setSeconds(0);
		date.setMilliseconds(0);

		return date;
	}

});