/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class displays the date fields on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtDateField', {

    extend: 'Ext.Container',

    xtype: 'datecontainer',

    config: {
        layout: {
            type:'vbox'
        },
        items: [
        {
            xtype: 'container',
            cls: 'create-appt-margin first',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype:  'label',
                    html:    ZtMsg.allDay,
                    cls:    'zcs-appt-label',
                    flex:   1

                },
                {
                    xtype:     'togglefield',
                    name:      'isAllDay',
                    flex:       1,
                    listeners: {
                        change: function(field) {
                            if (field.getValue() === 1) {
                                Ext.ComponentQuery.query('timepickerfield')[0].hide();
                                Ext.ComponentQuery.query('timepickerfield')[1].hide();
                            } else {
                                Ext.ComponentQuery.query('timepickerfield')[0].show();
                                Ext.ComponentQuery.query('timepickerfield')[1].show();
                            }
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            cls: 'create-appt-margin',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype:  'datepickerfield',
                    name:   'start',
                    flex:   2,
                    destroyPickerOnHide: true,
                    dateFormat:  ZtMsg.invShortDateFormat,
                    value: new Date(),
                    listeners: {
                        change: function(field) {
                            if (field.getValue()) {
                                var endDate = Ext.ComponentQuery.query('#end')[0];
                                if (endDate)
                                    endDate.setValue(field.getValue());
                            }
                        }
                    }
                },
                {
                    xtype:  'timepickerfield',
                    name:   'startTime',
                    flex:   1,
                    destroyPickerOnHide: true,
                    dateFormat:  ZtMsg.invTimeFormat,
                    value: ZCS.util.convertTime(new Date()),
                    listeners: {
                        change: function(field) {
                            if (field.getValue()) {
                                var endTime = Ext.ComponentQuery.query('#endTime')[0];
                                if (endTime)
                                    endTime.setValue(ZCS.util.convertTime(field.getValue(), true));
                            }
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            cls: 'create-appt-margin',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype:               'datepickerfield',
                    name:                'end',
                    itemId:              'end',
                    flex:                 2,
                    destroyPickerOnHide:  true,
                    dateFormat:  ZtMsg.invShortDateFormat,
                    value: new Date()
                },
                {
                    xtype:  'timepickerfield',
                    name:   'endTime',
                    itemId:   'endTime',
                    flex:   1,
                    destroyPickerOnHide: true,
                    dateFormat:  ZtMsg.invTimeFormat,
                    value: ZCS.util.convertTime(new Date(), true),
                    listeners: {
                        change: function(field) {
                            var val = field.getValue();
                            if (val.getHours() === 0) {
                                var endDate = Ext.ComponentQuery.query('#end')[0];
                                if (endDate) {
                                    var end = endDate.getValue(),
                                        dt = new Date(end.setDate(end.getDate() + 1));
                                    endDate.setValue(dt);
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            cls: 'create-appt-margin last',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype:   'label',
                    html:     ZtMsg.repeatLabel,
                    cls:     'zcs-appt-label',
                    flex:   1

                },
                {
                    xtype:   'selectfield',
                    name:    'repeat',
                    flex:     1,
                    options: [
                        { text: ZtMsg.none,                 value: "NON"},
                        { text: ZtMsg.everyDay,             value: "DAI"},
                        { text: ZtMsg.everyWeek,            value: "WEE"},
                        { text: ZtMsg.everyMonth,           value: "MON"},
                        { text: ZtMsg.everyYear,            value: "YEA"}
                    ]
                },
                {
                    xtype:   'textfield',
                    name:    'recurrence',
                    flex:     2,
                    hidden: true,
                    disabled: true
                }
            ]
        }
    ]
    }
});
