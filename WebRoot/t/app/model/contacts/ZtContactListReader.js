/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class parses JSON contact data into ZtContactList objects.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactListReader', {

    extend: 'ZCS.model.ZtReader',

    alias: 'reader.contactlistreader',

    getDataFromNode: function(node) {

        var data = {},
            emails = [],
            attrs = node._attrs;

        Ext.copyTo(data, attrs, ZCS.constant.CONTACT_ATTRS);

        //copy the email fields
        if ('email' in attrs) {
            emails.push(attrs['email']);
            for(var index = 2; ;index++)
            {
                if(('email' + index) in attrs)
                    emails.push(attrs['email' + index]);
                else
                    break;
            }
            data['emailFields'] = emails;
        }

        data.type = attrs.type;
        //folderId of the folder the contact resides in
        data.folderId = node.l;

        return data;
    }
});

