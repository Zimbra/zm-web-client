/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmBriefcaseItemList = function(appCtxt, search, type) {

	ZmList.call(this, type || ZmItem.BRIEFCASE, appCtxt, search);

}
ZmBriefcaseItemList.prototype = new ZmList;
ZmBriefcaseItemList.prototype.constructor = ZmBriefcaseItemList;

ZmBriefcaseItemList.prototype.toString = function() {
	return "ZmBriefcaseItemList";
};

// Public methods

/***
ZmPageList.prototype.addFromDom =
function(node, args) {
	this.type = node._type || this.type;
	return ZmList.prototype.addFromDom.call(this, node, args);
};
/***/
