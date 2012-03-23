/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
 * @extends		DwtComposite
 * @private
 */
ZmZimletAppView = function(parent, controller) {
	DwtComposite.call(this, {parent:parent, posStyle:DwtControl.ABSOLUTE_STYLE });
};
ZmZimletAppView.prototype = new DwtComposite;
ZmZimletAppView.prototype.constructor = ZmZimletAppView;

ZmZimletAppView.prototype.toString = function() {
	return "ZmZimletAppView";
};

//
// Public methods
//

ZmZimletAppView.prototype.setContent = function(html) {
	var el = this.getHtmlElement();
	el.innerHTML = html;
};

ZmZimletAppView.prototype.setView = function(view) {
	var el = this.getHtmlElement();
	el.innerHTML = "";
	view.reparent(this);
};