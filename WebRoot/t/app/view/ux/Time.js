/**
 * This is a specialized component which displays a Time Picker on the screen, allowing for the selection of a time (down to milliseconds)
 * This class extends from {@link Ext.picker.Picker} and {@link Ext.Sheet} so it is a popup.
 * ## Examples
 *
 *     @example
 *     var timePicker = Ext.create('Ext.ux.picker.Time');
 *     Ext.Viewport.add( timePicker );
 *     timePicker.show();
 *     
 * You can add up to 5 slots: hours, minutes, seconds, milliseconds, meridien
 * 
 *     @example
 *     var timePicker = Ext.create('Ext.ux.picker.Time',{
 *         slotOrder: ['hours','minutes','seconds','milliseconds','meridien']
 *     });
 *     Ext.Viewport.add( timePicker );
 *     timePicker.show();
 *     
 * You can set custom value lists
 * 
 *     @example
 *     var timePicker = Ext.create('Ext.ux.picker.Time',{
 *         hourList: [3,5,8,9,10]
 *     });
 *     Ext.Viewport.add( timePicker );
 *     timePicker.show();
 * 
 * You can set custom start and end values for each slot, as well as custom increments
 * 
 *     
 *     @example
 *     var timePicker = Ext.create('Ext.ux.picker.Time',{
 *         startHour: 8,
 *         endHour: 18,
 *         increment:2
 *     });
 *     Ext.Viewport.add( timePicker );
 *     timePicker.show();     
 *     
 */
Ext.define('Ext.ux.picker.Time', {
    extend: 'Ext.picker.Picker',
    xtype: 'timepicker',
    alternateClassName: 'Ext.TimePicker',
    requires: [ 'Ext.DateExtras' ],
    config: {
        /**
         * @cfg {String} hourText
         * The label to show for the hour column.
         * @accessor
         */
	    hourText: 'Hour',
	    /**
         * @cfg {String} minuteText
         * The label to show for the minute column.
         * @accessor
         */
	    minuteText: 'Minute',
	    /**
         * @cfg {String} secondText
         * The label to show for the seconds column.
         * @accessor
         */
	    secondText: 'Seconds',
	    /**
         * @cfg {String} millisecondText
         * The label to show for the millisecond column.
         * @accessor
         */
	    millisecondText: 'Milliseconds',
	    /**
         * @cfg {String} meridiemText
         * The label to show for the meridiem column.
         * @accessor
         */
	    meridiemText: 'AM/PM',
	    /**
         * @cfg {String} AMText
         * The text to use for the ante-meridiem.
         * @accessor
         */
        AMText: 'AM',
        /**
         * @cfg {String} PMText
         * The text to use for the post-meridiem.
         * @accessor
         */
        PMText: 'PM',
        /**
         * @cfg {Number} startHour
         * The start hour for the time picker. If meridiem is specified in the {@link #slotOrder}, 
         * {@link #startHour} will be set to 0 (for midnight) if this value is not set at config time
         * @accessor
         */
	    startHour: 1,
	    /**
         * @cfg {Number} endHour
         * The end hour for the time picker. If {@link #endHour} is greater than 12, 
         * meridiem slot will be ignored
         * @accessor
         */
	    endHour: 12,
        /**
         * @cfg {Number} startMinute
         * The start minute for the time picker.
         * @accessor
         */
	    startMinute: 0,
	    /**
         * @cfg {Number} endMinute
         * The end minute for the time picker.
         * @accessor
         */
	    endMinute: 59,
        /**
         * @cfg {Number} startSecond
         * The start second for the time picker.
         * @accessor
         */
	    startSecond: 0,
	    /**
         * @cfg {Number} endSecond
         * The end second for the time picker.
         * @accessor
         */
	    endSecond: 59,
	    /**
         * @cfg {Number} startMillisecond
         * The start millisecond for the time picker.
         * @accessor
         */
	    startMillisecond: 0,
	    /**
         * @cfg {Number} endMillisecond
         * The end millisecond for the time picker.
         * @accessor
         */
	    endMillisecond: 999,
        /**
         * @cfg {Array} hourList
         * Array of hours to use in the hour picker. If {@link #hourList} is defined, {@link #startHour},
         * {@link #endHour} and {@link #hourIncrement} will be ignored
         * @accessor
         */
        hourList: null,
        /**
         * @cfg {Array} minuteList
         * Array of minutes to use in the minute picker. If {@link #minuteList} is defined, {@link #startMinute},
         * {@link #endMinute} and {@link #minuteIncrement} will be ignored
         * @accessor
         */
        minuteList: null,
        /**
         * @cfg {Array} secondList
         * Array of seconds to use in the second picker. If {@link #secondList} is defined, {@link #startSecond},
         * {@link #endSecond} and {@link #secondIncrement} will be ignored
         * @accessor
         */
        secondList: null,
        /**
         * @cfg {Array} millisecondList
         * Array of milliseconds to use in the millisecond picker. If {@link #millisecondList} is defined, {@link #startMillisecond},
         * {@link #endMillisecond} and {@link #millisecondIncrement} will be ignored
         * @accessor
         */
        millisecondList: null,
        /**
         * @cfg {Number} hourIncrement
         * The increment value for hour.
         * @accessor
         */
        hourIncrement: 1,
        /**
         * @cfg {Number} minuteIncrement
         * The increment value for minute.
         * @accessor
         */
	    minuteIncrement: 15,
        /**
         * @cfg {Number} secondIncrement
         * The increment value for second.
         * @accessor
         */
        secondIncrement: 5,
        /**
         * @cfg {Number} millisecondIncrement
         * The increment value for millisecond.
         * @accessor
         */
        millisecondIncrement: 100,
        /**
         * @cfg {Array} slotOrder
         * The order of slots in the picker
         * @accessor
         */
	    slotOrder: ['hour','minute','meridiem'],
        zIndex: 9999
	},
    initialize: function() {
		this.callParent();
    },
    constructor: function() {
        this.callParent( arguments );
        this.createSlots();
    },
    setValue: function( value, animated ) {
        if ( Ext.isDate( value ) ) {
            var useMeridiem=Ext.Array.contains( this.getSlotOrder(), 'meridiem'),
                hours = value.getHours();
            if (useMeridiem) {
                if (hours > 12) {
                    hours -= 12;
                }
                if (hours == 0)
                    hours = 12;
            }
            value = {
                hour  : hours,
                minute: value.getMinutes(),
                second: value.getSeconds(),
                millisecond: value.getMilliseconds(),
                meridiem: value.getHours() >= 12 ? this.getPMText() : this.getAMText()
            };
        }
        this.callParent([value, animated]);
    },
    getValue: function( useDom ) {
        var values = {},
            items = this.getItems().items,
            ln = items.length,
            date = new Date(),
            useMeridiem=Ext.Array.contains( this.getSlotOrder(), 'meridiem' ),
            hour, minute, second, millisecond, meridiem, item, i;
        // get slot values
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item instanceof Ext.picker.Slot) {
                values[ item.getName() ] = item.getValue( useDom );
            }
        }

        // if all the slots return null, we should not return a date
        if (values.hour === null ) {
            return null;
        }
        
        // process hour
        // make sure it's a number
        if( Ext.isNumber( values.hour ) ) {
            // if meridiem is active, need to smartly transform value
            if( useMeridiem ) {
                // if PM is selected
                if( values.meridiem == this.getPMText() ) {
                    hour = values.hour < 12 ? values.hour + 12 : values.hour;
                }
                if( values.meridiem == this.getAMText() ) {
                    hour = values.hour== 12 ? 0 : values.hour;
                }
            }
            else {
                hour = Ext.isNumber( values.hour ) ? values.hour : 0;
            }
        }
        minute = Ext.isNumber( values.minute ) ? values.minute : 0;
        second = Ext.isNumber( values.second ) ? values.second : 0;
        millisecond = Ext.isNumber( values.millisecond ) ? values.millisecond : 0;
        //meridiem = !Ext.isEmpty( values.meridiem ) ? values.meridiem : null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, second, millisecond );
    },
    /**
     * Generates all slots specified by this component, and then sets them on the component
     * @private
     */
    createSlots: function() {
        var me= this,
            slotOrder = me.getSlotOrder(),
            ln, i, slots=[];
        // cleanup config
        me.cleanupConfig();
		// create array of slot data
        slotOrder.forEach( function ( item ) {
            var slot = me.createSlot( item )
            if( slot ) {
                slots.push( slot );
            }
        });
        me.setSlots( slots );
    },
    /**
     * Returns a slot config for a specified time.
     * @private
     */
    createSlot: function( name ) {
        var me = this;
        switch ( name ) {
            case 'hour':
                return {
                    name: 'hour',
                    align: 'center',
                    data: me.getHourCollection(),
                    title: me.getHourText(),
                    flex: 1
                };
            case 'minute':
                // make sure "use" flag is on
                if( Ext.Array.contains( me.getSlotOrder(), 'minute' ) ) {
                    return {
                        name: 'minute',
                        align: 'center',
                        data: me.getMinuteCollection(),
                        title: me.getMinuteText(),
                        flex: 1
                    };
                }
                break;
            case 'second':
                // make sure "use" flag is on
                if( Ext.Array.contains( me.getSlotOrder(), 'minute' ) && Ext.Array.contains( me.getSlotOrder(), 'second' ) ) {
                    return {
                        name: 'second',
                        align: 'center',
                        data: me.getSecondCollection(),
                        title: me.getSecondText(),
                        flex: 1
                    };
                }
                break;
            case 'millisecond':
                // make sure "use" flag is on
                if( Ext.Array.contains( me.getSlotOrder(), 'minute' ) && 
                    Ext.Array.contains( me.getSlotOrder(), 'second' ) && 
                    Ext.Array.contains( me.getSlotOrder(), 'millisecond' ) 
                ) {
                    return {
                        name: 'millisecond',
                        align: 'center',
                        data: me.getMillisecondCollection(),
                        title: me.getMillisecondText(),
                        flex: 1
                    };
                }
                break;
            case 'meridiem':
                // make sure "use" flag is on, and that the end hour is less than 13
                if( Ext.Array.contains( me.getSlotOrder(), 'meridiem' )  && me.getEndHour() <=12 ) {
                    return {
                        name: 'meridiem',
                        align: 'center',
                        data: [
                            {
                                text: me.getAMText(),
                                value: me.getAMText()
                            },  
                            {
                                text:me.getPMText(),
                                value:me.getPMText()
                            }                        
                        ],
                        title: me.getMeridiemText(),
                        flex: 1
                    };
                }
                break;
        }
    },
    cleanupConfig: function() {
        var me = this,
            shour = me.getStartHour(),
            ehour = me.getEndHour(),
            sminute = me.getStartMinute(),
            eminute = me.getEndMinute(),
            ssecond = me.getStartSecond(),
            esecond = me.getEndSecond(),
            smilli = me.getStartMillisecond(),
            emilli = me.getEndMillisecond(),
            useMeridiem = Ext.Array.contains( me.getSlotOrder(), 'meridiem' );
        // evaluate user config
        shour = shour < 1 || !Ext.isNumber( shour ) ? useMeridiem ? 1 : 0 : shour;
        ehour = ehour > 23 || !Ext.isNumber( ehour ) ? Ext.Array.contains( me.getSlotOrder(), 'meridiem' )  ? 12 : 23 : ehour;
        sminute = sminute < 0 || !Ext.isNumber( sminute ) ? 0 : sminute;
        eminute = eminute > 59 || !Ext.isNumber( eminute ) ? 59 : eminute;
        ssecond = ssecond < 1 || !Ext.isNumber( ssecond ) ? 0 : ssecond;
        esecond = eminute > 59 || !Ext.isNumber( esecond ) ? 59 : esecond;
        smilli = smilli < 1 || !Ext.isNumber( smilli ) ? 0 : smilli;
        emilli = emilli > 59 || !Ext.isNumber( emilli ) ? 999 : emilli;
        // set values
        me.setStartHour( shour );
        me.setEndHour( ehour );
        me.setStartMinute( sminute );
        me.setEndMinute( eminute );
        me.setStartSecond( ssecond );
        me.setEndSecond( esecond );
        me.setStartMillisecond( smilli );
        me.setEndMillisecond( emilli );
    },
    getHourCollection: function() {
        var me = this,
            hours = [];
        // compile collection of hour values
        // if an hour list is defined
        if( !!me.getHourList() ) {
            var list = me.getHourList();
            for( i=0; i<list.length; i++ ) {
                // ensure that hour is not greater than 23...otherwise, it will create an invalid date
                if( i<24 ) {
                    hours.push({
        				text: list[ i ],
        				value: list[ i ]
        			});
                }
            }
        }
        // otherwise, increment between start and end hour by increment setting
        else {
            for( i=me.getStartHour(); i<=me.getEndHour(); i += me.getHourIncrement() ) {
    			hours.push({
    				text: i,
    				value: i
    			});
    		}    
        }
        return hours;
    },
    getMinuteCollection: function() {
        var me = this,
            minutes = [];
        // compile collection of minute values
        // if a minute list is defined
        if( !!me.getMinuteList() ) {
            var list = me.getMinuteList();
            for( i=0; i<list.length; i++ ) {
                minutes.push({
    				text: list[ i ] <10 ? '0'+list[ i ] : list[ i ],
    				value: list[ i ]
    			});
            }
        }
        // otherwise, increment minutes automatically by increment setting
        else {
            for( i=me.getStartMinute(); i<=me.getEndMinute(); i += me.getMinuteIncrement() ) {
    			minutes.push({
    				text: i<10 ? '0'+i : i,
    				value:i
    			});
    		}    
        }
        return minutes;
    },
    getSecondCollection: function() {
        var me = this,
            seconds = [];
        // compile collection of second values
        // if a second list is defined
        if( !!me.getSecondList() ) {
            var list = me.getSecondList();
            for( i=0; i<list.length; i++ ) {
                // ensure that second is not greater than 59...otherwise, it will create an invalid date
                if( i<60 ) {
                    seconds.push({
        				text: list[ i ] <10 ? '0'+list[ i ] : list[ i ],
        				value: list[ i ]
        			});
                }
            }
        }
        // otherwise, increment seconds automatically by increment setting
        else {
            for( i=me.getStartSecond(); i<=me.getEndSecond(); i += me.getSecondIncrement() ) {
    			seconds.push({
    				text: i<10 ? '0'+i : i,
    				value:i
    			});
    		}    
        }
        return seconds;
    },
    getMillisecondCollection: function() {
        var me = this,
            milliseconds = [];
        // compile collection of milliseconds values
        // if a millisecond list is defined
        if( !!me.getMillisecondList() ) {
            var list = me.getMillisecondList();
            for( i=0; i<list.length; i++ ) {
                // ensure that millisecond is not greater than 999...otherwise, it will create an invalid date
                if( i<1000 ) {
                    milliseconds.push({
        				text: list[ i ] <10 ? '0'+list[ i ] : list[ i ],
        				value: list[ i ]
        			});
                }
            }
        }
        // otherwise, increment milliseconds automatically by increment setting
        else {
            for( i=me.getStartMillisecond(); i<=me.getEndMillisecond();  i += me.getMillisecondIncrement() ) {
    			milliseconds.push({
    				text: i<10 ? '0'+i : i,
    				value:i
    			});
    		}    
        }
        return milliseconds;
    }
});
