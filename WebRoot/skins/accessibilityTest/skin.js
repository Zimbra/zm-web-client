/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite, Network Edition.
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.  All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
//
// Skin class
//
function VelodromeSkin() {
	ZmSkin.call(this, {
        // specific components
        appChooser: {direction:"LR", fullWidth:true},
        helpButton: {style:"link", container:"quota", hideIcon:true, url: "http://www.comcast.net/help/faq/index.jsp?cat=Email#SmartZone"},
        logoutButton: {style:"link", container:"quota", hideIcon:true},
        // skin regions
        quota: {containers: ["skin_td_quota"]},
        userInfo: {position: "static"},
        sidebarAd: {
            containers: function(skin, state) {
                skin._showEl("skin_sidebar_ad_outer", state);
                skin._reflowApp();
            }
        },
        fullScreen: {containers: ["skin_tr_main_full", "!skin_tr_main","!skin_td_tree_outer", "!skin_td_tree_app_sash"]},
        searchBuilder: {containers: ["skin_tr_search_builder_toolbar", "skin_tr_search_builder", "skin_td_search_builder_toolbar", "skin_td_search_builder"] },
        treeFooter: {containers: ["skin_tr_tree_footer", "skin_td_tree_footer","skin_container_tree_footer"]},
		//tree: {containers: ["skin_td_tree_outer","skin_td_tree_app_sash"], maxWidth: 400}
        tree: {containers: ["skin_td_tree_outer"], resizeContainers: ["skin_col_tree"], maxWidth: 400}
    });
	this._appChooserListeners = [];
	this._appCreateListeners = [];
	this._tabQueue = [];
}

VelodromeSkin.prototype = new ZmSkin;
VelodromeSkin.prototype.constructor = VelodromeSkin;

//
// Public methods
//

VelodromeSkin.prototype.show = function(id, visible) {

    ZmFolder.HIDE_ID[ZmFolder.ID_AUTO_ADDED] = true;

	ZmSkin.prototype.show.apply(this, arguments);

    if (id == "fullScreen") {
        // true, if unspecified
        visible = visible == null || visible;

        // swap toolbar containers
        var parentId = visible ? "skin_full_toolbar_container" : "skin_main_toolbar_container";
        var parentEl = document.getElementById(parentId);

        var toolbarId = "skin_container_app_top_toolbar";
        var toolbarEl = document.getElementById(toolbarId);

        parentEl.appendChild(toolbarEl);
    }
};

VelodromeSkin.prototype.getSidebarAdContainer = function() {
    return document.getElementById("skin_container_sidebar_ad");
};

VelodromeSkin.prototype._getPortalToolBarOps = function() {
    return [];
};

VelodromeSkin.prototype.setTreeWidth = function(width) {
    ZmSkin.prototype.setTreeWidth.call(this, width);
};

VelodromeSkin.prototype._setContainerSizes = function(containerName, width, height) {
	var containers = this.hints[containerName].resizeContainers || this.hints[containerName].containers;
	for (var i = 0; i < containers.length; i++) {
		Dwt.setSize(containers[i], width, null);
	}
};

//
// Skin instance
skin = new VelodromeSkin();

// Namespace for much of our code
if (!window.comcast) window.comcast = {};

// App listeners

if (window.ZmZimbraMail) {
	skin.__handleMailLaunch = function() {
		appCtxt.set(ZmSetting.SEND_ON_BEHALF_OF, true);
	};
	ZmZimbraMail.addAppListener(ZmApp.MAIL, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin.__handleMailLaunch));

	VelodromeSkin.prototype.__handleVoiceLaunch = function() {
		ZmVoiceApp.overviewFallbackApp = ZmApp.MAIL;
	};
	ZmZimbraMail.addAppListener(ZmApp.VOICE, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin.__handleVoiceLaunch));
}

if (window.AjxDispatcher) {
	skin.__handlePortalLaunch = function() {
		this.overrideAPI(ZmPortalController.prototype, "_getToolBarOps", this._getPortalToolBarOps);

		var historylistener = new AjxListener(this, this._historyChangeListener);
		appCtxt.getHistoryMgr().addListener(historylistener);
		appCtxt.getAppController().addPostRenderCallback(historylistener);
	};

	AjxDispatcher.addPackageLoadFunction("Portal", new AjxCallback(skin, skin.__handlePortalLaunch));
}


//
// utility methods
//


VelodromeSkin.prototype.hashContains = function(hash, object, strict) {
	for (var id in hash) {
		if ((strict && hash[id] === object) || (!strict && hash[id] == object))
			return true;
	}
	return false;
};

//------------------------------------------------------------------------------

	// Runs the function or callback (or array of these) with the supplied arguments
VelodromeSkin.prototype.run = function(fctOrCallback /*, args... */) {
	if (fctOrCallback) {
		var args = Array.prototype.slice.call(arguments, 1);
		if (fctOrCallback instanceof AjxCallback) {
			return fctOrCallback.run.apply(fctOrCallback, args);
		} else if (AjxUtil.isFunction(fctOrCallback)) {
			return fctOrCallback.apply(fctOrCallback, args);
		} else if (AjxUtil.isArray(fctOrCallback)) {
			var retVal = [];
			var array = [].concat(fctOrCallback); // Copy the array so any changes made by the callbacks are ignored here
			for (var i=0, cnt = array.length; i<cnt; i++) {
				retVal[i] = this.run.apply(this,[array[i]].concat(args));
			}
			return retVal;
		}
	}
};

	// Same as run above, but the arguments are in array form
VelodromeSkin.prototype.apply = function(fctOrCallback, args) {
	this.run.apply(this, [fctOrCallback].concat(args));
};

//------------------------------------------------------------------------------


// Overrides a function in an object (usually a class prototype) with a new function "newfunc"
// The overridden function will be saved as the "func" attribute before we perform the call to newfunc.
// It may be called as arguments.callee.func from inside the new function (A), or as object[funcname].func from other functions (B).
// newfunc may be available to several classes (call overrideAPI on several class prototypes), and remain the same shared function object.
// Each time object[funcname] is called, the newfunc.func attribute is set to the appropriate overridden function.
// (Previous implementation overwrote newfunc.func for good, throwing overridden functions into the void)
VelodromeSkin.prototype.overrideAPI = function(object, funcname, newfunc, displayname) {
    newfunc = newfunc || this[funcname];
    if (newfunc) {
        var oldfunc = object[funcname];
        object[funcname] = function() {
            newfunc.func = oldfunc; // (A)
            return newfunc.apply(this, arguments);
        }
        object[funcname].displayName = displayname || funcname;
        object[funcname].func = oldfunc; // (B)
		object[funcname].inner = newfunc;
    }
};

VelodromeSkin.prototype._parseFunctionPath = function(functionString, descend) {
	var lastDot = functionString.lastIndexOf("."),
		objectArr = functionString.substr(0,lastDot).split("."),
		methodStr = functionString.substr(lastDot+1),
		object = window,
		returnValue = {method:methodStr, path:objectArr};
	if (descend) {
		for (var i=0; i<objectArr.length; i++) {
			object = object[objectArr[i]];
			if (!AjxUtil.isObject(object) && !AjxUtil.isFunction(object) && window.console) {
				console.log("Cannot parse "+functionString+", child object does not exist: "+objectArr[i]);
				return null;
			}
		}
		returnValue.object = object;
	}
	return returnValue;
};

// Latches onto a function and reports each time it is called
// Usage example: skin.report("Dwt.byId");
VelodromeSkin.prototype.report = function(functionString, withTrace, callback) {
	if (window.console) {
		this.override(functionString, function(){
			console.log(AjxUtil.isFunction(this)?"":this,functionString+"(",AjxEnv.isIE ? skin.arrayLikeToArray(arguments).join(", ") : arguments,") BEGIN");
			if (withTrace) {
				if (console.trace) {
					console.trace(); // Sane browsers
				} else {
					 // IE
						var curr  = arguments.callee.caller,
							FUNC  = 'function', ANON = "{anonymous}",
							fnRE  = /function\s*([\w\-$]+)?\s*\(/i,
							stack = [],j=0,
							fn,args,i;

						while (curr && j<100) {
							fn    = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
							args  = stack.slice.call(curr.arguments);
							i     = args.length;

							while (i--) {
								switch (typeof args[i]) {
									case 'string'  : args[i] = '"'+args[i].replace(/"/g,'\\"')+'"'; break;
									case 'function': args[i] = FUNC; break;
								}
							}

							stack[j++] = fn + '(' + args.join() + ')';
							curr = curr.caller;
						}
						console.log(stack.join("\n"));
				}
			}
			var r = arguments.callee.func.apply(this,arguments);
			console.log(AjxUtil.isFunction(this)?"":this,functionString+"(",AjxEnv.isIE ? skin.arrayLikeToArray(arguments).join(", ") : arguments,") END");
			return r;
		}, callback);
	}
};


// The goal is to expose an override function skin.override(str, fct, cb);
// where we don't have to worry about packages. Thus:
// skin.override("ZmMsgController.prototype.show", function(){ do something }, new AjxCallback(function(){ console.log("done!"); }));
// will put our function into a structure, waiting for ZmMsgController.prototype
// to exist, and then override the show method, calling the callback when it's been done.
// Thus we don't need to worry about enveloping the override in a package load function

// We build a tree structure of methods to override. This structure is later used to perform all overrides
// Structure is:
// {'ClassA':{'prototype':{'methodX':[<function>], 'methodY':[<function>]}}, 'ClassB':{'prototype':{'methodZ':[<function>,<function>]}}}
// this will override ClassA.prototype.methodX with the first function, ClassA.prototype.methodY with the second, and
// ClassB.prototype.methodZ will be overridden twice (if the second override calls arguments.callee.func.apply, the first override is called too)
	
VelodromeSkin.prototype._overrideCache = {};
VelodromeSkin.prototype.override = function(functionString, newfunc, callback) {
	//console.log("added override for ",functionString, {f:newfunc});
	if (window.AjxUtil) {
		if (AjxUtil.isArray(functionString)) {
			for (var i=0; i<functionString.length; i++) {
				this.override(functionString[i], newfunc, callback);
			}
		} else {
			var name = 'wrapper for ' + functionString;
			var a = this._parseFunctionPath(functionString, false),
				cache = this._overrideCache;
			if (a) {
				var currentHash = cache;
				for (var i=0; i<a.path.length; i++) {
					var pathPart = a.path[i];
					if (!currentHash[pathPart]) {
						currentHash[pathPart] = {};
					}
					currentHash = currentHash[pathPart];
				}
				if (!currentHash[a.method]) {
					currentHash[a.method] = [];
				}
				currentHash[a.method].push({
					func:newfunc, callback:callback, name: name
				});
			}
		}

		this._doOverrides();
	}
};

VelodromeSkin.prototype._doOverrides = function() {
	var recurse = function(treeobj, winobj, keys) {
		for (var key in treeobj) {
			var path = keys.concat(key);
			if (AjxUtil.isArray(treeobj[key])) {
				for (var i=0; i<treeobj[key].length; i++) {
					var override = treeobj[key][i];
					//console.log("overriding ",path.join(".")," with function ",{f:override.func});
					skin.overrideAPI(winobj, key, override.func, override.name);
					if (override.callback) {
						skin.run(override.callback);
					}
				}
				treeobj[key].length = 0;
			} else if (winobj[key]) {
				recurse(treeobj[key], winobj[key], path);
			}
			if (!AjxUtil.arraySize(treeobj[key])) {
				delete treeobj[key];
			}
		}
	}
	recurse(this._overrideCache, window, []);
};

VelodromeSkin.prototype.override.append = function(functionString, newfunc, callback, returnOrig) {
	var f = newfunc,
		r = returnOrig !== false;
	skin.override(functionString, function(){
		var origReturn = arguments.callee.func.apply(this,arguments);
		var newReturn = f.apply(this,arguments);
		return r ? origReturn : newReturn;
	}, callback);
};

//------------------------------------------------------------------------------

VelodromeSkin.prototype.appCtxtListener = function(callback) {
	this.classListener("appCtxt",callback);
};

// set a function to be called when a class is available to us
// e.g. classListener("DwtToolBar", function(){ do something now that DwtToolBar exists });
VelodromeSkin.prototype.classListener = function(className, callback) {
	if (callback) {
		if (window[className]) {
			this.run(callback);
		} else {
			if (!this._classListeners[className]) {
				this._classListeners[className] = [];
			}
			this._classListeners[className].push(callback);
		}
	}
};
VelodromeSkin.prototype._classListeners = {},
VelodromeSkin.prototype._runEligibleClassListeners = function() {
	for (var className in this._classListeners) {
		if (window[className]) {
			this.run(this._classListeners[className]);
			delete this._classListeners[className];
		}
	}
};

//------------------------------------------------------------------------------

VelodromeSkin.prototype._packageLoaded = function() {
	this._doOverrides();
	this._runEligibleClassListeners();
};

if (window.AjxCallback && window.AjxDispatcher && window.ZmZimbraMail && window.ZmAppEvent) { // We are in the main page, not in a login screen
	(function(){
	
		var cb = new AjxCallback(skin, skin._packageLoaded),
			// All the packages in zimbra
			packages = ["Alert","Docs","NewWindow_1","SpreadsheetPreview","BriefcaseCore","DocsPreview",
				"NewWindow_2","Startup1_1","Briefcase","Extras","Portal","Startup1_2",
				"BrowserPlus","IMConference","PreferencesCore","Startup2","CalendarAppt",
				"IMCore","Preferences","TasksCore","CalendarCore","IM","Share","Tasks",
				"Calendar","ImportExport","Slides","UnitTest","ContactsCore","Leaks",
				"SpreadsheetALE","Voicemail","Contacts","MailCore","SpreadsheetEmbed",
				"ZimletApp","Crypt","Mail","Spreadsheet","Zimlet","TinyMCE"];
		for (var i=0; i<packages.length; i++) {
			AjxDispatcher.addPackageLoadFunction(packages[i], cb);
		}
		// Also call the listener around the startup, to catch stuff like appCtxt
		ZmZimbraMail.addListener(ZmAppEvent.PRE_STARTUP, cb);
		ZmZimbraMail.addListener(ZmAppEvent.POST_STARTUP, cb);

		// Although updating zimlet classes stinks to high heaven, we sometimes need to do it
		skin.appCtxtListener(function(){
		    appCtxt.addZimletsLoadedListener(cb);
		});
	})();

	// DwtMenuItem is already loaded
	skin.override("DwtMenuItem.prototype.setShortcut", function(shortcut) {});
	skin.override("ZmContactsApp.prototype._registerPrefs", function() {});
}

	VelodromeSkin.prototype._parseHashString = function(hash) {
		try {
		    if (!hash)
		        hash = window.location.hash;

		    return AjxStringUtil.parseQueryString(hash.replace(/^#*/, '?'));
		} catch (e) {
		    console.warn(e.stack, e);
		}
	};

	VelodromeSkin.prototype._historyChangeListener = function(ev) {
		var query = this._parseHashString(ev && ev.data);

		if (query && query.app) {
		    appCtxt.getAppController().activateApp(query.app);
		}
	};



// text: The text to display on the tab
// image: A ZCS image class. Since you don't show icons on the tabs, this is irrelevant for you
// tooltip: Text to display in the tooltil when hovering over the tab
// url: The point of this whole story
// index: The index in the tabs ordering, if you want the tab to be elsewhere but in the end. Set it to a string to replace an existing tab
// directLink: Clicking the tab redirects the whole page to the url
// showLeft: display the left bar

VelodromeSkin.prototype.customUrlTab = function(param) {
	var id = param.id = param.id || "CustomTab"+Dwt.getNextId(),
		app = param.app = new ZmApp(id, this, DwtShell.getShell(window));

	var qsRef = ZmApp.QS_ARG;
	if (AjxUtil.isString(param.index)) {
		qsRef[id] = qsRef[param.index]
		delete qsRef[param.index];
	}
		
	if (param.qsArg && param.qsArg != param.index) {
		qsRef[id] = param.qsArg;
	}

	app.launch = function(){
	};

	this.addAppChooserListener(new AjxCallback(this, this._customUrlTab, [param]));
};

VelodromeSkin.prototype._customUrlTab = function(param) {
	var id = param.id,
		app = param.app,
		controller = appCtxt.getAppController(),
		chooser = appCtxt.getAppChooser(),
		destination = param.url,
		index = param.index,
		showLeft = param.showLeft,
		launchCallback = param.launchCallback;

	var buttonParams = {
		text:param.text,
		image:param.image,
		tooltip:param.tooltip,
		textPrecedence: 30
	};

	if (!this.__prefsIndex) {
		this.__prefsIndex = AjxUtil.indexOf(chooser.getItems(), chooser.getButton("Options"));
	}
	if (index != null) {
		if (AjxUtil.isNumber(index) && index >= 0) {
			buttonParams.index = index;
		} else if (AjxUtil.isString(index)) {
			var oldButton = chooser.getButton(index);
			if (oldButton) {
				buttonParams.index = AjxUtil.indexOf(chooser.getItems(), oldButton);
				chooser.removeButton(index);

				if (param.replaceApp && appCtxt.getApp(index) instanceof ZmApp) {
					controller._apps[index] = app;
				}

			} else {
				index = null;
			}
		}
	}

	if (index == null) {
		buttonParams.index = this.__prefsIndex;
	}

	chooser.addButton(id, buttonParams);
	
	if (param.directLink) {
		app.launch = function(params, callback) {
			window.location = destination;
		};
	} else {
		var viewName = id+"_frame",
			iframeView = new ZmUpsellView({id:id, parent:appCtxt.getShell(), posStyle:Dwt.ABSOLUTE_STYLE, className: 'ZmUpsellView'}),
			iframeId = iframeView.getHTMLElId() + "_iframe",
			el = iframeView.getHtmlElement(),
			elements = {},
			callbacks = {};
		el.innerHTML = ["<iframe id='", iframeId, "' width='100%' height='100%' frameborder='0'>"].join("");
		elements[ZmAppViewMgr.C_APP_CONTENT] = iframeView;
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(function(){
			Dwt.setTitle([ZmMsg.zimbraTitle, param.text].join(": "));
			var iframe = Dwt.byId(iframeId);
			if (iframe && !iframe.src && destination) {
				iframe.src = destination;
			}

			if (!showLeft) {
				setTimeout(function(){
					var containers = skin.hints.tree.containers;
					for (var i=0; i<containers.length; i++) {
						skin._hideEl(containers[i]);
					}
					skin._reflowApp();
				},10);
			}

		});
		if (param.callbacks) {
			AjxUtil.hashUpdate(callbacks, param.callbacks, true);
		}

		app.createView({viewId:viewName, elements:elements, isTransient:false, callbacks:callbacks, hide:param.showLeft?null:ZmAppViewMgr.LEFT_NAV});

		app.launch = function(params, callback) {
			app.pushView(viewName);
			if (launchCallback) {
				skin.run(launchCallback);
			}
			if (callback) {
				skin.run(callback);
			}
		};


		iframeView.addSelectionListener = iframeView.addActionListener = function(){}; // No-op (called from ZmBaseController.prototype._initializeView)
	}
	controller.addApp(app);

	// Rebuild appchooser buttons hash, because ZCS <= 6 will have a problem with closing mail tabs otherwise
	var buttonsHash = {},
		children = chooser.getChildren();
	for (var i=0; i<children.length; i++) {
	    var button = children[i];
	    buttonsHash[button.getData("_id_")] = button;
	}
	chooser._buttons = buttonsHash;
	chooser._createPrecedenceList();

	if (param.callback) {
		skin.run(param.callback);
	}
	return id;
};
VelodromeSkin.prototype.getIframeById = function(id) {
	return DwtControl.fromElementId(id);
};

VelodromeSkin.prototype.getTabIndex = function(id) {
	var appChooser = appCtxt.getAppChooser(),
		button = appChooser.getButton(id);
	return button ? AjxUtil.indexOf(appChooser.getItems(), button) : -1;
};


VelodromeSkin.prototype.addAppChooserListener = function(callback) {
	if (this._appChooserListenersRun) {
		this.run(callback);
	} else {
		this._appChooserListeners.push(callback);
	}
};

skin.override("ZmZimbraMail.prototype._createAppChooser", function() {
	var appChooser = this._appChooser = arguments.callee.func.apply(this,arguments);
	for (var i=0; i<skin._appChooserListeners.length; i++) {
		try {
			skin.run(skin._appChooserListeners[i]);
		} catch (e) {}
	}
	skin._appChooserListenersRun = true;
	return appChooser;
});

VelodromeSkin.prototype.addAppCreateListener = function(callback) {
	if (this._appCreateListenersRun) {
		this.run(callback);
	} else {
		this._appCreateListeners.push(callback);
	}
};

skin.override("ZmZimbraMail.prototype._createEnabledApps", function() {
	arguments.callee.func.apply(this,arguments);
	for (var i=0; i<skin._appCreateListeners.length; i++) {
		try {
			skin.run(skin._appCreateListeners[i]);
		} catch (e) {}
	}
	skin._appCreateListenersRun = true;
});


VelodromeSkin.prototype.byClass = function(className, ancestor, firstOnly) {
	if (!ancestor) {
		if (document.getElementsByClassName) {
			var matches = document.getElementsByClassName(className);
			return (matches && firstOnly) ? (matches[0] || null) : this.arrayLikeToArray(matches);
		} else {
			ancestor = document.body;
		}
	}
	if (ancestor.getElementsByClassName) {
		var matches = ancestor.getElementsByClassName(className);
		return (matches && firstOnly) ? (matches[0] || null) : this.arrayLikeToArray(matches);
	}
	var items = [];
	var recurse = function(el) {
		if (el && el.children) {
			for (var i=0; i<el.children.length; i++) {
				var child = el.children[i];
				if (Dwt.hasClass(child, className)) {
					items.push(child);
					if (firstOnly) {
						break;
					}
				}
				recurse(child);
				if (firstOnly && items.length) {
					break;
				}
			}
		}
	};
	recurse(ancestor);
	return (items && firstOnly) ? (items[0] || null) : items;
};

VelodromeSkin.prototype.sortElements = function(elements) {
	return elements.sort(function(a,b){
		if (a.compareDocumentPosition) {
			return 3 - (a.compareDocumentPosition(b) & 6);
		} else if (a.sourceIndex !== undefined) {
			return a.sourceIndex - b.sourceIndex;
		}
	});
};

VelodromeSkin.prototype.arrayLikeToArray = function(arrayLike) {
	var array = [];
	if (arrayLike && arrayLike.length) {
		for (var i=0; i<arrayLike.length; i++) {
			array[i] = arrayLike[i];
		}
	}
	return array;
};

VelodromeSkin.prototype.cacheBuster = (function(){
	var settingString = "XCTAG_JS_RESOURCE_VERSIONING".replace(/^\s|\s$/,"").toLowerCase();
	return (settingString == "1" || settingString == "true" || settingString == "yes") ? ("?t=" + new Date().valueOf()) : "";
})();

VelodromeSkin.prototype.includeJS = function(url) {
	url += this.cacheBuster;
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	head.appendChild(script);
};
VelodromeSkin.prototype.includeCSS = function(url, params) {
	params = params || {};
	url += this.cacheBuster;
	var head = document.getElementsByTagName("head")[0];
	var link = document.createElement("link");
	link.rel = params.rel || "stylesheet";
	link.type = params.type || "text/css";
	link.href = url;
	if (params.media) {
		link.media = params.media;
	}
	head.appendChild(link);
};
