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
 * This class is a NestedList that shows a folder tree. The main reason we subclass NestedList is so
 * that we can use the disclosure button to expand a folder (rather than show a detail card), and tap
 * to perform a folder search (rather than expand the folder).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtOrganizerList', {

	extend: 'Ext.dataview.NestedList',

	xtype: 'organizerlist',

	/**
	 * List will fire different events on 'itemtap' depending on editing state
	 */
	editing: false,

	config: {

		cls: 'zcs-organizer-list',

		infinite: true,

		grouped: true,

		listConfig: {
			itemTpl: '<div class="zcs-menu-icon <tpl if="folderType">{folderType}\"<tpl else>{type}\"</tpl>></div>' +
				'<div class="zcs-menu-label"><tpl if="folderType === ZCS.constant.ORG_CALENDAR">' +
				'<tpl if="zcsId === ZCS.constant.ID_CALENDAR">' +
				'<span class="zcs-menu-color-block zcs-tag-1"></span><tpl else>' +
				'<span class="zcs-menu-color-block zcs-tag-{color}" style="background-color: {rgb};"></span></tpl></tpl>{title}</div>'
		},

		listeners  : {
			element:    'element',
			delegate:   'div.x-list-header',
			tap: function(e) {
					if (this.getType() === ZCS.constant.ORG_LIST_SELECTOR) {
						this.fireEvent('edititemtap', null, this.getActiveItem());
					}
			}
		},

		type: null,     // ZCS.constant.ORG_LIST_*

		// Show the folder's child list.
		onItemDisclosure: function(record, item, index, e) {

			// This event is scoped to the sub-list that caught it, so we need to get the top-level nested
			// list to expand the node, as a sub-list only knows how to display a flat series of items.
			var list = item.dataview,
				store = list.getStore(),
				node = store.getAt(index),
				nestedList = this.up('nestedlist');

			nestedList.goToNode(node);
			if (node.parentNode) {
				node.parentNode.set('expanded', true);
			}

			list.up('organizerlist').fireEvent('changeNode', node, false);
		}
	},

	onBackTap: function() {
        var list = this.getActiveItem(),
            store = list.getStore(),
            node = store.getNode();

        this.callParent(arguments);
        list.up('organizerlist').fireEvent('changeNode', node, true);
    },

	/**
	 * Runs a search that will show the folder's contents.
	 */
	onItemTap: function(list, index, target, folder, e) {

		//Stop the base dom event, which for some reason, on devices, will trigger
		//a focus on an input which is moved into the coordinates of this event by
		//this event handler.  The current thought is that this event handler operates on touchstart,
		//and focus operates on touchend.

		e.preventDefault();

		if (!this.editing) {
			this.fireEvent('search', folder.getQuery(), folder);

			this.fireEvent('itemtap', list, index, target, folder, e);
		} else {
			this.fireEvent('edititemtap', folder, list);
		}
	},

	/**
	 * Returns the folder with the given ID.
	 *
	 * @param {string}  id      folder ID
	 * @return {ZtFolder}       folder
	 */
	getById: function(id) {
		return this.getStore().getById(id);
	},

	/**
	 * Override Ext.dataview.NestedList.getList to propagate grouping info from
	 * parent NestedList to List sublist.
	 */
	getList: function(node) {

		var list = this.callParent(arguments);

		list.xtype = 'organizersublist';
		list.infinite = this.getInfinite();
		list.grouped = this.getGrouped();
		list.store.setGrouper(this.getStore().config.grouper);

		return list;
	},

	/**
	 * Returns a template to use for showing the organizer in the overview. Note that it does not
	 * return display text for the given organizer, just the template.
	 *
	 * @param node
	 * @return {String}
	 */
	getItemTextTpl: function(node) {
		return ZCS.template.Folder;
	},

	getTitleTextTpl: function(node) {
		return this.getItemTextTpl(node);
	}
});

Ext.define('ZCS.view.ZtOrganizerSubList', {

	extend: 'Ext.dataview.List',

	xtype: 'organizersublist',

	config: {
		infinite: true,
		type: null      // ZCS.constant.ORG_LIST_*
	},

	// The two overrides below are so that absolutely nothing happens when the user taps on a
	// disabled organizer. Don't show the pressed or the selected background color.
	onItemTrigger: function(me, index) {
		if (!me.getItemAt(index).getDisabled()) {
			this.callParent(arguments);
		}
	},

	doItemTouchStart: function(me, index, target, record) {
		if (me.getItemAt(index) && !me.getItemAt(index).getDisabled()) {
			this.callParent(arguments);
		}
	}
});
