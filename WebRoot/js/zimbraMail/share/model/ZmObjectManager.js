/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
 * Object mananger class - use this class to hilite objects w/in a given view
 * @constructor
 * @class
 *
 * @author Kevin Henrikson
 * 
 * @param view			the view this manager is going to hilite for
 * @param selectCallback AjxCallback triggered when user clicks on hilited object
 * 						(provide if you want to do something before the clicked
 * 						on object opens its corresponding view)
 * @param skipHandlers 	true to avoid adding the standard handlers
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

// not sure this function is useful.
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

ZmObjectManager.prototype.toString =
function() {
	return "ZmObjectManager";
};

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

ZmObjectManager.prototype.reset =
function() {
	this._objects = {};
};

ZmObjectManager.prototype.setView =
function(view) {
	if (view != null) {
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

		// Process mouse movement across all elements to allow zimlets' tooltips
		// to pop up and down correctly.
		view._ignoreInternalOverOut = false;
	}
	this._view = view;
};

ZmObjectManager.prototype.objectsCount =
function() {
	return (appCtxt.zimletsPresent()) ? appCtxt.getZimletMgr().getContentZimlets().length : 0;
};

ZmObjectManager.prototype.getImageAttachmentHandler =
function() {
	return this._imageAttachmentHandler;
};

// type is optional.. if you know what type of content is being passed in, set the
// type param so we dont have to figure out what kind of content we're dealing with
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
			if (content instanceof AjxEmailAddress) {
				if(lowestHandler) {
					this.generateSpan(lowestHandler, html, idx, content, null);
				} else {
					html[idx++] = content;
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


//Added this customized method for the sake of ZmMailMsgView performance. 
//TODO: Integrate this method to findObjectsInNode()
ZmObjectManager.prototype.processObjectsInNode = function(doc, node){

    var objectManager = this;
    var tmpdiv = doc.createElement("div");

    doc || ( doc = node.ownerDocument ); 


    recurse = function(node, handlers) {
		var tmp, i, val, next;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();

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
				}
			} else {
				// consider processed
				node = next;
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

    //Parse thorough the DOM directly and find objects.
    for(var i=0; i<node.childNodes.length; i++){
        recurse(node.childNodes[i], true);
    }
    
};

ZmObjectManager.prototype.findObjectsInNode =
function(node, re_discard, re_allow, callbacks) {
	var objectManager = this, doc = node.ownerDocument, tmpdiv = doc.createElement("div");

	if (!re_discard)
		re_discard = /^(script|link|object|iframe|applet)$/i;

	// This inner function does the actual work.  BEWARE that it return-s
	// in various places, not only at the end.
	recurse = function(node, handlers) {
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
			// fix style
			// node.nowrap = "";
			// node.className = "";

			if (AjxEnv.isIE)
				// strips expression()-s, bwuahahaha!
				// granted, they get lost on the server-side anyway, but assuming some get through...
				// the line below exterminates them.
				node.style.cssText = node.style.cssText;

			// Clear dangerous rules.  FIXME: implement proper way
			// using removeAttribute (kind of difficult as it's
			// (expectedly) quite different in IE from *other*
			// browsers, so for now style.prop="" will do.)
			tmp = ZmMailMsgView._dangerousCSS;
			for (i in tmp) {
				val = tmp[i];
				if (!val || val.test(node.style[i]))
					node.style[i] = "";
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
 * go through the content and return the result of the object handler's match call.
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

// Dives recursively into the given DOM node.  Creates ObjectHandlers in text
// nodes and cleans the mess in element nodes.  Discards by default "script",
// "link", "object", "style", "applet" and "iframe" (most of them shouldn't
// even be here since (1) they belong in the <head> and (2) are discarded on
// the server-side, but we check, just in case..).
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
		// fix style
		// node.nowrap = "";
		// node.className = "";

		if (AjxEnv.isIE)
			// strips expression()-s, bwuahahaha!
			// granted, they get lost on the server-side anyway, but assuming some get through...
			// the line below exterminates them.
			node.style.cssText = node.style.cssText;

		// Clear dangerous rules.  FIXME: implement proper way
		// using removeAttribute (kind of difficult as it's
		// (expectedly) quite different in IE from *other*
		// browsers, so for now style.prop="" will do.)
		tmp = ZmMailMsgView._dangerousCSS;
		for (i in tmp) {
			val = tmp[i];
			if (!val || val.test(node.style[i]))
				node.style[i] = "";
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

ZmObjectManager.prototype.setHandlerAttr =
function(type, name, value) {
    var handlers = this.getHandlers()[type];
	if (handlers) {
		for (var i = 0; i < handlers.length; i++) {
			handlers[i][name] = value;
		}
	}
};

ZmObjectManager.prototype.generateSpan =
function(handler, html, idx, obj, context) {
	var id = this._objectIdPrefix + Dwt.getNextId();
	this._objects[id] = {object: obj, handler: handler, id: id, context: context };
	return handler.generateSpan(html, idx, obj, id, context);
};

ZmObjectManager.prototype._findObjectSpan =
function(e) {
	while (e && (!e.id || e.id.indexOf(this._objectIdPrefix) !== 0)) {
		e = e.parentNode;
	}
	return e;
};

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
		if (!manager.isHovering()) {
			manager.reset();
			manager.setHoverOverDelay(ZmObjectManager._TOOLTIP_DELAY);
			manager.setHoverOverData(object);
			manager.setHoverOverListener(this._hoverOverListener);
			manager.hoverOver(ev.docX, ev.docY);
		}
	}

	ev._returnValue = true;
	ev._dontCallPreventDefault = true;
	return false;
};

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

ZmObjectManager.prototype._mouseMoveListener =
function(ev) {
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

ZmObjectManager.prototype._rightClickListener =
function(ev) {
	ev.button = DwtMouseEvent.RIGHT;
	this._mouseDownListener(ev);
};

ZmObjectManager.prototype._mouseDownListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) {return true;}
	var object = this._objects[span.id];
	if (!object) {return true;}

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

ZmObjectManager.prototype._mouseUpListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) {return false;}
	var object = this._objects[span.id];
	if (!object) {return false;}

	span.className = object.handler.getHoveredClassName(object.object, object.context);
	return false;
};

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

ZmObjectManager.__byPriority =
function(a, b) {
	return (b._prio < a._prio) - (a._prio < b._prio);
};
