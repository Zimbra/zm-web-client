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
            listType = ZCS.constant.ORG_LIST_SELECTOR,
            organizerData = {
                items: ZCS.session.findOrganizersByAttribute('folderType', ZCS.constant.ORG_CALENDAR, ZCS.constant.APP_CALENDAR)
            };

        Ext.each(organizerData.items, function(folder) {

	        var zcsId = folder.get('zcsId'),
		        folderType = folder.get('folderType'),
		        isMountpoint = folder.get('isMountpoint'),
		        displayName = folder.get('displayName'),
		        remoteId = folder.get('remoteId');

            if (zcsId !== ZCS.constant.ID_TRASH && folderType === ZCS.constant.ORG_CALENDAR) {
                if (isMountpoint) {
                    arr.push({ text: displayName, value: remoteId });
                }
                else {
                    arr.push({ text: displayName, value: zcsId });
                }

                Ext.each(folder.childNodes, function(child) {

	                var isMountpoint = folder.get('isMountpoint'),
		                displayName = folder.get('displayName'),
		                remoteId = folder.get('remoteId'),
                        data;

                    if (isMountpoint) {
                        data = { text: displayName, value: remoteId };
                    }
                    else {
                        data = { text: displayName, value: zcsId };
                    }
                    arr.push(data);
                }, this);
            }
        } , this);

        return arr;
    }
});
