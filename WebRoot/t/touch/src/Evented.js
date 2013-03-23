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
 */
Ext.define('Ext.Evented', {

    alternateClassName: 'Ext.EventedBase',

    mixins: ['Ext.mixin.Observable'],

    statics: {
        generateSetter: function(nameMap) {
            var internalName = nameMap.internal,
                applyName = nameMap.apply,
                changeEventName = nameMap.changeEvent,
                doSetName = nameMap.doSet;

            return function(value) {
                var initialized = this.initialized,
                    oldValue = this[internalName],
                    applier = this[applyName];

                if (applier) {
                    value = applier.call(this, value, oldValue);

                    if (typeof value == 'undefined') {
                        return this;
                    }
                }

                // The old value might have been changed at this point
                // (after the apply call chain) so it should be read again
                oldValue = this[internalName];

                if (value !== oldValue) {
                    if (initialized) {
                        this.fireAction(changeEventName, [this, value, oldValue], this.doSet, this, {
                            nameMap: nameMap
                        });
                    }
                    else {
                        this[internalName] = value;
                        if (this[doSetName]) {
                            this[doSetName].call(this, value, oldValue);
                        }
                    }
                }

                return this;
            }
        }
    },

    initialized: false,

    constructor: function(config) {
        this.initialConfig = config;
        this.initialize();
    },

    initialize: function() {
        this.initConfig(this.initialConfig);
        this.initialized = true;
    },

    doSet: function(me, value, oldValue, options) {
        var nameMap = options.nameMap;

        me[nameMap.internal] = value;
        if (me[nameMap.doSet]) {
          me[nameMap.doSet].call(this, value, oldValue);
        }
    },

    onClassExtended: function(Class, data) {
        if (!data.hasOwnProperty('eventedConfig')) {
            return;
        }

        var ExtClass = Ext.Class,
            config = data.config,
            eventedConfig = data.eventedConfig,
            name, nameMap;

        data.config = (config) ? Ext.applyIf(config, eventedConfig) : eventedConfig;

        /*
         * These are generated setters for eventedConfig
         *
         * If the component is initialized, it invokes fireAction to fire the event as well,
         * which indicate something has changed. Otherwise, it just executes the action
         * (happens during initialization)
         *
         * This is helpful when we only want the event to be fired for subsequent changes.
         * Also it's a major performance improvement for instantiation when fired events
         * are mostly useless since there's no listeners
         */
        for (name in eventedConfig) {
            if (eventedConfig.hasOwnProperty(name)) {
                nameMap = ExtClass.getConfigNameMap(name);

                data[nameMap.set] = this.generateSetter(nameMap);
            }
        }
    }
});
