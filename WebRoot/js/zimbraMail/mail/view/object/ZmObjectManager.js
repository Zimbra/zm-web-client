function ZmObjectManager(view, appCtxt) {

	if (arguments.length == 0) return;

	this._view = view;
	this._appCtxt = appCtxt;
	this._uuid = Dwt.getNextId();	
	this._objectIdPrefix = "OBJ_" + this._uuid + "_";		
	// TODO: make this dynamic, have handlers register a factory method...
	this._emailHandler = new ZmEmailObjectHandler(appCtxt);
	// URL should be first, to handle email addresses embedded in URAjx
	this._objectHandlers = [
		new ZmURLObjectHandler(appCtxt),	
		this._emailHandler,
		new ZmPhoneObjectHandler(appCtxt),
		new ZmPOObjectHandler(appCtxt),
		new ZmTrackingObjectHandler(appCtxt),		
		// Removed due to cost of emoticon icons
		// new ZmEmoticonObjectHandler(appCtxt)
	];
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		ZmDateObjectHandler.registerHandlers(this._objectHandlers, appCtxt);
	}
	this.reset();

	// install handlers
    view.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
    view.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this._mouseOutListener));    
    view.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));        
    view.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._mouseUpListener));            
    view.addListener(DwtEvent.ONMOUSEMOVE, new AjxListener(this, this._mouseMoveListener));                
}

ZmObjectManager._TOOLTIP_DELAY = 275;

ZmObjectManager.prototype.toString = 
function() {
	return "ZmObjectManager";
}

ZmObjectManager.prototype.reset = 
function() {
	this._objects = new Object();
}

ZmObjectManager.prototype.getEmailHandler = 
function() {
	return this._emailHandler;
}

ZmObjectManager.prototype.getHandlers = 
function() {
	return this._objectHandlers;
}

ZmObjectManager.prototype.findObjects =
function(content, htmlEncode) {
	if  (content == null) return "";
	
	var html = new Array();
	var idx = 0;

	var maxIndex = content.length;
	var lastIndex = 0;

	while (true) {
		var lowestResult = null;
		var lowestIndex = maxIndex;

		// go through each handler and ask it to find us a match >= to lastIndex.
		// handlers that didn't match last time will simply return, handlers that matched
		// last time that we didn't use (because we found a closer match) will simply return 
		// that match again.
		//
		// when we are done, we take the handler with the lowest index.

		for (var i in this._objectHandlers) {
			var handler = this._objectHandlers[i];
			var result = handler.findObject(content, lastIndex);
			if (result != null && result.index < lowestIndex) {
				lowestResult = result;
				lowestIndex = result.index;
				lowestHandler = handler;
			}
		}

		if (lowestResult == null) {
			// all done
			// do last chunk
			var chunk = content.substring(lastIndex, maxIndex);
			if (htmlEncode)
				html[idx++] = AjxStringUtil.htmlEncode(chunk, true);
			else
				html[idx++] = chunk;
			break;
		}

		//  add anything before the match
		if (lowestIndex > lastIndex) {
			var chunk = content.substring(lastIndex, lowestIndex);
			if (htmlEncode)
				html[idx++] = AjxStringUtil.htmlEncode(chunk, true);
			else
				html[idx++] = chunk;
		}

		// add the match
		idx = this.generateSpan(lowestHandler, html, idx, lowestResult[0], lowestResult.context);
		
		// update the index
		lastIndex = lowestResult.index + lowestResult[0].length;
	}

	return html.join("");
}

/*
ZmObjectManager.prototype.match =
function(line) {
	var result = null;
	for (var i in this._objectHandlers) {
		var handler = this._objectHandlers[i];
		result = handler.match(line);
		if (result != null)
			return {result: result, handler: handler};
	}
	return null;
}
*/

ZmObjectManager.prototype.generateSpan = 
function(handler, html, idx, obj, context) {
	var id = this._objectIdPrefix + Dwt.getNextId();
	this._objects[id] = {object: obj, handler: handler, id: id, context: context };
	return handler.generateSpan(html, idx, obj, id, context);
}

ZmObjectManager.prototype._findObjectSpan = 
function(e) {
	while (e && (e.id == null || e.id.indexOf(this._objectIdPrefix) != 0)) {
		e = e.parentNode;
	}
	return e;
}

ZmObjectManager.prototype._mouseOverListener = 
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return false;
	var object = this._objects[span.id];
	if (!object) return false;

	span.className = object.handler.getActivatedClassName(object.object, object.context);
	if (object.handler.hasToolTipText()) {
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.setContent(object.handler.getToolTipText(object.object, object.context));
		tooltip.mouseOver(ev.docX, ev.docY, ZmObjectManager._TOOLTIP_DELAY);
	}
	return false;
}

ZmObjectManager.prototype._mouseOutListener = 
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return false;
	var object = this._objects[span.id];
	if (!object) return false;
		
	span.className = object.handler.getClassName(object.object, object.context);
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.mouseOut(0);
	return false;
}

ZmObjectManager.prototype._mouseMoveListener = 
function(ev) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.mouseMove(ZmObjectManager._TOOLTIP_DELAY);
	return false;
}

ZmObjectManager.prototype._mouseDownListener = 
function(ev) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.mouseDown();
	var span = this._findObjectSpan(ev.target);
	if (!span) return true;
	var object = this._objects[span.id];
	if (!object) return true;
	
	span.className = object.handler.getTriggeredClassName(object.object, object.context);
	if (ev.button == DwtMouseEvent.RIGHT) {
		var menu = object.handler.getActionMenu(object.object, span, object.context);
		if (menu)
			menu.popup(0, ev.docX, ev.docY);
		return true;
	} else if (ev.button == DwtMouseEvent.LEFT) {
		object.handler.selected(object.object, span, ev, object.context);
		return true;
	}
	return false;
}

ZmObjectManager.prototype._mouseUpListener = 
function(ev) {
	var span = this._findObjectSpan(ev.target);
	if (!span) return false;
	var object = this._objects[span.id];
	if (!object) return false;
		
	span.className = object.handler.getActivatedClassName(object.object, object.context);
	return false;
}
