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
 * This class parses JSON contact data into ZtContact objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.contactreader',

	getDataFromNode: function(node) {

		var data = {},
			attrs = node._attrs;

		data.type = ZCS.constant.ITEM_CONTACT;

		Ext.copyTo(data, attrs, ZCS.constant.CONTACT_ATTRS);

        // Build email array
        var emails= [];
        if ('email' in attrs) {
        emails.push(attrs.email);
        for(var index = 2; ;index++)
        {
            if(('email' + index) in attrs)
                emails.push(attrs['email' + index]);
            else
                break;
        }
        data.emailFields = emails;
        }

        // Build mobilePhone array
        var mobPhones= [];
        if ('mobilePhone' in attrs) {
        mobPhones.push(attrs.mobilePhone);
        for(var index = 2; ;index++)
        {
            if(('mobilePhone' + index) in attrs)
                mobPhones.push(attrs['mobilePhone' + index]);
            else
                break;
        }
        data.mobilePhoneFields = mobPhones;
        }

        //Build workPhone array
        var workPhones= [];
        if ('workPhone' in attrs) {
            workPhones.push(attrs.workPhone);
            for(var index = 2; ;index++)
            {
                if(('workPhone' + index) in attrs)
                    workPhones.push(attrs['workPhone' + index]);
                else
                    break;
            }
            data.workPhoneFields = workPhones;
        }

        //Build otherPhone array
        var otherPhones= [];
        if ('otherPhone' in attrs) {
            otherPhones.push(attrs.otherPhone);
            for(var index = 2; ;index++)
            {
                if(('otherPhone' + index) in attrs)
                    otherPhones.push(attrs['otherPhone' + index]);
                else
                    break;
            }
            data.otherPhoneFields = otherPhones;
        }

        // Build homeURL array
        var homeUrls = [];
        if ('homeURL' in attrs) {
            homeUrls.push(attrs.homeURL);
            for(var index = 2; ;index++)
            {
                if(('homeURL' + index) in attrs)
                    homeUrls.push(attrs['homeURL' + index]);
                else
                    break;
            }
            data.homeUrlFields = homeUrls;
        }

        // Build workURL array
        var workUrls = [];
        if ('workURL' in attrs) {
            workUrls.push(attrs.workURL);
            for(var index = 2; ;index++)
            {
                if(('workURL' + index) in attrs)
                    workUrls.push(attrs['workURL' + index]);
                else
                    break;
            }
            data.workUrlFields = workUrls;
        }

        // Build otherURL array
        var otherUrls = [];
        if ('otherURL' in attrs) {
            otherUrls.push(attrs.otherURL);
            for(var index = 2; ;index++)
            {
                if(('otherURL' + index) in attrs)
                    otherUrls.push(attrs['otherURL' + index]);
                else
                    break;
            }
            data.otherUrlFields = otherUrls;
        }


		return data;
	}
});
