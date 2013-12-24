/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
 * This class represents a controller that manages the mail app's folder list.
 */
Ext.define('ZCS.controller.mail.ZtFolderListController', {

    extend: 'Ext.app.Controller',

	mixins: {
		organizerNotificationHandler: 'ZCS.common.ZtOrganizerNotificationHandler'
	},

	config: {

        refs: {
            // event handlers
            folderList:     'sheet #' + ZCS.constant.APP_MAIL + 'overview nestedlist',
            folderSelector: 'organizeredit nestedlist',
            newFolderBtn:   '#' + ZCS.constant.APP_MAIL + 'overview button[action=newFolder]',
            newTagBtn:      '#' + ZCS.constant.APP_MAIL + 'overview button[action=newTag]',
            editBtn:        '#' + ZCS.constant.APP_MAIL + 'overview button[action=edit]',
            folderLocBtn:   'organizeredit #folderLocation',
            cancelBtn:      'organizeredit button[action=cancel]',
            saveBtn:        'organizeredit button[action=save]',
            deleteBtn:      'organizeredit button[action=delete]',

            // other
            overview:           '#' + ZCS.constant.APP_MAIL + 'overview',
            organizerEditPanel: 'organizeredit',
            colorPicker:        'organizeredit colorselector'
        },

        control: {
            folderList: {
                edititemtap:    'doEdit'
            },
            folderSelector: {
                edititemtap:        'assignParentFolder',
                activeitemchange:   'filterFolderList'
            },
            editBtn: {
                tap:            'toggleEditState'
            },
            newFolderBtn: {
                tap:            'showNewFolder'
            },
            newTagBtn: {
                tap:            'showNewTag'
            },
            cancelBtn: {
                tap:            'hideEditPanel'
            },
            folderLocBtn: {
                tap:            'showFolderSelection'
            },
            saveBtn: {
                tap:            'doSave'
            },
            deleteBtn: {
                tap:            'deleteFolder'
            }
        }
    },

	launch: function() {

		ZCS.app.on('notifyFolderCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifySearchCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifyTagCreate', this.handleOrganizerCreate, this);

		ZCS.app.on('notifyFolderDelete', this.handleOrganizerDelete, this);
		ZCS.app.on('notifySearchDelete', this.handleOrganizerDelete, this);
		ZCS.app.on('notifyTagDelete', this.handleOrganizerDelete, this);

		ZCS.app.on('notifyFolderChange', this.handleOrganizerChange, this);
		ZCS.app.on('notifySearchChange', this.handleOrganizerChange, this);
		ZCS.app.on('notifyTagChange', this.handleOrganizerChange, this);

		ZCS.app.on('notifyRefresh', this.handleRefresh, this);
	},

	doEdit: function(item, list) {

	    var type = item.get('type');

        if (type === ZCS.constant.ORG_FOLDER) {
            this.showFolderEdit(item, list);
        }
        else if (type === ZCS.constant.ORG_TAG) {
            this.showTagEdit(item, list);
        }
    },

    doSave: function() {

        var organizerEditPanel = this.getOrganizerEditPanel();

        if (organizerEditPanel.getActiveItem().get('itemId') === 'tagEditCard') {
            this.saveTag();
        } else {
            this.saveFolder();
        }
    },

    showFolderEdit: function(folder, list) {

        var organizerEditPanel = this.getOrganizerEditPanel();

        // Set the panel up for Edit Folder
        organizerEditPanel.down('titlebar').setTitle(ZtMsg.editFolder);
        if (folder.isDeletable()) {
            this.getDeleteBtn().show();
        } else {
            this.getDeleteBtn().hide();
        }

        // Assign the folder being edited
        organizerEditPanel.down('#folderName').setValue(folder.get('name'));
        organizerEditPanel.setFolder(folder);

        // Assign its current parent folder
        this.assignParentFolder(folder.parentNode);

        if (!folder.isMovable()) {
            this.getFolderLocBtn().disable();
        }

        organizerEditPanel.show();
    },

    showNewFolder: function () {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            folderList = this.getFolderList(),
            parentFolder = folderList.getLastNode();

        // Set the panel up for New Folder
        organizerEditPanel.down('titlebar').setTitle(ZtMsg.newFolder);
        this.getDeleteBtn().hide();

        // Assign its default parent folder
        this.assignParentFolder(parentFolder);

        organizerEditPanel.show();
    },

    showTagEdit: function (tag, list) {

        var organizerEditPanel  = this.getOrganizerEditPanel(),
            colorPicker         = this.getColorPicker();

        // Set the panel up for Edit Tag
        organizerEditPanel.down('titlebar').setTitle(ZtMsg.editTag);

        // Assign the tag being edited
        organizerEditPanel.down('#tagName').setValue(tag.get('name'));
        organizerEditPanel.setTag(tag);
        colorPicker.setColor(tag.get('color'));

        organizerEditPanel.setActiveItem('#tagEditCard');
        organizerEditPanel.show();
    },

    showNewTag: function () {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            colorPicker = this.getColorPicker();

        // Set the panel up for New Tag
        organizerEditPanel.down('titlebar').setTitle(ZtMsg.newTag);
        colorPicker.setColor(0);

        organizerEditPanel.setActiveItem('#tagEditCard');
        organizerEditPanel.show();
    },

    assignParentFolder: function (folder, folderList) {

        var overview = this.getOverview(),
            organizerEditPanel = this.getOrganizerEditPanel(),
            folderName = folder.parentNode == null ? 'Mail' : folder.get('name');

        this.getFolderLocBtn().setText(folderName);
        organizerEditPanel.setParentFolder(folder);

        organizerEditPanel.setActiveItem('#folderEditCard');
    },

    /**
     * Filters the folder location selector, only showing those folders which
     * mayContain the folder currently being edited.
     */
    filterFolderList: function (folderList) {

        var activeList = folderList.getActiveItem(),
            activeStore = activeList.getStore(),
            editedFolder = this.getOrganizerEditPanel().getFolder();

        activeStore.clearFilter();
        if (editedFolder) {
            activeStore.filter([{
                filterFn: function (item) {
                    return item.mayContain(editedFolder);
                }
            }]);
        }
        activeList.refresh();
    },

    hideEditPanel: function () {

        var organizerEditPanel = this.getOrganizerEditPanel();

        // Clear tag info
        organizerEditPanel.down('#tagName').setValue('');
        organizerEditPanel.setTag(undefined);

        // Clear folder info
        organizerEditPanel.down('#folderName').setValue('');
        organizerEditPanel.setFolder(undefined);
        organizerEditPanel.setParentFolder(undefined);

        this.getFolderLocBtn().enable();

        this.toggleEditState();
        organizerEditPanel.hide();
    },

    showFolderSelection: function () {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            folderLocationSelector = organizerEditPanel.down('#locationSelectionCard'),
            folderList = this.getFolderSelector(),
            rootNode = folderList.getStore().getRoot();

        if (folderList._lastNode !== rootNode) {
            // reset folder selector to top level which triggers activeitemchange
            folderList.goToNode(rootNode);
        } else {
            // if already on first card just update filter manually
            this.filterFolderList(folderList);
        }
        organizerEditPanel.setActiveItem(folderLocationSelector);
    },

    toggleEditState: function() {

        var overview = this.getOverview(),
            organizerEditToolbar = overview.getDockedItems()[0],
            button = this.getEditBtn(),
            folderList = this.getFolderList();

        if (folderList.editing) {
            button.setText('Edit');
            folderList.editing = undefined;
            organizerEditToolbar.hide();
        } else {
            button.setText('Done');
            folderList.editing = true;
            organizerEditToolbar.show();
        }
    },

    saveFolder: function() {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            folder = organizerEditPanel.getFolder(),
	        newFolderName = organizerEditPanel.down('#folderName').getValue(),
            newParentFolder = organizerEditPanel.getParentFolder(),
	        newParentId = (newParentFolder && newParentFolder.get('zcsId')) || ZCS.constant.ID_ROOT,
	        app = ZCS.session.getActiveApp(),
	        options = {};

	    if (!folder) {
		    folder = Ext.create('ZCS.model.ZtOrganizer', {
			    type:           ZCS.constant.ORG_FOLDER,
			    name:           newFolderName,
			    parentZcsId:    newParentId
		    });
		    options.view = ZCS.constant.FOLDER_VIEW[app];
		    folder.save(options);
	    }
	    else {
		    if (newFolderName !== folder.get('name')) {
			    options.name = newFolderName;
			    folder.save(options);
		    }
		    if (newParentId !== folder.get('parentZcsId')) {
			    options.parentId = newParentId;
			    folder.save(options);
		    }
	    }

        this.hideEditPanel();
    },

    deleteFolder: function() {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            folder = organizerEditPanel.getFolder(),
	        options = {};

	    if (folder) {
		    if (folder.deleteIsHard()) {
			    var deleteMsg = Ext.String.format(ZtMsg.hardDeleteFolderText, folder.get('name'));
			    Ext.Msg.confirm(ZtMsg.hardDeleteFolderTitle, deleteMsg, function(buttonId) {
				    if (buttonId === 'yes') {
					    options.delete = true;
					    folder.save(options);
				    }
			    }, this);
		    }
		    else {
			    options.trash = true;
			    folder.save(options);
		    }
	    }

        this.hideEditPanel();
    },

    saveTag: function() {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            tag = organizerEditPanel.getTag(),
	        tagName = organizerEditPanel.down('#tagName').getValue(),
	        color = this.getColorPicker().getColor();

	    if (!tag) {
		    tag = Ext.create('ZCS.model.ZtOrganizer', {
			    type:   ZCS.constant.ORG_TAG,
			    name:   tagName,
			    color:  color
		    });
	    }
	    else {
		    tag.set('name', tagName);
		    tag.set('color', color);
	    }
	    tag.save();

        this.hideEditPanel();
    },

	handleOrganizerCreate: function(folder, notification) {
		this.addOrganizer(this.getOrganizerEditPanel(), notification, 'selector');
	},

	/**
	 * An organizer has just changed. If it is a move, we need to relocate it within
	 * the overview used for parent folder selection.
	 *
	 * @param {ZtOrganizer}     folder          organizer that changed
	 * @param {Object}          notification    JSON with new data
	 */
	handleOrganizerChange: function(folder, notification) {
		this.modifyOrganizer(this.getOrganizerEditPanel(), folder, notification, 'selector');
	},

	/**
	 * An organizer has been hard-deleted. Remove it from overview stores.
	 *
	 * @param {ZtOrganizer}     folder          organizer that changed
	 */
	handleOrganizerDelete: function(folder) {
		this.removeOrganizer(this.getOrganizerEditPanel(), folder);
	},

	/**
	 * We got a <refresh> block. Reload the overviews.
	 */
	handleRefresh: function() {
		this.reloadOverviews(this.getOrganizerEditPanel(), 'selector');
	}
});
