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
 * This class displays the calendarfolder field on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtFolderField', {

    extend: 'Ext.Container',

    xtype: 'foldercontainer',

    config: {
        xtype: 'container',
        cls: 'create-appt-margin first',
        layout: {
            type: 'hbox'
        }
    },

    initialize: function() {
        var me = this;
        this.callParent(arguments);

        this.add({
            xtype:  'label',
            html:    ZtMsg.folderCalendar,
            cls:    'zcs-appt-label',
            flex:   1
        });

        this.add({
            xtype: 'selectfield',
            name:   'apptFolderId',
            flex:   1,
            value: 10,
            options: me.setCalendarFolders()
        });
    },

    setCalendarFolders: function() {
        var arr = [],
        // get the organizer data for this app
            listType = ZCS.constant.ORG_LIST_SELECTOR,
            organizerData = {
                items: ZCS.session.getOrganizerData(ZCS.constant.APP_CALENDAR, null, listType)
            };

        Ext.each(organizerData.items, function(folder) {
            if (folder.zcsId !== ZCS.constant.ID_TRASH && folder.folderType === ZCS.constant.ORG_CALENDAR) {
                arr.push({text:folder.displayName, value:folder.zcsId});
                Ext.each(folder.items, function(child) {
                    //subfolders, if any
                    var data = {text: child.displayName, value:child.zcsId};
                    arr.push(data);
                }, this);
            }
        } , this);
        return arr;
    }

});