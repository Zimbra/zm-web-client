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
 * This class represents a contact in the list view.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.contacts.ZtContactList', {

    extend: 'ZCS.model.ZtItem',

    requires: [
        'ZCS.model.contacts.ZtContactListReader',
        'ZCS.model.contacts.ZtContactListWriter'
    ],

    config: {

        fields: [
            { name: 'firstName', type: 'string' },
            { name: 'lastName', type: 'string' },
            { name: 'nickname', type: 'string' }, //for displaying group name
            { name: 'jobTitle', type: 'string'},
            { name: 'company', type: 'string' },
            /**
             * image and imagepart fields store the image related attributes for a contact.
             */
            { name: 'image', type: 'auto'},
            { name: 'imagepart', type: 'auto'},
            { name: 'zimletImage', type: 'auto'},
            { name: 'imageUrl', type:'auto',
                convert: function(v, record) {
                    var image = record.data.image;
                    var imagePart  = (image && image.part) || record.data.imagepart;

                    if (!imagePart) {
                        return record.data.zimletImage || null;  //return zimlet populated image only if user-uploaded image is not there.
                    }

                    return ZCS.htmlutil.buildUrl({
                        path: ZCS.constant.PATH_MSG_FETCH,
                        qsArgs: {
                            auth: 'co',
                            id: record.data.id,
                            part: imagePart,
                            max_width:48,
                            t:(new Date()).getTime()
                        }
                    });
                }
            }
        ],

        proxy: {
            type: 'soapproxy',
            api: {
                create  : urlBase + '',
                read    : urlBase + 'SearchRequest',
                update  : urlBase + '',
                destroy : urlBase + ''
            },
            reader: 'contactlistreader',
            writer: 'contactlistwriter'
        }
    }
});
