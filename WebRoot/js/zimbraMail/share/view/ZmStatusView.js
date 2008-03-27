/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
ZmStatusView = function(parent, className, posStyle, id) {

	DwtControl.call(this, {parent:parent, className:(className || "ZmStatus"), posStyle:posStyle, id:id});

	this._toast = this._standardToast = new ZmToast(this, ZmId.TOAST);
	this._statusQueue = [];
};

ZmStatusView.prototype = new DwtControl;
ZmStatusView.prototype.constructor = ZmStatusView;


// Constants

ZmStatusView.LEVEL_INFO 			= 1;	// informational
ZmStatusView.LEVEL_WARNING			= 2;	// warning
ZmStatusView.LEVEL_CRITICAL			= 3;	// critical

ZmStatusView.MSG_PARAMS = ["msg", "level", "detail", "transitions", "toast"];

// Public methods

ZmStatusView.prototype.toString =
function() {
	return "ZmStatusView";
};

/**
 * Displays a status message 
 * @param msg the message
 * @param level ZmStatusView.LEVEL_INFO, ZmStatusView.LEVEL_WARNING, or ZmStatusView.LEVEL_CRITICAL (optional) 
 * @param detail details (optional)
 * @param transitions transitions (optional)
 * @param toast the toast control (optional)
 */
ZmStatusView.prototype.setStatusMsg =
function(params) {
	params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
	if (typeof params == "string") {
		params = { msg: params };
	}
	var work = {
		msg: params.msg,
		level: params.level || ZmStatusView.LEVEL_INFO,
		detail: params.detail,
		date: new Date(),
		transitions: params.transitions,
		toast: params.toast || this._standardToast
	};

	// always push so we know one is active
	this._statusQueue.push(work);

	if (!this._toast.isPoppedUp()) {
        this._updateStatusMsg();
    }
};

ZmStatusView.prototype.nextStatus =
function() {
    if (this._statusQueue.length > 0) {
        this._updateStatusMsg();
        return true;
    }
    return false;
};


// Static functions

ZmStatusView.getClass =
function(work) {
	switch (work.level) {
		case ZmStatusView.LEVEL_CRITICAL:	return "ZToastCrit";
		case ZmStatusView.LEVEL_WARNING:	return "ZToastWarn";
		default: 							return "ZToastInfo";
	}
};

ZmStatusView.getImageHtml32 =
function(work) {
	switch (work.level) {
		case ZmStatusView.LEVEL_CRITICAL:	return "Critical_32";
		case ZmStatusView.LEVEL_WARNING:	return "Warning_32";
		default: 							return "Information_32";
	}
};


// Protected methods

ZmStatusView.prototype._updateStatusMsg =
function() {
    var work = this._statusQueue.shift();
    if (!work) { return; }

    var level = ZmStatusView.getClass(work);
    var icon = ZmStatusView.getImageHtml32(work);

    this._toast = work.toast;
	this._toast.popup(level, work.msg, icon, null, work.transitions);
};


//
// ZmToast
//

ZmToast = function(parent, id) {
	if (arguments.length == 0) { return; }

    DwtComposite.call(this, {parent:parent.shell, className:"ZToast", posStyle:Dwt.ABSOLUTE_STYLE, id:id});
    this._statusView = parent;
    this._createHtml();

    this._funcs = {};
    this._funcs["position"] = AjxCallback.simpleClosure(this.__position, this);
    this._funcs["show"] = AjxCallback.simpleClosure(this.__show, this);
    this._funcs["hide"] = AjxCallback.simpleClosure(this.__hide, this);
    this._funcs["pause"] = AjxCallback.simpleClosure(this.__pause, this);
    this._funcs["idle"] = AjxCallback.simpleClosure(this.__idle, this);
    this._funcs["fade"] = AjxCallback.simpleClosure(this.__fade, this);
    this._funcs["fade-in"] = this._funcs["fade"];
    this._funcs["fade-out"] = this._funcs["fade"];
    this._funcs["next"] = AjxCallback.simpleClosure(this.transition, this);
}
ZmToast.prototype = new DwtComposite;
ZmToast.prototype.constructor = ZmToast;
ZmToast.prototype.toString =
function() {
	return "ZmToast";
};

// Constants

ZmToast.FADE = { type: "fade" };
ZmToast.FADE_IN = { type: "fade-in" };
ZmToast.FADE_OUT = { type: "fade-out" };
ZmToast.PAUSE = { type: "pause" };
ZmToast.IDLE = {type: "idle" };

ZmToast.DEFAULT_TRANSITIONS = [ ZmToast.FADE_IN, ZmToast.PAUSE, ZmToast.FADE_OUT ];

ZmToast.DEFAULT_STATE = {};
ZmToast.DEFAULT_STATE["position"] = { location: "C" }; // center
ZmToast.DEFAULT_STATE["pause"] = { duration: 1200 };
ZmToast.DEFAULT_STATE["fade"] = { duration: 100, multiplier: 1 };
ZmToast.DEFAULT_STATE["fade-in"] = { start: 0, end: 99, step: 10, duration: 100, multiplier: 1 };
ZmToast.DEFAULT_STATE["fade-out"] = { start: 99, end: 0, step: -10, duration: 100, multiplier: 1 };

ZmToast.LEVEL_RE = /\b(ZToastCrit|ZToastWarn|ZToastInfo)\b/g;

// Data

ZmToast.prototype.TEMPLATE = "share.Widgets#ZToast";


// Public methods

ZmToast.prototype.dispose =
function() {
	this._textEl = null;
	this._iconEl = null;
	this._detailEl = null;
	DwtComposite.prototype.dispose.call(this);
};

ZmToast.prototype.popup =
function(level, text, icon, loc, customTransitions) {
    this.__clear();
    this._poppedUp = true;

    // setup display
    var el = this.getHtmlElement();
    Dwt.delClass(el, ZmToast.LEVEL_RE, level || "ZToastInfo")

    if (this._textEl) {
        this._textEl.innerHTML = text || "";
    }

	if (this._iconEl) {
        AjxImg.setImage(this._iconEl, icon, false);
    }

    // get transitions
    var location = appCtxt.get(ZmSetting.SKIN_HINTS, "toast.location") || loc;
    var transitions = customTransitions || appCtxt.get(ZmSetting.SKIN_HINTS, "toast.transitions") || ZmToast.DEFAULT_TRANSITIONS;

	transitions = [].concat( {type:"position", location:location}, transitions, {type:"hide"} );

    // start animation
    this._transitions = transitions;
    this.transition();
};

ZmToast.prototype.popdown =
function() {
    this.__clear();
    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._poppedUp = false;
};

ZmToast.prototype.isPoppedUp =
function() {
    return this._poppedUp;
};

ZmToast.prototype.transition =
function() {
    var transition = this._transitions && this._transitions.shift();
    if (!transition) {
        this._poppedUp = false;
        if (!this._statusView.nextStatus()) {
            this.popdown();
        }
        return;
    }

    var state = this._state = this._createState(transition);

    var el = this.getHtmlElement();
    Dwt.setOpacity(el, state.opacity);
    Dwt.setLocation(el, state.x, state.y);

    this._funcs[transition.type || "next"]();
};

// Protected methods

ZmToast.prototype._createHtml =
function(templateId) {
    var data = { id: this._htmlElId };
    this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);
    Dwt.setZIndex(this.getHtmlElement(), Dwt.Z_TOAST);
};

ZmToast.prototype._createHtmlFromTemplate =
function(templateId, data) {
    DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);
    this._textEl = document.getElementById(data.id+"_text");
    this._iconEl = document.getElementById(data.id+"_icon");
    this._detailEl = document.getElementById(data.id+"_detail");
};

ZmToast.prototype._createState =
function(transition) {
    var state = AjxUtil.createProxy(transition);
    var defaults = ZmToast.DEFAULT_STATE[state.type];
    for (var name in defaults) {
        if (!state[name]) {
            state[name] = defaults[name];
        }
    }

	switch (state.type) {
        case "fade-in":
		case "fade-out":
		case "fade": {
            state.value = state.start;
            break;
        }
    }
    return state;
};

// Private methods

ZmToast.prototype.__clear =
function() {
    clearTimeout(this._actionId);
    clearInterval(this._actionId);
    this._actionId = -1;
};

// transition handlers

ZmToast.prototype.__position =
function() {
    var el = this.getHtmlElement();
    var bsize = Dwt.getSize(this.shell.getHtmlElement());
    var tsize = Dwt.getSize(el);

    var x = (bsize.x - tsize.x) / 2;
    var y = (bsize.y - tsize.y) / 2

    var location = this._state.location || "C";
    switch (location.toUpperCase()) {
        case 'N': y = 0; break;
        case 'S': y = bsize.y - tsize.y; break;
        case 'E': x = bsize.x - tsize.x; break;
        case 'W': x = 0; break;
        case 'NE': x = bsize.x - tsize.x; y = 0; break;
        case 'NW': x = 0; y = 0; break;
        case 'SE': x = bsize.x - tsize.x; y = bsize.y - tsize.y; break;
        case 'SW': x = 0; y = bsize.y - tsize.y; break;
        case 'C': default: /* nothing to do */ break;
    }
    Dwt.setLocation(el, x, y);

    this._funcs["next"]();
};

ZmToast.prototype.__show =
function() {
    var el = this.getHtmlElement();
    Dwt.setVisible(el, true);
    Dwt.setVisibility(el, true);
    this._funcs["next"]();
};

ZmToast.prototype.__hide =
function() {
    var el = this.getHtmlElement();
    Dwt.setLocation(el, Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._funcs["next"]();
};

ZmToast.prototype.__pause =
function() {
    setTimeout(this._funcs["next"], this._state.duration);
};

ZmToast.prototype.__idle =
function() {
	if (!this._idleTimer) {
		this._idleTimer = new DwtIdleTimer(0, new AjxCallback(this, this.__idleCallback));
	} else {
		this._idleTimer.resurrect(0);
	}
};

ZmToast.prototype.__idleCallback =
function(idle) {
	if (!idle) {
		this.transition();
		this._idleTimer.kill();
	}
};

ZmToast.prototype.__move =
function() {
    // TODO
    this._funcs["next"]();
};

ZmToast.prototype.__fade =
function() {
    var opacity = this._state.value;
    var step = this._state.step;

    // NOTE: IE is slow re-rendering when adjusting opacity. So we try
    //       to do it in an IE-optimized way.
    if (AjxEnv.isIE) {
        if (AjxEnv.isIE5_5up) {
            try {
                var el = this.getHtmlElement();
                el.style.visibility = step > 0 ? "hidden" : "visible";
                
                var duration = this._state.duration / 1000;
                el.style.filter = "progid:DXImageTransform.Microsoft.Fade(duration="+duration+",overlap=1.0)";

                el.filters[0].Apply();
                el.style.visibility = step > 0 ? "visible" : "hidden";
                el.filters[0].Play();
            }
            catch (e) {
                DBG.println("error: "+e);
            }
        }
        setTimeout(this._funcs["next"], 0);
        return;
    }

    var isOver = step > 0 ? opacity >= this._state.end : opacity <= this._state.end;
    if (isOver) {
        opacity = this._state.end;
    }

    var el = this.getHtmlElement();
    Dwt.setOpacity(el, opacity);

    if (isOver) {
        this.__clear();
        setTimeout(this._funcs["next"], 0);
        return;
    }

    if (this._actionId == -1) {
        var duration = this._state.duration;
        var delta = duration / Math.abs(step);
        this._actionId = setInterval(this._funcs["fade"], delta);
    }

    this._state.value += step;
    this._state.step *= this._state.multiplier;
};
