/**
 * This is a specialized field which shows a {@link Ext.picker.Time} when tapped. If it has a predefined value,
 * or a value is selected in the {@link Ext.ux.picker.Time}, it will be displayed like a normal {@link Ext.field.Text}
 * (but not selectable/changable).
 *
 * ## Examples
 *
 * It can be very useful to set a default {@link #value} configuration on {@link Ext.field.DatePicker} fields. In
 * this example, we set the {@link #value} to be the current date. You can also use the {@link #setValue} method to
 * update the value at any time.
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 items: [
 *                     {
 *                         xtype: 'timepickerfield',
 *                         label: 'Start Time',
 *                         name: 'starttime',
 *                         value: new Date()
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 */
Ext.define( 'Ext.ux.field.TimePicker', {
    extend: 'Ext.field.DatePicker',
    alternateClassName: 'Ext.form.TimePicker',
    xtype: 'timepickerfield',
    requires: [
        'Ext.DateExtras'
    ],
    config: {
        /**
         * @cfg {String} [dateFormat=Ext.util.Format.defaultDateFormat] The format to be used when displaying the date in this field.
         * Accepts any valid date format. You can view formats over in the {@link Ext.Date} documentation.
         */
//        dateFormat: 'h:i A',
        dateFormat: ZtMsg.invTimeFormat,
        /**
         * @cfg {String} default time
         * The default time to be used when initilizing the field
         * Example: '8:00', '14:50'
         */
        defaultTime: '8:00'
    },
    applyValue: function( value ) {
        var date = new Date();
        // if we have no value whatsoever, set a default
        if ( !Ext.isDate( value ) && !Ext.isObject( value ) ) {
            var defaultTime = this.getDefaultTime().split( ':' );
            return new Date( date.getYear(), date.getMonth(), date.getDate(), defaultTime[ 0 ], defaultTime[ 1 ] );
        }
        // if the value is an object, create a new date with time values based on object
        if ( Ext.isObject( value ) ) {         
            return new Date( date.getYear(), date.getMonth(), date.getDate(), value.hour, value.minute );
        }
        return value;
    },
    applyPicker: function( picker, pickerInstance ) {
        picker = Ext.factory( picker, 'Ext.ux.picker.Time' );
        picker.setHidden( true );
        Ext.Viewport.add( picker );
        return picker;
    },
    /**
     * @cfg {String} [dateFormat=Ext.util.Format.defaultDateFormat] The format to be used when displaying the time in this field.
     * Accepts any valid date/time format. You can view formats over in the {@link Ext.Date} documentation.
     */
    getValue: function() {
        if ( this._picker && this._picker instanceof Ext.ux.picker.Time ) {
            return this._picker.getValue();
        }
        return this._value;
    },
    getPicker: function() {
        var picker = this._picker,
            value = this.getValue();
            
        if ( picker && !picker.isPicker ) {
            picker = Ext.factory( picker, Ext.ux.picker.Time );
            if ( value != null ) {
                picker.setValue( value );
            }
        }
        // add listeners
        picker.on({
            scope: this,
            change: 'onPickerChange',
            hide  : 'onPickerHide'
        });
        this._picker = picker;
        return picker;
    }
});