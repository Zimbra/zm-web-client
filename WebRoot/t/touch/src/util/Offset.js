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
 */
/**
 * @private
 */
Ext.define('Ext.util.Offset', {

    /* Begin Definitions */

    statics: {
        fromObject: function(obj) {
            return new this(obj.x, obj.y);
        }
    },

    /* End Definitions */

    constructor: function(x, y) {
        this.x = (x != null && !isNaN(x)) ? x : 0;
        this.y = (y != null && !isNaN(y)) ? y : 0;

        return this;
    },

    copy: function() {
        return new Ext.util.Offset(this.x, this.y);
    },

    copyFrom: function(p) {
        this.x = p.x;
        this.y = p.y;
    },

    toString: function() {
        return "Offset[" + this.x + "," + this.y + "]";
    },

    equals: function(offset) {
        //<debug>
        if(!(offset instanceof this.statics())) {
            Ext.Error.raise('Offset must be an instance of Ext.util.Offset');
        }
        //</debug>

        return (this.x == offset.x && this.y == offset.y);
    },

    round: function(to) {
        if (!isNaN(to)) {
            var factor = Math.pow(10, to);
            this.x = Math.round(this.x * factor) / factor;
            this.y = Math.round(this.y * factor) / factor;
        } else {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    },

    isZero: function() {
        return this.x == 0 && this.y == 0;
    }
});
