(function() {
	var util = comcast.access.util;

	skin.override("ZmNewWindow.prototype.getKeyMapMgr", function() {
		return this._kbMgr.__keyMapMgr;
	});

	skin.override.append('DwtKeyboardMgr.prototype.__initKeyboardHandling', function() {
		var kbff = Dwt.byId(DwtKeyboardMgr.FOCUS_FIELD_ID);
		kbff.setAttribute('aria-hidden', true);
		kbff.setAttribute('aria-label', 'Keyboard manager focus field');
	});

	skin.override('DwtKeyboardMgr.prototype.__doGrabFocus', function(focusObj) {
		if (!focusObj ||
			(focusObj===this.__focusObj && 
				(((focusObj instanceof DwtControl) ? focusObj.getHtmlElement() : focusObj) === document.activeElement)
			)) { return; }

		var dwtInputCtrl = focusObj.isInputControl;
	
		if (dwtInputCtrl || !(focusObj instanceof DwtControl)) {
			DBG.println("focus", "DwtKeyboardMgr._doGrabFocus: input or non-control");
			// dealing with an input field
			if (this.__focusObj instanceof DwtControl && !this.__dwtInputCtrl) {
				// ctrl -> input
				this.__oldFocusObj = this.__focusObj;
			}
			this.__focusObj = focusObj;
			this.__dwtInputCtrl = dwtInputCtrl;
			var el = dwtInputCtrl ? focusObj.getInputElement() : focusObj;
			// IE throws JS error if you try to focus a disabled or invisible input
			if ((!AjxEnv.isIE && focusObj.focus) ||
				(AjxEnv.isIE && focusObj.focus && !el.disabled && Dwt.getVisible(el))) {
				// ignore exception - IE sometimes still throws error, don't know why
				try {
					util.focus(focusObj);
				} catch(ex) {}
			}
		} else {
			DBG.println("focus", "DwtKeyboardMgr._doGrabFocus: control");
			// If the current focus of obj and the one grabbing focus are both DwtControls
			// then we need to simulate a blur on the control losing focus
			if (this.__dwtCtrlHasFocus && (this.__focusObj instanceof DwtControl)) {
				// ctrl -> ctrl: blur old ctrl
				DwtKeyboardMgr.__onBlurHdlr();
				this.__dwtCtrlHasFocus = true;	// reset
			}
			
			this.__focusObj = focusObj;
			this.__dwtInputCtrl = false;
		
			// If a DwtControl already has focus, then we need to manually call
			// DwtKeyboardMgr.__onFocusHdlr to simulate focus since calling the focus()
			// method on the input field does nothing.
			if (this.__dwtCtrlHasFocus) {
				// ctrl -> ctrl: tell newly focused ctrl it got focus
				DwtKeyboardMgr.__onFocusHdlr();
			} else {
				DwtKeyboardMgr.__onFocusHdlr();
				// input -> ctrl: set browser focus to keyboard input field
				if (this.__enabled) {
				//	util.focus(this._kbFocusField);
				}
			}
		}
		if (this.__focusObj instanceof DwtControl && this.__focusObj.a11yFocusable) {
			util.focus(this.__focusObj.getHtmlElement());
		}
	});

	skin.override("DwtKeyboardMgr.__syncFocus", function(kbMgr, obj) {
		if (util.isFocusable(kbMgr.__focusObj)) {
			return true;
		}
	
		if (!kbMgr.__dwtCtrlHasFocus) {
			if ((obj != kbMgr.__focusObj) && !kbMgr.__dwtInputCtrl) {
				if (kbMgr.__currTabGroup && kbMgr.__currTabGroup.setFocusMember(obj)) {
					kbMgr.__focusObj = obj;
					kbMgr.__oldFocusObj = null;
				} else {
					return false;
				}
			}
		}
		return true;
	});

	// Remove blockade of open menus
	skin.override("DwtKeyboardMgr.__keyDownHdlr", function(ev) {
		ev = DwtUiEvent.getEvent(ev, this);
		var kbMgr = DwtKeyboardMgr.__shell.getKeyboardMgr();
		if (!ev) {
			return;
		}
		ev.focusObj = null;
		if (kbMgr._evtMgr.notifyListeners(DwtEvent.ONKEYDOWN, ev) === false) {
			return false;
		};

		if (DwtKeyboardMgr.__shell._blockInput) { return false; }
		if (kbMgr && !kbMgr.isEnabled()) { return true; }
		if (!kbMgr || !kbMgr.__checkStatus()) { return false; }
		var kev = DwtShell.keyEvent;
		kev.setFromDhtmlEvent(ev);
		var keyCode = DwtKeyEvent.getCharCode(ev);
		var focusInTGMember = DwtKeyboardMgr.__syncFocus(kbMgr, kev.target);

		var currTabGroup = kbMgr.__currTabGroup;
		if (keyCode == DwtKeyMapMgr.TAB_KEYCODE && currTabGroup && !DwtKeyMapMgr.hasModifier(kev)) {
			if (focusInTGMember || currTabGroup.getFocusMember()) {
				if (currTabGroup.iframeHack(kev)) {
				 	if (!kev.shiftKey) {
				 		currTabGroup.getNextFocusMember(true);
				 	} else {
				 		currTabGroup.getPrevFocusMember(true);
				 	}
				} else {
					return kbMgr.__processKeyEvent(ev, kev, true, DwtKeyboardMgr.__KEYSEQ_NOT_HANDLED);
				}
		 	} else {
		 		currTabGroup.resetFocusMember(true);
		 	}
			return kbMgr.__processKeyEvent(ev, kev, false, DwtKeyboardMgr.__KEYSEQ_HANDLED);
		}

		// Enter on a focusable non-control (e.g. span.fakeAnchor or zimlet span object)
		var target = kev.target;
		if (kev.charCode == 13 && util.isFocusable(target) && !DwtControl.fromElement(target) && (target.getAttribute("role")==="link" || target.nodeName.toLowerCase()==="a")) {
			kev.target.click();
			DwtUiEvent.setBehaviour(ev, true, false, true);
			return false;
		}

		return arguments.callee.func.apply(this,arguments);
	});


	// Remove all non-ctrl and non-arrow key shortcuts
	if (comcast.access.debug.disableHotkeys) {
		skin.appCtxtListener(function(){
			var keyMapMgr = appCtxt.getKeyboardMgr().__keyMapMgr;
			for (var mapName in keyMapMgr._map) {
				var map = keyMapMgr._map[mapName],
					newMap = {};
				for (var keySeq in map) {
					if (keySeq.indexOf("Ctrl")===0 ||
						keySeq=="37" || keySeq=="38" || keySeq=="39" || keySeq=="40") {
						newMap[keySeq] = map[keySeq];
					}
				}
				keyMapMgr._map[mapName] = newMap;
				keyMapMgr.reloadMap(mapName);
			}
		});
	}

})();
