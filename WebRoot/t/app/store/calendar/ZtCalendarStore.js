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
 * This class represents a store of calendars used to display the calendars in the list panel.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */
Ext.define('ZCS.store.calendar.ZtCalendarStore', {

    extend: 'ZCS.store.ZtItemStore',

    config: {
        model: 'ZCS.model.calendar.ZtCalendar',
        remoteSort: true
    }
});