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
 * This class displays the description/notes field on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtDescriptionField', {

    extend: 'Ext.Container',

    xtype: 'descriptioncontainer',

    config: {
        cls:    'zcs-description-field',
        style:  'margin-bottom: 1rem;',
        layout: 'fit',
        items: [
            {
                xtype:  'component',
                itemId: 'body',
                name:   'notes',
                width:  '100%',
                html:   '<div contenteditable="true" class="zcs-body-field zcs-editable" onblur="ZCS.util.showHidePlaceholder(this);" data-placeholder="' + ZtMsg.notes + '"></div>'
            }
        ]
    }
});
