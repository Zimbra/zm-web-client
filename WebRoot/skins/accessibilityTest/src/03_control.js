(function(){
	var util = comcast.access.util;

	skin.classListener('DwtControl', function() {
		DwtControl.prototype.a11yRole = null;
		DwtControl.prototype.a11yFocusable = false;
		DwtControl.prototype.a11yTitle = null;
		DwtControl.prototype.a11yReadOnly = null;

		DwtControl.prototype.setRole = function(role) {
			util.setElementRole(this.getHtmlElement(), role);
		};

		if (AjxUtil.indexOf(DwtEvent.MOUSE_EVENTS, DwtEvent.ONCLICK) === -1) {
			DwtEvent.MOUSE_EVENTS.push(DwtEvent.ONCLICK);
		}

		for (var eventkey in util.EVENT_HANDLERS)
			DwtControl.__HANDLER[eventkey] = util.EVENT_HANDLERS[eventkey];

	});

	skin.override.append('DwtControl.prototype.__initCtrl', function() {
		if (this.a11yRole !== null) {
			this.setRole(this.a11yRole);
		}

		if (this.a11yFocusable) {
			util.makeFocusable(this);
		}

		if (this.a11yTitle !== null) {
			this.getHtmlElement().setAttribute('aria-label', this.a11yTitle);
		}

		if (this.a11yReadOnly !== null) {
			this.getHtmlElement().setAttribute('aria-readonly', this.a11yReadOnly);
		}
	});

	/* mark tables with the ZWidgetTable class as
	 * presentational */
	skin.override.append('DwtControl.prototype._createHtmlFromTemplate', function() {
		util.setTableRolePresentation(this.getHtmlElement()/*,'ZWidgetTable'*/);
	});

	/* detect disabled elements */
	skin.override('DwtControl.prototype.setDisplayState', function(state) {
		var a = [];
		for (var i = 0; i < arguments.length; i++) {
			a.push(arguments[i]);
		}
		if (!this._enabled) {
			a.push(DwtControl.DISABLED);
		}
		state = a.join(" ");
		if (this._displayState != state) {
			this._displayState = state;
			Dwt.delClass(this.getHtmlElement(), DwtControl._RE_STATES, state);
		}

		var el = this.getHtmlElement();

		if (el) {
			el.setAttribute('aria-disabled',
							Boolean(Dwt.hasClass(el, DwtControl.DISABLED)));

			if (Dwt.hasClass(el, DwtControl.SELECTED)) {
				el.setAttribute('aria-selected', true);
			} else {
				el.removeAttribute('aria-selected');
			}
						   
		} else if (window.console) {
			console.warn("%s has no element? id=%s",
						 this, this.getHTMLElId());
		}
	});

	var ignore_next_click = false;

	// This wrapper exists to intercept ONCLICK events.
	//
	// In the ideal world, ZCS would listen for these events, and thus
	// behave properly regardless of whether the user was sighted or
	// blind. Instead, ZCS listens (almost exclusively) for
	// ONMOUSEUP/ONMOUSEDOWN events, and effectively offers it's own
	// implementation of clicks. Which doesn't work with screenreaders
	// other than VoiceOver.
	//
	// What we do instead is listen for the cases where an
	// ONMOUSEUP/ONMOUSEDOWN sequence *would* trigger an ONCLICK, and
	// disregard the click. This allows us to focus on the remainder
	// of cases, which we may assume are triggered by a keyboard or an
	// assitive technology.
	skin.override('DwtControl.__mouseEvent', function(ev, eventType, obj, mouseEv) {
		var r = arguments.callee.func.apply(this, arguments);
		if (eventType == DwtEvent.ONMOUSELEAVE ||
			eventType == DwtEvent.ONMOUSEOUT) {
			// we're 'switching' elements, so the browser won't
			// trigger a click event
			ignore_next_click = false;

		} else if (eventType == DwtEvent.ONMOUSEUP) {
			// yes, ignore the next click -- ZCS' built-in click-ish
			// thing will work just fine
			ignore_next_click = true;

		} else if (eventType == DwtEvent.ONCLICK) {
			if (ignore_next_click) {
				ignore_next_click = false;
				return true;
			}

			var obj = obj ? obj : DwtControl.getTargetControl(ev);

			// check whether the target control listens for clicks,
			// and if not, fake a mouseup/mousedown event pair
			if (obj && obj.isListenerRegistered &&
				!obj.isListenerRegistered(DwtEvent.ONCLICK)) {
				DBG.println(AjxDebug.DBG1, 'faking a click!');
				window.console && console.warn('faking a click!');

				eventType = DwtEvent.ONMOUSEDOWN;
				if (ev) ev.type = eventType;

				arguments.callee.func(ev, eventType,
									  obj, DwtShell.mouseEvent);

				eventType = DwtEvent.ONMOUSEUP;
				if (ev) ev.type = eventType;

				arguments.callee.func(ev, eventType,
									  obj, DwtShell.mouseEvent);

				return DwtShell.mouseEvent._returnValue;
			}
		}
		return r;
	});

	skin.override('DwtControl.prototype.__doFocus', function() {
		if (!this._hasFocus) {
			var r = arguments.callee.func.apply(this, arguments);
			if (this.a11yFocusable && !this.a11yFocusesChild) {
				if (this.getHtmlElement()) {
					util.focus(this.getHtmlElement());
				} else if (window.console) {
					console.warn("%s has no element? id=%s",
								 this, this.getHTMLElId());
				}
			}
			return r;
		}
	});

	skin.override('DwtControl.prototype.canReceiveTabFocus', function(){
		return this.a11yFocusable || this.isInputControl;
	});
	
	skin.override("DwtComposite.prototype.sortChildren", function(){
		this._children.sort(function(childA, childB){
			var childAel = childA && childA.getHtmlElement(),
				childBel = childB && childB.getHtmlElement();
			if (childAel && childBel) {
				if (childAel.compareDocumentPosition) {
					return 3 - (childAel.compareDocumentPosition(childBel) & 6);
				} else if (childAel.sourceIndex !== undefined) {
					return childAel.sourceIndex - childBel.sourceIndex;
				}
			}
			return 0;
		});
	});




	skin.override('DwtControl.prototype.setAriaLabel', function(text) {
		if (text) {
			text = (this.a11yLabelPrefix || "") + AjxStringUtil.htmlDecode(text).replace(/&[^;]*;/,"").replace(/:|;/,"");
		}
		if (text || text==="") {
			this.getHtmlElement().setAttribute('aria-label', text);
		}
	});
	skin.override('DwtControl.prototype.getAriaLabel', function() {
		this.getHtmlElement().getAttribute('aria-label');
	});
	skin.override('DwtControl.prototype.clearAriaLabel', function() {
		this.getHtmlElement().removeAttribute('aria-label');
	});

/*
	skin.override("DwtControl.prototype.setDescribedBy", function(labelText){
		return util.setDescribedBy(this.getHtmlElement(), labelText);
	});
	skin.override("DwtControl.prototype.getDescribedBy", function(){
		return util.getDescribedBy(this.getHtmlElement());
	});
	skin.override("DwtControl.prototype.clearDescribedBy", function(){
		return util.clearDescribedBy(this.getHtmlElement());
	});*/
/*
	skin.override("DwtControl.prototype.updateAriaLabeling", function(){
		if (this.__hasDialog || this.__hasMenu) {
			var text = [];
			if (this.__hasDialog) {
				text.push(ZmMsg.opensDialog);
			}
			if (this.__hasMenu) {
				text.push(ZmMsg.opensMenu);
				if (util.isInstance(this, "DwtMenuItem")) {
					text.push(ZmMsg.useKeyRightMenu);
				} else if (util.isInstance(this, "DwtButton")) {
					text.push(ZmMsg.useKeyDownMenu);
				}
				util.setHasActionMenu(this.getHtmlElement(), true);
			}
			this.setDescribedBy(text.join(", "));
		} else {
			this.clearDescribedBy();
			util.setHasActionMenu(this.getHtmlElement(), false);
		}
	});*/


})();
