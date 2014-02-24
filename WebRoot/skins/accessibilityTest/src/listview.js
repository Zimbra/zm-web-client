(function(){
	var util = comcast.access.util;

	skin.classListener('DwtListView', function(){
		DwtListView.prototype.a11yRole = 'tree';
		DwtListView.prototype.a11yItemRole = 'treeitem';
	});

	skin.classListener('ZmConvListView', function() {
		ZmConvListView.prototype.a11yRole = 'tree';
		ZmConvListView.prototype.a11yItemRole = 'treeitem';
		ZmConvListView.prototype.a11yTitle = ZmMsg.conversationList;
		ZmConvListView.prototype.a11yTitleEmpty = ZmMsg.conversationListEmpty;

		// all ZmConvListView::handleKeyAction() does is suppress the
		// DBLCLICK action to make Enter work -- ironically, that
		// breaks the Enter key for us...
		delete ZmConvListView.prototype.handleKeyAction;
	});

	skin.classListener('ZmMailListView', function() {
		ZmMailListView.prototype.a11yTitle = ZmMsg.messageList;
		ZmMailListView.prototype.a11yTitleEmpty = ZmMsg.messageListEmpty;
	});

	skin.classListener('DwtChooserListView', function() {
		DwtChooserListView.prototype.a11yRole = 'listbox';
		DwtChooserListView.prototype.a11yItemRole = 'option';
	});

	skin.classListener('ZmContactChooserSourceListView', function(){
		ZmContactChooserSourceListView.prototype.a11yTitle =
			ZmMsg.contactSourceListTitle;
	});

	skin.classListener('ZmContactChooserTargetListView', function(){
		ZmContactChooserTargetListView.prototype.a11yTitle =
			ZmMsg.contactTargetListTitle;
	});

	skin.override("DwtListView.prototype._focusByMouseDownEvent", function(ev) {
		// Do nothing, we'll focus manually later. If we focus now, the list will jump to the top before an item is selected
	});

	skin.override("DwtListView.prototype._itemClicked", function(clickedEl, ev){

		// Let right click on an unselected item select it, deselecting other items
		var bContained = this._selectedItems.contains(clickedEl);
		arguments.callee.func.apply(this,arguments);
		if ((!ev.shiftKey && !ev.ctrlKey) || !this.multiSelectEnabled && ev.button == DwtMouseEvent.RIGHT && !bContained && this._evtMgr.isListenerRegistered(DwtEvent.ACTION))	{
			this.setSelection(this.getItemFromElement(this._rightSelItem));
		}

		// Do the manual focusing here
		if (util.isVisible(this)) {
			appCtxt.getKeyboardMgr().grabFocus(this);
		}
	});

	function getitemstring(item) {
		var type = item.type;

		if (type == ZmItem.CONV && item.msgIds.length == 1) {
			type = ZmItem.MSG;
		} else if (util.isInstance(item, "AjxEmailAddress")) {
			return (item.getDispName() || item.getName()) + " " + item.getAddress();
		}
		return ZmMsg[ZmItem.MSG_KEY[type]] || "";
	}

	function updateExpansion(clv, item, button) {
		if (!button) {
			/* no-op */
		} else if (clv._isExpandable(item)) {
			var expanded = Boolean(clv.isExpanded(item));
			var glyph = expanded ?
				util.DINGBATS.TRIANGLE.DOWN : util.DINGBATS.TRIANGLE.RIGHT;

			util.setElementRole(button, 'button');
			button.setAttribute('aria-expanded', Boolean(expanded));
			util.setFallbackText(button, glyph, getitemstring(item));
		} else {
			util.setFallbackText(button, '', getitemstring(item));
			button.setAttribute('aria-disabled', true);
		}
	}

	function clearSortedColumn(columnid) {
		if (!columnid)
			columnid = this._currentColId

		var sortedcol = document.getElementById(columnid);

		if (sortedcol) {
			var headercol = this._headerIdHash[columnid];

			sortedcol.setAttribute('aria-sort', 'none');

			var arrowid = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ARROW,
												 this._view, headercol._field);
			var arrowel = Dwt.byId(arrowid);

			if (arrowel) {
				util.setFallbackText(arrowel, '');
			}
		}
	}

	function updateSortedColumn(columnid) {
		if (!columnid)
			columnid = this._currentColId

		var sortedcol = document.getElementById(columnid);

		if (sortedcol) {
			var order = this._bSortAsc ? "ascending" : "descending";
			sortedcol.setAttribute('aria-sort', order);

			var headercol = this._headerIdHash[columnid];

			var arrowid = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ARROW,
												 this._view, headercol._field);
			var arrowel = Dwt.byId(arrowid);

			if (arrowel) {
				var arrowglyph = this._bSortAsc ?
					util.DINGBATS.TRIANGLE.UP : util.DINGBATS.TRIANGLE.DOWN;
				util.setFallbackText(arrowel, arrowglyph, '');
			}
		}
	}

	function processItemFields(item, element) {
		var ctrl = this.getController();

		if (!element) {
			element = this._getElFromItem(item);
		}

		if (!element && item.isZmConv) {
			if (item.msgIds.length == 1) {
				item = item.getFirstHotMsg();
			}
			element = this._getElFromItem(item);
		}

		if (!element) {
			window.console && console.warn('no element found for item %s:',
										   this._getItemId(item), item);
			return;
		}

		var list = this.getList();
		if (list) {
			var hasmore = this.getList()._hasMore;
			var total = (hasmore === false) ? this.size() : ctrl._getNumTotal();
			var index = list.indexOf(item);
			var level = 1;

			if (index < 0) {
				var conv = appCtxt.getById(item.cid);
				if (conv) {
					level = 2;
					index = conv.msgs.indexOf(item);
				}
			}

			if (total) {
				element.setAttribute('aria-setsize', total);
			}

			element.setAttribute('aria-posinset', index + 1);
			element.setAttribute('aria-level', level);
		}

		var labels = {};

		for (var field in this._headerInit) {
			var label = null;
			var elem = Dwt.byId(this._getFieldId(item, field), element);

			var pre = this._headerInit[field].precondition;

			if (pre && !appCtxt.get(pre)) {
				continue;
			}

			switch (field) {
				case ZmItem.F_SELECTION: {
					if (elem) {
						fixCheckboxItem(elem);
					}

					break;
				}

				case ZmItem.F_READ: {
					if (elem && elem.nodeType==1) {
						var msg = item.isUnread ? ZmMsg.unread : ZmMsg.read;
						util.setFallbackText(elem, msg);
					}

					break;
				}

				case ZmItem.F_FLAG: {
					if (elem) {
						fixCheckboxItem(elem, item.isFlagged);
					}

					if (item.isFlagged) {
						label = ZmMsg.flagged;
					}
					break;
				}

				case ZmItem.F_ATTACHMENT: {
					if (elem) {
						if (item.hasAttach) {
							util.setFallbackText(elem, ZmMsg.hasAttachment);
						} else {
							util.setFallbackText(elem, '', ZmMsg.noAttachment);
						}
					}

					if (item.hasAttach) {
						label = ZmMsg.hasAttachment;
					}

					break;
				}

				case ZmItem.F_EXPAND: {
					if (elem)
						updateExpansion(this, item, elem);

					if (this.isExpanded(item)) {
						label = ZmMsg.expanded;
					}

					break;
				}

				case ZmItem.F_STATUS: {
					var statustext = item.getStatusTooltip();
					var itemtext = getitemstring(item);

					if (elem) {
						util.setFallbackText(elem,
											 statustext,
											 statustext || itemtext);
					}

					if (statustext) {
						var statusitems = statustext.split(", ");
						AjxUtil.arrayRemove(statusitems, ZmMsg.read);
						label = AjxUtil.collapseList(statusitems).join(", ");
					}

					break;
				}

				case ZmItem.F_SUBJECT: {
					var fragmentid = this._getFieldId(item, ZmItem.F_FRAGMENT);
					var fragmentelem = Dwt.byId(fragmentid, element);

					if (fragmentelem) {
						fragmentelem.setAttribute('aria-hidden', true);
					}

					label = item.subject || ZmMsg.noSubject;

					break;
				}

				case ZmItem.F_PRIORITY: {
					var priority;

					if (item.isLowPriority) {
						if (elem) {
							util.setFallbackText(elem, ZmMsg.low);
						}
						label = ZmMsg.lowPriority;
					} else if (item.isHighPriority) {
						if (elem) {
							util.setFallbackText(elem, ZmMsg.high);
						}
						label = ZmMsg.highPriority;
					}

					break;
				}

				case ZmItem.F_TAG: {
					if (item.tags.length > 0) {
						tags = item.tags.join(' & ');
						if (elem) {
							util.setFallbackText(elem, tags);
						}
						label = AjxMessageFormat.format(ZmMsg.taggedAs, [tags]);
					} else if (elem) {
						util.setFallbackText(elem, '', ZmMsg.none);
					}

					break;
				}

				case ZmItem.F_DATE: {
					label = AjxDateUtil.computeDateStr(new Date(), item.date);

					break;
				}

				case ZmItem.F_FROM: {
					var addrtype = this._isOutboundFolder() ?
						AjxEmailAddress.TO : AjxEmailAddress.FROM;
					var participants = item.getAddresses(addrtype) || item.participants;

					if (participants && participants.size()) {
						// add the three first recipients
						var recp = [];
						participants.slice(0, 3).foreach(function(item) {
							recp.push(item.toString(true, true));
						});
						label = AjxUtil.collapseList(recp).join(", ");
					} else {
						label = ZmMsg.noRecipientsPlain;
					}

					break;
				}
			}
			if (label) {
				labels[field] = label;
			}
		}

		if (util.isInstance(item, "ZmConv")) {
			labels["conv"] = ZmMsg.conversation;
		}

		element.setAttribute('aria-label', AjxUtil.collapseList([
			labels[ZmItem.F_EXPAND],
			labels[ZmItem.F_FLAG],
			labels[ZmItem.F_TAG],
			labels[ZmItem.F_STATUS],
			labels[ZmItem.F_PRIORITY],
			labels[ZmItem.F_ATTACHMENT],
			labels[ZmItem.F_SUBJECT],
			labels["conv"],
			labels[ZmItem.F_FROM],
			labels[ZmItem.F_DATE]
		]).join(', '));
	}

	function fixCheckboxItem(cbelem, ischecked)
	{
		if (util.setElementRole(cbelem, 'checkbox')) {
			if (cbelem.tabIndex !== 0) {
				util.makeFocusable(cbelem);
			}

			if (ischecked === undefined) {
				ischecked =
					!Boolean(Dwt.hasClass(cbelem, ZmListView.UNCHECKED_CLASS));
			}

			cbelem.setAttribute('aria-checked', ischecked);

			// do screen readers other than VoiceOver read out checkboxes?
			var hiddentext =
				(AjxEnv.isMac ? '' :
				 (ischecked ? ZmMsg.checked : ZmMsg.unchecked));

			// add a Unicode ballot box glyph
			var hctext = ischecked ?
				util.DINGBATS.BALLOT.CROSSED : util.DINGBATS.BALLOT.EMPTY;

			util.setFallbackText(cbelem, hctext, hiddentext);
		}
	}

	// redirect clicks on high contrast fallbacks to their parent node
	skin.override('ZmListView.prototype._itemClicked', function(el, ev) {
		if (el && Dwt.hasClass(el, util.HIGH_CONTRAST_FALLBACK_CLASS_NAME)) {
			arguments[0] = el = el.parentNode;
		}

		if (ev && ev.target &&
			Dwt.hasClass(ev.target, util.HIGH_CONTRAST_FALLBACK_CLASS_NAME)) {
			ev.target = ev.target.parentNode;
		}

		return arguments.callee.func.apply(this, arguments);
	});

	skin.override.append('DwtListView.prototype._renderList', function() {
		var maintbl = this.getHtmlElement().firstChild;

		if (maintbl && maintbl.tagName === 'TABLE') {
			util.setElementRole(maintbl, 'presentation');

			// work around a bug in JAWS where the above role of
			// presentation isn't correctly passed down to the
			// individual cells in direct violation of the standards
			// (code like it's 1999! FTW!)
			for (var i = 0; i < maintbl.rows.length; i++) {
				var row = maintbl.rows[i];

				for (var j = 0; j < row.cells.length; j++) {
					var cell = row.cells[j];

					util.setElementRole(cell, 'presentation');
				}
			}

		} else if (window.console) {
			console.warn("expected TABLE as first child of a list view, not %s",
						 maintbl);
		}
	});

	skin.override.append('DwtChooserListView.prototype._renderList', function() {
		this.getHtmlElement().setAttribute('aria-multiselectable', !!this.multiSelectEnabled);
	});

	skin.override('ZmListView.prototype.createHeaderHtml', function(defaultColumnSort) {
		if (!this._a11ySelectionListener) {
			// this is not strictly related to the header, but we need
			// it called at least once for each list view
			this._a11ySelectionListener = new AjxListener(this, function(ev) {
				var item = ev.item;

				if (item) {
					processItemFields.call(this, item);

				} else if (ev.detail == DwtListView.ITEM_SELECTED) {
					this._selectedItems.map(function(el) {
						processItemFields.call(this, this.getItemFromElement(el), el);
					}, this);
				} else {
					this._list.map(processItemFields, this);
				}
			});
			this.addSelectionListener(this._a11ySelectionListener);
		}

		function isCheckboxHeader(field) {
			return (field === ZmItem.F_SELECTION ||
					field === ZmItem.F_READ);
		};

		var centerelems = this._listColDiv.getElementsByTagName('center');
		while (centerelems.length) {
			var elem = centerelems[0];

			var parent = elem.parentNode;

			while (elem.lastChild)
				parent.insertBefore(elem.lastChild, elem);
			parent.removeChild(elem);
		}

		// changes for high contrast mode: don't waste space on the
		// icon and always provide a label
		if (this._headerList && util.isHighContrastMode()) {
			for (var i = 0; i < this._headerList.length; i++) {
				var col = this._headerList[i];

				if (!col._label)
					col._label = col._name;

				// "Read / Unread" is too long
				if (col._field === ZmItem.F_READ)
					col._label = ZmMsg.read;

				// suppress non-checkbox icons
				if (util.isHighContrastMode() && !isCheckboxHeader(col._field))
					delete col._iconInfo;

				// fix widths
				if (col._width == ZmListView.COL_WIDTH_ICON ||
					col._width == ZmListView.COL_WIDTH_NARROW_ICON) {
					var key = 'COLUMN_WIDTH_HC_' + col._field.toUpperCase();
					if (key in ZmMsg)
						col._width = Number(ZmMsg[key]);
				}
			}
		}

		// call super
		var r = arguments.callee.func.apply(this, arguments);

		if (!this._headerList)
			return r;

		var headertblid =
			DwtId.getListViewHdrId(DwtId.WIDGET_HDR_TABLE,
								   this._view)
		var headertbl = Dwt.byId(headertblid);

		if (!headertbl) {
			if (window.console)
				console.warn("%s don't have a header table!", this);
		} else {
			util.setElementRole(headertbl, 'presentation');

			for (var i = 0, cell;
				 cell = headertbl.rows[0].cells[i]; i++) {
				var col = this._headerList[i];
				var field = col._field;

				util.setElementRole(cell, 'button');
				util.makeFocusable(cell);

				if (col._sortable) {
					clearSortedColumn.call(this, cell.id);
				}

				var labelid = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL,
													 this._view, field);
				var label = Dwt.byId(labelid);

				if (!label) {
					var name = col._name;
					label = util.createHiddenTextNode(name);
					label.id = labelid;
					cell.appendChild(label);
				}

				if (isCheckboxHeader(field)) {
					var iconid = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON,
														this._view, field);
					fixCheckboxItem(Dwt.byId(iconid));
				}

				if (cell.firstChild &&
					cell.firstChild.tagName == 'DIV') {
					var table = cell.firstChild.firstChild;

					if (table && table.tagName == 'TABLE')
						util.setElementRole(table,
											'presentation');
				}

				var sashid = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_SASH,
													this._view, field);
				var sash = Dwt.byId(sashid);

				if (sash && sash.tagName === 'TABLE') {
					util.setElementRole(sash, 'presentation');
					sash.setAttribute('aria-hidden', true);
				}
			}
		}

		updateSortedColumn.call(this);

		return r;
	});

	
	skin.override('DwtListView.prototype._createItemHtml', function(item, params, asHtml, count) {
		var self = this;
		var r = arguments.callee.func.apply(this, arguments);

		var div = document.createElement('div');
		var focusableIds = [];

		if (asHtml) {
			div.innerHTML = r;
		} else {
			div.appendChild(r);
		}

		var itemel = div.firstChild;

		util.setElementRole(itemel, this.a11yItemRole);
		itemel.tabIndex = 0;
		focusableIds.push(util.getElementID(itemel));

		itemel.setAttribute('aria-label', getitemstring(item));

		if (!this.useListElement()) {
			var table = itemel.firstChild;

			util.setElementRole(table, 'presentation');
			table.setAttribute('aria-hidden', true);

			AjxUtil.foreach(table.rows[0].cells, function(cell, idx) {
				util.setElementRole(cell, 'button');
				focusableIds.push(util.getElementID(cell));

				if (cell.firstChild && cell.firstChild.tagName == 'DIV' &&
					cell.firstChild.firstChild &&
					cell.firstChild.firstChild.tagName == 'TABLE')
					util.setElementRole(div.firstChild, 'presentation');
			});
		}

		if (util.isInstance(this, "ZmListView")) {
			processItemFields.call(this, item, itemel);
		} else if (item.isAjxEmailAddress) {
			itemel.setAttribute('aria-label', item.toString(false, true));
		}

		// When the row has been rendered, apply stuff we couldn't before
		setTimeout(function(){
			for (var i=0; i<focusableIds.length; i++) {
				var el = Dwt.byId(focusableIds[i]);
				if (el) {
					util.makeFocusable(el);
				}
			}
		},0);

		return asHtml ? div.innerHTML : div.firstChild;
	});

	skin.override.append('ZmListView.prototype.setSelectionCbox', function(obj) {
		if (!obj) { return; }

		var item = obj.tagName ? this.getItemFromElement(obj) : obj;
		if (item) {
			processItemFields.call(this, item);
		}
	});

	skin.override.append(['ZmListView.prototype.setSelectionHdrCbox', 'ZmListView.prototype.deselectAll'], function() {
		var col = this._headerHash ? this._headerHash[ZmItem.F_SELECTION] : null;
		var hdrId = col ? DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON, this._view, col._field) : null;
		var hdrDiv = hdrId ? document.getElementById(hdrId) : null;

		if (hdrDiv) {
			fixCheckboxItem(hdrDiv);
		}
	});

	skin.override.append('ZmListView.prototype._changeListener', function(ev) {
		var item = this._getItemFromEvent(ev);
		if (item && item.isZmItem) {
			processItemFields.call(this, item);
		}
	});

	skin.override.append(['ZmConvListView.prototype._expand', 'ZmConvListView.prototype._collapse'], function(item) {
		processItemFields.call(this, item);
	});

	// DE3378: Select first message when expanding conversation in list
	skin.override.append("ZmConvListView.prototype._expand", function(conv, msg, force){
		var item = msg || conv;
		var firstMsg = item && item.msgs && item.msgs.getVector().get(0);
		if (firstMsg) {
			this.setSelection(firstMsg, false);
		}
	});

	skin.override(['ZmListView.prototype._columnClicked', 'ZmListView.prototype._itemClicked'], function() {
		var before = this.getSelectionCount();
		var r = arguments.callee.func.apply(this, arguments);
		var after = this.getSelectionCount();

		if (before != after) {
			util.say(AjxMessageFormat.format(ZmMsg.itemsSelected, [after]))
		}

		return r;
	});

	function updateListViewFocus() {
		var kbAnchor = this._rightSelItem || this._kbAnchor || this.getHtmlElement();

		if (kbAnchor == document.activeElement) {
			return;

		} else if (!util.isDescendant(appCtxt.getKeyboardMgr().__focusObj, this)) {
			// Don't steal focus if we're not already selected
			return;

		} else if (kbAnchor.tabIndex === 0) {
			util.focus(kbAnchor);

			// now, tell the keyboard manager...
			var kbMgr = DwtShell.getShell(window).getKeyboardMgr();
			kbMgr.__dwtCtrlHasFocus = true;
			kbMgr.__focusObj = this;

		} else if (window.console) {
			console.warn('attempting to focus unfocusable element',
						 kbAnchor);
		}
	}

	// If a row in this list has focus, we have focus
	skin.override("DwtListView.prototype.hasFocus", function(){
		return arguments.callee.func.apply(this) || util.isDescendant(document.activeElement, this);
	});

	// ensure that the focused element has browser focus
	function updateListViewFocusWrapper(el,ev) {
		var r = arguments.callee.func.apply(this, arguments);

		// Right-clicks don't count; they grab focus from the popup menu
		var rightClicked = ev && util.isInstance(ev,"DwtMouseEvent") && ev.button === DwtMouseEvent.RIGHT;

		if (!rightClicked) {
			updateListViewFocus.call(this);
		}

		return r;
	}

	skin.override('DwtListView.prototype.__doFocus', function() {
		var hadfocus = this.hasFocus();

		var r = arguments.callee.func.apply(this, arguments);

		if (!hadfocus) {
			updateListViewFocus.call(this);
		}

		return r;
	});

	var cellFocusClass = "Cell-focused";

	skin.override('DwtListView.prototype._unmarkKbAnchorElement', function() {
		var self = this;
		setTimeout(function(){
			if (self._kbAnchor && !self.hasFocus()) {
				Dwt.delClass(self._kbAnchor, cellFocusClass);
			}
		},1);

		return arguments.callee.func.apply(this, arguments);
	});

	// this is a comprehensive list of all functions that touch
	// DwtListView::_kbAnchor - we could likely get away with less,
	// but as updateListViewFocusWrapper() is relatively fast there's
	// little need to
	skin.override([ 'DwtListView.prototype._setKbFocusElement',
					'DwtListView.prototype.removeItem',
					'DwtListView.prototype.setSelection',
					'DwtListView.prototype.setMultiSelection',
					'DwtListView.prototype.selectItem',
					'DwtListView.prototype._itemSelected'],
				  updateListViewFocusWrapper);

	skin.override("ZmDoublePaneController.prototype._initializeTabGroup", function(view) {
		if (this._tabGroups[view]) { return; }
		ZmListController.prototype._initializeTabGroup.apply(this, arguments);
		this._tabGroups[view].addMember(this.getCurrentView().getItemView());
	});

	// Add toolbars to the tabgroup
	skin.override.append('ZmListController.prototype._initializeTabGroup', function(view) {
		var toolbar = this._toolbar[view];
		var tabGroup = this._tabGroups[view];
		toolbar.noFocus = false;
		tabGroup.addMember(toolbar.getTabGroupMember());
		var navtoolbar = this._navToolBar[view];
		if (navtoolbar) {
			navtoolbar.noFocus = false;
			tabGroup.addMember(navtoolbar.getTabGroupMember());
		}
	});

	// lists are a special case - they recieve tab focus, but forward
	// the focus to the rows
	skin.override('DwtListView.prototype.canReceiveTabFocus', function(){
		return true;
	});

	var NEXT_CELL = "a11yNextCell";
	var PREV_CELL = "a11yPrevCell";
	var NEXT_ROW = "a11yNextRow";
	var PREV_ROW = "a11yPrevRow";

	var my_action_codes = new AjxVector([NEXT_CELL, PREV_CELL, NEXT_ROW, PREV_ROW]);

	skin.override("DwtListView.prototype.handleKeyAction", function(actionCode, ev) {
		// so, is this a keyboard-triggered double click?
		if (ev.target && ev.target == this._kbAnchor &&
			ev.target.getAttribute('role') === 'button' &&
			actionCode == DwtKeyMap.DBLCLICK) {
			var target = ev.target;

			ev.target = target.firstChild || target;
			ev.button = DwtMouseEvent.LEFT;

			this._itemClicked(this.getTargetItemDiv(ev), ev);

			// ensure that focus doesn't pass back to the row
			this._kbAnchor = target;
			updateListViewFocus.call(this);

			return true;
		}

		if (my_action_codes.indexOf(actionCode) < 0) {
			return arguments.callee.func.apply(this, arguments);
		}

		var isrow = function(el) {
			return el.getAttribute('role') === this.a11yItemRole;
		};
		var row = util.getAncestor(this._kbAnchor, isrow.bind(this));

		var colcount = row.firstChild.rows[0].cells.length;
		var rowcount = this.size() + 1;

		var x = (this._kbAnchor && this._kbAnchor.cellIndex >= 0) ? this._kbAnchor.cellIndex : -1;
		var y;

		if (row === this._listColDiv) {
			y = 0;
		} else {
			y = AjxUtil.indexOf(this._listDiv.children, row) + 1;
			if (y == 0)
				y = -1;
		}

		switch (actionCode) {
		case NEXT_ROW:
			y += 1;

			break;

		case PREV_ROW:
			if (y < 0)
				y = Infinity;
			else
				y -= 1;

			break;

		case NEXT_CELL:
			x += 1;

			break;

		case PREV_CELL:
			if (x < 0)
				x = Infinity;
			else
				x -= 1;

			break;
		}

		x = Math.min(Math.max(x, 0), colcount - 1);
		y = Math.min(Math.max(y, 0), rowcount - 1);

		if (y === 0)
			row = this._listColDiv;
		else
			row = this._listDiv.children[y - 1];

		Dwt.delClass(this._kbAnchor, cellFocusClass);
		this._kbAnchor = row.firstChild.rows[0].cells[x];
		Dwt.addClass(this._kbAnchor, cellFocusClass);
		updateListViewFocus.call(this);

		return true;
	});

	skin.override("DwtListView.prototype._setSortedColStyle", function() {
		// first, clear the sorted of the previous column, if any
		clearSortedColumn.call(this);

		// call the original
		arguments.callee.func.apply(this, arguments);

		// finally, set the sort of the current column
		updateSortedColumn.call(this);
	});

	// fix Zimbra bug 80218 -- allow escape to close search results
	skin.override("ZmListController.prototype.handleKeyAction", function(actionCode) {
		var handled = arguments.callee.func.apply(this, arguments);

		// allow escape to close the search results view
		// -- but avoid intercepting it for inline replies
		if (!handled && actionCode == ZmKeyMap.CANCEL) {
			var ctrl = this.isSearchResults && this.searchResultsController;

			if (ctrl) {
				ctrl._closeListener();

				return true;
			}
		}

		return handled;
	});

	// apply the other fix from Zimbra bug 80218 -- allow cancel to
	// bubble up if not handled by the conversation view
	skin.override("ZmConvListController.prototype.handleKeyAction", function(actionCode) {
		if (actionCode === ZmKeyMap.CANCEL) {
			var itemView = this.getItemView();
			if (itemView && itemView._cancelListener &&
				itemView._replyView &&
				itemView._replyView.getVisible()) {

				return arguments.callee.func.apply(this, arguments);
			} else {
				return ZmDoublePaneController.prototype.handleKeyAction.apply(this, arguments);
			}
		} else {
			return arguments.callee.func.apply(this, arguments);
		}
	});


	var headersHasActionMenu = function(listview, hasActionMenu) {
		var headers = listview._headerList;
		for (var i=0; i<headers.length; i++) {
			var el = headers[i] && headers[i]._id && Dwt.byId(headers[i]._id);
			if (el) {
				util.setHasActionMenu(el, hasActionMenu);
			}
		}
	};
	var rowsHasActionMenu = function(listview, hasActionMenu) {
		/*var rows = listview._listDiv.children;
		for (var i=0; i<rows.length; i++) {
			var row = rows[i];
			if (row && Dwt.hasClass(row, "Row")) {
				util.setHasActionMenu(rows[i], hasActionMenu);
			}
		}*/
	};

	skin.override.append(["DwtListView.prototype.addActionListener","DwtListView.prototype.removeActionListener"], function() {
		var hasActionMenu = this._evtMgr.isListenerRegistered(DwtEvent.ACTION);
		headersHasActionMenu(this, hasActionMenu);
		rowsHasActionMenu(this, hasActionMenu);
	});

	skin.override.append("DwtListView.prototype.createHeaderHtml", function(){
		headersHasActionMenu(this, this._evtMgr.isListenerRegistered(DwtEvent.ACTION));
		util.setTableRolePresentation(this._listColDiv);
	});

	skin.override.append("DwtListView.prototype._renderList", function(list){
		rowsHasActionMenu(this, this._evtMgr.isListenerRegistered(DwtEvent.ACTION));
	});

	skin.override.append("DwtChooserListView.prototype._renderList", function(list){
		if (list) {
			this._adjustWidth(list);
		}
	});

	skin.override.append("DwtChooser.prototype.addItems", function(items, view){
		var listView = (view == DwtChooserListView.SOURCE) ? this.sourceListView : this.targetListView;
		listView._adjustWidth();
	});

	skin.override.append(["DwtChooserListView.prototype._itemClicked","DwtChooserListView.prototype._blur"], function(){
		this._adjustWidth();
	});

	skin.override("DwtListView.prototype._adjustWidth", function(item){
		if (!item && this._list) {
			item = this._list;
		}
		if (item instanceof AjxVector) {
			item = item.getArray();
		}
		if (AjxUtil.isArray(item)) {
			for (var i=0; i<item.length; i++) {
				this.__doAdjustWidth(item[i]);
			}
			return;
		} else if (item) {
			this.__doAdjustWidth(item);
		}
	});
	skin.override("DwtListView.prototype.__doAdjustWidth", function(item){
	
		Dwt.setSize(this._listDiv, this.getSize().x, Dwt.DEFAULT);

		var row = this._getElFromItem(item);
		Dwt.setSize(row, Dwt.CLEAR, Dwt.DEFAULT);
			
		var cells = row.getElementsByTagName("td");

		var widenRow,
			rowWidth = 0;
		for (var i=0; i<cells.length; i++) {
			var cell = cells[i],
				text = cell.textContent || cell.innerText,
				contentWidth = AjxStringUtil.getWidth(AjxStringUtil.htmlEncode(text), Dwt.hasClass(row, this._selectedClass)),
				cellWidth = Dwt.getSize(cell).x;

			var style = DwtCssStyle.getComputedStyleObject(cell);
			var margins = (parseInt(style.marginLeft) || 0) + (parseInt(style.marginRight) || 0),
				borders = (parseInt(style.borderLeftWidth) || 0) + (parseInt(style.borderRightWidth) || 0),
				paddings = (parseInt(style.paddingLeft) || 0) + (parseInt(style.paddingRight) || 0);
			cellWidth -= paddings;

			rowWidth += margins + borders + paddings + Math.max(contentWidth, cellWidth);

			if (contentWidth > cellWidth) {
				widenRow = true;
			}
		}

		if (widenRow) {
			this.__artificialRowWidth = Math.max(this.__artificialRowWidth||0, rowWidth);

			if (!this.__adjustingWidth) {
				this.__adjustingWidth = true;
				setTimeout(function(){
					this.__adjustingWidth = false;
					var rows = this._parentEl.childNodes;
					for (var i=0; i<rows.length; i++) {
						Dwt.setSize(rows[i], this.__artificialRowWidth, Dwt.DEFAULT);
					}
					this.__artificialRowWidth = 0;
				}.bind(this),0);
			}
		}
	});


	skin.override.append("ZmMailListController.prototype._detachListener", function(){
		util.say(ZmMsg.openingNewWindow);
	});

	skin.override.append("ZmMailListController.prototype._checkMailListener", function(){
		util.say(ZmMsg.gettingMail);
	});

	skin.override("ZmMailListController.prototype.switchView", function(view){
		if ((view == ZmId.VIEW_TRAD || view == ZmId.VIEW_CONVLIST) && view != this.getCurrentViewType()) {
			util.say(AjxMessageFormat.format(ZmMsg.viewMailBy, [(view == ZmId.VIEW_TRAD) ? ZmMsg.message : ZmMsg.conversation]));
		}
		arguments.callee.func.apply(this,arguments);
	});


	skin.override.append('ZmOperation.initialize', function() {
		ZmOperation.registerOp("LIST_OPTIONS_MENU", {textKey:"listViewOptions", image:"Options"});
		ZmOperation.registerOp("LIST_ORDER_MENU", {textKey:"listSortOrder", image:"SortOrder"});
		ZmOperation.registerOp("LIST_COLUMN_MENU", {textKey:"listShowColumns", image:"ColumnView"});
		ZmOperation.registerOp("MARK_FLAGGED", {textKey:"markAsFlagged", image:"FlagRed"});
		ZmOperation.registerOp("MARK_UNFLAGGED", {textKey:"markAsUnflagged", image:"FlagDis"});
	});

	skin.override("ZmMailListView.prototype._getActionMenuForColHeader", function(){
		var menu = arguments.callee.func.apply(this,arguments);
		var omitFields = ["fg","pr","rd"]; // DE3194
		for (var i=0; i<omitFields.length; i++) {
			var menuItem = menu.getMenuItem(omitFields[i]);
			menu.removeChild(menuItem);
		}
		return menu;
	});

	var getListViewOptionsMenu = function() {
		// based on ZmMailListView.prototype._getActionMenuForColHeader
		// and ZmListView.prototype._getSortMenu
		var activeSortBy = this.getActiveSearchSortBy();
		var sorted_field = (activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy]) ?
			ZmMailListView.SORTBY_HASH[activeSortBy].field : ZmItem.F_DATE;
		var sort_fields = this._getSingleColumnSortFields();
		var omitFields = ["fg","pr","rd"]; // DE3194

		// create a action menu for the header list
		var menu = this._sortByActionMenu = new ZmPopupMenu(this);
		var actionListener = new AjxListener(this, function(ev) {
			if (!this.isMultiColumn()) {
				this._sortMenuListener(ev);
			} else {
				var field = ev.item.getData(ZmListView.KEY_ID);
				var header = this._headerHash[field];
				var columnid = header && header._id,
					columnHeader = columnid && Dwt.byId(columnid);
				if (columnHeader) {
					this._columnClicked(columnHeader, ev);
				}
			}
		});

		for (var i = 0; i < sort_fields.length; i++) {
			var column = sort_fields[i];
			if (AjxUtil.indexOf(omitFields, column.field)==-1) {
				var label = AjxMessageFormat.format(ZmMsg.arrangeBy, ZmMsg[column.msg]);
				var mi = menu.createMenuItem(column.field, {text:label, style:DwtMenuItem.RADIO_STYLE});
				if (column.field == sorted_field) {
					mi.setChecked(true, true);
				}

				mi.setData(ZmListView.KEY_ID, column.field);
				menu.addSelectionListener(column.field, actionListener);
			}
		}

		var mi = menu.getMenuItem(ZmItem.F_FROM);
		if (mi) {
			mi.setVisible(!this._isOutboundFolder());
		}
		mi = menu.getMenuItem(ZmItem.F_TO);
		if (mi) {
			mi.setVisible(this._isOutboundFolder());
		}

		return menu;
	};

	skin.override("ZmDoublePaneController.prototype._getActionMenuOps", function() {
		var list = arguments.callee.func.apply(this, arguments);

		AjxUtil.arrayAdd(list, ZmOperation.SEP);
		AjxUtil.arrayAdd(list, ZmOperation.LIST_OPTIONS_MENU);

		return list;
	});

	skin.override("ZmMailListController.prototype._getOptionsMenu", function(forceRefresh) {
		var view = this._mailListView;
		if (!this._optionsMenu) {
			this._optionsMenu = new ZmActionMenu({
				//parent: this._actionMenu,     TODO double check this
				parent: this._shell,
				style: DwtMenu.DROPDOWN_STYLE,
				controller: this,
				menuItems: [
					ZmOperation.LIST_ORDER_MENU,
					ZmOperation.LIST_COLUMN_MENU
				]
			});
			view._getGroupByActionMenu(this._optionsMenu);
			forceRefresh = true;
		}
		if (forceRefresh) {
			var optionsmenu = this._optionsMenu;
			var columnitem = optionsmenu.getOp(ZmOperation.LIST_COLUMN_MENU);
			if (view.isMultiColumn()) {
				var columnmenu = ZmListView.prototype._getActionMenuForColHeader.call(view);
				columnitem.setMenu(columnmenu);
				columnitem.setVisible(true);
			} else {
				columnitem.setVisible(false);
			}

			var orderitem = optionsmenu.getOp(ZmOperation.LIST_ORDER_MENU);
			var menu = getListViewOptionsMenu.call(view);
			orderitem.setMenu(menu);
		}
		return this._optionsMenu;
	});

	skin.override.append("ZmDoublePaneController.prototype.switchView", function(){
		this._getOptionsMenu(true);
	});

	skin.override.append("ZmMailListController.prototype._initializeActionMenu", function() {
		var optionsmenu = this._getOptionsMenu(),
			optionsitem = this._actionMenu.getOp(ZmOperation.LIST_OPTIONS_MENU);
		if (optionsitem) {
			optionsitem.setMenu(optionsmenu);
		}
	});
	skin.override.append("ZmMailListController.prototype._initializeParticipantActionMenu", function() {
		var optionsmenu = this._getOptionsMenu(),
			optionsitem = this._participantActionMenu.getOp(ZmOperation.LIST_OPTIONS_MENU);
		if (optionsitem) {
			optionsitem.setMenu(optionsmenu);
		}
	});

	skin.override.append("ZmMailListView.prototype.createHeaderHtml", function(){
		var sortBy = ZmMailListView.SORTBY_HASH[this.getActiveSearchSortBy()].field;
		var sortMenuItem = this._sortByActionMenu && this._sortByActionMenu.getMenuItem(sortBy);
		if (sortMenuItem) {
			sortMenuItem.setChecked(true, true);
		}

		var groupBy = this.getGroup(this._folderId);
		var groupMenuItem = this._groupByActionMenu && this._groupByActionMenu.getMenuItem(groupBy && groupBy.id || ZmOperation.GROUPBY_NONE);
		if (groupMenuItem) {
			groupMenuItem.setChecked(true, true);
		}
	});

	skin.override("ZmMailListView.prototype._columnClicked", function(clickedCol, ev) {
		var hdr = this.getItemFromElement(clickedCol);
		var group = this.getGroup(this._folderId);
		if (group && hdr && hdr._sortable) {
			var groupId = ZmMailListGroup.getGroupIdFromSortField(hdr._sortable);
			if (groupId != group.id) { // Don't re-group just because we sort differently; un-group instead
				this.clearGroupSections(this._folderId);
			}
		}
		ZmListView.prototype._columnClicked.call(this, clickedCol, ev);
	});

	skin.override("ZmMailListController.prototype._flagOps", function() {
		var list = arguments.callee.func.apply(this, arguments);

		if (!appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
			return list;
		}

		if (!this._listeners[ZmOperation.MARK_FLAGGED]) {
			
			this._listeners[ZmOperation.MARK_FLAGGED] = function(ev) {
					this._doFlag(this._listView[this._currentViewId].getSelection(), true);
				}.bind(this);
		}

		if (!this._listeners[ZmOperation.MARK_UNFLAGGED]) {
			this._listeners[ZmOperation.MARK_UNFLAGGED] = function(ev) {
					this._doFlag(this._listView[this._currentViewId].getSelection(), false);
				}.bind(this);
		}

		return [ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD, ZmOperation.SEP, ZmOperation.MARK_FLAGGED, ZmOperation.MARK_UNFLAGGED];
	});

	skin.override("ZmMailListController.prototype._getFlaggedStatus", function() {
		// based on ZmMailListController.prototype._getReadStatus, but for flagged
		var status = {hasFlagged : false, hasUnflagged : false}

		// dont bother checking for flagged/unflagged state for read-only folders
		var folder = this._getSearchFolder();
		if (folder && folder.isReadOnly()) {
			return status;
		}

		var items = this.getItems();

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			// TODO: refactor / clean up
			if (item.type == ZmItem.MSG) {
				status[item.isFlagged ? "hasFlagged" : "hasUnflagged"] = true;
			} else if (item.type == ZmItem.CONV) {
				status.hasUnflagged = status.hasUnflagged || item.hasFlag(ZmItem.FLAG_FLAGGED, false);
				status.hasFlagged = status.hasFlagged || item.hasFlag(ZmItem.FLAG_FLAGGED, true);
			}
			if (status.hasUnflagged && status.hasFlagged) {
				break;
			}
		}

		return status;
	});

	skin.override.append("ZmMailListController.prototype._enableFlags", function(menu) {
		if (!appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
			return;
		}

		var flagged = this._getFlaggedStatus();

		menu.enable(ZmOperation.MARK_FLAGGED, flagged.hasUnflagged);
		menu.enable(ZmOperation.MARK_UNFLAGGED, flagged.hasFlagged);
	});

	skin.override("ZmMailListController.prototype._showMailItem", function(){
		// DE3200: Don't announce tab selection
		if (window.DwtButton) {
			var id = DwtButton.setNoFocus();
			arguments.callee.func.apply(this,arguments);
			DwtButton.clearNoFocus(id);
		} else {
			arguments.callee.func.apply(this,arguments);
		}
	});

	skin.override("DwtListView.prototype.set", function(list, defaultColumnSort, noResultsOk) {
		var selection;
		if (this.hasFocus()) {
			selection = this.getItemFromElement(document.activeElement || this._parentEl.firstChild);
		}
		arguments.callee.func.apply(this,arguments);
		if (selection) {
			this.setSelectedItems(selection);
			appCtxt.getKeyboardMgr().grabFocus(this);
			appCtxt.getRootTabGroup().setFocusMember(this);
		}
	});

	skin.override.append("DwtListView.prototype._setNoResultsHtml", function(){
		if (this.a11yTitleEmpty) {
			this.getHtmlElement().tabIndex = 0;
			this.setAriaLabel(this.a11yTitleEmpty);
		}
		util.say(this._getNoResultsMessage());
	});   

	skin.override.append("DwtListView.prototype._resetList", function(){
		if (this.a11yTitle) {
			this.getHtmlElement().tabIndex = -1;
			this.setAriaLabel(this.a11yTitle);
		}
	});

})();
