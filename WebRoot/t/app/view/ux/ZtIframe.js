/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
			frameborder: 0,
			width: this.getWidth(),
			scrolling: 'no',
			name: this.getName()
		});

		this.element.applyStyles({
			'overflow-x': 'auto',
			'overflow-y': 'hidden',
			'-webkit-overflow-scrolling': 'touch'
		});

		this.setIframeEl(iframe);

		this.list = this.up('list');
        //<debug>
		Ext.Logger.iframe('IFRAME with name ' + this.getName() + ' has DOM ID: ' + iframe.dom.id);
        //</debug>
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
			position = component.element.getBox(),
			doc = this.getDoc(),
			theWin = window,
			frozenY = null,
			lastPageX = null,
			lastPageY = null,
			xDifferential = null,
			yDifferential = null,
			//Convert coordinates in the touch objects to be coordinates for this window
			//and not the iframe
			touchProcessor = function (touches, newTarget, changeId, freezeY) {
				var i,
					oldTouch,
					numTouches = touches.length,
					newTouchList,
					newTouch,
					pageX = undefined,
					pageY = undefined,
					newTouches = [],
					pageY,
					id;

				for (i = 0; i < numTouches; i += 1) {
					oldTouch = touches[i];

					id = changeId ? -oldTouch.identifier : oldTouch.identifier;

					if (!oldTouch.screenX) {
                        //<debug>
						Ext.Logger.iframe('Undefined screenX found.');
                        //</debug>
						if (oldTouch.pageX) {
                            //<debug>
                            Ext.Logger.iframe('PageX found');
                            //</debug>
							pageX = oldTouch.pageX + position.left;
						} else {
							pageX = undefined;
						}
					} else {
						pageX = oldTouch.screenX;
					}

					pageY = freezeY ? frozenY : oldTouch.screenY;

					//definition of page, client, screen found here: http://www.w3.org/TR/2011/WD-touch-events-20110505/
					//since we're in an iframe, pageY needs to be the whole scroll of the list, not just the scoll of the iframe.
					//The main document touch events do not have screenX, screenY, clientX, or clientY properties, so just set those as undefined all the time.
			
                    //<debug>
                    Ext.Logger.iframe('PageY' + pageY);
                    //</debug>

					newTouch = window.document.createTouch(
						window,
						newTarget,
						id,
						pageX, //pageX
						pageY, //pageY
						pageX, //oldTouch.screenX, //screenX
						pageY, //oldTouch.screenX, //screenY
						pageX, //oldTouch.clientX, //clientX
						pageY //oldTouch.clientY //clientY
					);
					newTouches.push(newTouch);
				}

				return window.document.createTouchList.apply(window.document, newTouches);
			},
			cloneEvent = function (ev, target, changeId, freezeY) {

				position = component.element.getBox();
				// This function is based on Apple's implementation, it may differ in other touch based browsers.
				// http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
				// Notes here: http://lists.w3.org/Archives/Public/public-webevents/2012AprJun/0004.html
				var clonedEvent = document.createEvent('TouchEvent'),
					touches,
					targetTouches,
					changedTouches,
					eventScreenX,
					eventScreenY,
					eventPageX,
					eventPageY;

				if (ev.touches[0] === undefined) {
                    //<debug>
					Ext.Logger.iframe('Touch has no events in touches list');
                    //</debug>
				}


				if (ev.touches.length > 0) {
					var lastTouch = ev.touches[ev.touches.length - 1];
					eventScreenX = undefined;
					eventPageX = lastTouch.screenX + position.left;
					eventScreenY = undefined;
					eventPageY = lastTouch.screenY;
				} else {
					//touchend events have a changedTouches list, not a touches array.
					eventScreenX = undefined;
					eventScreenY = undefined;
					eventPageX = 0;
					eventPageY = 0;
				}


	                    //<debug>
                Ext.Logger.iframe('PageY' + eventPageY);
                //</debug>


				if (freezeY && ev.type === 'touchstart') {
					frozenY = eventPageY;
				}

				if (freezeY) {
					eventScreenY = frozenY;
					eventPageY = frozenY;
				}

				touches = touchProcessor(ev.touches, target, changeId, freezeY);
				targetTouches = touchProcessor(ev.targetTouches, target, changeId, freezeY);
				changedTouches = touchProcessor(ev.changedTouches, target, changeId, freezeY);
				
				/*
                    The arguments are different for IOS and Android for the initTouchEvent function	

                 // IOS initTouchEvent
                 //https://developer.apple.com/library/safari/documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html#//apple_ref/javascript/instm/TouchEvent/initTouchEvent
                 event.initTouchEvent (
                 type,
                 canBubble,
                 cancelable,
                 view,
                 detail,
                 screenX,
                 screenY,
                 clientX,
                 clientY,
                 ctrlKey,
                 altKey,
                 shiftKey,
                 metaKey,
                 touches,
                 targetTouches,
                 changedTouches,
                 scale,
                 rotation
                 );


                 // Android initTouchEvent
                 // http://tech.kayac.com/archive/javascript_inittouchevent.html
                 event.initTouchEvent (
                 touches,
                 targetTouches,
                 changedTouches,
                 eventType,
                 view,
                 screenX,
                 screenY,
                 clientX,
                 clientY,
                 ctrlKey,
                 altKey,
                 shiftKey,
                 metaKey
                 );
                 */

                if(Ext.os.is.Android){
                    clonedEvent.initTouchEvent(
                        touches, //touches, A collection of Touch objects representing all touches associated with this event.
                        targetTouches, //targetTouches, A collection of Touch objects representing all touches associated with this target.
                        changedTouches, //changedTouches, A collection of Touch objects representing all touches that changed in this event.
                        ev.type, //type, The type of event that occurred.
                        theWin, //view, The view (DOM window) in which the event occurred.
                        eventPageX, //screenX The x-coordinate of the event’s location in screen coordinates.
                        eventPageY, //screenY The y-coordinate of the event’s location in screen coordinates.
                        eventPageX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
                        eventPageY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
                        ev.ctrlKey, //ctrlKey, If true, the control key is pressed; otherwise, it is not.
                        ev.altKey, //altKey If true, the alt key is pressed; otherwise, it is not.
                        ev.shiftKey, //shiftKey If true, the shift key is pressed; otherwise, it is not.
                        ev.metaKey //metaKey If true, the meta key is pressed; otherwise, it is not.
                    );
                }
                else{
                    clonedEvent.initTouchEvent(
                        ev.type, //type, The type of event that occurred.
                        true, //canBubble, Indicates whether an event can bubble. If true, the event can bubble; otherwise, it cannot.
                        true, //cancelable, Indicates whether an event can have its default action prevented. If true, the default action can be prevented; otherwise, it cannot.
                        theWin, //view, The view (DOM window) in which the event occurred.
                        ev.detail, //detail Specifies some detail information about the event depending on the type of event.
                        eventPageX, //screenX The x-coordinate of the event’s location in screen coordinates.
                        eventPageY, //screenY The y-coordinate of the event’s location in screen coordinates.
                        eventPageX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
                        eventPageY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
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
                }

				return clonedEvent;
			},
			delegateEvent = function (ev) {
				var clonedEvent;

				if (ev.srcElement.nodeName === 'A' && !Ext.fly(ev.srcElement).getAttribute("addr")) {
					return false;
				}

				if (!component.list) {
					component.list = component.up('list');
				}

				// clone the event for our window / document
				clonedEvent = cloneEvent(ev, component.element.dom);

				component.element.dom.dispatchEvent(clonedEvent);

				return true;
			},
			touchEventListener = function (ev) {
				if (!ev.isRefired) {

                    var elm = Ext.fly(ev.target),
                        idParams = ZCS.util.getIdParams(elm.dom.id) || {},
					    emailAttribute = elm.getAttribute("addr");

					if (emailAttribute && ev.type !== 'touchend' && ev.type !== 'touchmove') {
						ev.preventDefault();
	                    return false;
					} else if (emailAttribute && ev.type === 'touchend') {
						//<debug>
						Ext.Logger.iframe('Address touch ' + emailAttribute);
						//</debug>

						component.fireEvent('addressTouch', emailAttribute);
						ev.preventDefault();
						return false;
					}

                    // Invite response buttons accept/decline/tentative
                    if (elm.hasCls('zcs-invite-button') && ev.type === "touchend") {
                        component.fireEvent('inviteReply', idParams.msgId, idParams.action);
                    }

					//If the delegation occurred succesfully, do the rest of the processing.
					//It might fail if an anchor is encountered.
					if (delegateEvent(ev)) {

						//If we allow this event to bubble normally, inertial horizontal scrolling will occur.
						//However, if a Y axis scroll is allowed, then we may end up scrolling the whole page.
						//So do our best to only allow default scroll to occur if it is predominately an x-axis scrolling move.

						xDifferential = ev.pageX - lastPageX;
						yDifferential = ev.pageY - lastPageY;

						var yDifferentialIsHigh = yDifferential < -4 || yDifferential > 4;

						if (ev.type === 'touchend') {
							lastPageX = 0;
							lastPageY = 0;
							//<debug>
							Ext.Logger.iframe("Touch end");
							//</debug>
						} else {
							//<debug>
							Ext.Logger.iframe('[' + xDifferential + ',' + yDifferential+']');
							//</debug>
						}

	                    //<debug>

	                    //</debug>

						if (yDifferentialIsHigh && ev.type === 'touchmove') {
							//Cache these for the next time the handler is called.
							lastPageY = ev.pageY;
							lastPageX = ev.pageX;
							ev.preventDefault();
							return false;
						} else {
							lastPageY = ev.pageY;
							lastPageX = ev.pageX;
							ev.preventDefault();
							return false;
						}

					}

				} else {
                    //<debug>
					Ext.Logger.iframe('Handling refired event');
                    //</debug>
				}
			};

		html = ZCS.htmlutil.hideCidImages(html);

		if (doc) {

			//Force the iframe to be the width of its container so that when we compare
			//the iframe's contentWidth to its container we know if it reflowed or not.
			//Since this component is reused, the iframe width could have been reset to a non-reflowed
			//large width.
			this.getIframeEl().setWidth(this.element.getWidth() || this.getWidth());


			//Buffered handler in case the onload event fires twice (which seems to happen sometimes)
			this.getIframeEl().dom.onload = Ext.Function.createBuffered(function () {
				this.resizeToContent(callback);
			}, 50, this);

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
            //<debug>
			Ext.Logger.iframe('Set iframe width to ' + contentWidth);
            //</debug>
			iframe.setWidth(contentWidth);
		}

		var contentHeight = Math.max(docEl.scrollHeight, contentHeight),
			computedHeight = ZCS.htmlutil.getHeightFromComputedStyle(body, doc),
			childrenHeight = ZCS.htmlutil.getHeightFromChildren(body, doc);
        //<debug>
		Ext.Logger.iframe('IFRAME content heights: ' + [contentHeight, docEl.scrollHeight, computedHeight, childrenHeight].join(' / '));
        //</debug>

		// Since IFRAMEs are reused, childrenHeight appears to be the most reliable measure of the height
		// of the content. The others tend to persist even if we clear the IFRAME's content. An IFRAME has
		// a height of 150 by default, so prioritize childrenHeight if smaller.
		var height = childrenHeight;
		if (childrenHeight > 150 && computedHeight > 150 && contentHeight > 150) {
			height = childrenHeight;
		}

		//Only modify the dom and fire corresponding event if it's needed.
		// if (iframe.getHeight() !== height) {
            //<debug>
			Ext.Logger.iframe('Set IFRAME height to ' + height);
            //</debug>
			iframe.setHeight(height);
			this.setHeight(height);
			this.fireEvent('msgContentResize');
		// }

		if (callback) {
            //<debug>
			Ext.Logger.iframe('Running iframe content callback');
            //</debug>
			callback();
		}
	}
});
