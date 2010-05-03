/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * This file contains the object manager.
 * 
 */

/**
 * Creates an object manager.
 * @class
 * This class is used to high-light objects within a given view.
 * 
 * @author Kevin Henrikson
 *
 * @param {DwtComposite}	view			the view this manager is going to high-light for
 * @param {AjxCallback}	selectCallback  the callback triggered when user clicks on high-light object (provide if you want to do something before the clicked on object opens its corresponding view)
 * @param {Boolean}	skipHandlers 	<code>true</code> to avoid adding the standard handlers
 */
ZmObjectManager = function(view, selectCallback, skipHandlers) {

	this._selectCallback = selectCallback;
	this._uuid = Dwt.getNextId();
	this._objectIdPrefix = "OBJ_PREFIX_";
	this._objectHandlers = {};

	// don't include when looking for objects. only used to provide tool tips for images
	if (appCtxt.get(ZmSetting.MAIL_ENABLED) && window["ZmImageAttachmentObjectHandler"]) {
		this._imageAttachmentHandler = new ZmImageAttachmentObjectHandler();
	}

	// create handlers (see registerHandler below)
	if (!skipHandlers) {
        this.initialized = false;
        this._addAutoHandlers();
	} else {
        this.initialized = true;
    }

    this.sortHandlers();
	this.reset();
	this.setView(view);
}

ZmObjectManager._TOOLTIP_DELAY = 275;

// Define common types for quicker object matching.
ZmObjectManager.EMAIL = "email";
ZmObjectManager.URL = "url";
ZmObjectManager.PHONE = "phone";
ZmObjectManager.DATE = "date";
ZmObjectManager.ADDRESS = "address";

// Allows callers to pass in a current date
ZmObjectManager.ATTR_CURRENT_DATE = "currentDate";

ZmObjectManager._autohandlers = [];

/**
 * Registers the handler.
 * 
 * @param	{Object}	obj		the object
 * @param	{constant}	type	the type
 * @param	{constant}	priority	the priority
 */
ZmObjectManager.registerHandler =
function(obj, type, priority) {
	if (typeof obj == "string") {
		obj = eval(obj);
	}
	var c = ZmObjectManager._autohandlers;
	if (!obj.__registered) {
		var id = c.push(obj);
		var i = id - 1;
		if(type) {
			c[i].useType = type;
		}
		if(priority) {
			c[i].usePrio = priority;
		}
		obj.__registered = true;
	}
};

/**
 * @private
 */
ZmObjectManager.unregisterHandler =
function(obj) {
	if (typeof obj == "string") {
		obj = eval(obj);
	}
 	var c = ZmObjectManager._autohandlers, i;
	for (i = c.length; --i >= 0;) {
		if (c[i] === obj) {
			c.splice(i, 1);
			break;
		}
	}
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmObjectManager.prototype.toString =
function() {
	return "ZmObjectManager";
};

/**
 * Gets the handlers.
 * 
 * @return	{Array}	an array of {@link ZmObjectHandler} objects
 */
ZmObjectManager.prototype.getHandlers =
function() {
	if (!this.initialized && appCtxt.zimletsPresent()) {
		var zimletMgr = appCtxt.getZimletMgr();
		if (zimletMgr.isLoaded()) {
			this.initialized = true;
			var zimlets = zimletMgr.getContentZimlets();
			for (var i = 0; i < zimlets.length; i++) {
				this.addHandler(zimlets[i], zimlets[i].type, zimlets[i].prio);
			}
		}
	}
	return this._objectHandlers;
};

/**
 * Adds the handler.
 * 
 * @param	{ZmObjectHandler}	h		the handler
 * @param	{constant}			type	the type
 * @param	{constant}		priority	the priority
 */
ZmObjectManager.prototype.addHandler =
function(h, type, priority) {
	type = type || (h.getTypeName() ? h.getTypeName() : "none");
	priority = priority ? priority : -1;
	h._prio = priority;
	//DBG.println(AjxDebug.DBG3, "addHandler " + h + " type: " + type + " prio: " + priority);
	var oh = this.getHandlers();
	if (!oh[type]) {oh[type] = [];}
	oh[type].push(h);
};

/**
 * Removes the handler.
 * 
 * @param	{ZmObjectHandler}	h		the handler
 * @param	{constant}			type	the type
 */
ZmObjectManager.prototype.removeHandler =
function(h, type) {
	type = type || (h.getTypeName() ? h.getTypeName() : "none");
	var oh = this.getHandlers();
	if (oh[type]) {
		for (var i = 0, count = oh[type].length; i < count; i++) {
			if (oh[type][i] == h) {
				oh[type].splice(i, 1);
				break;
			}
		}
	}
};

/**
 * Sorts the handlers.
 * 
 */
ZmObjectManager.prototype.sortHandlers =
function() {
	this._allObjectHandlers = [];
    var objectHandlers = this.getHandlers();
    for (i in objectHandlers) {
		// Object handlers grouped by Type
		objectHandlers[i].sort(ZmObjectManager.__byPriority);

		// Copy each array to a single array of all Object Handlers
		for (var k = 0; k < objectHandlers[i].length; k++) {
			this._allObjectHandlers.push(objectHandlers[i][k]);
		}
	}
	this._allObjectHandlers.sort(ZmObjectManager.__byPriority);
};

/**
 * @private
 */
ZmObjectManager.prototype._addAutoHandlers =
function() {
	var c = ZmObjectManager._autohandlers, i, obj, prio;
	for (i = 0; i < c.length; ++i) {
		obj = c[i];
		var	zim = obj;
		var type = obj.TYPE;
		if (appCtxt.zimletsPresent()) {
			if (!(obj instanceof ZmZimletBase)) {
				zim = new obj();
			}
		}
		if (obj.useType) {
			type = obj.useType;
		}
		if (obj.usePrio) {
			prio = obj.usePrio;
		}
		this.addHandler(zim, type, prio);
	}
};

/**
 * Resets the objects.
 * 
 */
ZmObjectManager.prototype.reset =
function() {
	this._objects = {};
};

/**
 * Sets the view.
 * 
 * @param	{DwtComposite}		view		the view
 */
ZmObjectManager.prototype.setView =
function(view) {
	if (view != null && appCtxt.getZimletMgr().isLoaded()) {
	    view.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
	    view.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this._mouseOutListener));
	    view.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
	    view.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._mouseUpListener));
	    view.addListener(DwtEvent.ONMOUSEMOVE, new AjxListener(this, this._mouseMoveListener));
		if (AjxEnv.isSafari) {
			view.addListener(DwtEvent.ONCONTEXTMENU, new AjxListener(this, this._rightClickListener));
		}
		this._hoverOverListener = new AjxListener(this, this._handleHoverOver);
	    this._hoverOutListener = new AjxListener(this, this._handleHoverOut);
	}
	this._view = view;
};

/**
 * Gets the count of objects.
 * 
 * @return	{int}	the count
 */
ZmObjectManager.prototype.objectsCount =
function() {
	return (appCtxt.zimletsPresent()) ? appCtxt.getZimletMgr().getContentZimlets().length : 0;
};

/**
 * Gets the image attachment handler.
 * 
 * @return	{ZmImageAttachmentObjectHandler}	the handler
 */
ZmObjectManager.prototype.getImageAttachmentHandler =
function() {
	return this._imageAttachmentHandler;
};

/**
 * @private
 */
ZmObjectManager.prototype._getAjxEmailAddress =
function(obj){
    if(appCtxt.isChildWindow && obj.isAjxEmailAddress){ //Making sure child window knows its type AjxEmailAddress
        obj = AjxEmailAddress.copy(obj);
    }
    return obj;
};

/**
 * Finds objects.
 * 
 * @param	{String}	content		the content
 * @param	{Boolean}	htmlEncode	<code>true</code> to HTML encode the content
 * @param	{constant}	type		the type
 * @param	{Boolean}	isTextMsg	<code>true</code> if is text msg
 * @return	{String}	the object
 */
ZmObjectManager.prototype.findObjects =
function(content, htmlEncode, type, isTextMsg) {
	if  (!content) {return "";}
	var html = [];
	var idx = 0;

	var maxIndex = content.length;
	var lastIndex = 0;

    var objectHandlers = this.getHandlers();
    while (true) {
		var lowestResult = null;
		var lowestIndex = maxIndex;
		var lowestHandler = null;

		// if given a type, just go thru the handler defined for that type.
		// otherwise, go thru every handler we have. Regardless, ask each handler
		// to find us a match >= to lastIndex. Handlers that didn't match last
		// time will simply return, handlers that matched last time that we didn't
		// use (because we found a closer match) will simply return that match again.
		//
		// when we are done, we take the handler with the lowest index.
		var i;
		var handlers;
		var chunk;
		var result = null;
		if (type) {
			//DBG.println(AjxDebug.DBG3, "findObjects type [" + type + "]");
			handlers = objectHandlers[type];
			if (handlers) {
				for (i = 0; i < handlers.length; i++) {
					//DBG.println(AjxDebug.DBG3, "findObjects by TYPE (" + handlers[i] + ")");
					result = handlers[i].findObject(content, lastIndex);
					// No match keep trying.
					if(!result) {continue;}
					// Got a match let's handle it.
					if (result.index >= lowestIndex) {break;}
					lowestResult = result;
					lowestIndex = result.index;
					lowestHandler = handlers[i];
				}
			}
			// If it's an email address just handle it and return the result.
			if (type == "email" || content instanceof AjxEmailAddress) {
				if (lowestHandler) {
                    content = this._getAjxEmailAddress(content);
					this.generateSpan(lowestHandler, html, idx, content, null);
				} else {
					html[idx++] = AjxStringUtil.htmlEncode(content.toString());
				}
				return html.join("");
			}
		} else {
			for (var j = 0; j < this._allObjectHandlers.length; j++) {
				var handler = this._allObjectHandlers[j];
				//DBG.println(AjxDebug.DBG3, "findObjects trying (" + handler + ")");
				result = handler.findObject(content, lastIndex);
				if (result && result.index < lowestIndex) {
					lowestResult = result;
					lowestIndex = result.index;
					lowestHandler = handler;
				}
			}
		}

		if (!lowestResult) {
			// all done
			// do last chunk
			chunk = content.substring(lastIndex, maxIndex);
			if (htmlEncode) {
				html[idx++] = AjxStringUtil.htmlEncode(chunk, !!isTextMsg);
			} else {
				html[idx++] = chunk;
			}
			break;
		}

		//  add anything before the match
		if (lowestIndex > lastIndex) {
			chunk = content.substring(lastIndex, lowestIndex);
			if (htmlEncode) {
				html[idx++] = AjxStringUtil.htmlEncode(chunk, !!isTextMsg);
			} else {
				html[idx++] = chunk;
			}
		}

		// add the match
		if(lowestHandler) {
			idx = this.generateSpan(lowestHandler, html, idx, lowestResult[0], lowestResult.context);
		} else {
			html[idx++] = lowestResult[0];
		}

		// update the index
		lastIndex = lowestResult.index + (lowestResult.matchLength || lowestResult[0].length);
	}

	return html.join("");
};


/**
 * Added this customized method for the sake of ZmMailMsgView performance.
 * 
 * TODO: Integrate this method to findObjectsInNode()
 * 
 * @private
 */
ZmObjectManager.prototype.processObjectsInNode = function(doc, node){

    var objectManager = this;
    var tmpdiv = doc.createElement("div");

    doc || ( doc = node.ownerDocument );


    var recurse = function(node, handlers) {
		var tmp, i, val, next;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();

			if (next == null) {
				if (/^(img|a)$/.test(tmp)) {
                    var isMailTo = (tmp == 'a' && ZmMailMsgView._MAILTO_RE.test(node.href));
					if (tmp == "a" && node.target
					    && (isMailTo || ZmMailMsgView._URL_RE.test(node.href)))
					{
						// tricky.
						var txt = isMailTo ? node.href :RegExp.$1 ;
						tmp = doc.createElement("div");
						tmp.innerHTML = objectManager.findObjects(AjxStringUtil.trim(txt));
						tmp = tmp.firstChild;
						if (tmp.nodeType == 3 /* Node.TEXT_NODE */) {
							// probably no objects were found.  A warning would be OK here
							// since the regexps guarantee that objects _should_ be found.
							return tmp.nextSibling;
						}
						// here, tmp is an object span, but it
						// contains the URL (href) instead of
						// the original link text.
						node.parentNode.insertBefore(tmp, node); // add it to DOM
						tmp.innerHTML = "";
						tmp.appendChild(node); // we have the original link now
						return tmp.nextSibling;	// move on
					}
					handlers = false;
				}
			} else {
				// consider processed
				node = next;
			}

                        // bug 28264: the only workaround possible seems to be
                        // to remove textIndent styles that have a negative value:
                        if (parseFloat(node.style.textIndent) < 0)
                                node.style.textIndent = "";

                        for (i = node.firstChild; i; i = recurse(i, handlers));
			return node.nextSibling;

		    case 3:	// TEXT_NODE
		    case 4:	// CDATA_SECTION_NODE (just in case)
			// generate ObjectHandler-s
			if (handlers && /[^\s\xA0]/.test(node.data)) try {
 				var a = null, b = null;

				if (!AjxEnv.isIE) {
					// this block of code is supposed to free the object handlers from
					// dealing with whitespace.  However, IE sometimes crashes here, for
					// reasons that weren't possible to determine--hence we avoid this
					// step for IE.  (bug #5345)
					var results = /^[\s\xA0]+/.exec(node.data);
					if (results) {
						a = node;
						node = node.splitText(results[0].length);
					}
					results = /[\s\xA0]+$/.exec(node.data);
					if (results)
						b = node.splitText(node.data.length - results[0].length);
				}

				tmp = tmpdiv;
				var code = objectManager.findObjects(node.data, true, null, false);
				var disembowel = false;
				if (AjxEnv.isIE) {
					// Bug #6481, #4498: innerHTML in IE massacrates whitespace
					//            unless it sees a <pre> in the code.
					tmp.innerHTML = [ "<pre>", code, "</pre>" ].join("");
					disembowel = true;
				} else {
					tmp.innerHTML = code;
				}

				if (a)
					tmp.insertBefore(a, tmp.firstChild);
				if (b)
					tmp.appendChild(b);

				a = node.parentNode;
				if (disembowel)
					tmp = tmp.firstChild;
				while (tmp.firstChild)
					a.insertBefore(tmp.firstChild, node);
				tmp = node.nextSibling;
				a.removeChild(node);
				return tmp;
			} catch(ex) {};
		}
		return node.nextSibling;
	};

    //Parse thorough the DOM directly and find objects.
    for(var i=0; i<node.childNodes.length; i++){
        recurse(node.childNodes[i], true);
    }

};

/**
 * @private
 */
ZmObjectManager.prototype.findObjectsInNode =
function(node, re_discard, re_allow, callbacks) {
	var objectManager = this, doc = node.ownerDocument, tmpdiv = doc.createElement("div");

	if (!re_discard)
		re_discard = /^(script|link|object|iframe|applet)$/i;

	// This inner function does the actual work.  BEWARE that it return-s
	// in various places, not only at the end.
	var recurse = function(node, handlers) {
		var tmp, i, val, next;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();
			if (callbacks && callbacks.foreachElement) {
				next = callbacks.foreachElement(node, tmp, re_discard, re_allow);
			}
			if (next == null) {
				if (/^(img|a)$/.test(tmp)) {
					if (tmp == "a" && node.target
					    && (ZmMailMsgView._URL_RE.test(node.href)
						|| ZmMailMsgView._MAILTO_RE.test(node.href)))
					{
						// tricky.
						var txt = RegExp.$1;
						tmp = doc.createElement("div");
						tmp.innerHTML = objectManager.findObjects(AjxStringUtil.trim(RegExp.$1));
						tmp = tmp.firstChild;
						if (tmp.nodeType == 3 /* Node.TEXT_NODE */) {
							// probably no objects were found.  A warning would be OK here
							// since the regexps guarantee that objects _should_ be found.
							return tmp.nextSibling;
						}
						// here, tmp is an object span, but it
						// contains the URL (href) instead of
						// the original link text.
						node.parentNode.insertBefore(tmp, node); // add it to DOM
						tmp.innerHTML = "";
						tmp.appendChild(node); // we have the original link now
						return tmp.nextSibling;	// move on
					}
					handlers = false;
				} else if (re_discard.test(tmp) || (re_allow && !re_allow.test(tmp))) {
					tmp = node.nextSibling;
					node.parentNode.removeChild(node);
					return tmp;
				}
			} else {
				// consider processed
				node = next;
			}

			if (AjxEnv.isIE) {
				// strips expression()-s, bwuahahaha!
				// granted, they get lost on the server-side anyway, but assuming some get through...
				// the line below exterminates them.
				node.style.cssText = node.style.cssText;
			}

			for (i = node.firstChild; i; i = recurse(i, handlers));
			return node.nextSibling;

		    case 3:	// TEXT_NODE
		    case 4:	// CDATA_SECTION_NODE (just in case)
			// generate ObjectHandler-s
			if (handlers && /[^\s\xA0]/.test(node.data)) try {
 				var a = null, b = null;

				if (!AjxEnv.isIE) {
					// this block of code is supposed to free the object handlers from
					// dealing with whitespace.  However, IE sometimes crashes here, for
					// reasons that weren't possible to determine--hence we avoid this
					// step for IE.  (bug #5345)
					var results = /^[\s\xA0]+/.exec(node.data);
					if (results) {
						a = node;
						node = node.splitText(results[0].length);
					}
					results = /[\s\xA0]+$/.exec(node.data);
					if (results)
						b = node.splitText(node.data.length - results[0].length);
				}

				tmp = tmpdiv;
				var code = objectManager.findObjects(node.data, true, null, false);
				var disembowel = false;
				if (AjxEnv.isIE) {
					// Bug #6481, #4498: innerHTML in IE massacrates whitespace
					//            unless it sees a <pre> in the code.
					tmp.innerHTML = [ "<pre>", code, "</pre>" ].join("");
					disembowel = true;
				} else {
					tmp.innerHTML = code;
				}

				if (a)
					tmp.insertBefore(a, tmp.firstChild);
				if (b)
					tmp.appendChild(b);

				a = node.parentNode;
				if (disembowel)
					tmp = tmp.firstChild;
				while (tmp.firstChild)
					a.insertBefore(tmp.firstChild, node);
				tmp = node.nextSibling;
				a.removeChild(node);
				return tmp;
			} catch(ex) {};
		}
		return node.nextSibling;
	};
	var df = doc.createDocumentFragment();
	while (node.firstChild) {
		df.appendChild(node.firstChild); // NODE now out of the displayable DOM
		recurse(df.lastChild, true, this);	 // parse tree and findObjects()
	}
	node.appendChild(df);	// put nodes back in the document
};

/**
 * Finds content by going through the content and return the result of the object handler's match call.
 * 
 * @param	{String}	content		the content
 * @param	{constant}	type		the content type
 * @return	{String}	the object
 * @private
 */
ZmObjectManager.prototype.findMatch =
function(content, type) {
	if  (!content) {return "";}

	var maxIndex = content.length;
	var lastIndex = 0;

	var lowestResult = null;
	var lowestIndex = maxIndex;
	var lowestHandler = null;

	// if given a type, just go thru the handler defined for that type.
	// otherwise, go thru every handler we have.
	// when we are done, we take the handler with the lowest index.
	var i;

	var result = null;
	if (type) {
		//DBG.println(AjxDebug.DBG3, "findObjects type [" + type + "]");
		var handlers = this.getHandlers()[type];
		if (handlers) {
			for (i = 0; i < handlers.length; i++) {
				//DBG.println(AjxDebug.DBG3, "findObjects by TYPE (" + handlers[i] + ")");
				result = handlers[i].findObject(content, lastIndex);
				// No match keep trying.
				if(!result) {continue;}
				// Got a match let's handle it.
				if (result.index >= lowestIndex) {break;}
				lowestResult = result;
				lowestIndex = result.index;
				lowestHandler = handlers[i];
			}
		}
	} else {
		for (var j = 0; j < this._allObjectHandlers.length; j++) {
			var handler = this._allObjectHandlers[j];
			//DBG.println(AjxDebug.DBG3, "findObjects trying (" + handler + ")");
			result = handler.findObject(content, lastIndex);
			if (result && result.index < lowestIndex) {
				lowestResult = result;
				lowestIndex = result.index;
				lowestHandler = handler;
			}
		}
	}
	return lowestResult;
};

/**
 * Dives recursively into the given DOM node.  Creates ObjectHandlers in text
 * nodes and cleans the mess in element nodes.  Discards by default "script",
 * "link", "object", "style", "applet" and "iframe" (most of them shouldn't
 * even be here since (1) they belong in the <head> and (2) are discarded on
 * the server-side, but we check, just in case).
 *
 * @private
 */
ZmObjectManager.prototype.processHtmlNode =
function(node, handlers, discard, ignore) {
	var doc = node.ownerDocument;
	handlers = handlers != null ? handlers : true;
	var discardRe = discard instanceof RegExp ? discard : null;
	if (!discardRe) {
		discard = discard || [ "script", "link", "object", "style", "applet", "iframe" ];
		discard = discard instanceof Array ? discard : [ discard ];
		discardRe = new RegExp("^("+discard.join("|")+")$", "i");
	}

	var ignoreRe = ignore instanceof RegExp ? ignore : null;
	if (!ignoreRe && ignore) {
		ignore = ignore instanceof Array ? ignore : [ ignore ];
		ignoreRe = new RegExp("^("+ignore.join("|")+")$", "i");
	}

	var tmp, i, val;
	switch (node.nodeType) {
	    case 1:	// ELEMENT_NODE
		node.normalize();
		tmp = node.tagName.toLowerCase();
		if (/^(img|a)$/.test(tmp)) {
			if (tmp == "a"
			    && (ZmMailMsgView._URL_RE.test(node.href)
				|| ZmMailMsgView._MAILTO_RE.test(node.href)))
			{
				// tricky.
				var txt = RegExp.$1;
				tmp = doc.createElement("div");
				tmp.innerHTML = this.findObjects(AjxStringUtil.trim(RegExp.$1));
				tmp = tmp.firstChild;
				if (tmp.nodeType == 3 /* Node.TEXT_NODE */) {
					// probably no objects were found.  A warning would be OK here
					// since the regexps guarantee that objects _should_ be found.
					// DBG.println(AjxDebug.DBG1, "No objects found for potentially valid text!");
					return tmp.nextSibling;
				}
				// here, tmp is an object span, but it
				// contains the URL (href) instead of
				// the original link text.
				node.parentNode.insertBefore(tmp, node); // add it to DOM
				tmp.innerHTML = "";
				tmp.appendChild(node); // we have the original link now
				return tmp.nextSibling;	// move on
			}
			handlers = false;
		}
		else if (discardRe.test(tmp)) {
			tmp = node.nextSibling;
			node.parentNode.removeChild(node);
			return tmp;
		}
		else if (ignoreRe && ignoreRe.test(tmp)) {
			tmp = node.nextSibling;
			var fragment = doc.createDocumentFragment();
			for (var child = node.firstChild; child; child = child.nextSibling) {
				fragment.appendChild(child);
			}
			node.parentNode.replaceChild(fragment, node);
			return tmp;
		}
		else if (tmp == "style") {
			return node.nextSibling;
		}

		if (AjxEnv.isIE) {
			// strips expression()-s, bwuahahaha!
			// granted, they get lost on the server-side anyway, but assuming some get through...
			// the line below exterminates them.
			node.style.cssText = node.style.cssText;
		}

		var child = node.firstChild;
		while (child) {
			child = this.processHtmlNode(child, handlers, discardRe, ignoreRe);
		}
		return node.nextSibling;

	    case 3:	// TEXT_NODE
	    case 4:	// CDATA_SECTION_NODE (just in case)
		// generate ObjectHandler-s
		if (handlers && /[^\s\xA0]/.test(node.data)) try {
			var a = null, b = null;

			if (!AjxEnv.isIE) {
				// this block of code is supposed to free the object handlers from
				// dealing with whitespace.  However, IE sometimes crashes here, for
				// reasons that weren't possible to determine--hence we avoid this
				// step for IE.  (bug #5345)
				if (/^[\s\xA0]+/.test(node.data)) {
					a = node;
					node = node.splitText(RegExp.lastMatch.length);
				}
				if (/[\s\xA0]+$/.test(node.data))
					b = node.splitText(node.data.length - RegExp.lastMatch.length);
			}

			tmp = doc.createElement("div");
			var code  = this.findObjects(node.data, true, null, false);
			var disembowel = false;
			if (AjxEnv.isIE) {
				// Bug #6481, #4498: innerHTML in IE massacrates whitespace
				//            unless it sees a <pre> in the code.
				tmp.innerHTML = [ "<pre>", code, "</pre>" ].join("");
				disembowel = true;
			} else {
				tmp.innerHTML = code;
			}

			if (a)
				tmp.insertBefore(a, tmp.firstChild);
			if (b)
				tmp.appendChild(b);

			a = node.parentNode;
			if (disembowel)
				tmp = tmp.firstChild;
			while (tmp.firstChild)
				a.insertBefore(tmp.firstChild, node);
			tmp = node.nextSibling;
			a.removeChild(node);
			return tmp;
		} catch(ex) {};
	}
	return node.nextSibling;
};

/**
 * Sets handler attribute.
 * 
 * @param	{String}	type		the type
 * @param	{String}	name		the attribute name
 * @param	{Object}	value		the value
 */
ZmObjectManager.prototype.setHandlerAttr =
function(type, name, value) {
    var handlers = this.getHandlers()[type];
	if (handlers) {
		for (var i = 0; i < handlers.length; i++) {
			handlers[i][name] = value;
		}
	}
};

/**
 * Generates the span.
 * 
 * @private
 */
ZmObjectManager.prototype.generateSpan =
function(handler, html, idx, obj, context) {
	var id = this._objectIdPrefix + Dwt.getNextId();
	this._objects[id] = {object: obj, handler: handler, id: id, context: context };
	return handler.generateSpan(html, idx, obj, id, context);
};

/**
 * @private
 */
ZmObjectManager.prototype._findObjectSpan =
function(e) {
	while (e && (!e.id || e.id.indexOf(this._objectIdPrefix) !== 0)) {
		e = e.parentNode;
	}
	return e;
};

/**
 * @private
 */
ZmObjectManager.prototype._mouseOverListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) {return false;}
	var object = this._objects[span.id];
	if (!object) {return false;}

	span.className = object.handler.getHoveredClassName(object.object, object.context);
	if (object.handler.hasToolTipText()) {
		var shell = DwtShell.getShell(window);
		var manager = shell.getHoverMgr();
		if ((!manager.isHovering() || manager.getHoverObject() != object) && !DwtMenu.menuShowing()) {
			manager.reset();
			manager.setHoverOverDelay(ZmObjectManager._TOOLTIP_DELAY);
			manager.setHoverObject(object);
			manager.setHoverOverData(object);
			manager.setHoverOverListener(this._hoverOverListener);
			manager.hoverOver(ev.docX, ev.docY);
		}
	}

	ev._returnValue = true;
	ev._dontCallPreventDefault = true;
	return false;
};

/**
 * @private
 */
ZmObjectManager.prototype._mouseOutListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	var object = span ? this._objects[span.id] : null;

	if (object) {
		span.className = object.handler.getClassName(object.object, object.context);
		var shell = DwtShell.getShell(window);
		var manager = shell.getHoverMgr();
		manager.setHoverOutDelay(0);
		manager.setHoverOutData(object);
		manager.setHoverOutListener(this._hoverOutListener);
		manager.hoverOut();
	}

	return false;
};

/**
 * @private
 */
ZmObjectManager.prototype._mouseMoveListener =
function(ev) {
	ev._returnValue = true;
	ev._dontCallPreventDefault = true;
	ev._stopPropagation = true;
	var span = this._findObjectSpan(ev.target);
	var object = span ? this._objects[span.id] : null;

	if (object) {
		var shell = DwtShell.getShell(window);
		var manager = shell.getHoverMgr();
		if (!manager.isHovering()) {
			// NOTE: mouseOver already init'd hover settings
			manager.hoverOver(ev.docX, ev.docY);
		}
	}

	return false;
};

/**
 * @private
 */
ZmObjectManager.prototype._rightClickListener =
function(ev) {
	ev.button = DwtMouseEvent.RIGHT;
	return this._mouseDownListener(ev);
};

/**
 * @private
 */
ZmObjectManager.prototype._mouseDownListener =
function(ev) {

	ev._dontCallPreventDefault = true;
	ev._returnValue = true;
	ev._stopPropagation = false;

	var span = this._findObjectSpan(ev.target);
	if (!span) {
		return true;
	}
	var object = this._objects[span.id];
	if (!object) {
		return true;
	}

	ev._stopPropagation = true;

	var shell = DwtShell.getShell(window);
	var manager = shell.getHoverMgr();
	manager.setHoverOutDelay(0);
	manager.setHoverOutData(object);
	manager.setHoverOutListener(this._hoverOutListener);
	manager.hoverOut();

	span.className = object.handler.getActiveClassName(object.object, object.context);
	if (ev.button == DwtMouseEvent.RIGHT) {
		// NOTE: we need to know if the current view is a dialog since action
		//       menu needs to be a higher z-index
		var isDialog = (this._view instanceof DwtDialog);
		var menu = object.handler.getActionMenu(object.object, span, object.context, isDialog);
		if (menu) {
			menu.popup(0, ev.docX, ev.docY);
			// if we have an action menu, don't let the browser show its context menu too
			ev._dontCallPreventDefault = false;
			ev._returnValue = false;
			ev._stopPropagation = true;
			return true;
		}
	} else if (ev.button == DwtMouseEvent.LEFT) {
		if (this._selectCallback) {
			this._selectCallback.run();
		}
		object.handler.selected(object.object, span, ev, object.context);
		return true;
	}
	return false;
};

/**
 * @private
 */
ZmObjectManager.prototype._mouseUpListener =
function(ev) {
	ev._returnValue = true;
	ev._dontCallPreventDefault = true;
	ev._stopPropagation = true;
	var span = this._findObjectSpan(ev.target);
	if (!span) {return false;}
	var object = this._objects[span.id];
	if (!object) {return false;}

	span.className = object.handler.getHoveredClassName(object.object, object.context);
	return false;
};

/**
 * @private
 */
ZmObjectManager.prototype._handleHoverOver =
function(event) {
	if (!(event && event.object)) { return; }

	var span = this._findObjectSpan(event.target);
	var handler = event.object.handler;
	var object = event.object.object;
	var context = event.object.context;
	var x = event.x;
	var y = event.y;

	handler.hoverOver(object, context, x, y, span);
};

/**
 * @private
 */
ZmObjectManager.prototype._handleHoverOut =
function(event) {
	if (!(event && event.object)) { return; }

	var span = this._findObjectSpan(event.target);
	var handler = event.object.handler;
	var object = event.object.object;
	var context = event.object.context;

	handler.hoverOut(object, context, span);
};

// Private static functions

/**
 * @private
 */
ZmObjectManager.__byPriority =
function(a, b) {
	return (b._prio < a._prio) - (a._prio < b._prio);
};
