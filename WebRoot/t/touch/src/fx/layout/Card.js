/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @private
 */
Ext.define('Ext.fx.layout.Card', {
    requires: [
        'Ext.fx.layout.card.Slide',
        'Ext.fx.layout.card.Cover',
        'Ext.fx.layout.card.Reveal',
        'Ext.fx.layout.card.Fade',
        'Ext.fx.layout.card.Flip',
        'Ext.fx.layout.card.Pop',
//        'Ext.fx.layout.card.Cube',
        'Ext.fx.layout.card.Scroll'
    ],

    constructor: function(config) {
        var defaultClass = Ext.fx.layout.card.Abstract,
            type;

        if (!config) {
            return null;
        }

        if (typeof config == 'string') {
            type = config;

            config = {};
        }
        else if (config.type) {
            type = config.type;
        }

        config.elementBox = false;

        if (type) {
            if (Ext.browser.is.AndroidStock2) {
                // In Android 2 we only support scroll and fade. Otherwise force it to slide.
                if (type != 'fade') {
                    type = 'scroll';
                }
            }

            defaultClass = Ext.ClassManager.getByAlias('fx.layout.card.' + type);

            //<debug error>
            if (!defaultClass) {
                Ext.Logger.error("Unknown card animation type: '" + type + "'");
            }
            //</debug>
        }

        return Ext.factory(config, defaultClass);
    }
});
