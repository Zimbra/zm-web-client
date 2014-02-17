(function(){
var util = comcast.access.util = {

	DINGBATS: {
		CHECKMARK: '\u221A',
		BLACK_CIRCLE: '\u25CF',

		BALLOT: {
			EMPTY: '\u2610',
			CHECKED: '\u2611',
			CROSSED: '\u2612'
		},
		TRIANGLE: {
			LEFT: '\u25C0',
			RIGHT: '\u25B6',
			UP: '\u25B2',
			DOWN: '\u25BC'
		}
	},

	setTemplate: function(templateId, templateHtml) {
		AjxTemplate.compile(templateId, true, true, templateHtml);
		//AjxTemplate.register(templateId, compiled, {id: templateId}, true);
	},

	envelopChildren: function(el, tagNameOrNode) {
		var node = AjxUtil.isString(tagNameOrNode) ? document.createElement(tagNameOrNode) : (this.isElement(tagNameOrNode) ? tagNameOrNode : null);
		if (node) {
			for (var i=0; i<el.children.length; i++) {
				var child = el.children[i];
				el.removeChild(child);
				node.appendChild(child);
			}
			el.appendChild(node);
			return node;
		}
	},

	getAncestor: function getAncestor(el, filter) {
		while (el != null) {
			if (filter(el))
				return el;
			else
				el = el.parentNode;
		}
		return null;
	},

	isHighContrastMode: function() {
		// pick a random colour and see if it's retained as background
		// (statistically speaking, we would get it wrong about every
		// 16.7 millionth time but avoiding picking too contrasty
		// colors should help)
		var randomcolor =
			new AjxColor(Math.floor(Math.random() * 253 + 1),
						 Math.floor(Math.random() * 253 + 1),
						 Math.floor(Math.random() * 253 + 1)).toString();

		var testelem = document.createElement('div');

		testelem.style.color = randomcolor;

		var intendedcolor =
			DwtCssStyle.getProperty(testelem, 'color');

		testelem = document.createElement('div');
		testelem.style.backgroundColor = randomcolor;

		// we need to insert the element into the document in order
		// for High Contrast mode to affect it
		document.body.appendChild(testelem);

		var actualcolor =
			DwtCssStyle.getProperty(testelem, 'background-color');

		// we better clean up after ourselves
		document.body.removeChild(testelem);

		// now if the intended color didn't take its effect, we're in
		// high contrast mode
		var ishighcontrastmode = (intendedcolor !== actualcolor);

		// a slight -- and possibly premature -- optimization for
		// caching the result of this method
		this.isHighContrastMode = ishighcontrastmode ?
			function() { return true; } : function() { return false; };

		// allow CSS styling based on whether we're in HC mode
		if (ishighcontrastmode) {
			Dwt.addClass(document.body, 'HighContrastMode');
		}

		return ishighcontrastmode;
	},

	createHiddenElement: function(tagname) {
		// we want this element to remain a11y-visible, so use our own
		// CSS class rather than Dwt for adjusting visibility
		var elem = document.createElement(tagname || 'span');
		elem.className = 'a11yHidden';

		return elem;
	},

	createHiddenTextNode: function(text, tagname) {
		var elem = this.createHiddenElement(tagname);
		elem.appendChild(document.createTextNode(text));

		return elem;
	},

	createHiddenHeader: function(text, level) {
		var util = comcast.access.util;

		if (level >= 1 && level <= 6) {
			return util.createHiddenTextNode(text, 'h' + level);
		} else {
			var header = util.createHiddenTextNode(text);
			util.setElementRole(header, 'heading');
			header.setAttribute('aria-level', level);

			return header;
		}
	},

	addStylesheet: function(filename, doc){
		this._stylesheets.push({filename:filename, doc:doc||document});
		skin.appCtxtListener(new AjxCallback(this, this._addStylesheets));
	},
	_stylesheets: [],
	_addStylesheets: function(){
		var stylesheet;
		while (stylesheet = this._stylesheets.shift()) {
			var filename = stylesheet.filename,
				doc = stylesheet.doc,
				head = doc.getElementsByTagName("head")[0],
				link = doc.createElement("link");
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = filename + "?v=" + window.cacheKillerVersion;
			head.appendChild(link);
		}
	},

	_HIDDEN_TEXT_MAP: {},
	_HC_TEXT_MAP: {},

	HIGH_CONTRAST_FALLBACK_CLASS_NAME: 'a11y-text-equiv',

	/**
	 * Create a fallback text. The 'hidden' text is only rendered by
	 * screen readers; the high contrast text is visible when CSS
	 * backgrounds are disabled.
	 *
	 * If no explicit hidden text is specified, use the high contrast
	 * text.
	 */
	setFallbackText: function(element, highcontrasttext, hiddentext) {
		var id = this.getElementID(element);

		if (this.isHighContrastMode()) {
			var textid = this._HC_TEXT_MAP[id] || Dwt.getNextId();
			var textelem = Dwt.byId(textid);

			if (!textelem) {
				textelem = document.createElement('span');
				textelem.className = this.HIGH_CONTRAST_FALLBACK_CLASS_NAME;
				this._HC_TEXT_MAP[id] = textelem.id = textid;
				element.appendChild(textelem);
			}

			if (AjxUtil.isSpecified(textelem.textContent)) {
				textelem.textContent = highcontrasttext;
			} else {
				textelem.innerText = highcontrasttext;
			}
		}

		if (!AjxUtil.isSpecified(hiddentext)) {
			hiddentext = this.isHighContrastMode() ? '' : highcontrasttext;
		}

		var textid = this._HIDDEN_TEXT_MAP[id] || Dwt.getNextId();
		var textelem = Dwt.byId(textid);

		if (!textelem) {
			textelem = this.createHiddenElement();
			this._HIDDEN_TEXT_MAP[id] = textelem.id = textid;
			element.appendChild(textelem);
		}

		if (AjxUtil.isSpecified(textelem.textContent)) {
			textelem.textContent = hiddentext;
		} else {
			textelem.innerText = hiddentext;
		}
	},

	setElementRole: function(el, role) {
		var cause = 'all good';
		if (AjxUtil.isArray(el)) {
			for (var i=0; i<el.length; i++) {
				this.setElementRole(el[i], role);
			}
		} else {
			el = this.getElement(el);
			if (el) {
				if (!el.getAttribute('role')) {
					el.setAttribute('role', role);
					return true;
				} else if (el.getAttribute('role') === role) {
					return true;
				} else {
					cause = 'role already set to ' + el.getAttribute('role');
				}
			} else {
				cause = 'not an element';
			}
		
			var msg = 'failed to set role of ' + el + ' to ' + role + ': ' + cause + '!';

			if (window.console) {
				console.warn(msg);
			}
		}

		return false;
	},

	setTableRolePresentation: function(el, mandatoryClass){
		if (AjxUtil.isArray(el)) {
			for (var i=0; i<el.length; i++) {
				this.setTableRolePresentation(el[i], mandatoryClass);
			}
		} else if (el) {
			if (AjxUtil.isString(el)) {
				el = Dwt.byId(el);
			}
			if (this.isElement(el)) {
				AjxUtil.foreach(el.getElementsByTagName('table'), function(table) {
					if (!mandatoryClass || Dwt.hasClass(table, mandatoryClass)) {
						util.setElementRole(table, 'presentation');
					}
				});
			}
		}
	},


	printElement: function(el, prefixText, suffixText){
		if (window.console) {
			if (AjxEnv.isIE) {
				if (el) {
					console.log((prefixText||"")+el.nodeName+"#"+el.id+"."+(el.className&&el.className.replace(/\s+/,".")||"") + (el.nodeName==="A"?(" "+el.innerHTML):"") + (suffixText||""));
				} else {
					console.log((prefixText||"")+ " NULL " + (suffixText||""));
				}
			} else {
				console.log(prefixText||"",el,suffixText||"");
			}
		}
	},

	focus: function(item) {
		if (this.isInstance(item, "DwtControl")) {
			item = item.getHtmlElement();
		}
		// do focuses here, so we can easily log them if necessary
		if (this.isElement(item) && item !== document.activeElement) {
			if ((AjxEnv.isFirefox && item.nodeName==="IFRAME") || Dwt.hasClass(item,"MsgBody")) {
				// Iframes need to be focused later in FF
				setTimeout(function(){
					item.focus();
				},0);
			} else {
				item.focus();
			}
		}
	},

	EVENT_HANDLERS: {
		// Enable the DwtKeyboardMgr functions to be overridden
		onblur: function(){ return DwtKeyboardMgr.__onBlurHdlr.apply(this,arguments) },
		onfocus: function(){ return DwtKeyboardMgr.__onFocusHdlr.apply(this,arguments) },
		onkeyup: function(){ return DwtKeyboardMgr.__keyUpHdlr.apply(this,arguments) },
		onkeydown: function(){ return DwtKeyboardMgr.__keyDownHdlr.apply(this,arguments) }
	},

	makeFocusable: function(item, handlers, ignoreErrors) {
		if (!item) return;
		if (AjxUtil.isArray(item)) {
			for (var i=0; i<item.length; i++) {
				this.makeFocusable(item[i], handlers, ignoreErrors);
			}
		} else {
			var util = comcast.access.util;

			if (!handlers)
				handlers = AjxUtil.keys(util.EVENT_HANDLERS);

			if (item instanceof DwtControl) {
				item._setEventHdlrs(handlers);
				item.getHtmlElement().tabIndex = 0;

			} else if (util.isElement(item)) {
				if (!item.a11yfocused) {
					AjxUtil.foreach(handlers, function(key) {
						var handler = util.EVENT_HANDLERS[key];
						Dwt.setHandler(item, key, handler);
					});

					item.tabIndex = 0;
					item.a11yfocused = true;

				} else if (window.console && comcast.access.debug.logMakeFocusable) {
					console.log('skipping already focusable element:', item);
				}
			} else if (!ignoreErrors) {
				var msg = 'can only make elements and controls focusable';
				var detail = msg + ', not ' + typeof item + ' - ' + String(item);

				throw new AjxException(msg, AjxException.UNSUPPORTED,
									   'comcast.access.util.makeFocusable',
									   detail);
			}
		}
	},

	isFocusable: function(item) {
		if (!item) {
			return false;

		} else if (this.isElement(item)) {
			return item.tabIndex >= 0;

		} else if (item instanceof DwtListView) {
			// special case; list views aren't focusable as such, but
			// their contents are
			return true;

		} else if (item instanceof DwtControl) {
			return item.a11yFocusable;

		} else {
			if (window.console)
				console.warn('unable to determine focusability of item: ', item);

			return false;
		}
	},

	__addHiddenElement: function(el) {
		if (!this._hiddenElementContainer) {
			var container = this._hiddenElementContainer = document.createElement("div");
			document.body.appendChild(container);
			Dwt.setVisible(container,false);
		}
		this._hiddenElementContainer.appendChild(el);
	},
	__removeHiddenElement: function(el) {
		if (this._hiddenElementContainer) {
			this._hiddenElementContainer.removeChild(el);
		}
	},

	//--------------------------------------------------------------------------
	// Labeling & describing

	setLabel: function(el, labelText){
		if (el) {
			if (AjxUtil.isArray(el)) {
				for (var i=0; i<el.length; i++) {
					this.setLabel(el[i], labelText);
				}
			} else if (AjxUtil.isString(el)) {
				this.setLabel(Dwt.byId(el), labelText);
			} else if (this.isInstance(el,"DwtInputField") || this.isInstance(el,"ZmAddressInputField")) {
				this.setLabel(el.getInputElement(), labelText);
			} else if (this.isElement(el)) {
				if (el.nodeName === "INPUT") {
					var label = this.createHiddenElement("label");
					label.htmlFor = this.getElementID(el);
					label.innerHTML = labelText.replace(/[():]/g,"");
					el.parentNode.insertBefore(label,el);
				} else {
					el.setAttribute("aria-label", labelText);
				}
			}
		}
	},

	setDescribedBy: function(el, labelText, forceCreate){
		if (labelText) {
			var labelId = this.getElementID(el) + "__label" + (forceCreate ? ("_"+Dwt.getNextId()) : "");
			var label = Dwt.byId(labelId);
			if (!label || forceCreate) {
				label = document.createElement("label");
				label.htmlFor = this.getElementID(el);
				label.id = labelId;
				this.__addHiddenElement(label);
				el.setAttribute("aria-describedby",labelId);
			}
			label.innerHTML = labelText.replace(/[()]/g,"");
			return label;
		} else {
			this.clearDescribedBy(el);
		}
	},
	getDescribedBy: function(el){
		var label = Dwt.byId(this.getElementID(el) + "__label");
		return label && label.innerHTML || "";
	},
	clearDescribedBy: function(el){
		var labelId = this.getElementID(el) + "__label";
		var label = Dwt.byId(labelId);
		if (label) {
			this.__removeHiddenElement(label);
			el.removeAttribute("aria-describedby");
		}
	},

	//--------------------------------------------------------------------------

	/* see also DwtControl.prototype.setHasActionMenu */
	setHasActionMenu: function(el, hasMenu) {
		el.setAttribute("aria-haspopup", !!hasMenu);
	},

	/* return the ID of the given element, assigning one if
	 * necessary */
	getElementID: function(el) {
		// the assignment below is deliberate
		return el && (el.id || (el.id = Dwt.getNextId()));
	},

	getElement: function(controlOrElement) {
		if (controlOrElement instanceof DwtControl) {
			return controlOrElement.getHtmlElement();
		} else if (this.isElement(controlOrElement)) {
			return controlOrElement;
		}
	},

	isElement: function(el){
		return typeof(window.HTMLElement) === "object" ?
			(el instanceof HTMLElement) :
			(el && typeof el === "object" && el.nodeType === 1 && typeof el.nodeName==="string");
	},

	isInstance: function(aThing, aClass) {
		if (aThing && aClass) {
			if (AjxUtil.isArray(aClass)) {
				for (var i=0; i<aClass.length; i++) {
					if (this.isInstance(aThing, aClass[i])) {
						return true;
					}
				}
			} else {
				if (AjxUtil.isString(aClass)) {
					aClass = window[aClass];
				}
				if (aClass) {
					return aThing instanceof aClass;
				}
			}
		}
		return false;
	},

	isDescendant: function(childControl, parentControl) {
		childControl = this.getElement(childControl);
		parentControl = this.getElement(parentControl);
		if (childControl && parentControl) {
			do {
				if (childControl === parentControl) {
					return true;
				}
				childControl = childControl.parentNode;
			} while (childControl);
		}
		return false;
	},

	isVisible: function(element) {
		if (element instanceof DwtControl) {
			element = element.getHtmlElement();
		}
		while (element != null && this.isElement(element)) {
			if (!Dwt.getVisible(element)) {
				return false;
			}
			try {
				var loc = Dwt.getLocation(element);
				if (loc.x === Dwt.LOC_NOWHERE || loc.y === Dwt.LOC_NOWHERE) return false;
			} catch (e) {
				return false;
			}
			element = element.parentNode;
			if (element == null) {
				return false; // We are orphaned
			}
			if (element.nodeType==9) {
				if (element.defaultView && element.defaultView.frameElement) { // document in iframe
					element = element.defaultView.frameElement;
				} else {
					return true;
				}
			}
		}
		return false;
	},

//------------------------------------------------------------------------------

	// Returns a function that will log to the console depending on an enabler
	// If the enabler is a function, we call it with the arguments and will only log if it returns a true value
	// If the enabler is not a function, it is simply evaluated as true/false, and we log on a true value
	// For example: var log = util.logger(comcast.access.debug.printFoobars);
	// log("foobar")
	// Or: var log = util.logger(function(){return comcast.access.debug.printFoobars});
	// log("foobar")
	logger: function(enabler) {
		if (!AjxUtil.isFunction(enabler)) {
			var bEnabler = !!enabler;
			enabler = function(){return bEnabler};
		}
		return function() {
			if (window.console && enabler.apply(window,arguments)) {
				var args = Array.prototype.slice.call(arguments);
				var c = window.console;
				if (typeof c == 'object' && c.log && c.log.apply) {
					c.log.apply(c, args);
				}
			}
		};
	},

//------------------------------------------------------------------------------


	_createLiveRegions: function(){
		if (AjxEnv.isFirefox || AjxEnv.isSafari) {
			// VoiceOver doesn't support rude live regions ATM
			AjxUtil.foreach([this.SAY_POLITELY, this.SAY_ASSERTIVELY],
							this._createLiveRegion.bind(this));
		}
	},

	_createLiveRegion: function(assertiveness,text) {
		var label;

		switch (assertiveness) {
		case this.SAY_RUDELY:
			label = AjxMsg.criticalMsg;
			break;

		case this.SAY_ASSERTIVELY:
			label = AjxMsg.warningMsg;
			break;

		case this.SAY_POLITELY:
			label = AjxMsg.infoMsg;
			break;
		}

		if (AjxEnv.isFirefox || (AjxEnv.isSafari && !AjxEnv.isChrome)) {
			var liveRegion = this.createHiddenElement();
			liveRegion.id = 'a11y-live-' + assertiveness;
			liveRegion.setAttribute("aria-live", assertiveness);
			liveRegion.setAttribute("aria-label", label);

			this.setElementRole(liveRegion, 'log');
			document.body.insertBefore(liveRegion, document.body.firstChild);

			return liveRegion;

		} else {
			var liveRegion = document.createElement("div");
			liveRegion.setAttribute("aria-live", assertiveness);

			liveRegion.setAttribute("aria-relevant","additions");

			liveRegion.setAttribute("aria-atomic",false);
			liveRegion.setAttribute("aria-label", label);
			liveRegion.setAttribute("role","log");
			liveRegion.id = Dwt.getNextId();
			liveRegion.className = "a11yHidden";

			liveRegion.appendChild(document.createTextNode(text||"Initial text"));

			appCtxt.getShell().getHtmlElement().appendChild(liveRegion);
			return liveRegion;
		}
	},

	removeElement: function(element, delay){
		if (AjxUtil.isNumber(delay) && delay >= 0) {
			var self = this;
			setTimeout(function(){
				self.removeElement(element);
			},delay);
		} else {
			element.parentNode.removeChild(element);
		}
	},

	SAY_POLITELY: 'polite',
	SAY_ASSERTIVELY: 'assertive',
	SAY_RUDELY: 'rude',
	
	say: function(text, assertiveness){
		if (text && text.length) {
			if (!assertiveness) {
				assertiveness = this.SAY_POLITELY;
			}

			// VoiceOver doesn't support rude live regions ATM
			if (AjxEnv.isMac && assertiveness === this.SAY_RUDELY) {
				assertiveness = this.SAY_ASSERTIVELY;
			}

			if (window.console && comcast.access.debug.logSay) {
				console.log("SAYING %s (%s)", text, assertiveness);
			}

			if (false && AjxEnv.isChrome) {
				// Chrome requires some text be present in the region
				// beforehand, and also when we update
				var p1 = text[0];
				var p2 = text.substring(1);
				var liveRegion = this._createLiveRegion(assertiveness,p1);
				setTimeout(function(){
					liveRegion.appendChild(document.createTextNode(p2));
				},10);
				this.removeElement(liveRegion, 10000);

			} else if (AjxEnv.isFirefox || AjxEnv.isSafari && !AjxEnv.isChrome) {
				// using a persistent live region to which we append
				// paragraphs works best in Safari
				skin.appCtxtListener(new AjxCallback(this, function() {
					var liveRegion = Dwt.byId('a11y-live-' + assertiveness);
					var p = document.createElement('p');
					p.appendChild(document.createTextNode(text));
					liveRegion.appendChild(p);
					this.removeElement(p, 10000);
				}));

			} else if (AjxEnv.isFirefox) {
				var liveRegion = this._createLiveRegion(assertiveness, text);
				this.removeElement(liveRegion, 10000);

			} else { // IE et al
				//var liveRegion = this._createLiveRegion(assertiveness);
				var liveRegion = document.createElement("div");
				appCtxt.getShell().getHtmlElement().appendChild(liveRegion);
				var el1 = document.createElement("span");
				liveRegion.appendChild(el1);
				el1.setAttribute("role", "alert");
				var el2 = document.createTextNode(text);
				el1.appendChild(el2); 
				el1.style.display='none';
				el1.style.display='inline';
				this.removeElement(liveRegion, 10000);
			}
		}
	},

	stripHTML: function(html, emptyAll) {
		var container = document.createElement("div");
		container.innerHTML = html;

		var emptyHiddenTags = function(el, all) {
			if (Dwt.getVisible(el) && !all) {
				for (var i=0; i<el.children.length; i++) {
					emptyHiddenTags(el.children[i]);
				}
			} else {
				el.innerHTML = "";
			}
		};
		for (var i=0; i<container.children.length; i++) {
			emptyHiddenTags(container.children[i], !!emptyAll);
		}
		
		var text = container.innerHTML.replace(/<[^>]+>/g," ");
		text = AjxStringUtil.trim(text,true);
		return text;
	},
	cleanDescription: function(text) {
		text = text && text.replace(/\[.*\]/,"");
		return text;
	},


	/* List for scroll events, and set scroll to 0 when that happens
	Especially moving focus around by tabbing tends to cause some elements to get scrolled down */
	mustNotScroll: function(el) {
		if (el) {
			if (AjxUtil.indexOf(this._mustNotScrollElements, el) == -1) {
				var handler = this._mustNotScrollHandler.bind(this);
				if (el.addEventListener) {
					el.addEventListener("scroll", handler, true);
				} else if (el.attachEvent) {
					el.attachEvent("onscroll", handler);
				}
				this._mustNotScrollElements.push(el);
			}
		}
	},
	_mustNotScrollElements: [],
	_mustNotScrollHandler: function(ev){
		ev = ev || window.event;
		var target = DwtUiEvent.getTarget(ev);
		if (AjxUtil.indexOf(this._mustNotScrollElements, target)!=-1 && target.scrollTop) {
			target.scrollTop = 0;
			setTimeout(function(){
				target.scrollTop = 0;
			},0);
		}
	},
	normalizeScrolls: function(){
		var elements = this._mustNotScrollElements;
		for (var i=0; i<elements.length; i++) {
			var element = elements[i];
			if (element.scrollTop) {
				element.scrollTop = 0;
			}
		}
	},


	pruneObjects: function(objects){
		var finalList = [];
		for (var i=0; i<objects.length; i++) {
			var unique = true;
			for (var j=0; j<objects.length; j++) {
				if (j!=i && this.isDescendant(objects[j], objects[i]) && !(objects[j] == objects[i] && i<j)) {
					unique = false;
					break;
				}
			}
			if (unique) {
				finalList.push(objects[i]);
			}
		}
		return finalList;
	}
};

// Put the comcast.access.util._doOverrides function on a listener for each and every package.
// Then every time a package is loaded, we perform any eligible overrides.

skin.appCtxtListener(new AjxCallback(util, util._createLiveRegions));
})();
