/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
 * This class is a simple component for selecting a color.
 */
Ext.define('Ext.ux.ColorSelector', {
    extend: 'Ext.Container',
    xtype: 'colorselector',

    color: 0,

    config: {
        cls: 'zcs-color-selector',
        listeners: [{
            element: 'innerElement',
            event: 'tap',
            fn: 'onTap'
        }],
        items: [{
            xtype: 'field'
        }, {
            xtype: 'component',
            itemId: 'colorSelectorOptions',
            hidden: true
        }]
    },

    initialize: function () {
        var i=0,
            html = '<div class="zcs-color-selector-options">';

        for (i; i < ZCS.constant.TAG_COLOR_COUNT; i++) {
            html += '<div class="zcs-tag-'+i+'" value="'+i+'"></div>';
            if (i % 5 == 4) {
                html += '</div><div class="zcs-color-selector-options">';
            }
        }
        html += '</div>';

        this.down('#colorSelectorOptions').setHtml(html);

        this.callParent(arguments);
    },

    onTap: function (e, div) {
        if (e.getTarget('.x-field')) {
            this.toggleSelectorOptions();
        } else if (e.getTarget('.zcs-color-selector-options') && div.getAttribute('value')) {
            this.setColor(div.getAttribute('value'));
            this.toggleSelectorOptions();
        }
    },

    toggleSelectorOptions: function () {
        var options = this.down('#colorSelectorOptions');
        if (options.isHidden()) {
            options.show();
        } else {
            options.hide();
        }
    },

    setColor: function (index) {
        this.down('field').setCls('zcs-tag-'+index);
        this.color = index;
    },

    getColor: function () {
        return this.color;
    }

});