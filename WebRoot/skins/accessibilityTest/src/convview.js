(function() {
	var util = comcast.access.util;

	var LIST_ITEM_CLASS = 'A11yListItem';

	skin.classListener('ZmConvView2', function() {
		ZmConvView2.prototype.a11yRole = 'region';
		ZmConvView2.prototype.a11yFocusable = true;
	});

	skin.override.append('ZmConvView2.prototype._initialize', function() {
		var el = this.getHtmlElement();
		el.setAttribute('aria-labelledby', this._header._convSubjectId);

		util.setElementRole(this._header._subjectSpan, 'heading');
		this._header._subjectSpan.setAttribute('aria-level', 1);
	});

	skin.override.append('ZmConvDoublePaneView.prototype.setReadingPane', function() {
		// Avoid conv view expanding the main view
		this.setScrollStyle(Dwt.CLIP);
		util.mustNotScroll(this.getHtmlElement());
	});

	skin.override('ZmConvView2.prototype._renderMessages', function(conv, container) {
		util.setElementRole(container, 'list');
		this.getTabGroupMember().removeAllMembers();
		return arguments.callee.func.apply(this,arguments);
	});

	skin.override('ZmConvView2.prototype._renderMessage', function(msg, params) {
		var listitem = document.createElement('div');
		util.setElementRole(listitem, 'listitem');
		util.makeFocusable(listitem);
		listitem.className = LIST_ITEM_CLASS;
		params.parentElement.appendChild(listitem);
		params.parentElement = listitem;

		// this method is called when iterating over messages; hence,
		// the current index is the amount of messages processed
		var msgcount = this._item.msgs.size();
		var msgidx = this._msgViewList.length;

		var messages = AjxMessageFormat.format(ZmMsg.typeMessage, [msgcount]);
		var label = AjxMessageFormat.format(ZmMsg.itemCount1,
											[msgidx + 1, msgcount, messages]);
		listitem.setAttribute('aria-label', label);
		listitem.appendChild(util.createHiddenHeader(label, 2));

		arguments.callee.func.call(this, msg, params);
		this._tabGroupMember.addMember(this._msgViews[msg.id].getTabGroupMember());
	});

	skin.override.append("ZmMailMsgCapsuleView.prototype._renderMessageFooter", function(){
		var matches = Dwt.byClassName("footer", this.getHtmlElement());
		if (matches && matches.length) {
			var footer = matches[0];
			footer.id = footer.id || this._footerId;
		}
	});

	skin.override.append("ZmConvView2.prototype.reparent", function(){
		// Moving the iframe tends to kill the contents - rerender them
		for (var id in this._msgViews) {
			this._msgViews[id].dispose();
			delete this._msgViews[id];
		}
		var container = this._messagesDiv;
		if (container) {
			Dwt.removeChildren(container);
		}
		this._renderMessages(this._item, this._messagesDiv);
		
		for (var id in this._msgViews) {
			var msgView = this._msgViews[id];
			msgView._notifyZimletsNewMsg(msgView._msg);
		}
	});


	skin.override.append('ZmConvView2.prototype.reset', function() {
		// clear all the list item DIVs
		if (this._messagesDiv) {
			Dwt.removeChildren(this._messagesDiv);
		}
	});

	skin.override.append('ZmMailMsgCapsuleViewHeader.prototype.set', function() {
		var el = this.parent.getHtmlElement();
		var expanded = this._state == ZmMailMsgCapsuleViewHeader.EXPANDED;
		el.parentNode.setAttribute('aria-expanded', expanded);
	});

	skin.override("ZmConvView2.prototype.getTabGroupMember", function(){
		if (!this._tabGroupMember) {
			this._tabGroupMember = new DwtTabGroup(this.getHTMLElId());
		}
		return this._tabGroupMember;
	});

	skin.override("ZmMailMsgCapsuleView.prototype._handleMoreActionsLink", function(id, op, ev){
		var self = this,
			force = false;
		ev = DwtUiEvent.getEvent(ev);
		ev.docX = ev.clientX;
		ev.docY = ev.clientY;
	
		this._convView._setSelectedMsg(this._msg);

		setTimeout(function(){
			self._controller._listActionListener.call(self._controller, ev);
		},0);
		return true;
	});






	skin.classListener('ZmMailMsgCapsuleViewHeader', function() {
		ZmMailMsgCapsuleViewHeader.prototype.a11yRole = 'link';
		ZmMailMsgCapsuleViewHeader.prototype.a11yFocusable = true;
	});

	skin.override.append("ZmMailMsgCapsuleViewHeader.prototype.set",function(){
		util.setElementRole(this.getHtmlElement().firstChild, "application");
	});

	skin.override("ZmMailMsgCapsuleView.prototype._getTabItemContainers", function(){
		return [Dwt.byId(this._htmlElId + "__header" + ZmId.MV_HDR_TABLE),
				Dwt.byId(this._attLinksId),
				Dwt.byId(this._displayImagesId)];
	});
	skin.override("ZmMailMsgCapsuleView.prototype._getTabItemPlacardPositionContainer", function(){
		return Dwt.byId(this._attLinksId) || Dwt.byId(this._htmlElId + "__header" + ZmId.MV_HDR_TABLE);
	});
	
	skin.override("ZmMailMsgCapsuleView.prototype.getHeaderTabGroup", function(items){
		/*if (!AjxUtil.isArray(items)) {
			items = [];
		}
		
		var header = this._header;
		if (header) {
			header.getHtmlElement().setAttribute("aria-label", util.stripHTML(header.getHtmlElement().innerHTML));
			items.push(header);
		}*/

		return ZmMailMsgView.prototype.getHeaderTabGroup.call(this, items);
	});

	skin.override("ZmMailMsgCapsuleView.prototype.getFooterTabGroup", function(){
		var footer = Dwt.byId(this._footerId);
		var items = footer && Dwt.byTag("a", footer) || [];
		var tabGroup = new DwtTabGroup(this.getHTMLElId() + "_footer");
		if (items) {
			util.setElementRole(items,"link");
			util.makeFocusable(items, null, true);
			tabGroup.addMember(items);
			for (var i=0; i<items.length; i++) {
				Dwt.setHandler(items[i],DwtEvent.ONMOUSEDOWN, function(){
					appCtxt.getKeyboardMgr().grabFocus(this);
				});
			}
		}
		return tabGroup;
	});

	skin.override("ZmMailMsgCapsuleView.prototype.getScrollElement", function(){
		return this.parent._messagesDiv;
	});

	skin.override("ZmMailMsgCapsuleView.prototype._handleExpansion", function(expanded){
		if (expanded) {
			this._controller.latestExpanded = this;
			var oldHeaderTabGroupMember = this._headerTabGroupMember;
			var parent = oldHeaderTabGroupMember.getParent();
			var newHeaderTabGroupMember = this._headerTabGroupMember = this.getHeaderTabGroup();
			if (parent) {
				parent.replaceMember(oldHeaderTabGroupMember, newHeaderTabGroupMember);
			}

			var oldFooterTabGroupMember = this._footerTabGroupMember;
			var parent = oldFooterTabGroupMember.getParent();
			var newFooterTabGroupMember = this._footerTabGroupMember = this.getFooterTabGroup();
			if (parent) {
				parent.replaceMember(oldFooterTabGroupMember, newFooterTabGroupMember);
			}
		}
		appCtxt.getRootTabGroup().setFocusMember(this._header);
	});

	skin.override.append("ZmMailMsgCapsuleView.prototype._renderMessageFooter", function(){
		var oldFooterTabGroupMember = this._footerTabGroupMember;
		if (oldFooterTabGroupMember) {
			var parent = oldFooterTabGroupMember.getParent();
			if (parent) {
				var newFooterTabGroupMember = this._footerTabGroupMember = this.getFooterTabGroup();
				parent.replaceMember(oldFooterTabGroupMember, newFooterTabGroupMember);
			}
		}
	});

	skin.override.append("ZmMailMsgCapsuleView.prototype.set", function(){
		if (this._expanded) {
			this._handleExpansion(true);
		}
	});

	skin.override.append("ZmMailMsgCapsuleView.prototype._setExpansion", function(expanded){
		if (this._msgBodyCreated) {
			this._handleExpansion(expanded);
		}
	});
	skin.override.append("ZmMailMsgCapsuleView.prototype._handleReponseSetExpansion", function(){
		this._handleExpansion(true);
	});

	skin.override("ZmConvController.prototype._getDefaultFocusItem", function() {
		var msgView = (this.latestExpanded && this.latestExpanded.isExpanded()) ? this.latestExpanded : null;
		if (!msgView) {
			var children = this.getCurrentView().getChildren();
			for (var i=0; i<children.length; i++) {
				var child = children[i];
				if (util.isInstance(child, "ZmMailMsgCapsuleView") && child.isExpanded()) {
					msgView = child;
					break;
				}
			}
		}
		if (msgView) {
			var element = (msgView._iframeId && Dwt.byId(msgView._iframeId).parentNode) || (msgView._msgBodyDivId && Dwt.byId(msgView._msgBodyDivId));
			if (element) {
				return element;
			}
		}
		return this.getCurrentView();
	});

	skin.override("ZmMailMsgCapsuleViewHeader.prototype.handleKeyAction", function(){});
	skin.override("ZmMailMsgCapsuleViewHeader.prototype.handleKeyEvent", function(dwtKeyEvent){
		if (dwtKeyEvent.type == "keydown" && dwtKeyEvent.charCode == 13) {
			var msgView = this._msgView;
			var convView = msgView._convView;
			var returnValue = msgView._selectionListener(dwtKeyEvent);
			msgView._lastCollapsed = false;
			if (!msgView.isExpanded()) {
				if (convView._lastCollapsedId) {
					var lastMsgView = convView._msgViews[convView._lastCollapsedId];
					if (lastMsgView) {
						lastMsgView._lastCollapsed = false;
						lastMsgView._setHeaderClass();
					}
				}
				msgView._lastCollapsed = true;
				convView._lastCollapsedId = msgView._msgId;
			}
			msgView._setHeaderClass();
			return returnValue;
		}
		return false;
	});



	skin.override("ZmConvView2.prototype.setReply", function(){
		var replyView = this._replyView;
		arguments.callee.func.apply(this,arguments);
		if (!replyView && this._replyView) {
			var tg = this.getTabGroupMember();
			tg.addMember(this._replyView.getTabGroupMember());
			appCtxt.getKeyboardMgr().grabFocus(this._replyView._input);
		}
	});
	skin.override("ZmConvReplyView.prototype.getTabGroupMember", function(){
		if (!this._tabGroupMember) {
			this._tabGroupMember = new DwtTabGroup();
		}
		return this._tabGroupMember;
	});
	skin.override("ZmConvReplyView.prototype.set", function(){
		var initialized = this._initialized;
		arguments.callee.func.apply(this,arguments);
		if (!initialized) {
			var tg = this.getTabGroupMember();
			tg.addMember(this._input);
			Dwt.setHandler(this._input, DwtEvent.ONFOCUS, function(){
				var kbMgr = appCtxt.getKeyboardMgr();
				kbMgr.grabFocus(this);
			});
			tg.addMember(this._replyToolbar.getTabGroupMember());
		}
		appCtxt.getKeyboardMgr().grabFocus(this._input);
	});

	skin.override("ZmConvDoublePaneView.prototype.setItem", function(item, force) {
		var changed = ((item.type == ZmItem.CONV) != (this._itemView && this._itemView == this._convView));
		var r = arguments.callee.func.apply(this,arguments);
		if (changed) {
			// Make sure our created view is a member of the controller's tabgroup
			this._controller._tabGroups[this._view].addMember(this._itemView);
		}
		return r;
	});

})();
