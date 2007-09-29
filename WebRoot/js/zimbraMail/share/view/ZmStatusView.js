/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
function ZmStatusView(parent, className, posStyle) {

	if (arguments.length == 0) return;
	className = className || "ZmStatus";
	DwtControl.call(this, parent, className, posStyle);
	this._setMouseEventHdlrs();
	//this._setKeyEventHdlrs();
	this.setCursor("default");
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

//	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, ZmStatusView.prototype._mouseOverListener)); 
//	this.addListener(DwtEvent.ONMOUSEOUT,  new AjxListener(this, ZmStatusView.prototype._mouseOutListener));
//	this.addListener(DwtEvent.ONMOUSEDOWN,  new AjxListener(this, ZmStatusView.prototype._mouseDownListener));
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

ZmStatusView.prototype.toString = 
function() {
	return "ZmStatusView";
}

ZmStatusView.prototype.setIconVisible =
function(icon, visible) {
	var id = this._iconIds[icon];
	if (!id) return;
	var el = document.getElementById(id);
	if (el) Dwt.setVisible(el, visible);
}

ZmStatusView.prototype._createHtml =
function() {
	this._mainContentDivId = Dwt.getNextId();	
	this._toastDivId = Dwt.getNextId();
	this._iconIds = [];
	var inboxId = this._iconIds[ZmStatusView.ICON_INBOX] = Dwt.getNextId();
	var imId = this._iconIds[ZmStatusView.ICON_IM] = Dwt.getNextId();	
	var busyId = this._iconIds[ZmStatusView.ICON_BUSY] = Dwt.getNextId();
	var blankId = Dwt.getNextId();
	this._toastContentDivId = Dwt.getNextId();
	
	var html = new AjxBuffer();

	html.append("<table border=0 cellpadding=0 cellspacing=0 style='width:100%;'> ");
	html.append("<tr>");
	html.append("<td style='width:20px;' align='center'><div id='",inboxId,"'", AjxImg.getImageHtml("Inbox"), "</div></td>");
	html.append("<td style='width:20px;' align='center'><div id='",imId,"'", AjxImg.getImageHtml("ImStartChat"), "</div></td>");	
	html.append("<td style='height:16px' align='center'><div class='ZmStatusMainText' id='"+this._mainContentDivId+"'></div></td>");
	html.append("<td style='width:20px;' align='center'><div id='", busyId, "' class='DwtWait16Icon'/></td>");
	html.append("<td style='width:20px;' align='center'><div id='", blankId, "' class='Blank_16'/></td>");	
	html.append("</tr></table>");
	html.append("<div id='", this._toastDivId, "'>");
	html.append("<table style='width:100%;height:100%;' align='center'><tr><td align=center>");
	html.append("<div class='ZmStatusToastText' id='"+this._toastContentDivId+"'></div></td></tr></table></div>");
	
	this.getHtmlElement().innerHTML = html.toString();
	var toastEl = this._getToastEl();
	toastEl.style.position = 'absolute';
}

ZmStatusView.prototype._getMainContentEl = function () {	return document.getElementById(this._mainContentDivId); };
ZmStatusView.prototype._getToastEl = function () {	return document.getElementById(this._toastDivId); };
ZmStatusView.prototype._getToastContentEl = function () {	return document.getElementById(this._toastContentDivId); };

ZmStatusView.prototype._setMainText = function(text) {
	this._getMainContentEl().innerHTML = AjxStringUtil.htmlEncode(text);
}

ZmStatusView.prototype._setToastText =
function(text) {
	 this._getToastContentEl().innerHTML = AjxStringUtil.htmlEncode(text);
}

ZmStatusView.prototype.setStatusMsg =
function(msg, level, detail, delay, transition) {
	if (!level) level = ZmStatusView.LEVEL_INFO;
	if (!delay) delay = ZmStatusView.DEFAULT[level].delay;
	if (!transition) transition = ZmStatusView.DEFAULT[level].transition;
	
	var work = {msg: msg, detail: detail, level: level, delay: delay, date: new Date(), transition: transition};
	this._updateHistory(work);
	this._statusQueue.push(work); // always push so we know one is active
	if (this._statusQueue.length == 1) this._updateStatusMsg();
};

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

ZmStatusView.getClass =
function(work) {
	switch (work.level) {
		case ZmStatusView.LEVEL_CRITICAL:
			return "ZmStatusCriticalToast";
			break;
		case ZmStatusView.LEVEL_WARNING:
			return "ZmStatusWarningToast";
			break;			
		case ZmStatusView.LEVEL_INFO:
		default:
			return "ZmStatusInfoToast";
			break;
	}
}

ZmStatusView.getImageHtml32 =
function(work) {
	switch (work.level) {
		case ZmStatusView.LEVEL_CRITICAL:
			return AjxImg.getImageHtml("Critical_32");
			break;
		case ZmStatusView.LEVEL_WARNING:
			return AjxImg.getImageHtml("Warning_32");
			break;			
		case ZmStatusView.LEVEL_INFO:
		default:
			return AjxImg.getImageHtml("Information_32");
			break;
	}
}

ZmStatusView.prototype._updateStatusMsg =
function() {
	var work = this._statusQueue[0];

	while (work.transition == ZmStatusView.TRANSITION_INVISIBLE) {
		this._statusQueue.shift(); // FIFO
		if (this._statusQueue.length == 0) return;
		work = this._statusQueue[0];
	}
	
	var toastEl = this._getToastEl();

	this._setToastText(work.msg);

	var state = {
		transition: work.transition,
		toastEl : toastEl,
		num: ZmStatusView.ANIMATION_NUM_FRAMES,
		showing: true,
		delay: work.delay,
		view: this
	};
	
	toastEl.className = ZmStatusView.getClass(work);
/*	
	switch (work.level) {
		case ZmStatusView.LEVEL_CRITICAL:
			toastEl.className = "ZmStatusCriticalToast";
			break;
		case ZmStatusView.LEVEL_WARNING:
			toastEl.className = "ZmStatusWarningToast";
			break;			
		case ZmStatusView.LEVEL_INFO:
		default:
			toastEl.className = "ZmStatusInfoToast";
			break;
	}
*/
	switch (work.transition) {
		case ZmStatusView.TRANSITION_FADE_IN:
			state.y = 0;
			state.yDelta = 0;
			state.x =  0;
			state.xDelta = 0;
			state.opacityDelta = (100 / ZmStatusView.ANIMATION_NUM_FRAMES);
			state.opacity = 0;
			break;
		case ZmStatusView.TRANSITION_SLIDE_RIGHT:
			state.y = 0;
			state.yDelta = 0;
			state.x =  -this._toastWidth;
			state.xDelta = -(this._toastWidth / ZmStatusView.ANIMATION_NUM_FRAMES);
			state.opacityDelta = 0;
			state.opacity = 100;
			break;
		case ZmStatusView.TRANSITION_SLIDE_LEFT:			
			state.y = 0;
			state.yDelta = 0;
			state.x =  this._toastWidth;
			state.xDelta = (this._toastWidth / ZmStatusView.ANIMATION_NUM_FRAMES);
			state.opacityDelta = 0;
			state.opacity = 100;			
			break;
		case ZmStatusView.TRANSITION_SLIDE_DOWN:
			state.y = -this._toastHeight,
			state.yDelta = -(this._toastHeight / ZmStatusView.ANIMATION_NUM_FRAMES),
			state.x = 0;
			state.xDelta = 0;			
			state.opacityDelta = 0;
			state.opacity = 100;
			break;
		case ZmStatusView.TRANSITION_SLIDE_UP:
		default:
			state.y = this._toastHeight,
			state.yDelta = this._toastHeight / ZmStatusView.ANIMATION_NUM_FRAMES,
			state.x = 0;
			state.xDelta = 0;			
			state.opacityDelta = 0;
			state.opacity = 100;
			break;
	}
	
	this._toastAnimation(state);
};

ZmStatusView.prototype._toastAnimation = 
function(state) {
	var delay;
		
	state.y -= state.yDelta;
	state.x -= state.xDelta;	
	state.opacity += state.opacityDelta;

	if (--state.num == 0) {
		if (state.showing) {
			state.showing = false;
			state.yDelta = -state.yDelta;
			state.xDelta = -state.xDelta;
			state.opacityDelta = -state.opacityDelta;
			state.x = 0;
			state.y = 0;
			state.opacity = 100;
			state.num = ZmStatusView.ANIMATION_NUM_FRAMES;
			delay = state.delay;
		} else {
			Dwt.setLocation(state.toastEl, Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
			if (state.opacityDelta) Dwt.setOpacity(state.toastEl, 100);
			// TODO: store in history	
			this._statusQueue.shift(); // FIFO
			if (this._statusQueue.length > 0) this._updateStatusMsg();
			return;
		}
	} else {
		delay = ZmStatusView.ANIMATION_DELAY;
	}

	if (state.opacityDelta) Dwt.setOpacity(state.toastEl, state.opacity);
	Dwt.setLocation(state.toastEl, state.x, state.y);
	var act = new AjxTimedAction(null, ZmStatusView._toastAnimationAction, state);
	AjxTimedAction.scheduleAction(act,delay);
};

ZmStatusView._toastAnimationAction =
function(state) {
	state.view._toastAnimation(state);
};

ZmStatusView.prototype._updateClock =
function() {
	var now = new Date();
	this._setMainText(AjxDateUtil.computeTimeString(now));
	AjxTimedAction.scheduleAction(this._updateClockTimedAction, (60-now.getSeconds()+2) * 1000);
};

ZmStatusView.prototype._controlListener =
function(ev) {
	if ((ev.oldWidth == ev.newWidth) && (ev.oldHeight == ev.newHeight)) return;
	// size toast
	var toastEl = this._getToastEl();
//	if (toastEl) {
		Dwt.setSize(toastEl, ev.newWidth-2, ev.newHeight-2);
//	}		
	this._toastHeight = ev.newHeight;
	this._toastWidth = ev.newWidth;
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
