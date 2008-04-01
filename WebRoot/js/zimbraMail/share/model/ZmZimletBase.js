/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/** All Zimlet Objects should inherit from this base class.  It provides
 * default implementation for Zimlet Object functions.  Zimlet developer may
 * wish to override some functions in order to provide custom functionality.
 *
 * @author Mihai Bazon
 */
ZmZimletBase = function() {
	// For Zimlets, the ZmObjectHandler constructor is a no-op.  Zimlets
	// don't receive any arguments in constructor.  In the init() function
	// below we call ZmObjectHandler.init() in order to set some arguments.
}

ZmZimletBase.PANEL_MENU = 1;
ZmZimletBase.CONTENTOBJECT_MENU = 2;

ZmZimletBase.PROXY = "/service/proxy?target=";

ZmZimletBase.prototype = new ZmObjectHandler();

ZmZimletBase.prototype._init =
function(zimletContext, shell) {
	this._passRpcErrors = false;
	this._zimletContext = zimletContext;
	this._dwtShell = shell;
	this._origIcon = this.xmlObj().icon;
	this.__zimletEnabled = true;
	this.name = this.xmlObj().name;

	var contentObj = this.xmlObj("contentObject");
	if (contentObj && contentObj.matchOn) {
		var regExInfo = contentObj.matchOn.regex;
		if(!regExInfo.attrs) {regExInfo.attrs = "ig";}
		this.RE = new RegExp(regExInfo._content, regExInfo.attrs);
		if (contentObj.type) {
			this.type = contentObj.type;
		}
		ZmObjectHandler.prototype.init.call(this, this.type, contentObj["class"]);
	}
};

/// Override this function in order to initialize Zimlet internals.  The base
/// class function should stay no-op.
ZmZimletBase.prototype.init = function() {};

ZmZimletBase.prototype.toString =
function() {
	return this.name;
};

ZmZimletBase.prototype.getShell =
function() {
	return this._dwtShell;
};

/// Adds a new item in the search domain drop-down.  Pass an icon
/// class (null for no icon), a label and optionally a listener that
/// will be called when the item is selected.
ZmZimletBase.prototype.addSearchDomainItem =
function(icon, label, listener, id) {
	var searchToolbar = appCtxt.getSearchController().getSearchToolbar();
	return searchToolbar ? searchToolbar.createCustomSearchBtn(icon, label, listener, id) : null;
};

/// Returns the text entered in the search bar
ZmZimletBase.prototype.getSearchQuery =
function() {
	var searchToolbar = appCtxt.getSearchController().getSearchToolbar();
	return searchToolbar ? searchToolbar.getSearchFieldValue() : null;
};

ZmZimletBase.prototype.getZimletManager =
function() {
	return appCtxt.getZimletMgr();
};

ZmZimletBase.prototype.xmlObj =
function(key) {
	return !key ? this._zimletContext : this._zimletContext.getVal(key);
};


/* Panel Item Methods */


// This method is called when an item is dragged on the Zimlet drop target as
// realized in the UI. It is invoked from within the <dragSource> element. This
// method is only called for the valid types that the Zimlet accepts. This
// method can perform additional validation based on semantic information
// beyond the type of the object being dragged onto the Zimlet. This method
// defines the following formal parameters:
//
// - zmObject
//
// Return true if the drag should be allowed, false otherwise.
ZmZimletBase.prototype.doDrag =
function(zmObject) {
	return true;
};

// This method is called when an item is dropped on the Zimlet item as realized
// in the UI. At this point the Zimlet should perform the actions it needs to
// for the drop. This method defines the following formal parameters:
//
// - zmObject
// - canvas
ZmZimletBase.prototype.doDrop =
function(zmObject) {};

ZmZimletBase.prototype.portletCreated =
function(portlet) {
    DBG.println("portlet created: " + portlet.id);
};

ZmZimletBase.prototype.portletRefreshed =
function(portlet) {
    DBG.println("portlet refreshed: " + portlet.id);
};

// This method is called when the Zimlet panel item is double clicked. This
// method defines the following formal parameters:
//
// - canvas
ZmZimletBase.prototype.doubleClicked =
function(canvas) {
	this.createPropertyEditor();
};

ZmZimletBase.prototype._dispatch =
function(handlerName) {
	var params = [];
	var obj;
	var url;
	for (var i = 1; i < arguments.length; ++i) {
		params[i-1] = arguments[i];
	}
	// create a canvas if so was specified
	var canvas;
	switch (handlerName) {
	    case "singleClicked":
	    case "doubleClicked":
		// the panel item was clicked
		obj = this.xmlObj("zimletPanelItem")
			[handlerName == "singleClicked" ? "onClick" : "onDoubleClick"];
		if (!obj) {
			break;
		}
		url = obj.actionUrl;
		if (url) {
			url = this.xmlObj().makeURL(url);
		}
		if (obj && (obj.canvas || url)) {
			canvas = this.makeCanvas(obj.canvas, url);
		}
		break;

	    case "doDrop":
		obj = params[1]; // the dragSrc that matched
		if (!obj)
			break;
		if (obj.canvas) {
			canvas = obj.canvas[0];
		}
		url = obj.actionUrl;
		if (url && canvas) {
			// params[0] is the dropped object
			url = this.xmlObj().makeURL(url[0], params[0]);
			canvas = this.makeCanvas(canvas, url);
			return "";
		}
		break;
	}
	if (canvas) {
		params.push(canvas);
	}
	return this.xmlObj().callHandler(handlerName, params);
};

// Similar to doubleClicked, but called upon a single click.  Note that this
// might be called once or twice in the case of a dbl. click too.
ZmZimletBase.prototype.singleClicked = function(canvas) {};

// Called when a new message is being viewed.
// msg and oldMsg are ZmMailMsg objects; oldMsg can be null.
ZmZimletBase.prototype.onMsgView = function(msg, oldMsg) {};

/* Content Object methods */

// This method is called when content (e.g. a mail message) is being
// parsed. The match method may be called multiple times for a given piece of
// content and should apply whatever pattern matching is required to identify
// objects in the content. This method defines the following formal parameters
//
// Returns non-null result in the format of String.match if text on the line matched this
// handlers regular expression.
// i.e: var result = zimlet.match(line);
// result[0] should be matched string
// result.index should be location within line match occured
// Zimlets can also set result.context which will be passed back to them during the
//  various method calls (toolTipPoppedUp, clicked, etc)
//
// Zimlets should set regex.lastIndex to startIndex and then use regex.exec(content).
// they should also use the "g" option when constructing their regex.

//
// - content - The content against which to perform a match
// - startIndex - Index in the content at which to begin the search
//
// Return the first content object match in the content starting from startIndex
ZmZimletBase.prototype.match =
function(content, startIndex) {
	if(!this.RE) {return null;}
	this.RE.lastIndex = startIndex;
	var ret = this.RE.exec(content);
	if (ret) {
		ret.context = ret;
	}
	return ret;
};

// The clicked method is called when a Zimlet content object is clicked on by
// the user. This method defines the following formal parameters
//
// - spanElement
// - contentObjText
// - matchContext
// - event
ZmZimletBase.prototype.clicked =
function(spanElement, contentObjText, matchContext, event) {
	var c = this.xmlObj("contentObject.onClick");
	if (c && c.actionUrl) {
		var obj = { objectContent: contentObjText };
		if (matchContext && (matchContext instanceof Array)) {
			for (var i = 0; i < matchContext.length; ++i) {
				obj["$"+i] = matchContext[i];
			}
		}
		this.xmlObj().handleActionUrl(c.actionUrl, c.canvas, obj);
	}
};

// This method is called when the tool tip is being popped up. This method
// defines the following formal parameters:
//
// - spanElement
// - contentObjText
// - matchContext
// - canvas
ZmZimletBase.prototype.toolTipPoppedUp =
function(spanElement, contentObjText, matchContext, canvas) {
	var c = this.xmlObj("contentObject");
	if (c && c.toolTip) {
		var obj = { objectContent: contentObjText };
		if (matchContext) {
			for (var i = 0; i < matchContext.length; ++i) {
				obj["$"+i] = matchContext[i];
			}
		}
		var txt;
		if (c.toolTip instanceof Object &&
		    c.toolTip.actionUrl) {
		    this.xmlObj().handleActionUrl(c.toolTip.actionUrl, [{type:"tooltip"}], obj, canvas);
		    // XXX the tooltip needs "some" text on it initially, otherwise it wouldn't resize afterwards.
		    txt = "fetching data...";
		} else {
			// If it's an email address just use the address value.
			if (obj.objectContent instanceof AjxEmailAddress) {obj.objectContent = obj.objectContent.address;}
			txt = this.xmlObj().processString(c.toolTip, obj);
		}
		canvas.innerHTML = txt;
	}
};

// This method is called when the user is popping down a sticky tool tip. It
// defines the following formal parameters:
//
// - spanElement
// - contentObjText
// - matchContext
// - canvas
//
// Returns null if the tool tip may be popped down, else return a string
// indicating why the tool tip should not be popped down
ZmZimletBase.prototype.toolTipPoppedDown =
function(spanElement, contentObjText, matchContext, canvas) {
};

ZmZimletBase.prototype.getActionMenu =
function(obj, span, context) {
	if (this._zimletContext._contentActionMenu instanceof AjxCallback) {
		this._zimletContext._contentActionMenu = this._zimletContext._contentActionMenu.run();
	}
	this._actionObject = obj;
	this._actionSpan = span;
	this._actionContext = context;
	return this._zimletContext._contentActionMenu;
};

/* Common methods */


// The menuItemSelected method is called when a context menu item is selected
// by the user. It defines the following formal parameters:
//
// - contextMenu - Identifies the context menu from which the item was
//   selected. This may be ZmZimletBase.PANEL_MENU or ZmZimletBase.CONTENTOBJECT_MENU
// - menuItemId - This is the ID that is provided in the <menuItem> elements id attribute
// - spanElement
// - contentObjText
// - canvas
ZmZimletBase.prototype.menuItemSelected =
function(contextMenu, menuItemId, spanElement, contentObjText, canvas) {};

// This method is called by the Zimlet framework if there is a <userProperties>
// element specified in the Zimlet definition file, and if the editor attribute
// of that element is set to custom. This methods responsibility is to create
// property editor for set of properties defined in the <userProperties>
// element.
ZmZimletBase.prototype.createPropertyEditor =
function(callback) {
	var userprop = this.xmlObj().userProperties;

	if (!userprop) {return;}

	if (!this._dlg_propertyEditor) {
		var view = new DwtComposite(this.getShell());
		var pe = this._propertyEditor = new DwtPropertyEditor(view, true);
		pe.initProperties(userprop);
		var dialog_args = {
			title : this._zimletContext.processMessage(this.xmlObj("description")) + " preferences",
			view  : view
		};
		var dlg = this._dlg_propertyEditor = this._createDialog(dialog_args);
		pe.setFixedLabelWidth();
		pe.setFixedFieldWidth();
		dlg.setButtonListener(DwtDialog.OK_BUTTON,
				      new AjxListener(this, function() {
					      this.saveUserProperties(callback);
				      }));
	}
	this._dlg_propertyEditor.popup();
};


/* Helper methods */


/**
 * Displays the given error message in the standard error dialog.
 */
ZmZimletBase.prototype.displayErrorMessage =
function(msg, data, title) {
	if (title == null)
		title = this.xmlObj("description") + " error";
	var dlg = appCtxt.getErrorDialog();
	dlg.reset();
	dlg.setMessage(msg, data, DwtMessageDialog.WARNING_STYLE, title);
	dlg.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
	dlg.popup();
};

ZmZimletBase.prototype.displayStatusMessage =
function(msg) {
	appCtxt.setStatusMsg(msg);
};

ZmZimletBase.prototype.getResource =
function(resourceName) {
	return this.xmlObj().getUrl() + resourceName;
};

ZmZimletBase.prototype.getType =
function() {
	return this.type;
};

ZmZimletBase.prototype.requestFinished =
function(callback, passErrors, xmlargs) {
	this.resetIcon();
	if (!(passErrors || this._passRpcErrors) && !xmlargs.success) {
		this.displayErrorMessage("We could not connect to the remote server, or an error was returned.<br />Error code: " + xmlargs.status, xmlargs.text);
	} else if (callback)
		// Since we don't know for sure if we got an XML in return, it
		// wouldn't be too wise to create an AjxXmlDoc here.  Let's
		// just report the text and the Zimlet should know what to do
		callback.run(xmlargs);
};

ZmZimletBase.prototype.sendRequest =
function(requestStr, serverURL, requestHeaders, callback, useGet, passErrors) {
	if (passErrors == null)
		passErrors = false;
	if (requestStr instanceof AjxSoapDoc)
		requestStr = [ '<?xml version="1.0" encoding="utf-8" ?>',
			       requestStr.getXml() ].join("");
	this.setBusyIcon();
	serverURL = ZmZimletBase.PROXY + AjxStringUtil.urlComponentEncode(serverURL);
	var our_callback = new AjxCallback(this, this.requestFinished, [ callback, passErrors ]);
	return AjxRpc.invoke(requestStr, serverURL, requestHeaders, our_callback, useGet);
};

ZmZimletBase.prototype.enableContextMenuItem =
function(contextMenu, menuItemId, enabled) {};

ZmZimletBase.prototype.getConfigProperty =
function(propertyName) {};

ZmZimletBase.prototype.getUserProperty =
function(propertyName) {
	return this.xmlObj().getPropValue(propertyName);
};

ZmZimletBase.prototype.setUserProperty =
function(propertyName, value, save) {
	this.xmlObj().setPropValue(propertyName, value);
	if (save)
		this.saveUserProperties();
};

/**
 * This will be called by the framework when userProperties are about to be
 * saved.  Returns true if prefs are OK, false or string otherwise.  If a
 * string is returned, an error message will be displayed in the standard
 * dialog.
 */
ZmZimletBase.prototype.checkProperties =
function(props) {
	return true;
};

/**
 * Called by the framework usually during SOAP calls to provide some end-user
 * feedback.  The default is a nice animated icon defined in Zimbra.
 */
ZmZimletBase.prototype.setBusyIcon =
function() {
	this.setIcon("ZimbraIcon DwtWait16Icon");
};

/**
 * Call this function to change the Zimlet's icon in the panel tree.  Called by
 * the framework to provide visual feedback during sendRequest() calls.
 */
ZmZimletBase.prototype.setIcon =
function(icon) {
	if (!this.xmlObj("zimletPanelItem"))
		return;
	this.xmlObj().icon = icon;
	var treeView = appCtxt.getAppViewMgr().getCurrentViewComponent(ZmAppViewMgr.C_TREE);
	var treeItem = treeView && treeView.getTreeItemById(this.xmlObj().getOrganizer().id);
	if (treeItem) {
		treeItem.setImage(icon);
	}
};

/**
 * This resets the Zimlet icon to the one originally specified in the XML file,
 * if any.
 */
ZmZimletBase.prototype.resetIcon =
function() {
	this.setIcon(this._origIcon);
};

ZmZimletBase.prototype.saveUserProperties =
function(callback) {
	var soapDoc = AjxSoapDoc.create("ModifyPropertiesRequest", "urn:zimbraAccount");

	var props = this.xmlObj().userProperties;
	var check = this.checkProperties(props);

	if (!check)
		return "";
	if (typeof check == "string")
		return this.displayErrorMessage(check);

	if (this._propertyEditor)
		if (!this._propertyEditor.validateData())
			return "";

	// note that DwtPropertyEditor actually works on the original
	// properties object, which means that we already have the edited data
	// in the xmlObj :-) However, the props. dialog will be dismissed if
	// present.
	for (var i = 0; i < props.length; ++i) {
		var p = soapDoc.set("prop", props[i].value);
		p.setAttribute("zimlet", this.xmlObj("name"));
		p.setAttribute("name", props[i].name);
	}

	var cmd = new ZmCsfeCommand();
	var ajxcallback = null;
	if (callback)
		ajxcallback = new AjxCallback(this, function(result) {
			// TODO: handle errors
			callback.run();
		});
	cmd.invoke({ soapDoc: soapDoc, callback: ajxcallback, asyncMode: true });

	if (this._dlg_propertyEditor) {
		this._dlg_propertyEditor.popdown();
		// force the dialog to be reconstructed next time
		this._dlg_propertyEditor.dispose();
		this._propertyEditor = null;
		this._dlg_propertyEditor = null;
	}
	return "";
};

ZmZimletBase.prototype.getUserPropertyInfo =
function(propertyName) {
	return this.xmlObj().getProp(propertyName);
};

ZmZimletBase.prototype.getMessage =
function(msg) {
	//Missing properties should not be catastrophic.
	var p = window[this.xmlObj().name];
	return p ? p[msg] : '???'+msg+'???';
};

ZmZimletBase.prototype.getMessages =
function() {
	return window[this.xmlObj().name] || {};
};

ZmZimletBase.prototype.getConfig =
function(configName) {
	return this.xmlObj().getConfig(configName);
};

ZmZimletBase.prototype.getBoolConfig =
function(key, defaultValue) {
	var val = AjxStringUtil.trim(this.getConfig(key));
	if (val != null) {
		if (arguments.length < 2)
			defaultValue = false;
		if (defaultValue) {
			// the default is TRUE, check if explicitely disabled
			val = !/^(0|false|off|no)$/i.test(val);
		} else {
			// default FALSE, check if explicitely enabled
			val = /^(1|true|on|yes)$/i.test(val);
		}
	} else {
		val = defaultValue;
	}
	return val;
};

ZmZimletBase.prototype.setEnabled =
function(enabled) {
	if (arguments.length == 0)
		enabled = true;
	this.__zimletEnabled = enabled;
};

ZmZimletBase.prototype.getEnabled =
function() {
	return this.__zimletEnabled;
};

ZmZimletBase.prototype.getUsername =
function() {
	return appCtxt.get(ZmSetting.USERNAME);
};

ZmZimletBase.prototype.getUserID =
function() {
	return appCtxt.get(ZmSetting.USERID);
};

// Make DOM safe id's
ZmZimletBase.encodeId =
function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

ZmZimletBase.prototype.hoverOver =
function(object, context, x, y, span) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.setContent('<div id="zimletTooltipDiv"/>', true);
	this.toolTipPoppedUp(span, object, context, document.getElementById("zimletTooltipDiv"));
	tooltip.popup(x, y, true);
};

ZmZimletBase.prototype.hoverOut =
function(object, context, span) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
	this.toolTipPoppedDown(span, object, context, document.getElementById("zimletTooltipDiv"));
};

ZmZimletBase.prototype.makeCanvas =
function(canvasData, url) {
	var canvas = null;
	var div;

	div = document.createElement("div");
	div.id = "zimletCanvasDiv";

	// HACK #1: if an actionUrl was specified and there's no <canvas>, we
	// assume a <canvas type="window">
	if (!canvasData && url)
		canvasData = { type: "window" };

	// HACK #2: some folks insist on using "style" instead of "type". ;-)
	if (canvasData.style && !canvasData.type)
		canvasData.type = canvasData.style;

	switch (canvasData.type) {
	    case "window":
		var browserUrl = url;
		if (browserUrl == null)
			browserUrl = appContextPath+"/public/blank.html";
		var props = [ "toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes" ];
		if (canvasData.width)
			props.push("width=" + canvasData.width);
		if (canvasData.height)
			props.push("height=" + canvasData.height);
		props = props.join(",");
		canvas = window.open(browserUrl, this.xmlObj("name"), props);
		if (!url) {
			// TODO: add div element in the window.
			//canvas.document.getHtmlElement().appendChild(div);
		}
		break;

	    case "dialog":
		var view = new DwtComposite(this.getShell());
		if (canvasData.width)
			view.setSize(canvasData.width, Dwt.DEFAULT);
		if (canvasData.height)
			view.setSize(Dwt.DEFAULT, canvasData.height);
		var title = canvasData.title || ("Zimlet dialog (" + this.xmlObj("description") + ")");
		canvas = this._createDialog({ view: view, title: title });
		canvas.view = view;
		if (url) {
			// create an IFRAME here to open the given URL
			var el = document.createElement("iframe");
			el.src = url;
			var sz = view.getSize();
			if (!AjxEnv.isIE) {
				// substract default frame borders
				sz.x -= 4;
				sz.y -= 4;
			}
			el.style.width = sz.x + "px";
			el.style.height = sz.y + "px";
			view.getHtmlElement().appendChild(el);
			canvas.iframe = el;
		} else {
			view.getHtmlElement().appendChild(div);
		}
		canvas.popup();
		break;
	}
	return canvas;
};

ZmZimletBase.prototype.applyXslt =
function(xsltUrl, doc) {
	var xslt = this.xmlObj().getXslt(xsltUrl);
	if (!xslt) {
		throw new Error("Cannot create XSLT engine: "+xsltUrl);
	}
	if (doc instanceof AjxXmlDoc) {
		doc = doc.getDoc();
	}
	var ret = xslt.transformToDom(doc);
	return AjxXmlDoc.createFromDom(ret);
};

/* Internal functions -- overriding is not recommended */

ZmZimletBase.prototype._createDialog =
function(params) {
	params.parent = this.getShell();
	return new ZmDialog(params);
};

/* Overrides default ZmObjectHandler methods for Zimlet API compat */
ZmZimletBase.prototype._getHtmlContent =
function(html, idx, obj, context) {
	if (obj instanceof AjxEmailAddress) {
		obj = obj.address;
	}
	var contentObj = this.xmlObj().getVal("contentObject");
	if(contentObj && contentObj.onClick) {
 		html[idx++] = AjxStringUtil.htmlEncode(obj);
	} else {
		html[idx++] = AjxStringUtil.htmlEncode(obj, true);
	}
	return idx;
};

//Accepts only one conversation object 
ZmZimletBase.prototype.getMsgsForConv =
function(callback, convObj){

	if (convObj instanceof Array) {
		convObj = convObj[0];
	}
	var convListController = AjxDispatcher.run("GetConvListController");
	var convList = convListController.getList();
	var conv = convList.getById(convObj.id);
	
	var ajxCallback = new AjxCallback(this, this._handleTranslatedConv, [callback, conv]);
	conv.loadMsgs({fetchAll:true}, ajxCallback);
};

ZmZimletBase.prototype._handleTranslatedConv =
function(callback, conv) {
	if (callback) {
		callback.run(ZmZimletContext._translateZMObject(conv.msgs.getArray()));
	}
};

