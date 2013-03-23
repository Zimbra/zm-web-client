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
 * Touch event.
 */
Ext.define('Ext.event.Touch', {
    extend: 'Ext.event.Dom',

    requires: [
        'Ext.util.Point'
    ],

    constructor: function(event, info) {
        if (info) {
            this.set(info);
        }

        this.touchesMap = {};

        this.changedTouches = this.cloneTouches(event.changedTouches);
        this.touches = this.cloneTouches(event.touches);
        this.targetTouches = this.cloneTouches(event.targetTouches);

        return this.callParent([event]);
    },

    clone: function() {
        return new this.self(this);
    },

    setTargets: function(targetsMap) {
        this.doSetTargets(this.changedTouches, targetsMap);
        this.doSetTargets(this.touches, targetsMap);
        this.doSetTargets(this.targetTouches, targetsMap);
    },

    doSetTargets: function(touches, targetsMap) {
        var i, ln, touch, identifier, targets;

        for (i = 0,ln = touches.length; i < ln; i++) {
            touch = touches[i];

            identifier = touch.identifier;

            targets = targetsMap[identifier];

            if (targets) {
                touch.targets = targets;
            }
        }
    },

    cloneTouches: function(touches) {
        var map = this.touchesMap,
            clone = [],
            lastIdentifier = null,
            i, ln, touch, identifier;

        for (i = 0,ln = touches.length; i < ln; i++) {
            touch = touches[i];

            identifier = touch.identifier;

            // A quick fix for a bug found in Bada 1.0 where all touches have
            // idenfitier of 0
            if (lastIdentifier !== null && identifier === lastIdentifier) {
                identifier++;
            }

            lastIdentifier = identifier;

            if (!map[identifier]) {
                map[identifier] = {
                    pageX: touch.pageX,
                    pageY: touch.pageY,
                    identifier: identifier,
                    target: touch.target,
                    timeStamp: touch.timeStamp,
                    point: Ext.util.Point.fromTouch(touch),
                    targets: touch.targets
                };
            }

            clone[i] = map[identifier];
        }

        return clone;
    }
});
