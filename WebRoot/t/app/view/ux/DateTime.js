Ext.define('Ext.ux.picker.DateTime', {
    extend: 'Ext.picker.Picker',
    xtype: 'datetimepicker',
    alternateClassName: 'Ext.ux.DateTimePicker',
    requires: ['Ext.DateExtras'],

    config: {
        /**
         * @cfg {Number} yearFrom
         * The start year for the date picker.
         * @accessor
         */
        yearFrom: 1980,

        /**
         * @cfg {Number} yearTo
         * The last year for the date picker.
         * @default the current year (new Date().getFullYear())
         * @accessor
         */
        yearTo: new Date().getFullYear(),

        /**
         * @cfg {String} monthText
         * The label to show for the month column.
         * @accessor
         */
        monthText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'M' : 'Month',

        /**
         * @cfg {String} dayText
         * The label to show for the day column.
         * @accessor
         */
        dayText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'j' : 'Day',

        /**
         * @cfg {String} yearText
         * The label to show for the year column.
         * @accessor
         */
        yearText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'Y' : 'Year',

        /**
        * @cfg {String} hourText
        * The label to show for the hour column. Defaults to 'Hour'.
        */
        hourText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'H' : 'Hour',

        /**
         * @cfg {String} minuteText
         * The label to show for the minute column. Defaults to 'Minute'.
         */
        minuteText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'i' : 'Minute',

        /**
         * @cfg {String} ampmText
         * The label to show for the ampm column. Defaults to 'AM/PM'.
         */
        ampmText: (Ext.os.deviceType.toLowerCase() == "phone") ? 'A' : 'AM/PM',

        /**
         * @cfg {Array} slotOrder
         * An array of strings that specifies the order of the slots.
         * @accessor
         */
        slotOrder: ['month', 'day', 'year','hour','minute','ampm'],

        /**
         * @cfg {Int} minuteInterval
         * @accessor
         */
        minuteInterval : 15,

        /**
         * @cfg {Boolean} ampm
         * @accessor
         */
        ampm : false,


        /**
         * @cfg {Object/Date} value
         * Default value for the field and the internal {@link Ext.picker.Date} component. Accepts an object of 'year',
         * 'month' and 'day' values, all of which should be numbers, or a {@link Date}.
         *
         * Examples:
         * {year: 1989, day: 1, month: 5} = 1st May 1989.
         * new Date() = current date
         * @accessor
         */

        /**
         * @cfg {Boolean} useTitles
         * Generate a title header for each individual slot and use
         * the title configuration of the slot.
         * @accessor
         */

        /**
         * @cfg {Array} slots
         * @hide
         * @accessor
         */
    },

    initialize: function() {
        this.callParent();

        this.on({
            scope: this,
            delegate: '> slot',
            slotpick: this.onSlotPick
        });
    },

    setValue: function(value, animated) {
        if (Ext.isDate(value)) {

            ampm =  'AM';
            currentHours = hour =  value.getHours();
            if(this.getAmpm()){
                if (currentHours > 12) {
                    ampm = "PM";
                    hour -= 12;
                } else if(currentHours == 12) {
                   ampm = "PM";
                } else if(currentHours == 0) {
                    hour = 12;
                }
            }
            value = {
                day  : value.getDate(),
                month: value.getMonth() + 1,
                year : value.getFullYear(),
                hour : hour,
                minute : value.getMinutes(),
                ampm : ampm
            };
        }

        this.callParent([value, animated]);
    },

    getValue: function() {
        var values = {},
            daysInMonth, day, hour, minute,
            items = this.getItems().items,
            ln = items.length,
            item, i;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item instanceof Ext.picker.Slot) {
                values[item.getName()] = item.getValue();
            }
        }
        daysInMonth = this.getDaysInMonth(values.month, values.year);
        day = Math.min(values.day, daysInMonth),hour = values.hour,  minute = values.minute;


        var yearval = (isNaN(values.year)) ? new Date().getFullYear() : values.year,
            monthval = (isNaN(values.month)) ? (new Date().getMonth()) : (values.month - 1),
            dayval = (isNaN(day)) ? (new Date().getDate()) : day,
            hourval = (isNaN(hour)) ? new Date().getHours() : hour,
            minuteval = (isNaN(minute)) ? new Date().getMinutes() : minute;
            if(values.ampm && values.ampm == "PM" && hourval<12){
                hourval = hourval + 12;
            }
            if(values.ampm && values.ampm == "AM" && hourval == 12){
                hourval = 0;
            }
        return new Date(yearval, monthval, dayval, hourval, minuteval);
    },

    /**
     * Updates the yearFrom configuration
     */
    updateYearFrom: function() {
        if (this.initialized) {
            this.createSlots();
        }
    },

    /**
     * Updates the yearTo configuration
     */
    updateYearTo: function() {
        if (this.initialized) {
            this.createSlots();
        }
    },

    /**
     * Updates the monthText configuration
     */
    updateMonthText: function(newMonthText, oldMonthText) {
        var innerItems = this.getInnerItems,
            ln = innerItems.length,
            item, i;

        //loop through each of the current items and set the title on the correct slice
        if (this.initialized) {
            for (i = 0; i < ln; i++) {
                item = innerItems[i];

                if ((typeof item.title == "string" && item.title == oldMonthText) || (item.title.html == oldMonthText)) {
                    item.setTitle(newMonthText);
                }
            }
        }
    },

    /**
     * Updates the dayText configuraton
     */
    updateDayText: function(newDayText, oldDayText) {
        var innerItems = this.getInnerItems,
            ln = innerItems.length,
            item, i;

        //loop through each of the current items and set the title on the correct slice
        if (this.initialized) {
            for (i = 0; i < ln; i++) {
                item = innerItems[i];

                if ((typeof item.title == "string" && item.title == oldDayText) || (item.title.html == oldDayText)) {
                    item.setTitle(newDayText);
                }
            }
        }
    },

    /**
     * Updates the yearText configuration
     */
    updateYearText: function(yearText) {
        var innerItems = this.getInnerItems,
            ln = innerItems.length,
            item, i;

        //loop through each of the current items and set the title on the correct slice
        if (this.initialized) {
            for (i = 0; i < ln; i++) {
                item = innerItems[i];

                if (item.title == this.yearText) {
                    item.setTitle(yearText);
                }
            }
        }
    },

    // @private
    constructor: function() {
        this.callParent(arguments);
        this.createSlots();
    },

    /**
     * Generates all slots for all years specified by this component, and then sets them on the component
     * @private
     */
    createSlots: function() {
        var me        = this,
            slotOrder = this.getSlotOrder(),
            yearsFrom = me.getYearFrom(),
            yearsTo   = me.getYearTo(),
            years     = [],
            days      = [],
            months    = [],
            hours = [],
            minutes = [],
            ampm= [],
            ln, tmp, i,
            daysInMonth;

        if(!this.getAmpm()){
            var index = slotOrder.indexOf('ampm')
            if(index >= 0){
                slotOrder.splice(index);
            }
        }
        // swap values if user mixes them up.
        if (yearsFrom > yearsTo) {
            tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                text: i,
                value: i
            });
        }

        daysInMonth = this.getDaysInMonth(1, new Date().getFullYear());

        for (i = 0; i < daysInMonth; i++) {
            days.push({
                text: i + 1,
                value: i + 1
            });
        }

        for (i = 0, ln = Ext.Date.monthNames.length; i < ln; i++) {
            months.push({
                text: (Ext.os.deviceType.toLowerCase() == "phone") ? Ext.Date.monthNames[i].substring(0,3) : Ext.Date.monthNames[i],
                value: i + 1
            });
        }

        var hourLimit =  (this.getAmpm()) ? 12 : 23
        var hourStart =  (this.getAmpm()) ? 1 : 0
        for(i=hourStart;i<=hourLimit;i++){
            hours.push({
                text: this.pad2(i),
                value: i
            });
        }


        for(i=0;i<60;i+=this.getMinuteInterval()){
            minutes.push({
                text: this.pad2(i),
                value: i
            });
        }

        ampm.push({
            text: 'AM',
            value: 'AM'
        },{
            text: 'PM',
            value: 'PM'
        });

        var slots = [];

        slotOrder.forEach(function(item) {
            slots.push(this.createSlot(item, days, months, years,hours,minutes,ampm));
        }, this);

        me.setSlots(slots);
    },

    /**
     * Returns a slot config for a specified date.
     * @private
     */
    createSlot: function(name, days, months, years,hours,minutes,ampm) {
        switch (name) {
            case 'year':
                return {
                    name: 'year',
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'center',
                    data: years,
                    title: this.getYearText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 1.3 : 3
                };
            case 'month':
                return {
                    name: name,
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'right',
                    data: months,
                    title: this.getMonthText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 1.2 : 4
                };
            case 'day':
                return {
                    name: 'day',
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'center',
                    data: days,
                    title: this.getDayText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 0.9 : 2
                };
            case 'hour':
                return {
                    name: 'hour',
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'center',
                    data: hours,
                    title: this.getHourText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 0.9 : 2
                };
            case 'minute':
                return {
                    name: 'minute',
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'center',
                    data: minutes,
                    title: this.getMinuteText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 0.9 : 2
                };
            case 'ampm':
                return {
                    name: 'ampm',
                    align: (Ext.os.deviceType.toLowerCase() == "phone") ? 'left' : 'center',
                    data: ampm,
                    title: this.getAmpmText(),
                    flex: (Ext.os.deviceType.toLowerCase() == "phone") ? 1.1 : 2
                };
        }
    },

   onSlotPick: function(pickedSlot, oldValue, htmlNode, eOpts) {

        // We don't actually get passed the new value. I think this is an ST2 bug. Instead we get passed the slot,
        // the oldValue, the node in the slot which was moved to, and options for the event.
        //
        // However looking at the code that fires the slotpick event, the slot.selectedIndex is always set there
        // We can therefore use this to pull the underlying value that was picked out of the slot's store
        var pickedValue = pickedSlot.getStore().getAt(pickedSlot.selectedIndex).get(pickedSlot.getValueField());

        pickedSlot.setValue(pickedValue);

        if(pickedSlot.getName() === 'month' || pickedSlot.getName() === 'year') {
            this.repopulateDaySlot();
        }
    },


    repopulateDaySlot: function() {
        var slot = this.getDaySlot(),
            days = [],
            month = this.getSlotByName('month').getValue(),
            year = this.getSlotByName('year').getValue(),
            daysInMonth;

        // Get the new days of the month for this new date
        daysInMonth = this.getDaysInMonth(month, year);

        for (i = 0; i < daysInMonth; i++) {
            days.push({
                text: i + 1,
                value: i + 1
            });
        }

        // We dont need to update the slot days unless it has changed
        if (slot.getData().length == days.length) {
            return;
        }

        slot.setData(days);
    },


    getSlotByName: function(name) {
        return this.down('pickerslot[name=' + name + ']');
    },


    getDaySlot: function() {
        return this.getSlotByName('day');
    },

    // @private
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 2 && this.isLeapYear(year) ? 29 : daysInMonth[month-1];
    },

    // @private
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    },
    pad2 : function(number) {
     return (number < 10 ? '0' : '') + number
    }
});