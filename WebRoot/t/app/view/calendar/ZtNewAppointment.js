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
        'Ext.field.Select'
    ],

    xtype: 'newapptpanel',

    config: {
        layout: 'fit',
        width: '80%',
        height: '100%',
        scrollable: false,
        hidden: true,
        modal: true,
        cls: 'compose-form'
    },

    initialize: function() {

        var newAppt = this,
            toolbar = {
                xtype: 'titlebar',
                docked: 'top',
                title: 'New Appointment',
                items: [
                    {
                        xtype: 'button',
                        text: ZtMsg.cancel,
                        handler: function() {
                            this.up('newapptpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Create',
                        align: 'right',
                        handler: function() {
                            console.log('Create appointment');
                            this.up('newapptpanel').fireEvent('create');
                        }
                    }
                ]
            },
            form = {
                xtype: 'formpanel',
                scrollable: false,
                defaults: {
                    labelWidth: '100%',
                    inputCls: 'zcs-form-input'
                },
                layout: {
                    type: 'vbox'
                },
                items: [
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'subject',
                                labelWidth: '10%',
                                flex: 1,
                                label: 'Subject:'

                            }
                        ]
                    },
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'location',
                                height: 44,
                                labelWidth: '11.45%',
                                flex: 1,
                                listeners: {
                                    blur: function () {
                                        //Because this panel is floating, and a keystroke may have forced the whole window to scroll,
                                        //when we blur, reset the scroll.
                                        ZCS.htmlutil.resetWindowScroll();
                                    }
                                },
                                label: 'Location:'
                            },
                            {
                                width: 'auto',
                                height: 44,
                                xtype: 'component',
                                html: 'Equipment',
                                itemId: 'ccToggle',
                                cls: 'x-form-label x-form-label-nowrap',
                                listeners: {
                                    painted: function () {
                                        var comp = this;
                                        this.element.on('tap', function () {
                                            console.log('Load the equipments');
                                        });
                                    }
                                }
                            }
                        ]
                    },
                    {
                        height: 8,
                        layout: {
                            type: 'hbox'
                        }
                    },
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'datepickerfield',
                                name: 'start',
                                height: 44,
                                labelWidth: '10%',
                                flex: 1,
                                label: 'Start:',
                                value: new Date(),
                                picker: {
                                    yearFrom: new Date().getFullYear() - 50,
                                    yearTo: new Date().getFullYear() + 50
                                }
                            }
                        ]
                    },
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'datepickerfield',
                                name: 'end',
                                height: 44,
                                labelWidth: '10%',
                                flex: 1,
                                label: 'End:',
                                value: new Date(),
                                picker: {
                                    yearFrom: new Date().getFullYear() - 50,
                                    yearTo: new Date().getFullYear() + 50
                                }
                            }
                        ]
                    },
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'repeat',
                                height: 44,
                                labelWidth: '12.45%',
                                flex: 1,
                                label: 'Repeat:',
                                options: [
                                    {   text: 'None', value: 'none'         },
                                    {   text: 'Every Day', value: 'day'     },
                                    {   text: 'Every Week', value: 'week'   },
                                    {   text: 'Every Month', value: 'month' },
                                    {   text: 'Every Year', value: 'year'   }
                                ]
                            },
                            {
                                width: 'auto',
                                height: 44,
                                xtype: 'component',
                                html: 'Email and SMS',
                                itemId: 'ccToggle',
                                cls: 'x-form-label x-form-label-nowrap',
                                listeners: {
                                    painted: function () {
                                        var comp = this;
                                        this.element.on('tap', function () {
                                            console.log('Load the equipments');
                                        });
                                    }
                                }
                            }
                        ]
                    },
                    {
                        height: 8,
                        layout: {
                            type: 'hbox'
                        }
                    },
                    {
                        height: 44,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'selectfield',
                                name: 'reminder',
                                height: 44,
                                labelWidth: '10%',
                                flex: 1,
                                label: 'Reminder:',
                                options: [
                                    {   text: 'Never', value: 'never' },
                                    {   text: '1 minute before', value: '1min' },
                                    {   text: '5 minutes before', value: '5min' },
                                    {   text: '10 minutes before', value: '10min' },
                                    {   text: '15 minutes before', value: '15min' },
                                    {   text: '30 minutes before', value: '30min' },
                                    {   text: '45 minutes before', value: '45min' },
                                    {   text: '60 minutes before', value: '60min' },
                                    {   text: '2 hours before', value: '2hrs' },
                                    {   text: '3 hours before', value: '3hrs' },
                                    {   text: '4 hours before', value: '4hrs' },
                                    {   text: '5 hours before', value: '5hrs' },
                                    {   text: '18 hours before', value: '18hrs' },
                                    {   text: '1 day before', value: '1day' },
                                    {   text: '2 days before', value: '2day' },
                                    {   text: '3 days before', value: '3day' },
                                    {   text: '4 days before', value: '4day' },
                                    {   text: '1 week before', value: '1week' },
                                    {   text: '2 weeks before', value: '2week' }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        scrollable: {
                            direction: 'vertical',
                            directionLock: true
                        },
                        padding: 0,
                        flex: 1,
                        items: [{
                            xtype: 'component',
                            html: '<div contenteditable="true" class="zcs-editable zcs-body-field"></div>',
                            itemId: 'body',
                            // TODO: listener below doesn't get fired, not sure about blur on editable DIV
                            listeners: {
                                blur: function () {
                                    //Because this panel is floating, and a keystroke may have forced the whole window to scroll,
                                    //when we blur, reset the scroll.
                                    ZCS.htmlutil.resetWindowScroll();
                                },
                                painted: function () {
                                    var heightToSet = Math.max(this.up('container').element.getHeight(), this.element.down('.zcs-body-field').dom.scrollHeight);

                                    this.setHeight(heightToSet);
                                    this.element.down('.zcs-body-field').setHeight(heightToSet);
                                }
                            }
                        }]
                    }
                ]
            };

        this.add([
            toolbar,
            form
        ]);
    },

    resetForm: function() {
        this.down('.formpanel').reset();
    }
});