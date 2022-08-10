/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file contains the zimlet object handler base class.
 * 
 */

/**
 * Creates the object handler.
 * @class
 * This class defines the default implementation for a zimlet object handler.
 * <br />
 * <br />
 * To write a zimlet, see {@link ZmZimletBase}. 
 * 
 * @param	{string}	typeName	the type name
 * @param	{string}	className	the class name
 */
ZmObjectHandler = function(typeName, className) {
	if (arguments.length > 0) {
		this.init(typeName, className);
	}
}

ZmObjectHandler.prototype.constructor = ZmObjectHandler;
ZmObjectHandler.prototype.isZmObjectHandler = true;

/**
 * This method is called by the Zimlet framework to initialize the object.
 * 
 * @param	{string}	typeName	the type name
 * @param	{string}	className	the class name; if <code>null</code>, "Object" will be used
 */
ZmObjectHandler.prototype.init =
function(typeName, className) {
	this._typeName = typeName;
	this._className = className ? className : "Object";
	this.name = this.toString();
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{string}		a string representation of the object
 */
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

ZmObjectHandler.prototype.getEnabled =	function() {
	return true;
};


/**
 * Gets the type name.
 * 
 * @return	{string}		the type name
 */
ZmObjectHandler.prototype.getTypeName =
function() {
	return this._typeName;
};

/**
 * Gets the class name for a given object.
 * 
 * @param	{Object}		obj			the object
 * @param	{Object}		context		the content
 * @param	{string}		spanId		ID of the SPAN
 *
 * @return	{string}		the class name
 */
ZmObjectHandler.prototype.getClassName =
function(obj, context, spanId) {
	return this._className;
};

/**
 * Gets the hovered class name for the given object.
 * 
 * @param	{Object}		obj			the object
 * @param	{Object}		context		the content
 * @param	{string}		spanId		ID of hovered SPAN
 *
 * @return	{string}		the hovered class name
 */
ZmObjectHandler.prototype.getHoveredClassName =
function(obj, context, spanId) {
	var cname = this.getClassName(obj, context, spanId);
	if (this._cachedClassNameForHovered !== cname) {
		this._cachedClassNameForHovered = cname;
		this._classNameHovered = cname + "-" + DwtCssStyle.HOVER;
	}
	return this._classNameHovered;
};

/**
 * Gets the active class name for a given object.
 * 
 * @param	{Object}		obj		the object
 * @param	{Object}		context		the content
 * @param	{string}		spanId		ID of the SPAN
 *
 * @return	{string}		the active class name
 */
ZmObjectHandler.prototype.getActiveClassName =
function(obj, context, spanId) {
	var cname = this.getClassName(obj, context, spanId);
	if (this._cachedClassNameForActive !== cname) {
		this._cachedClassNameForActive = cname;
		this._classNameActive = cname + "-" + DwtCssStyle.ACTIVE;
	}
	return this._classNameActive;
};

/**
 * @private
 */
ZmObjectHandler.prototype.findObject =
function(content, startIndex, objectMgr) {
	if (startIndex === 0) {
		this._lastMatch = null;
		this._noMatch = false;
	}
	if (this._noMatch) {return null;}
	if (this._lastMatch && this._lastMatch.index >= startIndex) {
		return this._lastMatch;
	}
	this._lastMatch = this.match(content, startIndex, objectMgr);
	this._noMatch = (this._lastMatch === null);
	return this._lastMatch;
};


/**
 * This method is used to match content for a zimlet. Zimlet implementations should
 * override this method. Usage should return a non-null result in the format of
 * <code>String.match</code> if text on the line matched the handler regular expression.
 * 
 * <pre>
 * var result = handler.match(line);
 * result[0] // should be matched string
 * result.index // should be location within line match occurred
 * </pre>
 * 
 * Handlers can also set result.context which will be passed back to
 * them during the various method calls ({@link #getToolTipText}, etc). Handlers should set
 * regex.lastIndex to startIndex and then use <code>regex.exec(content)</code>. Handlers should
 * also use the "g" option when constructing their regex.
 */
ZmObjectHandler.prototype.match =
function(content, startIndex) {
	return null;
};

/**
 * Generates content inside the <code>&lt;span&gt;</code> tag.
 * 
 * @return	{number}	the content index
 * @private
 * */
ZmObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context, spanId) {
	html[idx++] = AjxStringUtil.htmlEncode(obj, true);
	return idx;
};

/**
 * Generates the <code>&lt;span&gt;</code> tag.
 * 
 * @return	{number}	the content index
 * @private
 */
ZmObjectHandler.prototype.generateSpan = 
function(html, idx, obj, spanId, context, options) {
	html[idx++] = "<span class='";
	html[idx++] = this.getClassName(obj);
	html[idx++] = "' role='link' id='";
	html[idx++] = spanId;
	html[idx++] = "'>";
	idx = this._getHtmlContent(html, idx, obj, context, spanId, options);
	html[idx++] = "</span>";
	return idx;
};

/**
 * Checks if the handler has tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 * @return		<code>true</code> if the handler has tool tip text; <code>false</code> otherwise
 */
ZmObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return true;
};

/**
 * Gets the handler tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 * @return		{string}	the handler has tool tip text
 */
ZmObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return AjxStringUtil.htmlEncode(obj);
};

/**
 * Populates the handler tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 */
ZmObjectHandler.prototype.populateToolTip =
function(obj, context) {
};

/**
 * Gets the action menu.
 * 
 * @param		{Object}	obj			the object
 * @param		{string}	span		the span element
 * @param		{Object}	context		the context
 * @return		{ZmActionMenu}	the action menu
 * 
 * @private
 */
ZmObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
};

/**
 * This method is called by the Zimlet framework when the object is selected.
 * 
 * @param		{Object}	obj			the object
 * @param		{string}	span		the span element
 * @param		{Object}	ev			the event
 * @param		{Object}	context		the context
 * @see		#clicked
 */
ZmObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	return this.clicked(span, obj, context, ev);
};

/**
 * This method is called by the Zimlet framework when the object is clicked.
 * 
 * @param		{Object}	obj			the object
 * @param		{string}	span		the span element
 * @param		{Object}	ev			the event
 * @param		{Object}	context		the context
 */
ZmObjectHandler.prototype.clicked =
function(span, obj, context, ev) {
};

/**
 * This method is called when the object is hovered-over.
 * 
 * @private
 */
ZmObjectHandler.prototype.hoverOver = function(object, context, x, y) {

	var tooltip = this.getToolTipText(object, context) || '',
		content, callback;

	if (typeof(tooltip) === "string") {
		content = tooltip;
	}
	else if (tooltip.isAjxCallback || AjxUtil.isFunction(tooltip)) {
		callback = tooltip;
	}
	else if (typeof(tooltip) === "object") {
		content = tooltip.content;
		callback = tooltip.callback;
	}

	if (!content && callback && tooltip.loading) {
		content = AjxMsg.loading;
	}

	if (content) {
		this._showTooltip(object, context, x, y, content);
	}

	if (callback) {
		var callback1 = new AjxCallback(this, this._showTooltip, [ object, context, x, y ]);
		AjxTimedAction.scheduleAction(new AjxTimedAction(null, function() {
			callback.run(callback1);
		}), 0);
	}
};

ZmObjectHandler.prototype._showTooltip = function(object, context, x, y, content) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.setContent(content);
	tooltip.popup(x, y);
	// TODO: call below is odd; not sure if it's used much, appears to be for two-step tooltips (eg a map)
	this.populateToolTip(object, context);
};

/**
 * This method is called when the handler is hovered-out.
 * 
 * @private
 */
ZmObjectHandler.prototype.hoverOut = function(object, context) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
};
