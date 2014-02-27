(function() {
	var util = comcast.access.util;

	skin.classListener('ZmMailMsgView', function() {
		ZmMailMsgView.prototype.a11yRole = 'article';
		ZmMailMsgView.prototype.a11yFocusable = true;
	});

	skin.override.append('ZmMailMsgView.prototype._renderMessageHeader', function(msg){
		var el = this.getHtmlElement();
		el.setAttribute('aria-label', ZmMsg.message);
		el.appendChild(util.createHiddenHeader(ZmMsg.message, 1));

		for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
			var id = ZmMailMsgView._getShowMoreId(this._htmlElId, ZmMailMsg.ADDRS[i]) + "_link",
				el = Dwt.byId(id);
			if (el) {
				el.href = document.location.hash || "#";
			}
		}
	});

	skin.override.append("ZmMailMsgView.prototype.reparent", function(){
		// Moving the iframe tends to kill the contents - rerender them
		var container = this._getContainer();
		if (container) {
			Dwt.removeChildren(container);
		}
		this._renderMessage(this._msg, container);
		this._notifyZimletsNewMsg(this._msg);
	});

	/*skin.override("ZmMailMsgView.prototype.getTabGroupMember", function(){
		if (!this._tabGroupMember) {
			this._tabGroupMember = new DwtTabGroup("ZmMailMsgView");
		}
		return this._tabGroupMember;
	});*/



	// We have two options for achieving screen reader integration of the message content:

	// Method #1 envelops the iframe contents in a container element. When the iframe gest focused,
	// this container also gets focused within the frame page
	// This method works with Chrome, but not elsewhere

	// Method #2 creates a hidden element containing a copy of the mail contents (stripped for HTML tags)
	// This element is then referenced by the tabgroup member element by aria-labelledby
	// This method works in all browsers

	// Envelop the message body (inside the iframe) in a div container, which gets focused when the iframe gets focus
	var useMessageBodyContainer = false; // Don't use this right now; it works only in Chrome

	// Let the frame parent be our tab group member, that gets focused
	var useFrameContainerAsTabMember = true; // Always use this

	// Hold a stripped copy of the message in a hidden container, and point the tab member to it by aria-labelledby
	var useShadowLabel = !AjxEnv.isIE; // Non-IE browsers will read the shadow label in JAWS

	// Always render messages inline instead of in an iframe.
	var forceNoIframe = AjxEnv.isIE; // IE needs to embed the message in order to read it

	skin.override("ZmMailMsgView.prototype._getMessageTabMember", function(){
		return (useFrameContainerAsTabMember ? (this.getIframe() && this.getIframe().parentNode) : this.getIframe()) ||
			(this._msgBodyDivId && Dwt.byId(this._msgBodyDivId));
	});

	/** commented out because useMessageBodyContainer is always false
	if (useMessageBodyContainer) {
		var IFRAME_BODY_CONTAINER_ID = "__messagebody__";
		skin.override("DwtIframe.prototype._createFrame", function(html) {
			var bodyStartTag = /<body[^>]*>/i.exec(html);
			var bodyEndTag = /<\/body>/i.exec(html);
			if (bodyStartTag && bodyEndTag) {
				var startIndex = html.indexOf(bodyStartTag[0]);
				var endIndex = html.indexOf(bodyEndTag[0]);
				if (startIndex != -1 && endIndex != -1) {
					startIndex += bodyStartTag[0].length;
					html = html.substring(0, startIndex) + '<div id="'+IFRAME_BODY_CONTAINER_ID+'" tabIndex="0">' + html.substring(startIndex, endIndex) + '</div>' + html.substring(endIndex);
				}
			}
			return arguments.callee.func.call(this, html);
		});
	}**/

	// JAWS in IE will not read the contents if we're in an iframe
	if (forceNoIframe) {
		skin.override(["ZmMailMsgCapsuleView.prototype._useIframe","ZmMailMsgView.prototype._useIframe"],function() {
			return false;
		});
	}

	if (useShadowLabel) {
		skin.override.append("ZmMailMsgView.prototype.reset", function(){
			delete this.__shadowLabel;
		});

		skin.override.append("ZmMailMsgView.prototype._displayContent", function(params){
			if (!this.__shadowLabel) {
				var html = params.html || this._cleanedHtml;
				html = html.replace(/<style>(.|\n|\r)*<\/style>/ig, "");
				html = util.stripHTML(html);
				var shadowLabel = this.__shadowLabel = util.createHiddenElement("div");
				shadowLabel.id = Dwt.getNextId();
				shadowLabel.innerHTML = html;
				this.getHtmlElement().appendChild(shadowLabel);
				this._getMessageTabMember().setAttribute("aria-labelledby",shadowLabel.id);
			}
		});
	}


	skin.override(["ZmMailMsgView.prototype._renderMessage","ZmMailMsgCapsuleView.prototype._renderMessage"], function(){
		var tg = this.getTabGroupMember();
		tg.removeAllMembers();

		this.placardTabGroup = new DwtTabGroup(this.getHTMLElId() + "_placardContainer");

		var bodyTabGroupMember = this._bodyTabGroupMember = new DwtTabGroup("ZmMailMsgView_body");
		var footerTabGroupMember = this._footerTabGroupMember = new DwtTabGroup("ZmMailMsgView_footer");

		// Call original, rendering the elements and letting zimlets do their work
		arguments.callee.func.apply(this,arguments);

		var self = this;

		// Let mouse events in frame propagate up to this document
		if (this._usingIframe) {
			var frame = this.getIframe(),
				doc = this.getDocument();
			if (doc && doc.body) {
				Dwt.setHandler(doc.body, DwtEvent.ONMOUSEDOWN, function(ev) {
					if (document.createEvent) {
						var nev = document.createEvent("MouseEvent");
						nev.initMouseEvent("mousedown", true, true, window, 
							 ev.detail, ev.screenX, ev.screenY, ev.clientX, ev.clientY, 
							 ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, 
							 ev.button, ev.relatedTarget); 
						frame.dispatchEvent(nev);
					}

					// For unknown reasons, a blur event comes out of nowhere and removes our focus. Re-focus after everything else has transpired
					setTimeout(function(){
						if (AjxEnv.isIE) {
							// IE gets a blur event after the focus above; force set the _hasFocus attribute
							setTimeout(function(){
								self._hasFocus = true;
							},0);
						}
					},0);
				});
			}
			if (frame) {
				//Dwt.setHandler(frame, DwtEvent.ONFOCUS, function(){self.focus();});
				frame.setAttribute("title", ZmMsg.messageFrameTitle);
				frame.setAttribute("aria-label", ZmMsg.messageFrameTitle);
				
				var tabMember = this._getMessageTabMember();
				Dwt.setHandler(frame, DwtEvent.ONFOCUS, function(){
					setTimeout(function(){
						if (document.activeElement !== tabMember) {
							util.focus(tabMember);
						}
					},0);
				});
				
			}
		}

		this._headerTabGroupMember = this.getHeaderTabGroup();
		this._footerTabGroupMember = this.getFooterTabGroup();
		tg.addMember(this._headerTabGroupMember);
		tg.addMember(bodyTabGroupMember);
		tg.addMember(this._footerTabGroupMember);


		var closeButton = Dwt.byId(this._displayImagesId+"_close");
		if (closeButton) {
			closeButton.setAttribute("aria-label", ZmMsg.closeImageNotification);
		}
	});

	skin.override.append("ZmMailMsgView.prototype._completeMessageBody", function(callback) {
		// Set up body tabgroup

		var element = this._getMessageTabMember();

		if (element) {
			// Let our message iframe be focusable, so we can tab to it
			element.a11yFocusable = true;
			util.makeFocusable(element);

			/*if (AjxEnv.isChrome) {
				element.setAttribute("role","document");
			}*/

			this._bodyTabGroupMember.addMember(element);

			var doc = (this.getIframe() && (this.getIframe().contentDocument || this.getIframe().contentWindow.document));
			if (doc) {
				util.addStylesheet("/skins/accessibilityTest/src/tab-selection" + (AjxEnv.isIE?"-ie":"") + ".css", doc);
			}
		}
		if (this._usingIframe) {
			/** commented out because useMessageBodyContainer is always false
			if (useMessageBodyContainer) {
				var frame = this.getIframe();
				element.onTabFocus = function(){
					var idoc = frame.contentDocument,
						container = idoc.getElementById(IFRAME_BODY_CONTAINER_ID);
					util.focus(container);
					setTimeout(function(){
						if (idoc.activeElement !== container) {
							util.focus(container);
						}
					},0);
				};
			}
			**/
		} else {
			// Be sure to grab focus for our message container, or focus will revert to whatever is in appCtxt.getKeyboardMgr().__focusObj when the container is clicked
			var bodyDiv = this._containerEl || (this._msgBodyDivId && Dwt.byId(this._msgBodyDivId));
			Dwt.setHandler(bodyDiv, DwtEvent.ONMOUSEDOWN, function(){
				appCtxt.getKeyboardMgr().grabFocus(this);
				return true;
			});

		}
	});

	skin.override.append("ZmMailMsgView.prototype._findMailMsgObjects", function(){
		var parent = this._usingIframe ?
			(this.getIframe() && (this.getIframe().contentDocument || this.getIframe().contentWindow.document)) :
			(this._containerEl || (this._msgBodyDivId && Dwt.byId(this._msgBodyDivId)));

		if (parent) {
			if (AjxEnv.isIE && parent.nodeName==="#document") {
				parent = parent.body;
			}

			var items = Dwt.byTag("a", parent).concat(Dwt.byClassName("Object", parent));
				items = skin.sortElements(util.pruneObjects(items));
			util.makeFocusable(items);

			this._bodyTabGroupMember.removeAllMembers();

			var element = this._getMessageTabMember();
			
			if (element) {
				this._bodyTabGroupMember.addMember(element);
			}
			this._bodyTabGroupMember.addMember(items);

			var objectManager = this._objectManager;
			for (var i=0; i<items.length; i++) {
				var el = items[i];
				if (el && el.nodeName!=="A") {
					var w = window.parent || window;
					util.setElementRole(el, "link");

					Dwt.setHandler(el, DwtEvent.ONKEYDOWN, function(ev){
						ev = DwtUiEvent.getEvent(ev, this);
						if (ev.keyCode == 13) {
							var object = objectManager._objects[this.id];
							if (object) {
								if (objectManager._selectCallback) {
									objectManager._selectCallback.run();
								}
								object.handler.selected(object.object, this, ev, object.context);
							}
						}
					});
				}
			}
		}
	});




	skin.override("ZmMailMsgView.prototype._getTabItemContainers", function(){
		return [Dwt.byId(this._htmlElId + ZmId.MV_HDR_TABLE),
				Dwt.byId(this._displayImagesId)];
	});
	skin.override("ZmMailMsgView.prototype._getTabItemPlacardPositionContainer", function(){
		return Dwt.byId(this._htmlElId + ZmId.MV_HDR_TABLE);
	});

	skin.override("ZmMailMsgView.prototype.getHeaderTabGroup", function(items){
		if (!AjxUtil.isArray(items)) {
			items = [];
		}

		var headerElement = this._headerElement || this._header.getHtmlElement();
		if (headerElement) {
			headerElement.setAttribute("aria-label", util.stripHTML(headerElement.innerHTML));
			if (this._header) {
				items.push(this._header);
			}
			headerElement.a11yFocusable = true;
			util.makeFocusable(headerElement);
		}

		//var containers = [Dwt.byId(this._htmlElId + ZmId.MV_HDR_TABLE),
		//					Dwt.byId(this._displayImagesId)];
		var containers = this._getTabItemContainers();

		//var placardPos = Dwt.byId(this._htmlElId + ZmId.MV_HDR_TABLE),
		var placardPos = this._getTabItemPlacardPositionContainer();
		var placardTabGroupPosition;

		var members = [];
		for (var i=0; i<containers.length; i++) {
			var container = containers[i];
			if (container) {
				members = members.concat(Dwt.byClassName("Object",container), Dwt.byTag("a", container));
				if (container === placardPos) {
					placardTabGroupPosition = members[members.length-1];
				}
			}
		}

		var closeButton = Dwt.byId(this._displayImagesId+"_close");
		if (closeButton) {
			members.push(closeButton);
		}

		var good = [];
		for (var i=0; i<members.length; i++) {
			var thisMember = members[i],
				ok = true;
			for (var j=0; j<members.length; j++) {
				var otherMember = members[j];
				if (i!=j && Dwt.contains(thisMember, otherMember) && !(i<j && thisMember === otherMember)) {
					ok = false;
					break;
				}
			}
			if (ok) {
				if (thisMember.tagName !== "A") {
					util.setElementRole(thisMember,"link");
				}
				good.push(thisMember);
			}
		}
		items = items.concat(skin.sortElements(good));
		if (placardTabGroupPosition) {
			var pidx = AjxUtil.indexOf(items, placardTabGroupPosition);
			if (pidx != -1) {
				AjxUtil.arrayAdd(items, this.placardTabGroup, pidx+1);
			}
		}

		var tabGroup = new DwtTabGroup(this.getHTMLElId() + "_header");
		util.makeFocusable(items, null, true);
		tabGroup.addMember(items);
		return tabGroup;
	});

	skin.override("ZmMailMsgView.prototype.getFooterTabGroup", function(){
		return new DwtTabGroup(this.getHTMLElId() + "_footer");
	});

	skin.override("ZmMailMsgView.prototype.getKeyMapName", function(){
		return "mail";
	});

	skin.override("ZmMailMsgView.prototype.handleKeyAction", function(actionCode, ev){
		switch (actionCode) {
			case "ScrollUp":
				this.scroll(-53);
				return true;
			case "ScrollDown":
				this.scroll(53);
				return true;
		}
		return false;
	});

	skin.override("ZmMailMsgView.prototype.scroll", function(delta){
		if (delta && AjxUtil.isNumber(delta)) {
			var div = this.getScrollElement();
			div.scrollTop = Math.min(div.scrollHeight - div.offsetHeight, Math.max(0, div.scrollTop + delta));
		}
	});

	skin.override("ZmMailMsgView.prototype.getScrollElement", function(){
		return this.getHtmlElement();
	});

	skin.override("ZmMsgController.prototype._getDefaultFocusItem", function(){
		var view = this._view[this._currentViewId];
		return view._getMessageTabMember();
	});

	skin.override("ZmMsgController.prototype._saveFocus", function(){
		// Do nothing
	});
	
})();
