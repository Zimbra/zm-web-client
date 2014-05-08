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
 * This class represents a controller that manages the overviews.
 */
Ext.define('ZCS.controller.ZtOverviewController', {

    extend: 'Ext.app.Controller',

	mixins: {
		organizerNotificationHandler: 'ZCS.common.ZtOrganizerNotificationHandler'
	},

	config: {

        refs: {
            // event handlers
			folderList:             'overview nestedlist',
            folderSelector:         'organizeredit nestedlist',
	        newFolderBtn:           'overview button[action=newFolder]',
	        newTagBtn:              'overview button[action=newTag]',
            editBtn:                'overview button[action=edit]',
            locationSelectionCard:  'organizeredit #locationSelectionCard',
            locationSelectionCardCancelBtn: 'organizeredit #locationSelectionCard #zcs-location-selection-card-cancel-btn',
            folderLocBtn:           'organizeredit #folderLocation',
            cancelBtn:              'organizeredit button[action=cancel]',
            saveBtn:                'organizeredit button[action=save]',
            deleteFolderBtn:        'organizeredit button[action=deleteFolder]',
            deleteTagBtn:           'organizeredit button[action=deleteTag]',

            // other
            organizerEditPanel: 'organizeredit',
            colorPicker:        'organizeredit colorselector'
        },

        control: {
            folderList: {
				search: 'doSearch',
                edititemtap:    'showEdit'
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
            deleteFolderBtn: {
                tap:            'deleteFolder'
            },
            deleteTagBtn: {
                tap:            'deleteTag'
            },
            locationSelectionCard: {
                show:           'onLocationSelectionCardShow',
                hide:           'onLocationSelectionCardHide'
            },
            locationSelectionCardCancelBtn: {
                tap:            'hideLocationSelectionCard'
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

	getOverview: function() {
		return ZCS.session.getCurrentOverview();
	},

	getCurrentFolderList: function() {
		return Ext.ComponentQuery.query('sheet #' + ZCS.session.getActiveApp() + 'overview nestedlist')[0];
	},

	getEditType: function() {
		return this.getOrganizerEditPanel().getActiveItem().get('itemId') === 'tagEditCard' ? ZCS.constant.ORG_TAG : ZCS.constant.ORG_FOLDER;
	},

    doSave: function() {

        var errorMsg = (this.getEditType() === ZCS.constant.ORG_TAG) ? this.saveTag() : this.saveFolder();
	    if (errorMsg) {
		    Ext.Msg.alert(ZtMsg.error, errorMsg);
		    return;
	    }

        this.hideEditPanel();
        this.toggleEditState();
    },

	showNewFolder: function () {
		this.showNew(ZCS.constant.ORG_FOLDER);
	},

	showNewTag: function () {
		this.showNew(ZCS.constant.ORG_TAG);
	},

	showNew: function(type) {

		var	isTag = (type === ZCS.constant.ORG_TAG),
			organizerEditPanel = this.getOrganizerEditPanel(),
			deleteBtn = isTag ? this.getDeleteTagBtn() : this.getDeleteFolderBtn();

		organizerEditPanel.down('titlebar').setTitle(isTag ? ZtMsg.newTag : ZtMsg.newFolder);
		deleteBtn.hide();

		if (isTag) {
			this.getColorPicker().setColor(0);
		}
		else {
			// assign a default parent folder
			var list = this.getCurrentFolderList();
			this.assignParentFolder(list.getLastNode(), list.getActiveItem());
		}

		organizerEditPanel.setActiveItem('#' + type + 'EditCard');
		organizerEditPanel.show();
	},

	showEdit: function(organizer, list) {

		if (organizer && organizer.isSystem()) {
			return false;
		}

		var type = organizer.get('type'),
			isTag = (type === ZCS.constant.ORG_TAG),
			organizerEditPanel = this.getOrganizerEditPanel(),
			deleteBtn = isTag ? this.getDeleteTagBtn() : this.getDeleteFolderBtn();

		//TODO: allow this to succeed once there is a search edit state.
		if (type === 'search') {
			return false;
		}

		organizerEditPanel.down('titlebar').setTitle(isTag ? ZtMsg.editTag : ZtMsg.editFolder);
		if (organizer.isDeletable()) {
			deleteBtn.show();
		} else {
			deleteBtn.hide();
		}
		organizerEditPanel.down('#' + type + 'Name').setValue(organizer.get('name'));

		if (isTag) {
			organizerEditPanel.setTag(organizer);
			this.getColorPicker().setColor(organizer.get('color'));
		}
		else {
			organizerEditPanel.setFolder(organizer);
			this.assignParentFolder(organizer.parentNode, list);
			if (!organizer.isMovable()) {
				this.getFolderLocBtn().disable();
			}
		}

		organizerEditPanel.setActiveItem('#' + type + 'EditCard');
		organizerEditPanel.show();
	},

    assignParentFolder: function(folder, folderList) {

        var overview = this.getOverview(),
            organizerEditPanel = this.getOrganizerEditPanel(),
	        isRoot = !(folder && folder.parentNode),
            // root has no name, so get group name from first organizer in store
            folderName = !isRoot ? folder.get('name') : folderList.getStore().getAt(0).getGroupName();

        this.getFolderLocBtn().setText(folderName);
        organizerEditPanel.setParentFolder(folder || folderList.getParent().getStore().getRoot());
        organizerEditPanel.setActiveItem('#folderEditCard');
    },

    /**
     * Filters the folder location selector, only showing those folders which
     * mayContain the folder currently being edited.
     */
    filterFolderList: function(folderList) {

        var activeList = folderList.getActiveItem(),
            activeStore = activeList.getStore(),
            folder = this.getOrganizerEditPanel().getFolder(),
	        app = ZCS.session.getActiveApp();

	    if (!folder) {
		    // creating a new folder, so use a dummy for filtering
		    folder = Ext.create('ZCS.model.ZtOrganizer', {
			    type:       ZCS.constant.ORG_FOLDER,
			    folderType: ZCS.constant.APP_FOLDER[app]
		    });
	    }

        activeStore.clearFilter();
        activeStore.filter([{
            filterFn: function(item) {
                return item.mayContain(folder);
            }
        }]);
        activeList.refresh();
    },

    hideEditPanel: function() {
        var organizerEditPanel = this.getOrganizerEditPanel();

        // Clear tag info
        organizerEditPanel.down('#tagName').setValue('');
        organizerEditPanel.setTag(undefined);

        // Clear folder info
        organizerEditPanel.down('#folderName').setValue('');
        organizerEditPanel.setFolder(undefined);
        organizerEditPanel.setParentFolder(undefined);

        this.getFolderLocBtn().enable();

        organizerEditPanel.hide();
    },

    showFolderSelection: function() {
        var organizerEditPanel = this.getOrganizerEditPanel(),
            folderLocationSelector = organizerEditPanel.down('#locationSelectionCard'),
            folderList = this.getFolderSelector(),
            rootNode = folderList.getStore().getRoot();

        if (folderList._lastNode !== rootNode) {
            // reset folder selector to top level which triggers activeitemchange
            folderList.goToNode(rootNode);
        }
        else {
            // if already on first card just update filter manually
            this.filterFolderList(folderList);
        }
        organizerEditPanel.setActiveItem(folderLocationSelector);
    },

    toggleEditState: function() {
	    var overview = this.getOverview(),
            organizerEditToolbar = overview.getDockedItems()[0],
            editBtn = overview.down('#zcs-overview-edit-btn'),
            appsBtn = overview.down('#zcs-overview-apps-btn'),
            organizerEditPanel = this.getOrganizerEditPanel(),
            organizerListToolbar = overview.down('organizerlist').getToolbar(),
            folderList = this.getCurrentFolderList();

        if (folderList.editing) {
            folderList.editing = false;
            overview.removeCls('editing');
            organizerListToolbar.setTitle(ZCS.constant.APP_NAME[overview.getApp()]);
            editBtn.setText(ZtMsg.edit);
            appsBtn.show();
            organizerEditToolbar.hide();
        }
        else {
            folderList.editing = true;
            overview.addCls('editing');
            organizerListToolbar.setTitle([ZtMsg.edit,organizerListToolbar.getTitle()].join(" "));
            editBtn.setText(ZtMsg.done);
            appsBtn.hide();
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

	    var errorMsg = this.checkName(newFolderName);
	    if (errorMsg) {
		    return errorMsg;
	    }

	    if (!folder) {
		    folder = Ext.create('ZCS.model.ZtOrganizer', {
			    type:           ZCS.constant.ORG_FOLDER,
			    name:           newFolderName,
			    parentZcsId:    newParentId
		    });
		    options.view = ZCS.constant.FOLDER_VIEW[app];
	    }
	    else {
		    if (newFolderName !== folder.get('name')) {
			    options.name = newFolderName;
		    }
		    if (newParentId !== folder.get('parentZcsId')) {
			    options.parentId = newParentId;
		    }
		    if (!options.name && !options.parentId) {
			    return ZtMsg.noChangesMade;
		    }
	    }
	    folder.save(options);

        this.hideEditPanel();
    },

    saveTag: function() {

        var organizerEditPanel = this.getOrganizerEditPanel(),
            tag = organizerEditPanel.getTag(),
	        newTagName = organizerEditPanel.down('#tagName').getValue(),
	        newTagColor = this.getColorPicker().getColor(),
	        options = {};

	    var errorMsg = this.checkName(newTagName);
	    if (errorMsg) {
		    return errorMsg;
	    }

	    if (!tag) {
		    tag = Ext.create('ZCS.model.ZtOrganizer', {
			    type:   ZCS.constant.ORG_TAG,
			    name:   newTagName,
			    color:  newTagColor
		    });
	    }
	    else {
		    if (newTagName !== tag.get('name')) {
			    options.name = newTagName;
		    }
		    if (newTagColor !== tag.get('color')) {
			    options.color = newTagColor;
		    }
		    if (!options.name && !options.color) {
			    return ZtMsg.noChangesMade;
		    }
	    }
	    tag.save(options);
    },

	deleteFolder: function() {

		var organizerEditPanel = this.getOrganizerEditPanel(),
			folder = organizerEditPanel.getFolder(),
			options = {};

		if (folder) {
			if (folder.deleteIsHard()) {
				var deleteMsg = Ext.String.format(ZtMsg.hardDeleteFolderText, Ext.String.htmlEncode(folder.get('name')));
				Ext.Msg.confirm(ZtMsg.hardDeleteFolderTitle, deleteMsg, function(buttonId) {
					if (buttonId === 'yes') {
						options.del = true;
						folder.save(options);
                        this.hideEditPanel();
                        this.toggleEditState();
					}
				}, this);
			}
			else {
				options.trash = true;
				folder.save(options);
                this.hideEditPanel();
                this.toggleEditState();
			}
		}
	},

	deleteTag: function() {
		var organizerEditPanel = this.getOrganizerEditPanel(),
			tag = organizerEditPanel.getTag(),
			options = {};

		if (tag) {
			var deleteMsg = Ext.String.format(ZtMsg.hardDeleteTagText, Ext.String.htmlEncode(tag.get('name')));
			Ext.Msg.confirm(ZtMsg.hardDeleteTagTitle, deleteMsg, function(buttonId) {
				if (buttonId === 'yes') {
					options.del = true;
					tag.save(options);
                    this.hideEditPanel();
                    this.toggleEditState();
				}
			}, this);
		}
	},

	handleOrganizerCreate: function(folder, notification) {
		this.addOrganizer(this.getOrganizerEditPanel(), notification);
	},

	/**
	 * An organizer has just changed. If it is a move, we need to relocate it within
	 * the overview used for parent folder selection.
	 *
	 * @param {ZtOrganizer}     folder          organizer that changed
	 * @param {Object}          notification    JSON with new data
	 */
	handleOrganizerChange: function(folder, notification) {
		this.modifyOrganizer(this.getOrganizerEditPanel(), folder, notification);
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
		this.reloadOverviews(this.getOrganizerEditPanel());
	},

    onLocationSelectionCardShow: function(){
        this.getOrganizerEditPanel().getDockedItems()[0].hide();
    },

    onLocationSelectionCardHide: function(){
        this.getOrganizerEditPanel().getDockedItems()[0].show();
    },

    hideLocationSelectionCard: function(btn){
        var organizerEditPanel = this.getOrganizerEditPanel();
        organizerEditPanel.setActiveItem('#folderEditCard');        
    },

	/**
	 * Validates the name of an organizer.
	 *
	 * @param {String}  name    organizer name
	 * @returns {Boolean}   error string if validation fails, null if name is valid
	 */
	checkName: function(name) {

		if (!name) {
			return ZtMsg.nameMissing;
		}

		if (name.length > ZCS.constant.ORG_NAME_MAX_LENGTH) {
			return Ext.String.format(ZtMsg.nameTooLong, ZCS.constant.ORG_NAME_MAX_LENGTH);
		}

		if (!ZCS.constant.ORG_NAME_REGEX.test(name)) {
			return Ext.String.format(ZtMsg.nameInvalid, name);
		}

		return null;
	},

	doSearch: function(query, folder) {
		/**
		 * Search for other apps is handled generically in the list controller. Since list controller is
		 * not registered in case of calendar, override it specifically in calendar controller.
		 */
        /**
         * bug:88804 - Disable search on individual calendar folders till bug 88908 is fixed.
         */
//		if (ZCS.session.getActiveApp() === ZCS.constant.APP_CALENDAR) {
//			ZCS.app.getCalendarController().doSearch(query, folder);
//		}
	}
});

