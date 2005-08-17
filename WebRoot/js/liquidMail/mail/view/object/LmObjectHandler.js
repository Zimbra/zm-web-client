function LmObjectHandler(appCtxt, typeName, className) {

	if (arguments.length == 0) return;

	this._appCtxt = appCtxt;
	this._typeName = typeName;
	this._className = className != null ? className : "Object";
}

LmObjectHandler.prototype.constructor = LmObjectHandler;

LmObjectHandler.prototype.toString = 
function() {
	return "LmObjectHandler: type(" + this._typeName + ") class(" + this._className + ")";
}

// OVERRIDE if need be
LmObjectHandler.prototype.getClassName =
function(obj, context) {
	return this._className;
}

// OVERRIDE if need be
LmObjectHandler.prototype.getActivatedClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForActivated !== cname) {
		this._cachedClassNameForActivated = cname;
		this._classNameActivated = cname + "-" + DwtCssStyle.ACTIVATED;
	}
	return this._classNameActivated;
}

// OVERRIDE if need be
LmObjectHandler.prototype.getTriggeredClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForTriggered !== cname) {
		this._cachedClassNameForTriggered = cname;
		this._classNameTriggered = cname + "-" + DwtCssStyle.TRIGGERED;
	}
	return this._classNameTriggered;
}

LmObjectHandler.prototype.findObject =
function(content, startIndex) {
	if (startIndex == 0) {
		this._lastMatch = null;
		this._noMatch = false;
	}
	if (this._noMatch) return null;
	if (this._lastMatch && this._lastMatch.index >= startIndex)
		return this._lastMatch;
	this._lastMatch = this.match(content, startIndex);
	this._noMatch = this._lastMatch == null;
	return this._lastMatch;
}


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
LmObjectHandler.prototype.match =
function(content, startIndex) {
	return null;
}

// OVERRIDE IF NEED BE. Generates content inside the <span>
LmObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context) {
	html[idx++] = LsStringUtil.htmlEncode(obj, true);
	return idx;
}

// generates the span
LmObjectHandler.prototype.generateSpan = 
function(html, idx, obj, spanId, context) {
	html[idx++] = "<span class='";
	html[idx++] = this.getClassName(obj);
	html[idx++] = "' id='";
	html[idx++] = spanId;
	html[idx++] = "'>";	
	idx = this._getHtmlContent(html, idx, obj, context);
	html[idx++] = "</span>";
	return idx;
}

LmObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return true;
}

LmObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return LsStringUtil.htmlEncode(obj);
}

LmObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
}

LmObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	return;
}
