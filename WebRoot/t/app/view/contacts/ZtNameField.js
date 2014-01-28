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
 * @class ZCS.view.contacts.ZtNameField
 * This class displays the name field on the contact form.
 *
 */

Ext.define('ZCS.view.contacts.ZtNameField', {
    extend: 'ZCS.view.contacts.ZtMultiField',

    xtype: 'namecontainer',

    config: {
        type:           'name',
        addButtonLabel: ZtMsg.contactFormButtonAddField,
        optionalFields: [
            {title: ZtMsg.placeholderPrefix, name: 'namePrefix', order: 1},
            {title: ZtMsg.placeholderMiddleName, name: 'middleName', order: 3},
            {title: ZtMsg.placeholderMaidenName, name: 'maidenName', order: 4},
            {title: ZtMsg.placeholderSuffix, name: 'nameSuffix', order: 6},
            {title: ZtMsg.placeholderNickname, name: 'nickname', order: 7}
        ]
    },

    /**
     * override ZCS.view.contacts.ZtMultiField::initialize()
     */
    initialize: function(){
        this.callParent(arguments);

        var addButton = this.getAt(0);
        
        addButton.setWillShowOptionsOnTap(true);

        addButton.setAvailableOptionalFields(this.getOptionalFields());

        // add First Name and Last Name fields
        this.addField({
            // this opt object indicates that this field is mandatory and thus cannot be removed
            // we use the word "mandatory" instead of "required"
            // in order not to mistake it with "required" config which is used by the framework
            mandatory:      true,
            placeHolder:    ZtMsg.placeholderFirstName,
            name:           'firstName',
            order:          2
        });

        this.addField({
            mandatory:      true,
            placeHolder:    ZtMsg.placeholderLastName,
            name:           'lastName',
            order:          5
        });
    },

    /**
     * override ZCS.view.contacts.ZtMultiField::addField()
     */
    addField: function(opts){
        if (this.getVisibleFields().indexOf(opts.order) !=- 1) {
            return;
        }
        this.callParent(arguments);
        this.getVisibleFields().push(opts.order);
    },

    /**
     * override ZCS.view.contacts.ZtMultiField::getFieldConfig()
     */
    getFieldConfig: function(fieldId, opts) {
        var itemsConfig = [{
                xtype:          'textfield',
                placeHolder:    (opts.placeHolder) ? opts.placeHolder : '',
                value:          (opts.value) ? opts.value : '',
                name:           opts.name,
                flex:           1
            }];

        if (!opts.mandatory) {
            itemsConfig = itemsConfig.concat(this.getRemoveConfig(fieldId)).reverse();
        }

        return {
            layout:     'hbox',
            width:      '100%',
            items:      itemsConfig
        };
    },

    /**
     * Override ZCS.view.contacts.ZtMultiField::findInsertionIndex()   
     */
    findInsertionIndex: function(opts){
        var insertIndex = 0;
        if (this.getItems().length === 1) {
            return 0;
        }
        while (true) {
            if (insertIndex === this.getItems().length-1) {
                return insertIndex;
            }
            var item = this.getAt(insertIndex);
            if (opts.order < item.opts.order) {
                return insertIndex;
            }
            insertIndex += 1;
        }
        return insertIndex;
    },

    /**
     * Override ZCS.view.contacts.ZtMultiField::reset()
     */
    reset: function() {
        // remove all EXCEPT the last item i.e. the ADD FIELD button
        // and 2 mandatory fields: First Name & Last Name
        var nItems = this.getItems().length;

        while (nItems > 3) {
            for (var i = 0; i < nItems - 1; i += 1) {
                var item = this.getAt(i);
                if (item.config.opts && !item.config.opts.mandatory) {
                    this.removeAt(i);
                    nItems -= 1;
                    break;
                }
            }
        }

        this.setVisibleFields([2,5]);
    }
});
