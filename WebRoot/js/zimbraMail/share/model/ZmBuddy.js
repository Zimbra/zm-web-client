/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmBuddy(id, name, parent, tree, status) {
	ZmOrganizer.call(this, ZmOrganizer.BUDDY, id, name, parent, tree);
	this.status = status || ZmBuddy.STATUS_OFFLINE;
}

ZmBuddy.prototype = new ZmOrganizer;
ZmBuddy.prototype.constructor = ZmBuddy;

ZmBuddy.STATUS_OFFLINE = 0;
ZmBuddy.STATUS_AVAILABLE = 1;
ZmBuddy.STATUS_UNAVAILABLE = 2;

ZmBuddy.prototype.toString = 
function() {
	return "ZmBuddy - " + this.name;
};

// Constants
ZmBuddy.ID_BUDDY = ZmOrganizer.ID_BUDDY;

// Static methods
ZmBuddy.createFromJs =
function(parent, obj, tree) {
	DBG.println(AjxDebug.DBG1, "ZmBuddy.createFromJs() Loading...");
    var buddy = new ZmBuddy(obj.id, obj.name, parent, tree, obj.status);
    parent.children.add(buddy);
    return buddy;
};

ZmBuddy.sortCompare = 
function(buddyA, buddyB) {
	// sort by name
	var buddyAName = buddyA.name.toLowerCase();
	var buddyBName = buddyB.name.toLowerCase();
	if (buddyAName < buddyBName) {return -1;}
	if (buddyAName > buddyBName) {return 1;}
	return 0;
};

ZmBuddy.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmBuddy.prototype.getId = function() { return this.id; }

ZmBuddy.prototype.getName = 
function() {
	if (this.id == ZmBuddy.ID_BUDDY) {
		return ZmMsg.buddies;
	} 
	return this.name;
};

ZmBuddy.prototype.getIcon = 
function() {
    switch (this.status) {
    case ZmBuddy.STATUS_AVAILABLE:
    		return "ImAvailable";
        break;
    case ZmBuddy.STATUS_UNAVAILABLE:
    	    return "ImDnd"; //"ImUnavailable";
    	    break;        
    case ZmBuddy.STATUS_OFFLINE:
    default:
        return "RoundMinusDis"; //"Blank_16";
        break;
    	}
};
