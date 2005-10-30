/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZAPL 1.1
 * 
 * The contents of this file are subject to the Zimbra AJAX Public
 * License Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra AJAX Toolkit.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmStatusView(parent, className, posStyle) {

	if (arguments.length == 0) return;
	className = className || "ZmStatus";
	DwtControl.call(this, parent, className, posStyle);
 	this._doc = this.getDocument();	
	this._createHtml();
	this.setScrollStyle(Dwt.CLIP);
 	this._statusQueue = [];
	this.addControlListener(new AjxListener(this, this._controlListener));	
	
	this._updateClockTimedAction = new AjxTimedAction(this, this._updateClock, null);
	this._updateClock();
}

ZmStatusView.prototype = new DwtControl;
ZmStatusView.prototype.constructor = ZmStatusView;

ZmStatusView.ANIMATION_DELAY = 50; // each frame of toast sliding
ZmStatusView.ANIMATION_NUM_FRAMES = 8; // each frame of toast sliding
ZmStatusView.STATUS_LIFE = 5000; // status message duration

ZmStatusView.LEVEL_INFO = 1; // informational
ZmStatusView.LEVEL_WARNING = 2; // warning
ZmStatusView.LEVEL_CRITICAL = 3; // critical
ZmStatusView.LEVEL_SILENT = 4; // add to history, but don't display

ZmStatusView.TRANSITION_SLIDE_UP = 1; 
ZmStatusView.TRANSITION_SLIDE_DOWN = 2;
ZmStatusView.TRANSITION_SLIDE_LEFT = 3;
ZmStatusView.TRANSITION_SLIDE_RIGHT = 4;
ZmStatusView.TRANSITION_FADE_IN = 5;

ZmStatusView.DEFAULT = { };
ZmStatusView.DEFAULT[ZmStatusView.LEVEL_INFO] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_UP };
ZmStatusView.DEFAULT[	ZmStatusView.LEVEL_WARNING] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_DOWN };
ZmStatusView.DEFAULT[	ZmStatusView.LEVEL_CRITICAL] = { delay: ZmStatusView.STATUS_LIFE, transition: ZmStatusView.TRANSITION_SLIDE_DOWN };

ZmStatusView.prototype.toString = 
function() {
	return "ZmStatusView";
}

ZmStatusView.prototype._createHtml =
function() {
	this._mainContentDivId = Dwt.getNextId();	
	this._toastDivId = Dwt.getNextId();	
	this._toastContentDivId = Dwt.getNextId();
	
	var html = new AjxBuffer();
	html.append("<table style='width:100%;height:100%;' align='center'><tr><td align=center>");
	html.append("<div class='ZmStatusMainText' id='"+this._mainContentDivId+"'></div></td></tr></table>");
	
	html.append("<div id='", this._toastDivId, "'>");
	html.append("<table style='width:100%;height:100%;' align='center'><tr><td align=center>");
	html.append("<div class='ZmStatusToastText' id='"+this._toastContentDivId+"'></div></td></tr></table></div>");
	
	this.getHtmlElement().innerHTML = html.toString();
	var toastEl = this._getToastEl();
	toastEl.style.position = 'absolute';
	this._setMainText("hello");
}

ZmStatusView.prototype._getMainContentEl = function () {	return Dwt.getDomObj(this._doc, this._mainContentDivId); };
ZmStatusView.prototype._getToastEl = function () {	return Dwt.getDomObj(this._doc, this._toastDivId); };
ZmStatusView.prototype._getToastContentEl = function () {	return Dwt.getDomObj(this._doc, this._toastContentDivId); };

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
	
	var state = {msg: msg, detail: detail, level: level, delay: delay, when: new Date(), transition: transition};
	this._statusQueue.push(state); // always push so we know one is active
	if (this._statusQueue.length == 1) this._updateStatusMsg();
};

ZmStatusView.prototype._updateStatusMsg =
function() {
	var work = this._statusQueue[0];
	
	var toastEl = this._getToastEl();
	this._setToastText(work.msg);

	var state = {
		toastEl : toastEl,
		num: ZmStatusView.ANIMATION_NUM_FRAMES,
		showing: true,
		delay: work.delay,
		view: this
	};
	
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

//DBG.println("state.y = "+state.y);	
//DBG.println("state.yDelta = "+state.yDelta);	
//DBG.println("state.num = "+state.num);
//DBG.println("state.showing= "+state.showing);

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
			this._statusQueue.shift(); // FIFO
			if (this._statusQueue.length > 0) this._updateStatusMsg();
			return;
		}
	} else {
		delay = ZmStatusView.ANIMATION_DELAY;
	}

	if (state.opacityDelta) Dwt.setOpacity(state.toastEl, state.opacity);
	Dwt.setLocation(state.toastEl, state.x, state.y);
	var act = new AjxTimedAction();
	act.method = ZmStatusView._toastAnimationAction;
	act.params.add(state);
	AjxTimedAction.scheduleAction(act,delay);
};

ZmStatusView._toastAnimationAction =
function(args) {
	var state = args[0];
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
