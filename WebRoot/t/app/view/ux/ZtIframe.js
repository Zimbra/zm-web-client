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

		this.relayEvents(iframe, '*');
	},

	getDoc: function() {
		var el = this.getIframeEl();
		return el ? el.dom.contentDocument : null;
	},

	getBody: function() {
		var doc = this.getDoc();
		return doc ? doc.body : null;
	},

	setContent: function(html) {

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
					newTouch = window.document.createTouch(window, newTarget, 1 - oldTouch.identifier, oldTouch.screenX, oldTouch.screenY, oldTouch.screenX, oldTouch.screenY);
					newTouches.push(newTouch);
				}

				return window.document.createTouchList.apply(window.document, newTouches);
			},
			touchEventListener = function (ev) {

				// clone the event for our window / document

				// This function is based on Apple's implementation, it may differ in other touch based browsers.
				// http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
				// Notes here: http://lists.w3.org/Archives/Public/public-webevents/2012AprJun/0004.html
				var cloneEvent = document.createEvent('TouchEvent'),
					touches,
					targetTouches,
					changedTouches;

				touches = touchProcessor(ev.touches, component.element.dom);
				targetTouches = touchProcessor(ev.targetTouches, component.element.dom);
				changedTouches = touchProcessor(ev.changedTouches, component.element.dom);

				cloneEvent.initTouchEvent(
					ev.type, //type, The type of event that occurred.
					true, //canBubble, Indicates whether an event can bubble. If true, the event can bubble; otherwise, it cannot.
					true, //cancelable, Indicates whether an event can have its default action prevented. If true, the default action can be prevented; otherwise, it cannot.
					window, //view, The view (DOM window) in which the event occurred.
					ev.detail, //detail Specifies some detail information about the event depending on the type of event.
					ev.pageX, //screenX The x-coordinate of the event’s location in screen coordinates.
					ev.pageY, //screenY The y-coordinate of the event’s location in screen coordinates.
					ev.pageX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
					ev.pageY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
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

		if (doc) {
			doc.open();
			doc.write(html);
			doc.close();
			body = this.getBody();
			body.style.margin = '0';
			body.style.height = 'auto';
			this.fixSize();

			//Capture these touch events being sent to the iframe.
			body.addEventListener("touchstart", touchEventListener, true);
			body.addEventListener("touchend", touchEventListener, true);
			body.addEventListener("touchcancel", touchEventListener, true);
			body.addEventListener("touchleave", touchEventListener, true);
			body.addEventListener("touchmove", touchEventListener, true);

		}
	},

	/**
	 * Resizes the IFRAME to match its content. IFRAMEs do not automatically size to their content. By default, they
	 * are 150px high.
	 */
	resizeToContent: function() {

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
			computedHeight = ZCS.util.html.getHeightFromComputedStyle(body, doc),
			childrenHeight = ZCS.util.html.getHeightFromChildren(body, doc);
		Ext.Logger.iframe('IFRAME content heights: ' + [contentHeight, docEl.scrollHeight, computedHeight, childrenHeight].join(' / '));

		// Since IFRAMEs are reused, childrenHeight appears to be the most reliable measure of the height
		// of the content. The others tend to persist even if we clear the IFRAME's content.
		var height = childrenHeight || computedHeight || contentHeight;
		Ext.Logger.iframe('Set IFRAME height to ' + height);
		iframe.setHeight(height);
	},

	/**
	 * Resets the iframe's height via a timer so that the iframe has time to lay itself out.
	 */
	fixSize: function() {
		Ext.defer(this.resizeToContent, 200, this);
	}
});
