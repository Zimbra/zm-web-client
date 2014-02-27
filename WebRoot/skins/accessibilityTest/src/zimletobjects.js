(function(){
	var util = comcast.access.util;

	var parentHasClass = function(el, className) {
		do {
			if (el.className && Dwt.hasClass(el, className)) {
				return el;
			}
			el = el.parentNode;
		} while (el);
		return false;
	};

	skin.override("ZmObjectHandler.prototype.generateSpan", function(html, idx, obj, spanId, context, options) {
		html[idx++] = "<a class='";
		html[idx++] = this.getClassName(obj);
		html[idx++] = "' id='";
		html[idx++] = spanId;

		var bodyHtml = [];
		this._getHtmlContent(bodyHtml, 0, obj, context, spanId, options);
		var body = bodyHtml.join("");

		html[idx++] = "' ";

		var tmp = document.createElement("div");
		tmp.innerHTML = body;
		var firstTag = tmp.firstChild;

		if (tmp.children.length === 1 && firstTag && firstTag.tagName==="A") {
			html[idx++] = "href='" + firstTag.href + "'";
			if (firstTag.target) {
				html[idx++] = ' target="' + firstTag.target + '"';
			}
			html[idx++] = ">";
			html[idx++] = firstTag.innerHTML;
		} else {
			html[idx++] = "href='javascript:window.top.ZmObjectManager.__doClickObject(document.getElementById(\""+spanId+"\"));'>";
			html[idx++] = body;
		}
		
		html[idx++] = "</a>";
		return idx;
	});

	skin.override("ZmObjectManager.__doClickObject", function(element){
		for (var i=0; i<ZmObjectManager.__instances.length; i++) {
			var objectManager = ZmObjectManager.__instances[i];
			var object = objectManager && objectManager._objects && objectManager._objects[element.id];
			if (object) {
				if (objectManager._selectCallback) {
					objectManager._selectCallback.run();
				}
				object.handler.selected(object.object, element, null, object.context);
				break;
			}
		}
	});
	skin.override.append("ZmObjectManager.prototype.setView", function(){
		if (!ZmObjectManager.__instances) {
			ZmObjectManager.__instances = [];
		}
		if (!AjxUtil.arrayContains(ZmObjectManager.__instances, this)) {
			ZmObjectManager.__instances.push(this);
		}
	});

	var ariaLabel = function(objects, doc) {
		if (!doc) {
			doc = document;
		}

		for (var id in objects) {
			var object = objects[id],
				handler = object && object.handler,
				el = object.id && doc.getElementById(object.id);

			if (el && el.tagName === "A" && !el.innerHTML) {
				el.parentNode.removeChild(el);
				delete objects[id];
				continue;
			}

			if (el && util.isInstance(handler,"ZmZimletBase") && handler._zimletContext._contentActionMenu) {
				util.setHasActionMenu(el, true);
			}

			if (el) {
				var parentWithClass = parentHasClass(el, "LabelColValue");
				var childWithClass = Dwt.byClassName("a11yHidden", el);
				if (parentWithClass && !(childWithClass && childWithClass.length)) {
					var label = parentWithClass.previousSibling;
					if (Dwt.hasClass(label, "LabelColName")) {
						var newlabel = util.stripHTML(label.innerHTML).replace(/&[^;]*;/,"").replace(/:|;/,"") + " ";
						el.insertBefore(util.createHiddenTextNode(newlabel,"span"), el.firstChild);
					}
				}
			}
		}
	};

	skin.override.append("ZmObjectManager.prototype.findObjectsInNode", function(){
		ariaLabel(this._objects);
	});

	skin.override("ZmObjectManager.prototype.processObjectsInNode", function(doc, node){
		var processed = this.__processedElements = this.__processedElements || [];

		var objectManager = this;
		doc = doc || node.ownerDocument;
		var tmpdiv = doc.createElement("div");

		var recurse = function(node, handlers) {
			var tmp, i, val, next;

			if (AjxUtil.arrayContains(processed, node)) {
				return node.nextSibling;
			}

			switch (node.nodeType) {
				case 1:	// ELEMENT_NODE
				node.normalize();
				var tagName = node.tagName.toLowerCase();

				if (next == null) {
					if (/^(img|a)$/.test(tagName)) {
						var isMailTo = (tagName == 'a' && ZmMailMsgView._MAILTO_RE.test(node.href));
						if (tagName == "a" && node.target && (isMailTo || ZmMailMsgView._URL_RE.test(node.href))) {
							// tricky.
							var txt = isMailTo ? node.href : RegExp.$1 ;
							tmp = doc.createElement("div");
							tmp.innerHTML = objectManager.findObjects(AjxStringUtil.trim(txt));

							tmp = tmp.firstChild;
							processed.push(node);
							processed.push(tmp);

							if (tmp.nodeType == 3) {
								// probably no objects were found.  A warning would be OK here
								// since the regexps guarantee that objects _should_ be found.
								return tmp.nextSibling;
							}
							// here, tmp is an object span, but it
							// contains the URL (href) instead of
							// the original link text.
							node.parentNode.insertBefore(tmp, node); // add it to DOM
							if (tagName==="a" && tmp.tagName==="A") {
								tmp.innerHTML = node.innerHTML;
								tmp.style.cssText = node.style.cssText;
								node.parentNode.removeChild(node);
							} else {
								tmp.innerHTML = "";
								tmp.appendChild(node); // we have the original link now
							}
							return tmp.nextSibling;	// move on
						}
						handlers = false;
					}
				} else {
					// consider processed
					node = next;
				}

				// bug 28264: the only workaround possible seems to be
				// to remove textIndent styles that have a negative value:
				if (parseFloat(node.style.textIndent) < 0) {
					node.style.textIndent = "";
				}
				for (i = node.firstChild; i; i = recurse(i, handlers)) {}
				return node.nextSibling;

				case 3:	// TEXT_NODE
				case 4:	// CDATA_SECTION_NODE (just in case)
				// generate ObjectHandler-s
				if (handlers && /[^\s\xA0]/.test(node.data)) try {
	 				var a = null, b = null;

					if (!AjxEnv.isIE) {
						// this block of code is supposed to free the object handlers from
						// dealing with whitespace.  However, IE sometimes crashes here, for
						// reasons that weren't possible to determine--hence we avoid this
						// step for IE.  (bug #5345)
						var results = /^[\s\xA0]+/.exec(node.data);
						if (results) {
							a = node;
							node = node.splitText(results[0].length);
						}
						results = /[\s\xA0]+$/.exec(node.data);
						if (results)
							b = node.splitText(node.data.length - results[0].length);
					}

					tmp = tmpdiv;

					var code = objectManager.findObjects(node.data, true, null, false);
					var disembowel = false;
					if (AjxEnv.isIE) {
						// Bug #6481, #4498: innerHTML in IE massacrates whitespace
						//			unless it sees a <pre> in the code.
						tmp.innerHTML = [ "<pre>", code, "</pre>" ].join("");
						disembowel = true;
					} else {
						tmp.innerHTML = code;
					}

					if (a)
						tmp.insertBefore(a, tmp.firstChild);
					if (b)
						tmp.appendChild(b);

					a = node.parentNode;
					if (disembowel)
						tmp = tmp.firstChild;
					while (tmp.firstChild) {
						processed.push(tmp.firstChild);
						a.insertBefore(tmp.firstChild, node);
					}

					tmp = node.nextSibling;
					a.removeChild(node);
					return tmp;
				} catch(ex) {};
			}
			return node.nextSibling;
		};

		// Parse through the DOM directly and find objects.
		if (node && node.childNodes && node.childNodes.length) {
			for (var i = 0; i < node.childNodes.length; i++){
				recurse(node.childNodes[i], true);
			}
		}

		ariaLabel(this._objects, doc);
	});

})();
