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
Ext.define('Ext.slider.Toggle', {
    extend: 'Ext.slider.Slider',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: 'x-toggle',

        /**
         * @cfg {String} minValueCls CSS class added to the field when toggled to its minValue
         * @accessor
         */
        minValueCls: 'x-toggle-off',

        /**
         * @cfg {String} maxValueCls CSS class added to the field when toggled to its maxValue
         * @accessor
         */
        maxValueCls: 'x-toggle-on'
    },

    initialize: function() {
        this.callParent();

        this.on({
            change: 'onChange'
        });
    },

    applyMinValue: function() {
        return 0;
    },

    applyMaxValue: function() {
        return 1;
    },

    applyIncrement: function() {
        return 1;
    },

    updateMinValueCls: function(newCls, oldCls) {
        var element = this.element;

        if (oldCls && element.hasCls(oldCls)) {
            element.replaceCls(oldCls, newCls);
        }
    },

    updateMaxValueCls: function(newCls, oldCls) {
        var element = this.element;

        if (oldCls && element.hasCls(oldCls)) {
            element.replaceCls(oldCls, newCls);
        }
    },

    setValue: function(newValue, oldValue) {
        this.callParent(arguments);
        this.onChange(this, this.getThumbs()[0], newValue, oldValue);
    },

    onChange: function(me, thumb, newValue, oldValue) {
        var isOn = newValue > 0,
            onCls = me.getMaxValueCls(),
            offCls = me.getMinValueCls();

        this.element.addCls(isOn ? onCls : offCls);
        this.element.removeCls(isOn ? offCls : onCls);
    },

    toggle: function() {
        var value = this.getValue();
        this.setValue((value == 1) ? 0 : 1);

        return this;
    },

    onTap: function() {
        if (this.isDisabled() || this.getReadOnly()) {
            return;
        }

        var oldValue = this.getValue(),
            newValue = (oldValue == 1) ? 0 : 1,
            thumb = this.getThumb(0);

        this.setIndexValue(0, newValue, this.getAnimation());
        this.refreshThumbConstraints(thumb);

        this.fireEvent('change', this, thumb, newValue, oldValue);
    }
});
