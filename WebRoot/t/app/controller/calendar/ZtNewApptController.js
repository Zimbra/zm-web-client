
Ext.define('ZCS.controller.calendar.ZtNewApptController', {

    extend: 'Ext.app.Controller',

    requires: [
        'ZCS.view.calendar.ZtNewAppointment',
        'ZCS.common.ZtUtil',
        'Ext.ux.TouchCalendarView'
    ],

    config: {

        refs: {
            //event handlers
            newApptPanel: 'newapptpanel',

            //other
            newApptForm: 'newapptpanel formpanel'
        },

        control: {
            newApptPanel: {
                cancel: 'doCancel',
                create: 'createAppt'
            }
        },

        models: [
        ],

        stores: [
        ],

        action: null
    },

    showNewApptForm: function() {
        var panel = this.getNewApptPanel();

        panel.resetForm();

        panel.show({
            type: 'slide',
            direction: 'up'
        });
    },

    getNewApptPanel: function() {
        if (!this.newApptPanel) {
            this.newApptPanel = Ext.create('ZCS.view.calendar.ZtNewAppointment');
            Ext.Viewport.add(this.newApptPanel);
        }

        return this.newApptPanel;
    },

    /**
     * @private
     */
    doCancel: function() {
        this.getNewApptPanel().hide();
    },

    /**
     * @private
     */
    createAppt: function() {
        //TODO: Send a CreateAppointmentRequest to the server.

        this.getNewApptPanel().hide();
    }
//
//    getCalendarModel: function() {
//        var values = this.getNewApptForm().getValues(),
//            subject = values.subject,
//            location = values.location,
//            startDate = values.start,
//            endDate = values.end,
//            calRepeat = values.repeat,
//            calReminder = values.reminder;
//
//        console.info(
//            'Capturing the form data: \n' +
//            'Subject: ' + subject + '\n' +
//            'Location: ' + location + '\n' +
//            'Start Date: ' + startDate + '\n' +
//            'End Date: ' + endDate + '\n' +
//            'Repeat: ' + calRepeat + '\n' +
//            'Reminder: ' + calReminder + '\n'
//        );
//    }

});