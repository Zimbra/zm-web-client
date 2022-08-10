/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
};

ZmObjectManager._TOOLTIP_DELAY = 275;

// Define common types for quicker object matching.
ZmObjectManager.EMAIL = "email";
ZmObjectManager.URL = "url";
ZmObjectManager.PHONE = "phone";
ZmObjectManager.DATE = "date";
ZmObjectManager.ADDRESS = "address";
ZmObjectManager.TITLE = "title";

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
	if (!this.initialized) {
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
    for (var type in objectHandlers) {
		// Object handlers grouped by Type
		objectHandlers[type].sort(ZmObjectManager.__byPriority);

		// Copy each array to a single array of all Object Handlers
		for (var k = 0; k < objectHandlers[type].length; k++) {
			this._allObjectHandlers.push(objectHandlers[type][k]);
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
		var	handler = obj;
		var type = obj.TYPE;
		if (!(obj.isZmObjectHandler)) {
			handler = new obj();
		}
		if (obj.useType) {
			type = obj.useType;
		}
		if (obj.usePrio) {
			prio = obj.usePrio;
		}
		this.addHandler(handler, type, prio);
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
		view.addListener(DwtEvent.ONCONTEXTMENU, new AjxListener(this, this._rightClickListener));
		this._hoverOverListener = new AjxListener(this, this._handleHoverOver);
	    this._hoverOutListener = new AjxListener(this, this._handleHoverOut);
	}
	this._view = view;
};

ZmObjectManager.prototype.getView = function() {
	return this._view;
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
 * @param	{hash}		options		arbitrary options to pass to handler
 *
 * @return	{String}	the object
 */
ZmObjectManager.prototype.findObjects =
function(content, htmlEncode, type, isTextMsg, options) {
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
					result = handlers[i].findObject(content, lastIndex, this);
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
					this.generateSpan(lowestHandler, html, idx, content, lowestResult, options);
				} else {
					html[idx++] = AjxStringUtil.htmlEncode(content.toString());
				}
				return html.join("");
			}
		} else {
			for (var j = 0; j < this._allObjectHandlers.length; j++) {
				var handler = this._allObjectHandlers[j];
				//DBG.println(AjxDebug.DBG3, "findObjects trying (" + handler + ")");
				result = handler.findObject(content, lastIndex, this);
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
	doc = doc || node.ownerDocument;
    var tmpdiv = doc.createElement("div");

    var recurse = function(node, handlers) {
		var tmp, i, val, next;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();

			if (next == null) {
				if (/^(img|a)$/.test(tmp)) {
                    var href;
                    try {
                        // IE can throw an "Invalid Argument" error depending on value of href
                        // e.g: http://0:0:0:0:0:0:0:1%0:7070/service/soap/ContactActionRequest:1331608015326:9c4f5868c5b0b4f2
                        href = node.href;
                    }
                    catch(e) {
                        //do nothing
                    }

                    var isMailToLink = tmp === "a" && ZmMailMsgView._MAILTO_RE.test(href),
                        isUrlLink = tmp === "a" && ZmMailMsgView._URL_RE.test(href);

                    if ((isMailToLink || isUrlLink) && node.target){
						// tricky.
						var txt = isMailToLink ? href :RegExp.$1 ;
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
			if (parseFloat(node.style.textIndent) < 0) {
				node.style.textIndent = "";
			}
            for (i = node.firstChild; i; i = recurse(i, handlers)) {}
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

    // Parse through the DOM directly and find objects.
	if (node && node.childNodes && node.childNodes.length) {
		for (var i = 0; i < node.childNodes.length; i++){
			recurse(node.childNodes[i], true);
		}
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

			for (i = node.firstChild; i; i = recurse(i, handlers)) {}
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
function(handler, html, idx, obj, context, options) {
	var id = this._objectIdPrefix + Dwt.getNextId();
    if (handler && handler.name) {
        id = id + "_" + handler.name;
    }
	this._objects[id] = {object: obj, handler: handler, id: id, context: context };
	return handler.generateSpan(html, idx, obj, id, context, options);
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

	span.className = object.handler.getHoveredClassName(object.object, object.context, span.id);
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
			ev.hoverStarted = true;
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
		span.className = object.handler.getClassName(object.object, object.context, span.id);
		var shell = DwtShell.getShell(window);
		var manager = shell.getHoverMgr();
		manager.setHoverOutDelay(150);
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

	// "authoritative" means a previous listener doesn't want propagation to get reset
	if (!ev._authoritative) {
		ev._dontCallPreventDefault = true;
		ev._returnValue = true;
		ev._stopPropagation = false;
	}

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

	span.className = object.handler.getActiveClassName(object.object, object.context, span.id);
	if (ev.button == DwtMouseEvent.RIGHT) {
		var menu = object.handler.getActionMenu(object.object, span, object.context, ev);
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

	span.className = object.handler.getHoveredClassName(object.object, object.context, span.id);
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
	var id = event.object.id;
	var x = event.x;
	var y = event.y;

	handler.hoverOver(object, context, x, y, span, id);
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
	var id = event.object.id;

	handler.hoverOut(object, context, span, id);
};

// Private static functions

/**
 * @private
 */
ZmObjectManager.__byPriority =
function(a, b) {
	return (b._prio < a._prio) - (a._prio < b._prio);
};
