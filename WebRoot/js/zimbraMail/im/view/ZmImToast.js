/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmImToast = function(parent) {
    ZmToast.call(this, parent);

	this._funcs["remain"] = AjxCallback.simpleClosure(this.__remain, this);
	
	this._ignoreInternalOverOut = false;

	// Set up mouse listeners.
	var listeners = {};
	listeners[DwtEvent.ONMOUSEDOWN] = this._mouseDownListener;
	if (AjxEnv.isIE) {
		listeners[DwtEvent.ONMOUSEENTER] = this._mouseOverListener;
		listeners[DwtEvent.ONMOUSELEAVE] = this._mouseOutListener;
	} else {
		listeners[DwtEvent.ONMOUSEOVER] = this._mouseOverListener;
		listeners[DwtEvent.ONMOUSEOUT] = this._mouseOutListener;
	}
	var events = [];
	for (var event in listeners) {
		events.push(event);
		this.addListener(event, new AjxListener(this, listeners[event]));
	}
	this._setEventHdlrs(events);

	var id = this.getHTMLElId();
	this._textId = id + "_text";
	this._closeId = id + "_close";
}
ZmImToast.prototype = new ZmToast;
ZmImToast.prototype.constructor = ZmImToast;
ZmImToast.prototype.toString =
function() {
	return "ZmImToast";
};

ZmImToast.REMAIN = {type: "remain" };
ZmImToast.prototype.TEMPLATE = "im.Chat#Toast";

ZmImToast.prototype._createHtmlFromTemplate =
function(templateId, data) {
	ZmToast.prototype._createHtmlFromTemplate.call(this, templateId, data);
};

ZmImToast.prototype.__remain =
function() {
	// This transition handler does nothing, leaving the toast to
	// just remain up until the user clicks the close button.
};

ZmImToast.prototype._getElementForEvent =
function(ev) {
	var id = this.getHTMLElId();
	var element = ev.target;
	while (element) {
		if (element.id == this._textId || element.id == this._closeId) {
			return element;
		} else if (element.id == id) {
			return null;
		}
		element = element.parentNode;
	}
	return null;
};

ZmImToast.prototype._mouseOverListener =
function(ev) {
	var element = this._getElementForEvent(ev);
	if (element) {
		Dwt.delClass(element, "ZmImToastText", "ZmImToastText-hover"); 
	}
};

ZmImToast.prototype._mouseOutListener =
function(ev) {
	var element = this._getElementForEvent(ev);
	if (element) {
		Dwt.delClass(element, "ZmImToastText-hover", "ZmImToastText");
	}
};

ZmImToast.prototype._mouseDownListener =
function(ev) {
	var element = this._getElementForEvent(ev);
	if (element) {
		if (element.id == this._closeId) {
			this.transition();
		} else if (element.id == this._textId) {
			appCtxt.getAppController().activateApp(ZmApp.IM);
		}
	}
};

