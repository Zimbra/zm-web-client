(function(){

	var util = comcast.access.util;
	var log = util.logger(comcast.access.debug.logTabSelection);

	util.addStylesheet("/skins/accessibilityTest/src/tab-selection"+(AjxEnv.isIE?"-ie":"")+".css");

	var getHtmlElement = function(item) {
		if (item instanceof DwtControl) {
			return item.getHtmlElement();
		} else if (util.isElement(item)) {
			return item;
		}
	};

	var parentHasClass = function(el, className) {
		do {
			if (el.className && Dwt.hasClass(el, className)) {
				return true;
			}
			el = el.parentNode;
		} while (el);
		return false;
	};

	var addFocusedClass = function(el){
		if (el) {
			var newClass;
			if (AjxEnv.isIE) {
				var tagName = el.tagName.toLowerCase();
				var classes = el.className && AjxUtil.arrayAsHash(el.className.split(/\s+/)) || {};

				if (classes["ZmAppChooser"]) {
					newClass = "TabFocusedColor";
				}
				else if (classes["ZButton"] && classes["ZSelected"]) {
					newClass = "TabFocusedColorParent";
				}

				else if (classes["ZmMailMsgView"] || classes["ZmConvView2"] || classes["ZmMailMsgCapsuleView"] || tagName=="li") {
					newClass = "TabFocusedBorder";
				}

 				else if (parentHasClass(el, "mceDialog") && tagName==="a" && classes["pickcolor"]) {
					newClass = "TabFocusedOutlineParent";
				}

				else if (tagName==="a" || (tagName==="span" && (classes["ZmAttachDialog-removeLink"] || classes["SpellCheckLink"])) || el.getAttribute("role")==="link") {
					newClass = "TabFocusedOutline";
				}
				else if (classes["ZmOverview"] || classes["ZToolbar"] || classes["DwtListView"] || classes["DwtChooserListView"] || classes["Object"] || Dwt.hasClass("MsgBody")) {
					newClass = "TabFocusedOutline";
				}
				else if (parentHasClass(el, "ZmShortcutsPanel") || parentHasClass(el, "ZmShortcutsWindow")) {
					newClass = "TabFocusedOutline";
				}
				else if (classes["ZButton"] || (classes["ZToolbarButton"] && classes["ZDisabled"]) || classes["ZSelectAutoSizingContainer"]) {
					newClass = "TabFocusedOutlineParent";
				}
				//else if (Dwt.hasClass(el, "mceListBox") || Dwt.hasClass(el, "mceSplitButton") || Dwt.hasClass(el, "mceButton")) {
				else if (parentHasClass(el, "mceDialog") && (tagName==="input" || tagName==="select" || tagName==="li")) {
					newClass = "TabFocusedOutline";
				}
				else if (parentHasClass(el, "DwtDialog") && tagName==="input") {
					newClass = "TabFocusedOutline";
				}
				else if (parentHasClass(el, "mceToolbar") && (tagName==="div")) {
					newClass = "TabFocusedOutline";
				}

			} else {
				newClass = "TabFocused";
			}
			if (newClass) {
				Dwt.addClass(el, newClass);
			}
		}
	};

	var removeFocusedClass = function(el){
		if (el) {
			if (AjxEnv.isIE) {
				Dwt.delClass(el, "TabFocusedColor");
				Dwt.delClass(el, "TabFocusedBorder");
				Dwt.delClass(el, "TabFocusedOutline");
				Dwt.delClass(el, "TabFocusedColorParent");
				Dwt.delClass(el, "TabFocusedBorderParent");
				Dwt.delClass(el, "TabFocusedOutlineParent");
			} else {
				Dwt.delClass(el, "TabFocused");
			}
		}
	};

	// Log current tab selection in console
	skin.override('DwtTabGroup.prototype.__setFocusMember', function(member){
		var oldFocusMember = this.__currFocusMember;
		var newFocusMember = arguments.callee.func.apply(this, arguments);
		if (newFocusMember) {
			log("__newFocusMember: ", newFocusMember.getTabGroupMember ? newFocusMember.getTabGroupMember() : newFocusMember, getHtmlElement(newFocusMember));
			addFocusedClass(getHtmlElement(newFocusMember));
			if (oldFocusMember && oldFocusMember !== newFocusMember) {
				removeFocusedClass(getHtmlElement(oldFocusMember));
			}
			var newElement = getHtmlElement(newFocusMember);
			if (newElement && newElement.onTabFocus) {
				newElement.onTabFocus();
			}
		}
		return newFocusMember;
	});

	skin.override("DwtTabGroup.prototype.setFocusMember",function(member){
		var oldFocusMember = this.__currFocusMember;
		var success = arguments.callee.func.apply(this,arguments);
		if (success) {
			var newFocusMember = this.__currFocusMember;
			log("newFocusMember: ",newFocusMember.getTabGroupMember ? newFocusMember.getTabGroupMember() : newFocusMember, getHtmlElement(newFocusMember));
			addFocusedClass(getHtmlElement(newFocusMember));
			if (oldFocusMember && oldFocusMember !== newFocusMember) {
				removeFocusedClass(getHtmlElement(oldFocusMember));
			}
			var newElement = getHtmlElement(newFocusMember);
			if (newElement && newElement.onTabFocus) {
				newElement.onTabFocus();
			}
		}
		return success;
	});

	skin.override("DwtTabGroup.prototype.resetFocusMember",function(){
		var oldFocusMember = this.__currFocusMember;
		if (oldFocusMember) {
			removeFocusedClass(getHtmlElement(oldFocusMember));
		}
		var newFocusMember = arguments.callee.func.apply(this,arguments);
		addFocusedClass(getHtmlElement(newFocusMember));
		var newElement = getHtmlElement(newFocusMember);
		if (newElement && newElement.onTabFocus) {
			newElement.onTabFocus();
		}
		return newFocusMember;
	});

	skin.override("DwtTabGroup.prototype.replaceMember",function(oldMember, newMember, checkEnabled, skipNotify, focusItem, noFocus){
		if (oldMember && oldMember.getTabGroupMember && oldMember.getTabGroupMember() !== oldMember) {
			oldMember = oldMember.getTabGroupMember(); // Use tabGroupMember whenever possible
		}
		if (newMember && newMember.getTabGroupMember && newMember.getTabGroupMember() !== newMember) {
			newMember = newMember.getTabGroupMember(); // Use tabGroupMember whenever possible
		}
		if (newMember instanceof DwtTabGroup) {
			newMember.newParent(this);
		}

		if (oldMember === newMember) {
			return true;
		}

		var rootTg = this.__getRootTabGroup(),
			oldFocusMember = rootTg.__currFocusMember;

		var retVal = arguments.callee.func.apply(this,arguments);

		var newFocusMember = rootTg.__currFocusMember;
		addFocusedClass(getHtmlElement(newFocusMember));
		if (oldFocusMember && oldFocusMember !== newFocusMember) {
			removeFocusedClass(getHtmlElement(oldFocusMember));
		}
		return retVal;
	});

	skin.override('DwtTabGroup.prototype.__checkEnabled',function(member, checkEnabled) {
		if (!checkEnabled) return true;
		if (!member || member.noTab) {
			log(member,"failed","(!",!!member," || ",member&&member.noTab,")");
			return false;
		}
		if (member instanceof DwtControl) {
			log(member,(member.getEnabled() && member.getVisible())?"succeeded":"failed","(",member.getEnabled()," && ",member.getVisible(),")");
			return (util.isVisible(member)/* && member.getEnabled()*/);
		} else {
			log(member,(!member.disabled && Dwt.getVisible(member))?"succeeded":"failed","(!",!!member.disabled," && ",Dwt.getVisible(member),")");
			return (util.isVisible(member)/* && !member.disabled && !Dwt.hasClass(member,"mceButtonDisabled")*/)
		}
	});

	skin.override("DwtTabGroup.prototype.__getNextMember",function(member, checkEnabled) {
		log("Find next member after ",member,"in",this);
		var members = this.__members;
		var sz = members.size();
		// Start working from the member to the immediate right of <member> rightwards
		for (var i = members.indexOf(member) + 1; i < sz; i++) {
			var nextMember = members.get(i);
			if (nextMember) {
				if (nextMember instanceof DwtTabGroup) {
					//If the sibling is a tab group, get its leftmost member.
					nextMember = nextMember.__getLeftMostMember(checkEnabled);
					if (nextMember && this.__checkEnabled(nextMember, checkEnabled)) {
						log("found ",nextMember.toString());
						return nextMember;
					} else {
						log("skipping ",nextMember,", it is not enabled");
					}
				} else {
					// if sibling is not a tab group, then it is the next child.
					if (this.__checkEnabled(nextMember, checkEnabled)) {
						log("found ",nextMember.outerHTML);
						return nextMember;
					} else {
						log("skipping ",nextMember,", it is not enabled");
					}
				}
			} else {
				log("skipping empty member");
			}
		}
		log("no siblings or children found, ascending");

		/* If we have fallen through to here it is because the tab group only has 
		 * one member or we are at the end of the list. So we roll up to the parent, 
		 * unless we are at the root in which case we return null. */
		return this.__parent ? this.__parent.__getNextMember(this, checkEnabled) : null;
	});

	skin.override("DwtTabGroup.prototype.__getPrevMember",function(member, checkEnabled) {
		log("Find prev member before ",member,"in",this);
		var members = this.__members;
		// Start working from the member to the immediate left of <member> rightwards
		for (var i = members.indexOf(member) - 1; i >= 0; i--) {
			var prevMember = members.get(i);
			if (prevMember) {

				if (prevMember instanceof DwtTabGroup) {
					//If the sibling is a tab group, get its rightmost member.
					prevMember = prevMember.__getRightMostMember(checkEnabled);
					if (prevMember && this.__checkEnabled(prevMember, checkEnabled)) {
						log("found ",prevMember);
						return prevMember;
					} else {
						log("skipping ",prevMember,", it is not enabled");
					}
				} else {
					// if sibling is not a tab group, then it is the next child.
					if (this.__checkEnabled(prevMember, checkEnabled)) {
						log("found ",prevMember);
						return prevMember;
					} else {
						log("skipping ",prevMember,", it is not enabled");
					}
				}
			} else {
				log("skipping empty member");
			}
		}
		log("no siblings or children found, ascending");

		/* If we have fallen through to here it is because the tab group only has 
		 * one member or we are at the end of the list. So we roll up to the parent, 
		 * unless we are at the root in which case we return null. */
		//log("going to parent...");
		return this.__parent ? this.__parent.__getPrevMember(this, checkEnabled) : null;
	});

	// When opening a draft (or otherwise changing view from a mail list), the old controller has a timeout on grabbing the tabgroup again
	// Require that a controller is current before letting it put its tabgroup into root, and see if we don't already have focus
	skin.override("ZmController.prototype._restoreFocus",function(focusItem, noFocus){
		var controller = util.isInstance(this,"ZmSearchResultsController") && this._resultsController || this;
		if (controller === appCtxt.getCurrentController()) {
			var currentFocus = appCtxt.getRootTabGroup().getFocusMember(),
				currentFocusControl = currentFocus && ((currentFocus instanceof DwtControl) ? currentFocus : DwtControl.findControl(currentFocus)) || null;
			if (!currentFocusControl || currentFocusControl._controller !== controller) {
				//arguments.callee.func.apply(this,arguments);

				var rootTg = appCtxt.getRootTabGroup();

				var curApp = appCtxt.getCurrentApp();
				var ovId = curApp && curApp.getOverviewId();
				var overview = ovId && appCtxt.getOverviewController().getOverview(ovId);
				if (rootTg && overview && (overview != ZmController._currentOverview)) {
					//rootTg.replaceMember(ZmController._currentOverview, overview, false, false, null, true);
					rootTg.replaceMember(ZmController._currentOverview, overview, false, false, null, noFocus);
					ZmController._currentOverview = overview;
				}

				var member = controller.getTabGroup();
				log("focusItem = ",focusItem," || ",controller._savedFocusMember," || ",controller._getDefaultFocusItem()," || ",rootTg.getFocusMember());
				focusItem = focusItem || controller._savedFocusMember || controller._getDefaultFocusItem() || rootTg.getFocusMember();
				noFocus = noFocus || ZmController.noFocus;
				ZmController.noFocus = false;
				if (rootTg && member && (member != ZmController._currentAppViewTabGroup)) {
					// In conjunction with the override of ZmZimbraMail.prototype._setupTabGroups, we will insert/replace this member in the "main" tabgroup (child of root), if possible.
					var tg = rootTg.mainMember || rootTg;
					tg.replaceMember(ZmController._currentAppViewTabGroup, member, false, false, focusItem, noFocus);
					ZmController._currentAppViewTabGroup = member;
				} // removed else
				if (focusItem && !noFocus) {
					setTimeout(function(){
						appCtxt.getKeyboardMgr().grabFocus(focusItem);
						if (util.isInstance(controller, "ZmComposeController")) {
							controller._doRestoreFocus(focusItem);
						}
					},10);
				}

			} else {
				log("not focusing view; controller ",controller," already has focus");
			}
		} else {
			log("not focusing view; controller ",controller," is not current");
		}
	});

	// Ensure no duplicates in a tabgroup; tabbing will get stuck if that happens
	// Also, use member's tabGroupMember whenever possible
	skin.override('DwtTabGroup.prototype.addMember',function(member, index) {
		if (!member) {return;}
		var members = (member instanceof Array) ? member : [member];

		for (var i = 0, len = members.length; i < len; i++) {
			var m = members[i];
			if (m && m.getTabGroupMember && m.getTabGroupMember() !== m) {
				m = m.getTabGroupMember(); // Add tabGroupMember whenever possible
			}
			var element = util.getElement(m);
			if (element && element.nodeName==="IFRAME") {
				m = this.__addIframe(element);
			}
			this.__members.add(m, index, true); // No duplicates

			if (m instanceof DwtTabGroup) {
				m.newParent(this);
			}
		}
	});
	skin.override('DwtTabGroup.prototype.getParent',function() {
		return this.__parent;
	});
	
	skin.override('DwtTabGroup.prototype.__dump',function(debugLevel, level) {
		level = level || 0;
		var levelIndent = "";
		for (var i = 0; i < level; i++) {
			levelIndent += "    ";
		}
	
		log(levelIndent + " TABGROUP: " + this.__name);
		levelIndent += "    ";
	
		var sz = this.__members.size();
		var a = this.__members.getArray();
		for (var i = 0; i < sz; i++) {
			var member = a[i];
			if (member instanceof DwtTabGroup) {
				member.__dump(debugLevel, level + 1);
			} else {
				if (appCtxt.getRootTabGroup().getFocusMember() == member) {
					log(levelIndent.replace(/\s/g,">"), member, ((member instanceof DwtControl) ? member.getHTMLElId() : member.id));
				} else {
					log(levelIndent, member, ((member instanceof DwtControl) ? member.getHTMLElId() : member.id));
				}
			}
		}
	});

	//--------------------------------------------------------------------------

	var fakeKeyEvent = function(key, target, shiftKey) {
		if (document.createEvent) {
			var event = document.createEvent("KeyboardEvent");
			event.initKeyEvent("onkeydown", true, true, null, false, false, !!shiftKey, false, key, key);
			target.dispatchEvent(event);
		} else if (document.createEventObject) {
			var event = document.createEventObject(window.event);
			event.keyCode = key
			event.charCode = key;
			event.shiftKey = !!shiftKey;
			target.fireEvent("onkeydown", event);
			target.fireEvent("onkeypress", event);
			target.fireEvent("onkeyup", event);
		}
	};

	skin.override("DwtTabGroup.prototype.__addIframe",function(member){
		if (AjxEnv.isIE) {
			var element = util.getElement(member);
			if (element.nodeName==="IFRAME") {
				var tg = new DwtTabGroup(util.getElementID(member)+"_group");

				var frontguard = document.createElement("span");
				frontguard.tabIndex = 0;
				frontguard.onfocus = function(ev) {
					ev = ev || window.event;
					fakeKeyEvent(DwtKeyMapMgr.TAB_KEYCODE, this, ev.shiftKey);
				};
				frontguard.className="_frontguard_";
				element.parentNode.insertBefore(frontguard, element);
				tg.addMember(frontguard);

				var rearguard = document.createElement("span");
				rearguard.tabIndex = 0;
				rearguard.onfocus = function(ev) {
					ev = ev || window.event;
					fakeKeyEvent(DwtKeyMapMgr.TAB_KEYCODE, this, ev.shiftKey);
				};
				rearguard.className="_rearguard_";
				if (element.nextSibling) {
					element.parentNode.insertBefore(rearguard, element.nextSibling);
				} else {
					element.parentNode.appendChild(rearguard);
				}
				tg.addMember(rearguard);

				return tg;
			}
			return element;
		}
		return member;
	});

	skin.override("DwtTabGroup.prototype.iframeHack",function(kev){
		if (AjxEnv.isIE) {
			if (kev.target.className==="_frontguard_") {
				if (!kev.shiftKey) {
					return false;
				} else {
					this.__getRootTabGroup().setFocusMember(kev.target);
				}
			}
			if (kev.target.className==="_rearguard_") {
				if (kev.shiftKey) {
					return false;
				} else {
					this.__getRootTabGroup().setFocusMember(kev.target);
				}
			}
		}
		return true;
	});

})();
