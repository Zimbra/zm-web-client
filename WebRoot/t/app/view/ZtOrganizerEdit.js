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
 *
 *
 *  This view displays the interface for editing an organizer.
 *
 */
Ext.define('ZCS.view.ZtOrganizerEdit', {

    extend: 'ZCS.common.ZtLeftMenu',

    requires: [
        'Ext.ux.ColorSelector'
    ],

    xtype: 'organizeredit',

    config: {
        /**
         *  Record that represents the folder being edited.
         */
        folder: undefined,

        /**
         *  Record that represents the location of the folder being edited.
         */
        parentFolder: undefined,

        /**
         *  Record that represents the tag being edited.
         */
        tag: undefined,

        cls: 'zcs-edit-panel zcs-overview',

        layout: 'card',
        items: [{
            xtype:      'titlebar',
            docked:     'top',
            items: [{
                cls:    'zcs-text-btn',
                text:   ZtMsg.cancel,
                action: 'cancel',
                align:  'left'
            }, {
                cls:    'zcs-text-btn',
                text:   ZtMsg.save,
                action: 'save',
                align:  'right'
            }]
        }, {
            xtype:      'container',
            itemId:     'folderEditCard',
            cls:        'zcs-folder-edit',
            padding:    12,
            flex:       1,
            items: [{
                xtype:  'container',
                cls:    'zcs-textfield',
                items: [{
                    xtype:          'textfield',
                    placeHolder:    ZtMsg.folderName,
                    itemId:         'folderName',
                    clearIcon:      false
                }]
            }, {
                xtype:  'label',
                html:   ZtMsg.folderLocationLabel
            }, {
                xtype:      'button',
                itemId:     'folderLocation',
                cls:        'zcs-folder-loc-btn',
                iconCls:    'forward',
                iconAlign:  'right'
            }, {
                xtype: 'container',
                items: [{
                    xtype:      'button',
                    action:     'deleteFolder',
                    cls:        'zcs-folder-del-btn',
                    text:       ZtMsg.del,
                    centered:   true
                }]
            }]
        }, {
            xtype:      'container',
            itemId:     'tagEditCard',
            cls:        'zcs-folder-edit',
            padding:    12,
            flex: 1,
            items: [{
                xtype:  'container',
                cls:    'zcs-textfield',
                items: [{
                    xtype:          'textfield',
                    placeHolder:    ZtMsg.tagName,
                    itemId:         'tagName',
                    clearIcon:      false
                }]
            }, {
                xtype:  'label',
                html:   ZtMsg.colorLabel
            }, {
                xtype:  'colorselector',
                itemId: 'colorPicker'
           }, {
                xtype: 'container',
                items: [{
                    xtype:      'button',
                    action:     'deleteTag',
                    cls:        'zcs-folder-del-btn',
                    text:       ZtMsg.del,
                    centered:   true
                }]
            }]
        }, {
            xtype:  'container',
            flex:   1,
            cls:    'zcs-folder-edit',
            itemId: 'locationSelectionCard',
            layout: 'fit'
        }]
    },

    initialize: function() {

        var folderLocationSelector = this.down('#locationSelectionCard'),
            listType = ZCS.constant.ORG_LIST_SELECTOR,
            selectorData,
            selectorStore;

        // Prepare a store for the folder-selector list
        var selectorRoot = ZCS.session.getOrganizerRoot(null);
        
        selectorStore = Ext.create('ZCS.store.ZtOrganizerStore', {
            storeId:    'foldereditlocationselector',
            root:       selectorRoot
        });

        //Make sure the store doesn't thrash any as we set it up.
        selectorStore.data._autoSort = false;
        selectorStore.suspendEvents();
        selectorStore.filter(function (item) {
            return item.type === 'folder' && !item.isMountpoint;
        });

        selectorStore.doDefaultSorting();

        // Create the nested folder-selector list and add it to its card
        var selectorList = Ext.create('ZCS.view.ZtOrganizerList', {
            flex:               1,
            displayField:       'displayName',
            store:              selectorStore,
            grouped:            true,
            infinite:           true,
            title:              ZtMsg.folderLocationLabel,
            toolbar: {
                items : [{
                    xtype:      'button',
                    text:       ZtMsg.cancel,
                    cls:        'zcs-text-btn',
                    itemId:     'zcs-location-selection-card-cancel-btn',
                    align:      'left'
                }]
            },
            updateTitleText:    false,
            useTitleAsBackText: false,
            type:               listType
        });
        
	    selectorList.editing = true;
        folderLocationSelector.add(selectorList);

        this.setDimensions();
        this.callParent(arguments);
    }
});
