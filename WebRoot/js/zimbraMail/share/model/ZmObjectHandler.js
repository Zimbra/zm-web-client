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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmObjectHandler = function(appCtxt, typeName, className) {
	if (arguments.length > 0) {
		this._appCtxt = appCtxt;
		this.init(typeName, className);
	}
}

ZmObjectHandler.prototype.constructor = ZmObjectHandler;

ZmObjectHandler.prototype.init =
function(typeName, className) {
	this._typeName = typeName;
	this._className = className ? className : "Object";
};

ZmObjectHandler.prototype.toString = 
function() {
	// If you can find a cleaner way to get the name of 
	// a sub-class without hard coding each instance
	// in a toString() method feel free to change.
	if(!this._toString) {
		var ctor = "" + this.constructor;
		ctor = ctor.substring(0,ctor.indexOf("("));
		this._toString = ctor.substring("function ".length);
	}
	return this._toString;
};

ZmObjectHandler.prototype.getTypeName =
function() {
	return this._typeName;
};

// OVERRIDE if need be
ZmObjectHandler.prototype.getClassName =
function(obj, context) {
	return this._className;
};

// OVERRIDE if need be
ZmObjectHandler.prototype.getActivatedClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForActivated !== cname) {
		this._cachedClassNameForActivated = cname;
		this._classNameActivated = cname + "-" + DwtCssStyle.ACTIVATED;
	}
	return this._classNameActivated;
};

// OVERRIDE if need be
ZmObjectHandler.prototype.getTriggeredClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForTriggered !== cname) {
		this._cachedClassNameForTriggered = cname;
		this._classNameTriggered = cname + "-" + DwtCssStyle.TRIGGERED;
	}
	return this._classNameTriggered;
};

ZmObjectHandler.prototype.findObject =
function(content, startIndex) {
	if (startIndex === 0) {
		this._lastMatch = null;
		this._noMatch = false;
	}
	if (this._noMatch) {return null;}
	if (this._lastMatch && this._lastMatch.index >= startIndex) {
		return this._lastMatch;
	}
	this._lastMatch = this.match(content, startIndex);
	this._noMatch = (this._lastMatch === null);
	return this._lastMatch;
};


/** OVERRIDE. returns non-null result in the format of String.match if text on the line matched this
* handlers regular expression.
* i.e: var result = handler.match(line);
* result[0] should be matched string
* result.index should be location within line match occured
* handlers can also set result.context which will be passed back to them during the various method calls (getToolTipText, etc)
*
* handlers should set regex.lastIndex to startIndex and then use regex.exec(content). they should also use the "g" option when
* constructing their regex.
*/
ZmObjectHandler.prototype.match =
function(content, startIndex) {
	return null;
};

// OVERRIDE IF NEED BE. Generates content inside the <span>
ZmObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context) {
	html[idx++] = AjxStringUtil.htmlEncode(obj, true);
	return idx;
};

// generates the span
ZmObjectHandler.prototype.generateSpan = 
function(html, idx, obj, spanId, context) {
	html[idx++] = "<span class='";
	html[idx++] = this.getClassName(obj);
	html[idx++] = "' id='";
	html[idx++] = spanId;
	html[idx++] = "'>";
	idx = this._getHtmlContent(html, idx, obj, context);
	html[idx++] = "</span>";
	return idx;
};

ZmObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return true;
};

ZmObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return AjxStringUtil.htmlEncode(obj);
};

ZmObjectHandler.prototype.populateToolTip =
function(obj, context) {
};


ZmObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
};

ZmObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	return this.clicked(span, obj, context, ev);
};

ZmObjectHandler.prototype.clicked =
function(span, obj, context, ev) {
};

ZmObjectHandler.prototype.hoverOver = function(object, context, x, y) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.setContent(this.getToolTipText(object, context));
	tooltip.popup(x, y);
	this.populateToolTip(object, context);
};

ZmObjectHandler.prototype.hoverOut = function(object, context) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
};