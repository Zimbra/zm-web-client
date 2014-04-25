
Ext.define('ZCS.controller.calendar.ZtNewAppointmentController', {

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
                create: 'doSave',
                multiAddRemove: 'doMultiAddRemove'
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
        Ext.fly(this.getEditor()).addCls('zcs-fully-editable');

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
        var panel = this.getNewApptPanel();

        if (Ext.os.deviceType === "Phone") {
            panel.element.dom.style.setProperty('display', 'none');
        } else {
            panel.hide({
                type: 'fadeOut',
                duration: 250
            });
        }

        panel.resetForm();
    },

    doSave: function() {
        var newAppt = this.getCalendarModel();
        if (newAppt) {
            if (!newAppt.get('title')) {
                Ext.Msg.alert(ZtMsg.error, ZtMsg.errorMissingSubject);
            } else if (!this.isValidTime(newAppt)) {
                Ext.Msg.alert(ZtMsg.error, ZtMsg.errorInvalidApptEndBeforeStart);
            } else {
                this.createAppt(newAppt);
            }
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
            values = this.getNewApptForm().getValues(),
            editor = this.getEditor();

        ZCS.util.setFields(values, appt, ZCS.constant.CALENDAR_FIELDS);
        appt.set('notes', editor.innerHTML);

        return appt;
    },

    doMultiAddRemove: function(button) {
        var idParams = ZCS.util.getIdParams(button.getItemId()),
            type = idParams.type,
            action = idParams.action,
            container = this.getNewApptPanel().down(type + 'container');


        if (container && action === 'remove') {
            container.removeField(idParams.fieldId);
            return;
        }
        if (container && action === 'add') {
            container.addField();
        }
    },

    // Resets the form back to its initial state
    resetForm: function () {
        this.down('titlebar').setTitle(ZtMsg.appointmentCreated);
        this.down('.formpanel').reset();
        this.down('attendeecontainer').reset();
    },

    getEditor: function() {
        var panel = this.getNewApptPanel(),
            form = panel.down('formpanel'),
            bodyFld = form.down('#body'),
            editor = bodyFld.element.query('.zcs-editable')[0];

        return editor;
    },

    /**
     * Checks if the start time is greater than the end time.
     * @param newAppt
     * @returns {boolean}
     */
    isValidTime: function(newAppt) {
        var startDate = newAppt.get('startDate'),
            endDate = newAppt.get('endDate'),
            startTime = newAppt.get('startTime'),
            endTime = newAppt.get('endTime');

        startDate.setHours(startTime.getHours());
        startDate.setMinutes(startTime.getMinutes());

        endDate.setHours(endTime.getHours());
        endDate.setMinutes(endTime.getMinutes());

        if (startDate > endDate) {
            return false;
        }
        return true;
    }
});