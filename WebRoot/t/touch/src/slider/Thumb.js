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
 * Utility class used by Ext.slider.Slider - should never need to be used directly.
 */
Ext.define('Ext.slider.Thumb', {
    extend: 'Ext.Component',
    xtype : 'thumb',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'thumb',

        /**
         * @cfg
         * @inheritdoc
         */
        draggable: {
            direction: 'horizontal'
        }
    },

    elementWidth: 0,

    initialize: function() {
        this.callParent();

        this.getDraggable().onBefore({
            dragstart: 'onDragStart',
            drag: 'onDrag',
            dragend: 'onDragEnd',
            scope: this
        });

        this.element.on('resize', 'onElementResize', this);
    },

    onDragStart: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onDrag: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onDragEnd: function() {
        if (this.isDisabled()) {
            return false;
        }

        this.relayEvent(arguments);
    },

    onElementResize: function(element, info) {
        this.elementWidth = info.width;
    },

    getElementWidth: function() {
        return this.elementWidth;
    }
});
