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

Ext.define('ZCS.view.ZtAppsMenu', {

    extend: 'ZCS.common.ZtLeftMenu',

    xtype: 'appsmenu',

    initialize: function() {
        var accountName = ZCS.session.getAccountName(),
            userName = accountName.substr(0, accountName.indexOf('@')),
            menuItems = [];

        // Prepare menu items
        Ext.each(ZCS.constant.APPS, function(app) {
            if (ZCS.util.isAppEnabled(app)) {
                menuItems.push({
                    app:        app,
                    text:       ZCS.constant.APP_NAME[app],
                    group:      ZtMsg.applicationsGroup,
                    groupOrder: 1
                });
            }
        });

        menuItems.push({
        /*
	            app:        'settings',
	            text:       ZtMsg.settings,
	            group:      ZtMsg.otherGroup,
	            groupOrder: 2
            },
         */
            app:        'signout',
            text:       ZtMsg.logout,
            group:      ZtMsg.otherGroup,
	        groupOrder: 3
        });

        this.add([{
            xtype: 'titlebar',
            docked: 'top',
            title: accountName.length > 30 ? userName : accountName
        }, {
            xtype: 'list',
            flex: 1,
            grouped: true,
            itemTpl: '<div class="zcs-menu-icon {app}"></div><div class="zcs-menu-label">{text}</div>',
            store: {
                data: menuItems,
                grouper: {
                    groupFn: function (item) {
                        return item.get('group');
                    },
	                sortProperty: 'groupOrder'
                }
            }
        }]);
        this.setDimensions();
        this.callParent(arguments);
    }

});
