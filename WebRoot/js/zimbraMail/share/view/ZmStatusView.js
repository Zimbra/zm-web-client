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
ZmStatusView = function(parent, className, posStyle) {

	if (arguments.length == 0) return;
	className = className || "ZmStatus";
	DwtControl.call(this, parent, className, posStyle);
	this._setMouseEventHdlrs();
	this.setCursor("default");
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	this.addListener(DwtEvent.ONDBLCLICK,  new AjxListener(this, ZmStatusView.prototype._doubleClickListener));
	
	this._createHtml();
	this.setScrollStyle(Dwt.CLIP);
 	this._statusQueue = [];
 	this._statusHistory = []; 	
	this.addControlListener(new AjxListener(this, this._controlListener));	
	
	this._updateClockTimedAction = new AjxTimedAction(this, this._updateClock, null);
	this._updateClock();
	this._counter = 0;
	this.setIconVisible(ZmStatusView.ICON_INBOX, false);
	this.setIconVisible(ZmStatusView.ICON_IM, false);	
	this.setIconVisible(ZmStatusView.ICON_BUSY, false);
}

ZmStatusView.prototype = new DwtControl;
ZmStatusView.prototype.constructor = ZmStatusView;

ZmStatusView.prototype.toString =
function() {
	return "ZmStatusView";
}

//
// Constants
//

ZmStatusView.MAX_HISTORY = 50; // max items to store in history

ZmStatusView.ANIMATION_DELAY = 50; // each frame of toast sliding
ZmStatusView.ANIMATION_NUM_FRAMES = 8; // each frame of toast sliding
ZmStatusView.STATUS_LIFE = 5000; // status message duration

ZmStatusView.LEVEL_INFO = 1; // informational
ZmStatusView.LEVEL_WARNING = 2; // warning
ZmStatusView.LEVEL_CRITICAL = 3; // critical

ZmStatusView.TRANSITION_SLIDE_UP = 1; 
ZmStatusView.TRANSITION_SLIDE_DOWN = 2;
ZmStatusView.TRANSITION_SLIDE_LEFT = 3;
ZmStatusView.TRANSITION_SLIDE_RIGHT = 4;
ZmStatusView.TRANSITION_FADE_IN = 5;
ZmStatusView.TRANSITION_INVISIBLE = 6; // add to history, but don't display

ZmStatusView.ICON_INBOX = 1;
ZmStatusView.ICON_IM = 2;
ZmStatusView.ICON_BUSY = 3;

ZmStatusView.DEFAULT = { };
ZmStatusView.DEFAULT[ZmStatusView.LEVEL_INFO] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_UP };
ZmStatusView.DEFAULT[	ZmStatusView.LEVEL_WARNING] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_DOWN };
ZmStatusView.DEFAULT[	ZmStatusView.LEVEL_CRITICAL] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_DOWN };

//
// Public methods
//

ZmStatusView.prototype.setStatusMsg =
function(msg, level, detail, delay, transition, position) {
	if (!level) level = ZmStatusView.LEVEL_INFO;

	var work = {
        msg: msg, detail: detail, level: level,
        transition: transition,
        date: new Date()
    };
	this._updateHistory(work);
	this._statusQueue.push(work); // always push so we know one is active
	if (!this._toast.isPoppedUp()) {
        this._updateStatusMsg();
    }
};

ZmStatusView.prototype.nextStatus = function() {
    if (this._statusQueue.length > 0) {
        this._updateStatusMsg();
        return true;
    }
    return false;
};

ZmStatusView.prototype.setIconVisible =
function(icon, visible) {
	var id = this._iconIds[icon];
	if (!id) return;
	var el = document.getElementById(id);
	if (el) Dwt.setVisible(el, visible);
}

//
// Static functions
//

ZmStatusView.getClass =
function(work) {
	if (work.level == ZmStatusView.LEVEL_CRITICAL) return "ZToastCrit";
    if (work.level == ZmStatusView.LEVEL_WARNING) return "ZToastWarn";
    return "ZToastInfo";
}

ZmStatusView.getImageHtml32 =
function(work) {
	if (work.level == ZmStatusView.LEVEL_CRITICAL) return "Critical_32";
    if (work.level == ZmStatusView.LEVEL_WARNING) return "Warning_32";
    return "Information_32";
}

//
// Protected methods
//

ZmStatusView.prototype._createHtml =
function() {
    var id = this._htmlElId; 
    this._mainContentDivId = id+"_main";
    this._iconIds = {};
    this._iconIds[ZmStatusView.ICON_INBOX] = id+"_inbox";
	this._iconIds[ZmStatusView.ICON_IM] = id+"_im";
	this._iconIds[ZmStatusView.ICON_BUSY] = id+"_busy";

    this._toast = new ZmToast(this);

    var html = AjxTemplate.expand("zimbraMail.share.templates.Widgets#ZmStatusView", id);
    this.getHtmlElement().innerHTML = html;
}

ZmStatusView.prototype._getMainContentEl = function () {
    return document.getElementById(this._mainContentDivId);
};

ZmStatusView.prototype._setMainText = function(text) {
	this._getMainContentEl().innerHTML = AjxStringUtil.htmlEncode(text);
}

ZmStatusView.prototype._replayHistory =
function(index) {
	if (index >= this._statusHistory.length) return;
	var work = this._statusHistory[index];
	this._statusQueue.push(work); // always push so we know one is active
	if (this._statusQueue.length == 1) this._updateStatusMsg();
}

ZmStatusView.prototype._updateHistory =
function(work) {
	this._statusHistory.unshift(work);
	if (this._statusHistory.length > ZmStatusView.MAX_HISTORY) this._statusHistory.pop();
}

ZmStatusView.prototype._updateStatusMsg =
function() {
    var work = this._statusQueue.shift();
    while (work && work.transition == ZmStatusView.TRANSITION_INVISIBLE) {
        work = this._statusQueue.shift();
    }
    if (!work) {
        return;
    }

    var level = ZmStatusView.getClass(work);
    var text = work.msg;
    var icon = ZmStatusView.getImageHtml32(work);

    this._toast.popup(level, text, icon);
};

ZmStatusView.prototype._updateClock =
function() {
	var now = new Date();
	this._setMainText(AjxDateUtil.computeTimeString(now));
	AjxTimedAction.scheduleAction(this._updateClockTimedAction, (60-now.getSeconds()+2) * 1000);
};

// listeners

ZmStatusView.prototype._controlListener =
function(ev) {
};

ZmStatusView.prototype._mouseOverListener = 
function(ev) {
	this._mouseOver = true;
	if (this._statusQueue.length == 0) this._replayHistory(0);
};

ZmStatusView.prototype._mouseOutListener = 
function(ev) {
	this._mouseOver = false;
};

ZmStatusView.prototype._mouseDownListener = 
function(ev) {
};


ZmStatusView.prototype._doubleClickListener =
function(ev) {
	if (this._historyDialog == null) {
		this._historyDialog = new ZmStatusHistoryDialog(this.shell, this._appCtxt);
	}
	this._historyDialog.initialize(AjxVector.fromArray(this._statusHistory).clone());
	this._historyDialog.popup();
};

//
// Classes
//

ZmToast = function(parent) {
    DwtControl.call(this, parent.shell, "ZToast", Dwt.ABSOLUTE_STYLE);
    this._statusView = parent;
    this._createHtml();

    this._funcs = {};
    this._funcs["position"] = AjxCallback.simpleClosure(this.__position, this);
    this._funcs["show"] = AjxCallback.simpleClosure(this.__show, this);
    this._funcs["hide"] = AjxCallback.simpleClosure(this.__hide, this);
    this._funcs["pause"] = AjxCallback.simpleClosure(this.__pause, this);
    this._funcs["fade"] = AjxCallback.simpleClosure(this.__fade, this);
    this._funcs["fade-in"] = this._funcs["fade"];
    this._funcs["fade-out"] = this._funcs["fade"];
    this._funcs["next"] = AjxCallback.simpleClosure(this._transition, this);
}
ZmToast.prototype = new DwtControl;
ZmToast.prototype.constructor = ZmToast;

// Constants

ZmToast.DEFAULT_TRANSITIONS = [ { type: "fade-in" }, { type: "pause" }, { type: "fade-out" } ];

ZmToast.DEFAULT_STATE = {};
ZmToast.DEFAULT_STATE["position"] = { location: "C" }; // center
ZmToast.DEFAULT_STATE["pause"] = { duration: 1200 };
ZmToast.DEFAULT_STATE["fade"] = { duration: 100, multiplier: 1 };
ZmToast.DEFAULT_STATE["fade-in"] = { start: 0, end: 99, step: 10, duration: 100, multiplier: 1 };
ZmToast.DEFAULT_STATE["fade-out"] = { start: 99, end: 0, step: -10, duration: 100, multiplier: 1 };

ZmToast.LEVEL_RE = /\b(ZToastCrit|ZToastWarn|ZToastInfo)\b/g;

// Data

ZmToast.prototype.TEMPLATE = "zimbraMail.share.templates.Widgets#ZToast";

// Public methods

ZmToast.prototype.popup = function(level, text, icon, loc) {
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
    var location = this._appCtxt.get(ZmSetting.SKIN_HINTS, "toast.location") || loc;
    var transitions = this._appCtxt.get(ZmSetting.SKIN_HINTS, "toast.transitions") || ZmToast.DEFAULT_TRANSITIONS;
    transitions = [].concat( {type:"position",location:location}, transitions, {type:"hide"} );

    // start animation
    this._transitions = transitions;
    this._transition();
};

ZmToast.prototype.popdown = function() {
    this.__clear();
    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._poppedUp = false;
};

ZmToast.prototype.isPoppedUp = function() {
    return this._poppedUp;
};

// Protected methods

ZmToast.prototype._createHtml = function(templateId) {
    var data = { id: this._htmlElId };
    this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);
    Dwt.setZIndex(this.getHtmlElement(), Dwt.Z_TOAST);
};
ZmToast.prototype._createHtmlFromTemplate = function(templateId, data) {
    DwtControl.prototype._createHtmlFromTemplate.call(this, templateId, data);
    this._textEl = document.getElementById(data.id+"_text");
    this._iconEl = document.getElementById(data.id+"_icon");
    this._detailEl = document.getElementById(data.id+"_detail");
};

// Protected methods

ZmToast.prototype._transition = function() {
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

ZmToast.prototype._createState = function(transition) {
    var state = AjxUtil.createProxy(transition);
    var defaults = ZmToast.DEFAULT_STATE[state.type];
    for (var name in defaults) {
        if (!state[name]) {
            state[name] = defaults[name];
        }
    }
    switch (state.type) {
        case "fade-in": case "fade-out": case "fade": {
            state.value = state.start;
            break;
        }
    }
    return state;
};

// Private methods

ZmToast.prototype.__clear = function() {
    clearTimeout(this._actionId);
    clearInterval(this._actionId);
    this._actionId = -1;
};

// transition handlers

ZmToast.prototype.__position = function() {
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

ZmToast.prototype.__show = function() {
    var el = this.getHtmlElement();
    Dwt.setVisible(el, true);
    Dwt.setVisibility(el, true);
    this._funcs["next"]();
};

ZmToast.prototype.__hide = function() {
    var el = this.getHtmlElement();
    Dwt.setLocation(el, Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._funcs["next"]();
};

ZmToast.prototype.__pause = function() {
    setTimeout(this._funcs["next"], this._state.duration);
};

ZmToast.prototype.__move = function() {
    // TODO
    this._funcs["next"]();
};

ZmToast.prototype.__fade = function() {
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
