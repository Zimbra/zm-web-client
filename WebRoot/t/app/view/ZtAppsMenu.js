Ext.define('ZCS.view.ZtAppsMenu', {

    extend: 'Ext.Sheet',

    xtype: 'appsmenu',

    requires: [
        'Ext.Anim'
    ],

    config: {
        cls: 'zcs-overview',
        layout: 'vbox',
        hidden: true,
        modal: true,
        hideOnMaskTap: true,
        scrollable: false,
        enter: 'left',
        exit: 'left',
        left: 0
    },

    initialize: function() {
        var accountName = ZCS.session.getAccountName(),
            userName = accountName.substr(0, accountName.indexOf('@')),
            menuItems = [];

        // Prepare menu items
        Ext.each(ZCS.constant.APPS, function(app) {
            menuItems.push({
                app: app,
                text: app.charAt(0).toUpperCase() + app.slice(1),
                group: ZtMsg.applications
            });
        });
        menuItems.push({
            app: 'settings',
            text: 'Settings',
            group: ZtMsg.applications
        }, {
            app: 'signout',
            text: 'Sign Out',
            group: ZtMsg.applications
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
                    }
                }
            }
        }]);
        this.setDimensions();
        this.callParent(arguments);
    },

    setDimensions: function () {
        var orientation = Ext.Viewport.getOrientation(),
            deviceType = ZCS.util.getDeviceType(),
            menuPositionConfig = ZCS.constant.SIDE_MENU_CONFIG[deviceType][orientation];
        this.setHeight(Ext.Viewport.element.getHeight());
        this.setWidth(Ext.Viewport.element.getWidth() * menuPositionConfig.navigationWidth);
    }

});