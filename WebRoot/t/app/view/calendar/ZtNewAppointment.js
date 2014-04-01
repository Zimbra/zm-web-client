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

Ext.define('ZCS.view.calendar.ZtNewAppointment', {

    extend: 'Ext.Sheet',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Text',
        'Ext.Component',
        'Ext.field.DatePicker',
        'Ext.field.Select',
        'Ext.ux.field.DateTimePicker'
    ],

    xtype: 'newapptpanel',

    config: {
        layout:     'fit',
        width:      '100%',
        height:     '100%',
        scrollable:  false,
        hidden:      true,
        modal:       true,
        cls:        'zcs-appt-form'
    },

    statics: {
        reminderTimeDisplayMsgs : [
            ZtMsg.apptRemindNever,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNMinutesBefore,
            ZtMsg.apptRemindNHoursBefore,
            ZtMsg.apptRemindNHoursBefore,
            ZtMsg.apptRemindNHoursBefore,
            ZtMsg.apptRemindNHoursBefore,
            ZtMsg.apptRemindNHoursBefore,
            ZtMsg.apptRemindNDaysBefore,
            ZtMsg.apptRemindNDaysBefore,
            ZtMsg.apptRemindNDaysBefore,
            ZtMsg.apptRemindNDaysBefore,
            ZtMsg.apptRemindNWeeksBefore,
            ZtMsg.apptRemindNWeeksBefore
        ],

        reminderTimeValues :  [0, 1, 5, 10, 15, 30, 45, 60, 120, 180, 240, 300, 1080, 1440, 2880, 4320, 5760, 10080, 20160],
        reminderTimeLabels : [0, 1, 5, 10, 15, 30, 45, 60, 2, 3, 4, 5, 18, 1, 2, 3, 4, 1, 2]

    },

    initialize: function() {

        var newApptForm = this,
            toolbar = {
                xtype:   'titlebar',
                docked:  'top',
                title:    ZtMsg.apptCreate,
                items: [
                    {
                        xtype:  'button',
                        text:    ZtMsg.cancel,
                        handler: function() {
                            this.up('newapptpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype:      'button',
                        text:        ZtMsg.create,
                        align:      'right',
                        ui:         'green',
                        padding:    '0 2em',
                        handler: function() {
                            this.up('newapptpanel').fireEvent('create');
                        }
                    }
                ]
            },
            spacer = {
                xtype:  'spacer',
                cls:    'zcs-contact-spacer'
            },
            form = {
                xtype:       'formpanel',
                scrollable:   false,
                defaults: {
                    labelWidth:  '80px',
                    inputCls:    'zcs-form-input'
                },
                layout: {
                    type: 'vbox'
                },
                items: [
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.subjectLabel,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:       'textfield',
                                name:        'subject',
                                width:       '80%',
                                placeHolder:  ZtMsg.placeholderSubject

                            }
                        ]
                    },
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.locationLabel,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:       'textfield',
                                name:        'location',
                                width:       '80%',
                                flex:         1,
                                placeHolder:  ZtMsg.placeholderLocation
                            },
                            {
                                width:    '5.5em',
                                height:   '2.5em',
                                xtype:    'component',
                                html:      ZtMsg.equipmentLabel,
                                itemId:   'equipmentFieldToggle',
                                cls:      'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
                                listeners: {
                                    painted: function () {
                                        this.element.on('tap', function() {
                                            newApptForm.showEquipment();
                                        });
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype:  'container',
                        layout: 'hbox',
                        items:[
                            {
                                xtype:   'label',
                                html:     ZtMsg.equipmentLabel,
                                itemId:  'equipmentLabel',
                                hidden:   true,
                                width:   '20%',
                                cls:     'zcs-appt-label'

                            },
                            {
                                xtype:       'textfield',
                                width:       '80%',
                                hidden:       true,
                                flex:         1,
                                name:        'equipment',
                                placeHolder: ZtMsg.placeholderEquipment
                            }
                        ]

                    },
                    spacer,
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.startLabel,
                                cls:    'zcs-appt-label',
                                width:  '20%'
                            },
                            {
                                xtype:  'datetimepickerfield',
                                name:   'start',
                                width:  '80%',
                                destroyPickerOnHide: true
                            },
                            {
                                xtype:      'datepickerfield',
                                name:       'startAllDay',
                                itemId:     'startAllDay',
                                width:      '80%',
                                hidden:      true,
                                dateFormat:  ZtMsg.invDateFormat,
                                listeners: {
                                    focus: function() {
                                        if (!this.getValue()) {
                                            this.setValue(new Date());
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.endLabel,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:               'datetimepickerfield',
                                name:                'end',
                                flex:                 1,
                                width:               '80%',
                                destroyPickerOnHide:  true
                            },
                            {
                                xtype:       'datepickerfield',
                                name:        'endAllDay',
                                width:       '80%',
                                hidden:       true,
                                dateFormat:   ZtMsg.invDateFormat,
                                listeners: {
                                    focus: function() {
                                        var start = Ext.ComponentQuery.query('#startAllDay')[0].getValue();
                                        if (start) {
                                            this.setValue(start);
                                        } else if (!this.getValue()) {
                                            this.setValue(new Date());
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.allDay,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:     'togglefield',
                                name:      'isAllDay',
                                width:     '80%',
                                flex:       1,
                                listeners: {
                                    change: function(field, newValue) {
                                        if (field.getValue() == 1) {
                                            Ext.ComponentQuery.query('datetimepickerfield')[0].hide();
                                            Ext.ComponentQuery.query('datetimepickerfield')[1].hide();

                                            Ext.ComponentQuery.query('datepickerfield')[0].show();
                                            Ext.ComponentQuery.query('datepickerfield')[1].show();
                                        } else {
                                            Ext.ComponentQuery.query('datepickerfield')[0].hide();
                                            Ext.ComponentQuery.query('datepickerfield')[1].hide();

                                            Ext.ComponentQuery.query('datetimepickerfield')[0].show();
                                            Ext.ComponentQuery.query('datetimepickerfield')[1].show();
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:   'label',
                                html:     ZtMsg.repeatLabel,
                                cls:     'zcs-appt-label',
                                width:   '20%'

                            },
                            {
                                xtype:   'selectfield',
                                name:    'repeat',
                                flex:     1,
                                width:   '80%',
                                options: [
                                    { text: ZtMsg.none,                 value: "NON"},
                                    { text: ZtMsg.everyDay,             value: "DAI"},
                                    { text: ZtMsg.everyWeek,            value: "WEE"},
                                    { text: ZtMsg.everyMonth,           value: "MON"},
                                    { text: ZtMsg.everyYear,            value: "YEA"}
                                ]
                            }
                        ]
                    },
                    spacer,
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.reminderLabel,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:   'selectfield',
                                name:    'reminder',
                                flex:     1,
                                width:   '80%',
                                options: [ { text: ZtMsg.apptRemindNever, value: 0} ] ,
                                listeners: {
                                    painted: function() {
                                        var arr = [];
                                        for (var i = 0; i < ZCS.view.calendar.ZtNewAppointment.reminderTimeDisplayMsgs.length; i++) {
                                            var optLabel = Ext.String.format(ZCS.view.calendar.ZtNewAppointment.reminderTimeDisplayMsgs[i], ZCS.view.calendar.ZtNewAppointment.reminderTimeLabels[i]),
                                                data = {text: optLabel, value:ZCS.view.calendar.ZtNewAppointment.reminderTimeValues[i]};
                                            arr.push(data);
                                        }
                                        this.setOptions(arr);
                                    }
                                }
                            }
                        ]
                    },
                    spacer,
                    {
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype:  'label',
                                html:    ZtMsg.notes,
                                cls:    'zcs-appt-label',
                                width:  '20%'

                            },
                            {
                                xtype:    'textareafield',
                                name:     'notes',
                                maxRows:   5,
                                width:    '80%'
                            }
                        ]
                    }
                ]
            };

        this.add([
            toolbar,
            form
        ]);
    },

    // Shows the optional equipment field
    showEquipment: function() {
        this.down('#equipmentFieldToggle').hide();
        this.down('#equipmentLabel').show();
        this.down('field[name=equipment]').show();
    },

    resetForm: function() {
        this.down('.formpanel').reset();
    }
});