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
//@require Ext.Class
//@require Ext.ClassManager
//@require Ext.Loader

/**
 * Base class for all mixins.
 * @private
 */
Ext.define('Ext.mixin.Mixin', {
    onClassExtended: function(cls, data) {
        var mixinConfig = data.mixinConfig,
            parentClassMixinConfig,
            beforeHooks, afterHooks;

        if (mixinConfig) {
            parentClassMixinConfig = cls.superclass.mixinConfig;

            if (parentClassMixinConfig) {
                mixinConfig = data.mixinConfig = Ext.merge({}, parentClassMixinConfig, mixinConfig);
            }

            data.mixinId = mixinConfig.id;

            beforeHooks = mixinConfig.beforeHooks;
            afterHooks = mixinConfig.hooks || mixinConfig.afterHooks;

            if (beforeHooks || afterHooks) {
                Ext.Function.interceptBefore(data, 'onClassMixedIn', function(targetClass) {
                    var mixin = this.prototype;

                    if (beforeHooks) {
                        Ext.Object.each(beforeHooks, function(from, to) {
                            targetClass.override(to, function() {
                                if (mixin[from].apply(this, arguments) !== false) {
                                    return this.callOverridden(arguments);
                                }
                            });
                        });
                    }

                    if (afterHooks) {
                        Ext.Object.each(afterHooks, function(from, to) {
                            targetClass.override(to, function() {
                                var ret = this.callOverridden(arguments);

                                mixin[from].apply(this, arguments);

                                return ret;
                            });
                        });
                    }
                });
            }
        }
    }
});
