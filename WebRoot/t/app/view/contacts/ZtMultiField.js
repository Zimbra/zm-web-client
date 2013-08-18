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
 * This base class supports a contact form field that can appear multiple times.
 * It is a container that holds one or more instances of a form field. It will
 * have plus and minus icons to add and remove instances.
 *
 * @author Conrad Damon
 */
Ext.define('ZCS.view.contacts.ZtMultiField', {

    extend: 'Ext.Container',

    config: {
        layout:     'vbox',
        labelName:  '',
	    type:       ''
    },

	// By default, start with one field
	initialize: function() {
		this.addField();
	},

	// Label for field type
    getLabelConfig: function() {
	    return {
		    xtype:  'label',
		    html:   this.getLabelName(),
		    cls:    'zcs-contact-label',
		    width:  '20%'
	    };
    },

	// Plus and minus buttons for adding/removing fields
	getAddRemoveConfig: function(fieldId) {

		return [
			{
				xtype:      'button',
				iconCls:    'plus',
				itemId:     ZCS.util.getUniqueId({
								type:   this.getType(),
								action: 'add'
							}),
				flex:       0,
				align:      'right',
				cls:        'zcs-flat zcs-contact-addremove',

				handler: function() {
					this.up('contactpanel').fireEvent('multiAddRemove', this);
				}
			},
			{
				xtype:      'button',
				iconCls:    'minus',
				itemId:     ZCS.util.getUniqueId({
								type:       this.getType(),
								action:     'remove',
								fieldId:    fieldId
							}),
				flex:       0,
				align:      'right',
				cls:        'zcs-flat zcs-contact-addremove',

				handler: function() {
					this.up('contactpanel').fireEvent('multiAddRemove', this);
				}
			}
		];
	},

	addField: function() {

		var items = [],
			fieldId = ZCS.util.getUniqueId();

		items.push(this.getLabelConfig());
		items.push(this.getFieldConfig(fieldId));
		var config = {
			layout: 'hbox',
			items:  items,
			itemId: fieldId
		};
		this.add(config);
	},

	removeField: function(fieldId) {

		if (this.getItems().getCount() > 1) {
			var field = this.down('#' + fieldId);
			if (field) {
				field.destroy();
			}
		}
		else {
			// If trying to remove last field, just clear it.
			this.reset();
		}
	},

	reset: function() {
		this.removeAll(true);
		this.addField();
	}
});
