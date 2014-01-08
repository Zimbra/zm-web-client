Ext.define('ZCS.common.ZtContactFieldsMenuable', {
    requires: [
        'ZCS.common.ZtContactFieldsMenu'
    ],
    showFieldsMenu: function (menuButton) {
        var itemPanel,
            menu = Ext.create('ZCS.common.ZtContactFieldsMenu', {
                data: menuButton.getAvailableOptionalFields(),
                itemTpl: '{title}',
                listeners: [{
                    event: 'itemtap',
                    fn: function(menu, index, target, record, e){
                        var idParams = ZCS.util.getIdParams(menuButton.getItemId()),
                            type = idParams.type,
                            action = idParams.action,
                            container = menuButton.up(type + 'container');

                        var opts = {
                            mandatory:      false,
                            name:           record.get('name'),
                            placeHolder:    record.get('title'),
                            order:          record.get('order')
                        }

                        container.addField(opts);
                        menu.popdown();

                        // if the last item is chosen, hide the button itself
                        if (menu.getData().length == 1) {
                            menuButton.hide();
                        }
                    }
                }]
            });

        menuButton.addCls('menu-open');
        menu.addListener('hide', function () {
            //We may have removed the menuButton in the menu action.
            if (menuButton.dom) {
                menuButton.removeCls('menu-open');
            }
        }, this, {single: true});

        menu.popup(menuButton, menu.getPositioning());
    }
});
