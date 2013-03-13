/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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
 * This class is an IFRAME component. So far the only use it to display
 * message content, if the message has anything other than plain text.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ux.ZtIframe', {

	extend: 'Ext.Component',

	xtype: 'iframe',

	config: {
		name: '',       // name for IFRAME provided by caller
		css: '',        // optional styles for the IFRAME

		iframeEl: null  // the IFRAME Ext.dom.Element
	},

	initialize: function() {

		var iframe = this.element.createChild({
			tag: 'iframe',
			scrolling: 'no',
			frameborder: 0,
			width: '100%',
			name: this.getName()
		});

		this.setIframeEl(iframe);

		Ext.Logger.iframe('IFRAME with name ' + this.getName() + ' has DOM ID: ' + iframe.dom.id);
	},

	getDoc: function() {
		var el = this.getIframeEl();
		return el ? el.dom.contentDocument : null;
	},

	getBody: function() {
		var doc = this.getDoc();
		return doc ? doc.body : null;
	},

	getHead: function() {
		var doc = this.getDoc();
		return doc ? doc.head : null;
	},

	setContent: function(html, callback) {

		var component = this,
			doc = this.getDoc(),

			//Convert coordinates in the touch objects to be coordinates for this window
			//and not the iframe
			touchProcessor = function (touches, newTarget) {
				var i,
					oldTouch,
					numTouches = touches.length,
					newTouchList,
					newTouch,
					newTouches = [];

				for (i = 0; i < numTouches; i += 1) {
					oldTouch = touches[i];

					//definition of page, client, screen found here: http://www.w3.org/TR/2011/WD-touch-events-20110505/
					//since we're in an iframe, pageY needs to be the whole scroll of the list, not just the scoll of the iframe.

					newTouch = window.document.createTouch(
						window,
						newTarget,
						oldTouch.identifier,
						oldTouch.screenX, //pageX
						oldTouch.screenY, //pageY
						oldTouch.screenX, //screenX
						oldTouch.screenY, //screenY
						oldTouch.screenX, //clientX
						oldTouch.screenY //clientY
					);
					newTouches.push(newTouch);
				}

				return window.document.createTouchList.apply(window.document, newTouches);
			},
			touchEventListener = function (ev) {

				if (ev.srcElement.nodeName === 'A') {
					return true;
				}

				// clone the event for our window / document

				// This function is based on Apple's implementation, it may differ in other touch based browsers.
				// http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
				// Notes here: http://lists.w3.org/Archives/Public/public-webevents/2012AprJun/0004.html
				var cloneEvent = document.createEvent('TouchEvent'),
					touches,
					targetTouches,
					changedTouches,
					eventScreenX,
					eventScreenY,
					eventPageX,
					eventPageY;

				touches = touchProcessor(ev.touches, component.element.dom);
				targetTouches = touchProcessor(ev.targetTouches, component.element.dom);
				changedTouches = touchProcessor(ev.changedTouches, component.element.dom);

				if (ev.touches[0] === undefined) {
					Ext.Logger.iframe('Touch has no events in touches list');
				}


				if (ev.touches.length > 0) {
					var lastTouch = ev.touches[ev.touches.length - 1];
					eventScreenX = lastTouch.screenX;
					eventPageX = lastTouch.pageX;
					eventScreenY = lastTouch.screenY;
					eventPageY = lastTouch.pageY;
				} else {
					//touchend events have a changedTouches list, not a touches array.
					eventScreenX = ev.changedTouches[0].screenX;
					eventPageX = ev.changedTouches[0].pageX;
					eventScreenY = ev.changedTouches[0].screenY;
					eventPageY = ev.changedTouches[0].pageY;
				}

				cloneEvent.initTouchEvent(
					ev.type, //type, The type of event that occurred.
					true, //canBubble, Indicates whether an event can bubble. If true, the event can bubble; otherwise, it cannot.
					true, //cancelable, Indicates whether an event can have its default action prevented. If true, the default action can be prevented; otherwise, it cannot.
					window, //view, The view (DOM window) in which the event occurred.
					ev.detail, //detail Specifies some detail information about the event depending on the type of event.
					eventScreenX, //screenX The x-coordinate of the event’s location in screen coordinates.
					eventScreenY, //screenY The y-coordinate of the event’s location in screen coordinates.
					eventScreenX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
					eventScreenY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
					ev.ctrlKey, //ctrlKey, If true, the control key is pressed; otherwise, it is not.
					ev.altKey, //altKey If true, the alt key is pressed; otherwise, it is not.
					ev.shiftKey, //shiftKey If true, the shift key is pressed; otherwise, it is not.
					ev.metaKey, //metaKey If true, the meta key is pressed; otherwise, it is not.
					touches, //touches, A collection of Touch objects representing all touches associated with this event.
					targetTouches, //targetTouches, A collection of Touch objects representing all touches associated with this target.
					changedTouches, //changedTouches, A collection of Touch objects representing all touches that changed in this event.
					ev.scale, //scale The distance between two fingers since the start of an event as a multiplier of the initial distance. The initial value is 1.0. If less than 1.0, the gesture is pinch close (to zoom out). If greater than 1.0, the gesture is pinch open (to zoom in).
					ev.rotation //rotation The delta rotation since the start of an event, in degrees, where clockwise is positive and counter-clockwise is negative. The initial value is 0.0.
				);

				component.element.dom.dispatchEvent(cloneEvent);

				ev.preventDefault();

				return false;
			};

		html = ZCS.htmlutil.hideCidImages(html);

		if (doc) {

/*
			if (!doc.onload) {
				doc.onload = function () {
					debugger;
					alert('iframe loaded');
				}
			}
*/

			doc.open();
			doc.write(html);
			doc.close();

			var body = this.getBody(),
				head = this.getHead();

			var css = this.getCss();
			if (css) {
				var style = document.createElement('style'),
					rules = document.createTextNode(css);
				style.type = 'text/css';
				style.appendChild(rules);
				head.appendChild(style);
			}

			this.fixSize(callback);

			//Capture these touch events being sent to the iframe.
			body.addEventListener("touchstart", touchEventListener, false);
			body.addEventListener("touchend", touchEventListener, false);
			body.addEventListener("touchcancel", touchEventListener, false);
			body.addEventListener("touchleave", touchEventListener, false);
			body.addEventListener("touchmove", touchEventListener, false);

		}
	},

	/**
	 * Resizes the IFRAME to match its content. IFRAMEs do not automatically size to their content. By default, they
	 * are 150px high.
	 */
	resizeToContent: function(callback) {

		var doc = this.getDoc(),
			body = this.getBody(),
			docEl = doc.documentElement,
			contentHeight = body ? body.scrollHeight : 0,
			contentWidth = body ? body.scrollWidth : 0,
			iframe = this.getIframeEl(),
			iframeWidth = iframe.getWidth();

		if (contentWidth > iframeWidth) {
			Ext.Logger.iframe('Set iframe width to ' + contentWidth);
			iframe.setWidth(contentWidth);
		}

		var contentHeight = Math.max(docEl.scrollHeight, contentHeight),
			computedHeight = ZCS.htmlutil.getHeightFromComputedStyle(body, doc),
			childrenHeight = ZCS.htmlutil.getHeightFromChildren(body, doc);
		Ext.Logger.iframe('IFRAME content heights: ' + [contentHeight, docEl.scrollHeight, computedHeight, childrenHeight].join(' / '));

		// Since IFRAMEs are reused, childrenHeight appears to be the most reliable measure of the height
		// of the content. The others tend to persist even if we clear the IFRAME's content.
		var height = childrenHeight || computedHeight || contentHeight;

		//Only modify the dom and fire corresponding event if it's needed.
		if (iframe.getHeight() !== height) {
			Ext.Logger.iframe('Set IFRAME height to ' + height);
			iframe.setHeight(height);
			this.fireEvent('msgContentResize');
		}

		if (callback) {
			Ext.Logger.iframe('Running iframe content callback');
			callback();
		}
	},

	/**
	 * Resets the iframe's height via a timer so that the iframe has time to lay itself out.
	 */
	fixSize: function(callback) {
		Ext.defer(this.resizeToContent, 200, this, [callback]);
	}
});
