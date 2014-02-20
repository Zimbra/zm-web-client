(function(){

var util = comcast.access.util;

    // these TinyMCE customizations all apply to 3.5 -- disable them
    // for now
    return;

//------------------------------------------------------------------------------
// TinyMCE updates

skin.override("tinymce.ui.KeyboardNavigation", function(settings, dom) {
	var Event = tinymce.dom.Event, each = tinymce.each;
	var t = this, root = settings.root, items = settings.items,
			enableUpDown = settings.enableUpDown, enableLeftRight = settings.enableLeftRight || !settings.enableUpDown,
			excludeFromTabOrder = settings.excludeFromTabOrder,
			itemFocussed, itemBlurred, rootKeydown, rootKeyup, rootFocussed, focussedId;

	dom = dom || tinymce.DOM;

	itemFocussed = function(evt) {
		focussedId = evt.target.id;
	};
	
	itemBlurred = function(evt) {
		var item = dom.get(evt.target.id);
		//dom.setAttrib(evt.target.id, 'tabindex', '-1');
		Dwt.delClass(item,"mceFocus");
	};
	
	rootFocussed = function(evt) {
		var item = dom.get(focussedId);
		//dom.setAttrib(item, 'tabindex', '0');
		util.focus(item);
		Dwt.addClass(item,"mceFocus");
	};
	
	t.focus = function() {
		util.focus(dom.get(focussedId));
	};

	t.destroy = function() {
		each(items, function(item) {
			var elm = dom.get(item.id);

			dom.unbind(elm, 'focus', itemFocussed);
			dom.unbind(elm, 'blur', itemBlurred);
		});

		var rootElm = dom.get(root);
		dom.unbind(rootElm, 'focus', rootFocussed);
		dom.unbind(rootElm, 'keydown', rootKeydown);

		items = dom = root = t.focus = itemFocussed = itemBlurred = rootKeydown = rootFocussed = null;
		t.destroy = function() {};
	};
	
	t.moveFocus = function(dir, evt) {
		var idx = -1, controls = t.controls, newFocus;
		if (!focussedId)
			return;

		var visibleItems = [];
		each(items, function(item, index) {
			if (util.isVisible(Dwt.byId(item.id))) {
				visibleItems.push(item);
			}
		});

		each(visibleItems, function(item, index) {
			if (item.id === focussedId) {
				idx = index;
				return false;
			}
		});

		idx += dir;
		while (idx < 0) {
			idx += visibleItems.length;
		}
		while (idx >= visibleItems.length) {
			idx -= visibleItems.length;
		}
		
		newFocus = visibleItems[idx];
		dom.setAttrib(focussedId, 'tabindex', '-1');
		dom.setAttrib(newFocus.id, 'tabindex', '0');
		Dwt.delClass(Dwt.byId(focussedId), "mceFocus");
		Dwt.addClass(Dwt.byId(newFocus.id), "mceFocus");

		util.focus(dom.get(newFocus.id));
		if (settings.actOnFocus) {
			settings.onAction(newFocus.id);
		}
		// arrow keys can also move tab focus

		var win = evt.view;
		if (!win) {
			for (var el = evt.target; util.isElement(el); el = el.parentNode) {}
			var win = el.parentWindow;
		}
		var tg = win && win.tabgroup || appCtxt.getRootTabGroup();
		if (tg) {
			tg.setFocusMember(dom.get(newFocus.id));
		}

		if (evt)
			Event.cancel(evt);
	};
	
	rootKeydown = function(evt) {
		var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32, DOM_VK_TAB = 9;
		switch (evt.keyCode) {
			case DOM_VK_LEFT:
				if (settings.leftRight) {
					t.moveFocus(settings.leftRight(focussedId, true), evt);
				} else if (enableLeftRight) {
					t.moveFocus(-1,evt);
				}
				break;

			case DOM_VK_RIGHT:
				if (settings.leftRight) {
					t.moveFocus(settings.leftRight(focussedId, false), evt);
				} else if (enableLeftRight) {
					t.moveFocus(1,evt);
				}
				break;

			case DOM_VK_UP:
				if (settings.upDown) {
					t.moveFocus(settings.upDown(focussedId, true), evt);
				} else if (enableUpDown) {
					t.moveFocus(-1,evt);
				}
				break;

			case DOM_VK_DOWN:
				if (settings.upDown) {
					t.moveFocus(settings.upDown(focussedId, false), evt);
				} else if (enableUpDown) {
					t.moveFocus(1,evt);
				}
				break;

			case DOM_VK_ESCAPE:
				if (settings.onCancel) {
					settings.onCancel();
					Event.cancel(evt);
				}
				break;

			case DOM_VK_TAB:
				if (settings.onCancel && !settings.noTabCancel) {
					settings.onCancel();
				}
				return Event.cancel(evt);
				break;

			case DOM_VK_ENTER:
			case DOM_VK_RETURN:
			case DOM_VK_SPACE:
				if (settings.onAction) {
					settings.onAction(focussedId);
					Event.cancel(evt);
				}
				break;

			default:
				if (settings.cancelOther) {
					return Event.cancel(evt);
				}
				break;
		}
	};

	// Set up state and listeners for each item.
	each(items, function(item, idx) {
		var tabindex, elm;

		if (!item.id) {
			item.id = dom.uniqueId('_mce_item_');
		}

		elm = dom.get(item.id);

		if (excludeFromTabOrder) {
			dom.bind(elm, 'blur', itemBlurred);
			tabindex = '-1';
		} else {
			tabindex = (idx === 0 ? '0' : '-1');
		}

		elm.setAttribute('tabindex', tabindex);
		dom.bind(elm, 'focus', itemFocussed);
	});
	
	// Setup initial state for root element.
	if (items[0]){
		focussedId = items[0].id;
	}

	dom.setAttrib(root, 'tabindex', '-1');

	// Setup listeners for root element.
	var rootElm = dom.get(root);
	dom.bind(rootElm, 'focus', rootFocussed);
	dom.bind(rootElm, 'keydown', rootKeydown);
});

skin.override("tinymce.Editor.prototype.execCommand", function(cmd, ui, val, a) {

	var extend = tinymce.extend,
		each = tinymce.each;

	var self = this, s = 0, o, st;

	if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll|mceImage)$/.test(cmd) && (!a || !a.skip_focus))
		self.focus();

	a = extend({}, a);
	self.onBeforeExecCommand.dispatch(self, cmd, ui, val, a);
	if (a.terminate)
		return false;

	// Command callback
	if (self.execCallback('execcommand_callback', self.id, self.selection.getNode(), cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Registred commands
	if (o = self.execCommands[cmd]) {
		st = o.func.call(o.scope, ui, val);

		// Fall through on true
		if (st !== true) {
			self.onExecCommand.dispatch(self, cmd, ui, val, a);
			return st;
		}
	}

	// Plugin commands
	each(self.plugins, function(p) {
		if (p.execCommand && p.execCommand(cmd, ui, val)) {
			self.onExecCommand.dispatch(self, cmd, ui, val, a);
			s = 1;
			return false;
		}
	});

	if (s)
		return true;

	// Theme commands
	if (self.theme && self.theme.execCommand && self.theme.execCommand(cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Editor commands
	if (self.editorCommands.execCommand(cmd, ui, val)) {
		self.onExecCommand.dispatch(self, cmd, ui, val, a);
		return true;
	}

	// Browser commands
	self.getDoc().execCommand(cmd, ui, val);
	self.onExecCommand.dispatch(self, cmd, ui, val, a);
});

skin.override("tinymce.ui.ColorSplitButton.prototype.showMenu", function(){
	var DOM = tinymce.DOM, Event = tinymce.dom.Event;

	var t = this, r, p, e, p2;

	if (t.isDisabled())
		return;

	if (!t.isMenuRendered) {
		t.renderMenu();
		t.isMenuRendered = true;
	}

	if (t.isMenuVisible)
		return t.hideMenu();

	e = DOM.get(t.id);
	DOM.show(t.id + '_menu');
	DOM.addClass(e, 'mceSplitButtonSelected');
	p2 = DOM.getPos(e);
	DOM.setStyles(t.id + '_menu', {
		left : p2.x,
		top : p2.y + e.firstChild.clientHeight,
		zIndex : 200000
	});
	e = 0;

	Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
	t.onShowMenu.dispatch(t);

	var colorItems = DOM.select('a[data-mce-color]', t.id + '_menu'),
		colorItemsHash = {},
		moreButton = DOM.select('a.mceMoreColors', t.id + '_menu');

	for (var i=0; i<colorItems.length; i++) {
		colorItemsHash[colorItems[i].id] = {el:colorItems[i], idx:i};
	}
	var allItems = colorItems.concat(moreButton);

	if (t._focused) {
		t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
			if (e.keyCode == 27) {
				t.hideMenu();
				t.focus();
				Event.stop(e);
			}
		});

		util.focus(allItems[0]); // Select first link
	}

	var moreId = t.id + '_menu';
	var lastColorItem;
	t.keyboardNav = new tinymce.ui.KeyboardNavigation({
		root: t.id + '_menu',
		items: allItems,
		onCancel: function() {
			t.hideMenu();
			t.focus();
		},
		upDown: function(focusedId, up) {
			var hEntry = colorItemsHash[focusedId];
			var idx = AjxUtil.indexOf(colorItems, Dwt.byId(focusedId));
			var newIdx;
			if (idx >= 0) {
				if (idx < 8 && up) {
					lastCol = idx % 8;
					newIdx = 40;
				} else if (idx > 31 && idx < 40 && !up) {
					lastCol = idx % 8;
					newIdx = 40;
				} else {
					newIdx = idx + (up ? -8 : 8);
				}
			} else if (focusedId === moreButton[0].id) {
				newIdx = (up ? allItems.length - 9 : 0) + lastCol;
			}
			if (newIdx !== undefined) {
				return newIdx - idx;
			}
			return up ? -1 : 1;
		},
		leftRight: function(focusedId, left) {
			lastCol = 0;
			return left ? -1 : 1;
		}
	});

	t.keyboardNav.focus();
	t.isMenuVisible = 1;

});




skin.override("tinymce.ui.ToolbarGroup.prototype.renderHTML", function() {
	var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
	var self = this, html = [], controls = this.controls, each = tinymce.each, settings = this.settings;

	html.push('<div id="' + self.id + '" role="group" aria-labelledby="' + self.id + '_voice">');

	// We remove role="application" here, to solve the "read everything on tab to toolbar" issue in IE+NVDA (+others?)
	//html.push("<span role='application'>");
	html.push("<span>");

	html.push('<span id="' + self.id + '_voice" class="mceVoiceLabel" style="display:none;">' + dom.encode(settings.name) + '</span>');
	each(controls, function(toolbar) {
		html.push(toolbar.renderHTML());
	});
	html.push("</span>");
	html.push('</div>');

	return html.join('');
});

skin.override("tinymce.ui.ToolbarGroup.prototype.postRender", function() {
	var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
	var self = this, items = [];

	each(self.controls, function(toolbar) {
		each (toolbar.controls, function(control) {
			if (control.id) {
				items.push(control);
			}
		});
	});

	self.keyNav = new tinymce.ui.KeyboardNavigation({
		root: self.id,
		items: items,
		onCancel: function() {
			//Move focus if webkit so that navigation back will read the item.
			if (tinymce.isWebKit) {
				dom.get(t.editor.id+"_ifr").focus();
			}
			self.editor.focus();
		},
		excludeFromTabOrder: !self.settings.tab_focus_toolbar,
		noTabCancel: true
	});
});

// Avoid the toolbar items being announced as "column 1, 2, 3", etc
skin.override("tinymce.ui.Toolbar.prototype.renderHTML", function() {

	var dom = tinymce.DOM, each = tinymce.each;
	var t = this, h = '', c, co, s = t.settings, i, pr, nx, cl;

	cl = t.controls;
	for (i=0; i<cl.length; i++) {
		co = cl[i];
		pr = cl[i - 1];
		nx = cl[i + 1];

		if (i === 0) {
			c = 'mceToolbarStart';

			if (co.Button) {
				c += ' mceToolbarStartButton';
			} else if (co.SplitButton) {
				c += ' mceToolbarStartSplitButton';
			} else if (co.ListBox) {
				c += ' mceToolbarStartListBox';
			}

			h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
		}

		if (pr && co.ListBox) {
			if (pr.Button || pr.SplitButton) {
				h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		if (dom.stdMode) {
			h += '<td style="position: relative" role="presentation">' + co.renderHTML() + '</td>';
			//h += '<td style="position: relative">' + co.renderHTML() + '</td>';
		} else {
			h += '<td role="presentation">' + co.renderHTML() + '</td>';
			//h += '<td>' + co.renderHTML() + '</td>';
		}

		if (nx && co.ListBox) {
			if (nx.Button || nx.SplitButton) {
				h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}
	}

	c = 'mceToolbarEnd';

	if (co.Button) {
		c += ' mceToolbarEndButton';
	} else if (co.SplitButton) {
		c += ' mceToolbarEndSplitButton';
	} else if (co.ListBox) {
		c += ' mceToolbarEndListBox';
	}

	h += dom.createHTML('td', {'class' : c, 'role' : 'presentation'}, dom.createHTML('span', null, '<!-- IE -->'));
	//h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

	var h = dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || '', role: 'presentation', tabindex: '-1'}, '<tbody><tr>' + h + '</tr></tbody>');

	return h;
});

skin.override("tinymce.ui.ListBox.prototype.renderHTML", function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, undef;
	var h = '', t = this, s = t.settings, cp = t.classPrefix;

	h = '<span id="' + t.id + '" role="listbox" aria-haspopup="true" aria-labelledby="' + t.id +'_voiceDesc" aria-describedby="' + t.id + '_voiceDesc">';

	// This table is announced as "table" when it should be invisible to the screen reader. Why?
	h += '<table role="presentation" tabindex="0" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tr>';

	h += '<td>' + DOM.createHTML('span', {id: t.id + '_voiceDesc', 'class': 'voiceLabel', style:'display:none;'}, t.settings.title); 
	h += DOM.createHTML('a', {id : t.id + '_text', tabindex : -1, href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';

	h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>') + '</td>';

	h += '</tr></table>';
	h += '</span>';

	return h;
});

skin.override("tinymce.ui.Button.prototype.postRender", function() {
	var t = this, s = t.settings, imgBookmark;

	// In IE a large image that occupies the entire editor area will be deselected when a button is clicked, so
	// need to keep the selection in case the selection is lost
	if (tinymce.isIE && t.editor) {
		tinymce.dom.Event.add(t.id, 'mousedown', function(e) {
			var nodeName = t.editor.selection.getNode().nodeName;
			imgBookmark = nodeName === 'IMG' ? t.editor.selection.getBookmark() : null;
		});
	}
	tinymce.dom.Event.add(t.id, 'click', function(e) {
		if (!t.isDisabled()) {
			// restore the selection in case the selection is lost in IE
			if (tinymce.isIE && t.editor && imgBookmark !== null) {
				t.editor.selection.moveToBookmark(imgBookmark);
			}
			return s.onclick.call(s.scope, e);
		}
	});

	tinymce.dom.Event.add(t.id, 'keydown', function(e) {
		if (e.keyCode==tinymce.VK.SPACEBAR) { // DwtKeyboardMgr.__keyDownHdlr will handle ENTER key
			return s.onclick.call(s.scope, e);
		}
	});


});

function moveHidden(srcelem, dstelem) {
	var hidden = srcelem.getAttribute('aria-hidden')

	if (!hidden)
		return;

	srcelem.removeAttribute('aria-hidden');
	dstelem.setAttribute('aria-hidden', hidden);
}

skin.override("tinymce.InlineWindowManager.prototype.open", function(f,p) {
	var w = arguments.callee.func.apply(this,arguments);
	var id = w.iframeElement.id;
	var iframe = Dwt.byId(id);

	moveHidden(document.body, DwtShell.getShell(window).getHtmlElement());

	if (iframe) {

		var ready = function(){
			var kbMgr = appCtxt.getShell().getKeyboardMgr();
			kbMgr.pushTabGroup(iframe.tabgroup);
		};

		if (iframe.tabgroup) {
			 ready();
		} else {
			var tabgroup = iframe.tabgroup = new DwtTabGroup(id, true);
			tabgroup.__blockDefaultHandling = true;
			var load = function(){
				var win = iframe.contentWindow;
				var doc = win.document;
				var body = doc.body;
				var focusable = tinymce.DOM.select(":input,li,a", body);

				win.tabgroup = tabgroup;

				var focusable1 = [];
				for (var c=0; c<focusable.length; c++) {
					var found = false;
					for (var p=0; p<c; p++) {
						if (util.isDescendant(focusable[c], focusable[p])) {
							found = true;
							break;
						}
					}
					if (!found) {
						focusable1.push(focusable[c]);
					}
				}

				Dwt.addClass(body, "mceDialog");

				util.makeFocusable(focusable1);
				tabgroup.addMember(focusable1);
				tabgroup.setFocusMember(doc.activeElement);
				ready();
				
				if (iframe.removeEventListener) {
					iframe.removeEventListener("load", load, true);
				} else if (iframe.detachEvent) {
					iframe.detachEvent("onload", load);
				}

				util.addStylesheet("/skins/accessibilityTest/src/tab-selection"+(AjxEnv.isIE?"-ie":"")+".css", doc);
			};

			if (iframe.addEventListener) {
				iframe.addEventListener("load", load, true);
			} else if (iframe.attachEvent) {
				iframe.attachEvent("onload", load);
			}
		}
	}
	return w;
});

skin.override("tinymce.InlineWindowManager.prototype.close", function(win, id) {
	id = this._findId(id || win);
	var w = this.windows[id];
	var iframe = Dwt.byId(w.iframeElement.id);
	if (iframe) {
		var kbMgr = appCtxt.getShell().getKeyboardMgr();
		kbMgr.popTabGroup(iframe.tabgroup);
	}
	arguments.callee.func.apply(this,arguments);
	moveHidden(document.body, DwtShell.getShell(window).getHtmlElement());
});


// DE3239
if (AjxEnv.isIE) {
	// Giving a role to an "A" tag here (as the original function does) would cause the href attribute to be presented to the screen reader as the element value,
	// and the screen reader would read it (see http://community.nvda-project.org/ticket/273).
	// Using a different tag name causes an issue in TinyMCE where the cursor is moved to the beginning of the compose body every time a button is pressed
	// So the compromise is to keep the A tag, and remove the role from it.
	skin.override("tinymce.ui.Button.prototype.renderHTML", function() {
		var DOM = tinymce.DOM;
		var classPrefix = this.classPrefix, settings = this.settings, html, label;

		label = DOM.encode(settings.label || '');
		html = '<a id="' + this.id + '" href=" " class="' + classPrefix + ' ' + classPrefix + 'Enabled ' + settings['class'] + (label ? ' ' + classPrefix + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" aria-labelledby="' + this.id + '_voice" title="' + DOM.encode(settings.title) + '">';
		if (settings.image && !(this.editor  &&this.editor.forcedHighContrastMode) )
			html += '<span class="mceIcon ' + settings['class'] + '"><img class="mceIcon" src="' + settings.image + '" alt="' + DOM.encode(settings.title) + '" /></span>' + (label ? '<span class="' + classPrefix + 'Label">' + label + '</span>' : '');
		else
			html += '<span class="mceIcon ' + settings['class'] + '"></span>' + (label ? '<span class="' + classPrefix + 'Label">' + label + '</span>' : '');

		html += '<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="' + this.id + '_voice">' + settings.title + '</span>'; 
		html += '</a>';
		return html;
	});
}

skin.override("tinymce.themes.AdvancedTheme.prototype.renderUI", function(o) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event;
	var self = this, ed = this.editor;

	var count = ed.onKeyDown.listeners.length;

	var r = arguments.callee.func.apply(this,arguments);

	// Remove the listener that was added in the method
	ed.onKeyDown.listeners.length = count;

	ed.onKeyDown.add(function(ed, evt) {
		var keyCode = evt.keyCode;
		if (evt.altKey) {
 			var DOM_VK_F10 = 121, DOM_VK_F11 = 122, DOM_VK_0 = 48;
			if (keyCode === DOM_VK_F10) {
				// Make sure focus is given to toolbar in Safari.
				// We can't do this in IE as it prevents giving focus to toolbar when editor is in a frame
				var el = DOM.get(self.toolbarGroup.id);
				if (el) {
					if (tinymce.isWebKit) {
						window.focus();
					}
					appCtxt.getKeyboardMgr().grabFocus(el);
				}
				return Event.cancel(evt);
			} else if (keyCode === DOM_VK_F11) {
				var el = DOM.get(ed.id + '_path_row');
				if (el) {
					appCtxt.getKeyboardMgr().grabFocus(el);
				}
				return Event.cancel(evt);
			} else if (keyCode === DOM_VK_0) {
				// alt+0 is the UK recommended shortcut for accessing the list of access controls.
				self._mceShortcuts();
				return Event.cancel(evt);
			}
		} else if (evt.ctrlKey) {
			if (keyCode === 32) {
				ed.execCommand(evt.shiftKey ? "Outdent":"Indent");
				return Event.cancel(evt);
			}
		}
	});

	return r;
});

skin.override.append("tinymce.Editor.prototype.init", function(){
	var iframe = this.contentAreaContainer.firstChild;
	this.getBody().setAttribute("aria-label", iframe.title);
});

})();
