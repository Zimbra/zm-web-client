
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
                create: 'doSave'
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

    doSave: function() {
        var newAppt = this.getCalendarModel();
        if (newAppt) {
            this.createAppt(newAppt);
        }
    },

    /**
     * @private
     */
    createAppt: function(appt, callback, scope) {
        var folder = ZCS.session.getCurrentSearchOrganizer();

        appt.save({
            folderId: folder ? folder.get('zcsId') : null,
            success: function() {
                this.getNewApptPanel().hide();
                ZCS.app.fireEvent('showToast', ZtMsg.apptCreated);
                if (callback) {
                    callback.apply(scope);
                }
            },
            failure: function() {
                ZCS.app.fireEvent('showToast', ZtMsg.errorCreateAppt);
            }
        }, this);
    },

    getCalendarModel: function() {
        var appt = Ext.create('ZCS.model.calendar.ZtCalendar'),
            values = this.getNewApptForm().getValues();

        ZCS.util.setFields(values, appt, ZCS.constant.CALENDAR_FIELDS);
        return appt;
    }

});