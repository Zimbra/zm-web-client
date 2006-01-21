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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
* Object mananger class - use this class to hilite objects w/in a given view
* @constructor
* @class
*
* @author
* @param view			the view this manager is going to hilite for
* @param appCtxt 		the global ZmAppCtxt
* @param selectCallback AjxCallback triggered when user clicks on hilited object 
* 						(provide if you want to do something before the clicked 
* 						on object opens its corresponding view)
*/
function ZmObjectManager(view, appCtxt, selectCallback) {

	if (arguments.length < 1) {return;}
	DBG.println(AjxDebug.DBG2, "ZmObjectManager created by: " + view);
	this._view = view;
	this._appCtxt = appCtxt;
	this._selectCallback = selectCallback;
	this._uuid = Dwt.getNextId();
	this._objectIdPrefix = "OBJ_" + this._uuid + "_";
	this._objectHandlers = new Object();
	// don't include when looking for objects. only used to provide tool tips for images
	this._imageAttachmentHandler = new ZmImageAttachmentObjectHandler(appCtxt);

	// create handlers (see registerHandler below)
	this._createHandlers();
	
	// get Zimlet handler's
	var zimlets = this._appCtxt._settings._zmm.getContentZimlets();
	for (i = 0; i < zimlets.length; i++) {
		DBG.println(AjxDebug.DBG2, "ZmObjectManager: addHandler " + zimlets[i]);
		this.addHandler(zimlets[i]);
	}
	
	this.reset();

	// install handlers
    view.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
    view.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this._mouseOutListener));
    view.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
    view.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._mouseUpListener));
    view.addListener(DwtEvent.ONMOUSEMOVE, new AjxListener(this, this._mouseMoveListener));

    this._hoverOverListener = new AjxListener(this, this._handleHoverOver);
    this._hoverOutListener = new AjxListener(this, this._handleHoverOut);
}

ZmObjectManager._TOOLTIP_DELAY = 275;

ZmObjectManager._autohandlers = [];

ZmObjectManager.registerHandler =
function(obj, type) {
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

ZmObjectManager.prototype.addHandler =
function(h, type) {
    this._objectHandlers[type ? type : h.getTypeName()] = [h];
};

ZmObjectManager.prototype._createHandlers =
function() {
	var c = ZmObjectManager._autohandlers, i, obj,
		oh = this._objectHandlers;
	for (i = 0; i < c.length; ++i) {
		obj = c[i];
		var	zim = obj;
		var type = obj.TYPE;
		if (!(obj instanceof ZmZimletBase)) {
			zim = new obj(this._appCtxt);
		}
		if (obj.useType) {
			type = obj.useType;
		}
		if (!oh[type]) {oh[type] = [];}
		oh[type].push(zim);
	}
};

ZmObjectManager.prototype.toString =
function() {
	return "ZmObjectManager";
};

ZmObjectManager.prototype.reset =
function() {
	this._objects = new Object();
};

ZmObjectManager.prototype.getImageAttachmentHandler =
function() {
	return this._imageAttachmentHandler;
};

// type is optional.. if you know what type of content is being passed in, set the
// type param so we dont have to figure out what kind of content we're dealing with
ZmObjectManager.prototype.findObjects =
function(content, htmlEncode, type) {
	if  (!content) {return "";}
	var html = new Array();
	var idx = 0;

	var maxIndex = content.length;
	var lastIndex = 0;

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
		var result = null;
		if (type) {
			handlers = this._objectHandlers[type];
			if (handlers) {
				for (i = 0; i < handlers.length; i++) {
					result = handlers[i].findObject(content, lastIndex);
					if (!result || result.index >= lowestIndex) {break;}
					lowestResult = result;
					lowestIndex = result.index;
					lowestHandler = handlers[i];
				}
			}
			// If it's an email address just handle it and return the result.
			if (content instanceof ZmEmailAddress) {
				if(lowestHandler) {
					this.generateSpan(lowestHandler, html, idx, content, null);
				}
				return html.join("");
			}	
		} else {
			for (i in this._objectHandlers) {
				handlers = this._objectHandlers[i];
				for (var j = 0; j < handlers.length; j++) {
					result = handlers[j].findObject(content, lastIndex);
					if (result && result.index < lowestIndex) {
						lowestResult = result;
						lowestIndex = result.index;
						lowestHandler = handlers[j];
					}
				}
			}
		}

		if (!lowestResult) {
			// all done
			// do last chunk
			var chunk = content.substring(lastIndex, maxIndex);
			if (htmlEncode) {
				html[idx++] = AjxStringUtil.htmlEncode(chunk, true);
			} else {
				html[idx++] = chunk;
			}
			break;
		}

		//  add anything before the match
		if (lowestIndex > lastIndex) {
			var chunk = content.substring(lastIndex, lowestIndex);
			if (htmlEncode) {
				html[idx++] = AjxStringUtil.htmlEncode(chunk, true); 
			} else {
				html[idx++] = chunk;
			}
		}

		// add the match
		if(lowestHandler) {
			idx = this.generateSpan(lowestHandler, html, idx, lowestResult[0], lowestResult.context);
		}

		// update the index
		lastIndex = lowestResult.index + lowestResult[0].length;
	}

	return html.join("");
};

ZmObjectManager.prototype.setHandlerAttr =
function(type, name, value) {
    var handlers = this._objectHandlers[type];
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
	while (e && (e.id == null || e.id.indexOf(this._objectIdPrefix) != 0)) {
		e = e.parentNode;
	}
	return e;
};

ZmObjectManager.prototype._mouseOverListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return false;
	var object = this._objects[span.id];
	if (!object) return false;

	span.className = object.handler.getActivatedClassName(object.object, object.context);
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

ZmObjectManager.prototype._mouseDownListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return true;
	var object = this._objects[span.id];
	if (!object) return true;

	var shell = DwtShell.getShell(window);
	var manager = shell.getHoverMgr();
	manager.setHoverOutDelay(0);
	manager.setHoverOutData(object);
	manager.setHoverOutListener(this._hoverOutListener);
	manager.hoverOut();

	span.className = object.handler.getTriggeredClassName(object.object, object.context);
	if (ev.button == DwtMouseEvent.RIGHT) {
		// NOTE: we need to know if the current view is a dialog since action 
		//       menu needs to be a higher z-index
		var isDialog = (this._view instanceof DwtDialog);
		var menu = object.handler.getActionMenu(object.object, span, object.context, isDialog);
		if (menu)
			menu.popup(0, ev.docX, ev.docY);
		return true;
	} else if (ev.button == DwtMouseEvent.LEFT) {
		if (this._selectCallback)
			this._selectCallback.run();
		object.handler.selected(object.object, span, ev, object.context);
		return true;
	}
	return false;
};

ZmObjectManager.prototype._mouseUpListener =
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return false;
	var object = this._objects[span.id];
	if (!object) return false;

	span.className = object.handler.getActivatedClassName(object.object, object.context);
	return false;
};

ZmObjectManager.prototype._handleHoverOver = function(event) {
	if (!(event && event.object)) return;

	var span = this._findObjectSpan(event.target);
	var handler = event.object.handler;
	var object = event.object.object;
	var context = event.object.context;
	var x = event.x;
	var y = event.y;

	handler.hoverOver(object, context, x, y, span);
};

ZmObjectManager.prototype._handleHoverOut = function(event) {
	if (!(event && event.object)) return;

	var span = this._findObjectSpan(event.target);
	var handler = event.object.handler;
	var object = event.object.object;
	var context = event.object.context;

	handler.hoverOut(object, context, span);
};
