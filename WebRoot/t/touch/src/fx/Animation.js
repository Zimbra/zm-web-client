/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
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
 * @author Jacky Nguyen <jacky@sencha.com>
 */
Ext.define('Ext.fx.Animation', {

    requires: [
        'Ext.fx.animation.Slide',
        'Ext.fx.animation.SlideOut',
        'Ext.fx.animation.Fade',
        'Ext.fx.animation.FadeOut',
        'Ext.fx.animation.Flip',
        'Ext.fx.animation.Pop',
        'Ext.fx.animation.PopOut'
//        'Ext.fx.animation.Cube'
    ],

    constructor: function(config) {
        var defaultClass = Ext.fx.animation.Abstract,
            type;

        if (typeof config == 'string') {
            type = config;
            config = {};
        }
        else if (config && config.type) {
            type = config.type;
        }

        if (type) {
            if (Ext.os.is.Android2) {
                if (type == 'pop') {
                    type = 'fade';
                }
                if (type == 'popIn') {
                    type = 'fadeIn';
                }
                if (type == 'popOut') {
                    type = 'fadeOut';
                }
            }
            defaultClass = Ext.ClassManager.getByAlias('animation.' + type);

            //<debug error>
            if (!defaultClass) {
                Ext.Logger.error("Invalid animation type of: '" + type + "'");
            }
            //</debug>
        }

        return Ext.factory(config, defaultClass);
    }
});
