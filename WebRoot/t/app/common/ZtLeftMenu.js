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
 *
 *
 *  A menu that lives on the left side of the screen.
 * 
 */
Ext.define('ZCS.common.ZtLeftMenu', {

    extend: 'Ext.Sheet',

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

    setDimensions: function () {
        var orientation = Ext.Viewport.getOrientation(),
            deviceType = ZCS.util.getDeviceType(),
            menuPositionConfig = ZCS.constant.SIDE_MENU_CONFIG[deviceType][orientation];
        this.setHeight(Ext.Viewport.element.getHeight());
        this.setWidth(Ext.Viewport.element.getWidth() * menuPositionConfig.navigationWidth);
    }

});
