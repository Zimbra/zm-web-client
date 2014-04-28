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
 * @class ZCS.view.contacts.ZtAddButton
 * 
 * This class defines a button type which is put at the bottom of each field container
 * and is used to create new fields of respective container.
 *
 * The behavior of the button belongs to one of the following cases:
 *      Case 1: If the container's type is either "name" or "company"
 *          + On tapped, a menu displays with optional fields
 *          + Selecting a menu item adds corresponding field to the container in specified order
 *          + When there are no available options left, this button is hidden
 *      Case 2: If the container's type is one of the followings: "email", "phone", "url"
 *          On tapped, a field is added to the container
 *
 */

Ext.define('ZCS.view.contacts.ZtAddButton', {
    extend: 'Ext.Button',
    xtype: 'addtionalFieldsAddButton',

    config: {
        cls: 'form-add-field-button',
        
        // this is set to true if the container's type is either "name" or "company"
        willShowOptionsOnTap: false,
        
        // this config is used only when willShowOptionsOnTap is set to true
        availableOptionalFields: []
    }
});