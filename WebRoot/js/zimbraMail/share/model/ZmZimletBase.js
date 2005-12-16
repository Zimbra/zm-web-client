/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite.
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/** All Zimlet Objects should inherit from this base class.  It provides
 * default implementation for Zimlet Object functions.  Zimlet developer may
 * wish to override some functions in order to provide custom functionality.
 *
 * @author Mihai Bazon
 */
function ZmZimletBase(appCtxt, type, name) {
	ZmObjectHandler.call(this, appCtxt, type, name);
	this._passRpcErrors = false;
}

ZmZimletBase.PANEL_MENU = 1;
ZmZimletBase.CONTENTOBJECT_MENU = 2;

ZmZimletBase.PROXY = "/service/proxy?target=";

ZmZimletBase.prototype = new ZmObjectHandler();

ZmZimletBase.prototype.init =
function(zimletContext, shell) {
	this._zimletContext = zimletContext;
	this._dwtShell = shell;
	this._appCtxt = shell.getData(ZmAppCtxt.LABEL);
	this._origIcon = this.xmlObj().icon;
	this._url = zimletContext._url;
	if(this.xmlObj().contentObject && this.xmlObj().contentObject.matchOn[0]) {
		var regExInfo = this.xmlObj().contentObject.matchOn[0].regex[0];
		this.RE = new RegExp(regExInfo._content, regExInfo.attrs);
		if(this.xmlObj().contentObject.type) {
			this.type = this.xmlObj().contentObject.type;
		}
	}
};

ZmZimletBase.prototype.toString = 
function() {
	return this.xmlObj().name;
};

ZmZimletBase.prototype.getShell = function() {
	return this._dwtShell;
};

ZmZimletBase.prototype.getAppCtxt = function() {
	return this._appCtxt;
};

ZmZimletBase.prototype.xmlObj =
function(key) {
	return key == null
		? this._zimletContext
		: this._zimletContext.getVal(key);
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

// This method is called when the Zimlet panel item is double clicked. This
// method defines the following formal parameters:
//
// - canvas
ZmZimletBase.prototype.doubleClicked =
function(canvas) {
	this.createPropertyEditor();
};

// Similar to doubleClicked, but called upon a single click.  Note that this
// might be called once or twice in the case of a dbl. click too.
ZmZimletBase.prototype.panelItemClicked =
function(canvas) {};

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
	if(!this.RE) {return;}
	this.RE.lastIndex = startIndex;
	return this.RE.exec(content);
};

// The clicked method is called when a Zimlet content object is clicked on by
// the user. This method defines the following formal parameters
//
// - spanElement
// - contentObjText
// - matchContext
// - canvas
ZmZimletBase.prototype.clicked =
function(spanElement, contentObjText, matchContext, canvas) {
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
function() {
	return null;
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
	var userprop = this.xmlObj("userProperties");

	if (!userprop)
		return;

	if (!this._dlg_propertyEditor) {
		var view = new DwtComposite(this.getShell());
		var pe = this._propertyEditor = new DwtPropertyEditor(view, true);
		pe.initProperties(userprop);
		var dialog_args = {
			title : this.xmlObj("description") + " preferences",
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
ZmZimletBase.prototype.displayErrorMessage = function(msg, data, title) {
	if (title == null)
		title = this.xmlObj("description") + " error";
	var dlg = this.getAppCtxt().getErrorDialog();
	dlg.reset();
	dlg.setMessage(msg, data, DwtMessageDialog.WARNING_STYLE, title);
	dlg.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
	dlg.popup();
};

ZmZimletBase.prototype.displayStatusMessage = function(msg) {
	this.getAppCtxt().setStatusMsg(msg);
};

ZmZimletBase.prototype.getResource = 
function(resourceName) {
	return this._url + resourceName;
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
	serverURL = ZmZimletBase.PROXY + AjxStringUtil.urlEncode(serverURL);
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
ZmZimletBase.prototype.checkProperties = function(props) {
	return true;
};

/**
 * Called by the framework usually during SOAP calls to provide some end-user
 * feedback.  The default is a nice animated icon defined in Zimbra.
 */
ZmZimletBase.prototype.setBusyIcon = function() {
	this.setIcon("ZimbraIcon DwtWait16Icon");
};

/**
 * Call this function to change the Zimlet's icon in the panel tree.  Called by
 * the framework to provide visual feedback during sendRequest() calls.
 */
ZmZimletBase.prototype.setIcon = function(icon) {
	this.xmlObj().icon = icon;
	var appCtxt = this.getAppCtxt();
	var ctrl = appCtxt.getOverviewController();
	var treeView = ctrl.getTreeView(ZmZimbraMail._OVERVIEW_ID, ZmOrganizer.ZIMLET);
	var treeItem = treeView.getTreeItemById(this.xmlObj().getOrganizer().id);
	// OMG, what we had to go through!
	treeItem.setImage(icon);
};

/**
 * This resets the Zimlet icon to the one originally specified in the XML file,
 * if any.
 */
ZmZimletBase.prototype.resetIcon = function() {
	this.setIcon(this._origIcon);
};

ZmZimletBase.prototype.saveUserProperties =
function(callback) {
	var soapDoc = AjxSoapDoc.create("ModifyPropertiesRequest", "urn:zimbraAccount");

	var props = this.xmlObj("userProperties");
	var check = this.checkProperties(props);

	if (!check)
		return;
	if (typeof check == "string")
		return this.displayErrorMessage(check);

	if (this._propertyEditor)
		if (!this._propertyEditor.validateData())
			return;

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
};

ZmZimletBase.prototype.getUserPropertyInfo =
function(propertyName) {
	return this.xmlObj().getProp(propertyName);
};

ZmZimletBase.prototype.getConfig =
function(configName) {
	return this.xmlObj().getConfig(configName);
};

ZmZimletBase.prototype.getUsername =
function() {
	return this.getAppCtxt().getUsername();
};

// Make DOM safe id's
ZmZimletBase.encodeId = function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

/* Internal functions -- overriding is not recommended */

ZmZimletBase.prototype._createDialog = function(args) {
	return new ZmDialog(this.getShell(),
			    args.msgDialog,
			    args.className,
			    args.title,
			    args.extraButtons,
			    args.view);
};

/* Overrides default ZmObjectHandler methods for Zimlet API compat */
ZmZimletBase.prototype._getHtmlContent = 
function(html, idx, obj, context) {
	var contentObj = this.xmlObj().getVal('contentObject');
	if(contentObj) {
		html[idx++] = '<a target="_blank" href="';
		html[idx++] = (contentObj.onClick[0].actionUrl[0].target).replace('${objectContent}', AjxStringUtil.htmlEncode(obj));
		html[idx++] = '">'+AjxStringUtil.htmlEncode(obj)+'</a>';
	} else {
		html[idx++] = AjxStringUtil.htmlEncode(obj, true);
	}
	return idx;
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