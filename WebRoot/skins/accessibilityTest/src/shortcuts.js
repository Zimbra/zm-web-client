(function(){
	var util = comcast.access.util;

	skin.classListener('AjxKeys', function(){
		var removal = [];
		var tokenSeparator = ".";
		for (var key in AjxKeys) {
			var tokens = key.split(tokenSeparator);
			if (tokens && tokens.length && tokens[tokens.length-1] == "disabled") {
				removal.push(tokens.slice(0,tokens.length-1).join(tokenSeparator));
			}
		}
		for (var key in AjxKeys) {
			for (var i=0; i<removal.length; i++) {
				if (key.indexOf(removal[i])==0) {
					delete AjxKeys[key];
					break;
				}
			}
		}
	});

	skin.classListener('ZmShortcutsPanel', function(){
		ZmShortcutsPanel.prototype.a11yRole = 'dialog';
		ZmShortcutsPanel.prototype.a11yFocusable = true;
		ZmShortcutsPanel.prototype.a11yTitle = ZmMsg.keyboardShortcuts;

		ZmShortcutsPanel.tabItemClass = "ShortcutTabItem";
	});

	skin.override('ZmShortcutsPanel.prototype._createHtml', function() {
		if (appCtxt.isChildWindow) {
			Dwt.setSize(appCtxt.getShell().getHtmlElement(), Dwt.DEFAULT, Dwt.CLEAR);
			skin.includeCSS("/skins/velodrome2/print-keys.css", {media:"print"});
		}

		var id = this.getHTMLElId(),
			el = this.getHtmlElement();

		this._createHtmlFromTemplate("prefs.Pages#ShortcutsPanel", {id: id});

		this._headerDiv = Dwt.byId(id+"_header");
		this._headerLabel = Dwt.byId(id+"_headerLabel");
		this._headerDescription = Dwt.byId(id+"_headerDescription");
		this._contentDiv = Dwt.byId(id+"_content");

		Dwt.addClass(this._contentDiv, "ShortcutsContent");

		this.setZIndex(Dwt.Z_DIALOG);

		this._resize();

		this._closeLink = Dwt.byId(id+"_close");
		Dwt.setHandler(this._closeLink, DwtEvent.ONCLICK, ZmShortcutsPanel.closeCallback);

		this._detachLink = Dwt.byId(id+"_detach");
		if (this._detachLink) {
			Dwt.setHandler(this._detachLink, DwtEvent.ONCLICK, ZmShortcutsPanel.newWindowCallback);
		}

		el.setAttribute('aria-labelledby', id+"_headerLabel");
		el.setAttribute('aria-describedby', id+"_headerDescription");

		this._shellResizeListener = new AjxListener(this,this._resize);
	});

	skin.override("ZmShortcutsPanel.prototype._resize", function(){
		if (!appCtxt.isChildWindow) {
			var shellSize = appCtxt.getShell().getSize(),
				navbar = Dwt.byId("xcnavbar"),
				navBarSize = navbar && Dwt.getSize(navbar).y || 0,
				availableHeight = shellSize.y - navBarSize;

			var newHeight = availableHeight < 600 ? availableHeight : 600;
			this.setSize(Dwt.DEFAULT, newHeight);
			this._position({
				x: Math.round((shellSize.x - this.getSize().x) / 2),
				y: Math.round((shellSize.y - newHeight - navBarSize) / 2) + navBarSize
			});
		}

		var headerHeight = Dwt.getSize(this._headerDiv).y;
		var h = (newHeight || this.getSize().y) - headerHeight;
		Dwt.setSize(this._contentDiv, Dwt.DEFAULT, h - 10);
	});

	skin.override('ZmShortcutsPanel.prototype.popup', function(cols) {
		var kbMgr = appCtxt.getKeyboardMgr();
		kbMgr.pushDefaultHandler(this);
		this._cols = cols;
		Dwt.setZIndex(appCtxt.getShell()._veilOverlay, Dwt.Z_VEIL);
		var list = this._list = new ZmShortcutList({style:ZmShortcutList.PANEL_STYLE, cols:cols});
		this._contentDiv.innerHTML = list.getContent();
		if (!appCtxt.isChildWindow) {
			this._resize();
		}
		this._contentDiv.scrollTop = 0;

		this._tabGroup.removeAllMembers();

		var kbItems = [];

		kbItems.push(this._headerDescription);

		var headerLinks = [this._closeLink];
		if (this._detachLink) {
			headerLinks.push(this._detachLink);
		}
		util.setElementRole(headerLinks, "link");
		kbItems.push(headerLinks);

		kbItems = kbItems.concat(skin.byClass(ZmShortcutsPanel.tabItemClass, this._contentDiv));

		for (var i=0; i<kbItems.length; i++) {
			var item = kbItems[i];
			util.makeFocusable(item);
			this._tabGroup.addMember(item);
		}
		this._tabGroup.resetFocusMember(true);
		
		kbMgr.pushTabGroup(this._tabGroup);
		appCtxt.getShell().addControlListener(this._shellResizeListener);
	});

	skin.override.append('ZmShortcutsPanel.prototype.popdown', function() {
		appCtxt.getShell().removeControlListener(this._shellResizeListener);
	});

	skin.override('ZmShortcutsPanel.prototype.handleKeyEvent', function(ev) {
		// the original implementation calls close callback regardless
		// of which key is actually pressed -- we definitely don't
		// want that
		var charcode = DwtKeyEvent.getCharCode(ev);
		var key = String.fromCharCode(charcode);

		if (charcode == DwtKeyEvent.KEY_ESCAPE || key == "Q") {
			ZmShortcutsPanel.closeCallback();
			return true; // The event has been handled, don't do anything further
		}
	});

	skin.override("ZmShortcutList.prototype._renderShortcuts", function(cols) {
		var html = [],
			i = 0;
		html[i++] = "<div class='ZmShortcutList'>";
		html[i++] = "<table cellspacing=10 cellpadding=0 border=0 role='presentation' style='";
		if (AjxEnv.isIE) {
			html[i++] = "width:100%";
		} else {
			html[i++] = "margin:0 auto";
		}

		html[i++] = "'>";
		if (cols[0].title) {
			html[i++] = "<tr>";
			var style = ZmShortcutList._getClass("shortcutListType", this._style);
			for (j = 0; j < cols.length; j++) {
				html[i++] = "<td";
				if (AjxEnv.isIE) {
					html[i++] = " align='center'";
				}
				html[i++] = "><div class='" + style + "'>" + cols[j].title + "</div></td>";
			}
			html[i++] = "</tr>";
		}
		html[i++] = "<tr><td";
		if (AjxEnv.isIE) {
			html[i++] = " align='center'";
		}
		html[i++] = ">";
		for (j = 0; j < cols.length; j++) {
			i = this._getKeysHtml(cols[j], html, i);
		}
		html[i++] = "</td></tr></table>";
		html[i++] = "</div>";

		return html.join("");
	});

	skin.override('ZmShortcutList.prototype._getKeysHtml', function(params, html, i) {
		// bastardisation of _getKeysHtml which renders the shortcuts
		// as definition lists rather than tables, and inserts some
		// ARIA headings

		var keys = (params.type == ZmShortcutList.TYPE_APP) ? ZmKeys : AjxKeys;
		var kmm = appCtxt.getKeyboardMgr().__keyMapMgr;
		var mapDesc = {}, mapsFound = [], mapsHash = {}, keySequences = {}, mapsToShow = {}, mapsToOmit = {};
		if (params.maps) {
			for (var k = 0; k < params.maps.length; k++) {
				mapsToShow[params.maps[k]] = true;
			}
		}
		if (params.omit) {
			for (var k = 0; k < params.omit.length; k++) {
				mapsToOmit[params.omit[k]] = true;
			}
		}
		for (var propName in keys) {
			var propValue = keys[propName];
			if (!propValue || (typeof propValue != "string")) { continue; }
			var parts = propName.split(".");
			var map = parts[0];
			if ((params.maps && !mapsToShow[map]) || (params.omit && mapsToOmit[map])) { continue; }
			var isMap = (parts.length == 2);
			var action = isMap ? null : parts[1];
			var field = parts[parts.length - 1];

			if (action && (map != ZmKeyMap.MAP_CUSTOM)) {
				// make sure shortcut is defined && available
				var ks = kmm.getKeySequences(map, action);
				if (!(ks && ks.length)) { continue; }
			}
			if (field == "description") {
				if (isMap) {
					mapsFound.push(map);
					mapsHash[map] = true;
					mapDesc[map] = propValue;
				} else {
					keySequences[map] = keySequences[map] || [];
					keySequences[map].push([map, action].join("."));
				}
			}
		}

		var sortFunc = function(keyA, keyB) {
			var sortPropNameA = [keyA, "sort"].join(".");
			var sortPropNameB = [keyB, "sort"].join(".");
			var sortA = keys[sortPropNameA] ? Number(keys[sortPropNameA]) : 0;
			var sortB = keys[sortPropNameB] ? Number(keys[sortPropNameB]) : 0;
			return (sortA > sortB) ? 1 : (sortA < sortB) ? -1 : 0;
		}
		var maps = [];
		if (params.sort || !params.maps) {
			mapsFound.sort(sortFunc);
			maps = mapsFound;
		} else {
			for (var j = 0; j < params.maps.length; j++) {
				var map = params.maps[j];
				if (mapsHash[map]) {
					maps.push(map);
				}
			}
		}


		var or = [" ", ZmMsg.or, " "].join("");
		for (var j = 0; j < maps.length; j++) {
			var map = maps[j];
			if (!keySequences[map]) { continue; }
			html[i++] = "<div role='heading' aria-level='2' class='" + ZmShortcutList._getClass("shortcutListHeader", this._style) + "'>";
			var mapDesc = keys[[map, "description"].join(".")];
			html[i++] = mapDesc;
			html[i++] = "</div>";
			html[i++] = "<dl class='" + ZmShortcutList._getClass("shortcutListTable", this._style) + "' role='list'>";

			var actions = keySequences[map];
			if (actions && actions.length) {
				actions.sort(sortFunc);
				for (var k = 0; k < actions.length; k++) {
					var isodd = Boolean(k % 2);
					var action = actions[k];
					var ks = keys[[action, "display"].join(".")];
					var desc = keys[[action, "description"].join(".")];

					var cls = ZmShortcutList._getClass("shortcutKeys", this._style);
					cls += isodd ? " shortcutKeysOdd" : " shortcutKeysEven";

					html[i++] = "<div role='listitem' class='"+ZmShortcutsPanel.tabItemClass+"'>";
					
					html[i++] = "<div class='";
					html[i++] = cls
					html[i++] = "'>";
					var keySeq = ks.split(/\s*;\s*/);
					var keySeq1 = [];
					for (var m = 0; m < keySeq.length; m++) {
						keySeq1.push(ZmShortcutList._formatKeySequence(keySeq[m], this._style));
					}
					html[i++] = keySeq1.join(or);
					html[i++] = "</div>";
					html[i++] = "<div class='";

					var cls = ZmShortcutList._getClass("shortcutDescription", this._style);
					cls += isodd ? " shortcutDescriptionOdd" : " shortcutDescriptionEven";

					html[i++] = cls;
					html[i++] = "'>";
					html[i++] = desc;
					html[i++] = "</div>";

					html[i++] = "</div>";
				}
			}
			html[i++] = "</dl>";
		}

		return i;
	});

})();
