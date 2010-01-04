/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Create a new task list.
 * @constructor
 * @class
 * This class represents a list of tasks.
 *
 */
ZmTaskList = function(search) {
	ZmList.call(this, ZmItem.TASK, search);
};

ZmTaskList.prototype = new ZmList;
ZmTaskList.prototype.constructor = ZmTaskList;


// Public methods

ZmTaskList.prototype.toString =
function() {
	return "ZmTaskList";
};
