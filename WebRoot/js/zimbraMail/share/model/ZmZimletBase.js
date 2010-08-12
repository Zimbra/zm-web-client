/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines the Zimlet Handler Object.
 *
 */

/**
 * @class
 *
 * This class provides the default implementation for Zimlet functions. A Zimlet developer may
 * wish to override some functions in order to provide custom functionality. All Zimlet Handler Objects should extend this base class.
 * <br />
 * <br />
 * <code>function com_zimbra_myZimlet_HandlerObject() { };</code>
 * <br />
 * <br />
 * <code>
 * com_zimbra_myZimlet_HandlerObject.prototype = new ZmZimletBase();
 * com_zimbra_myZimlet_HandlerObject.prototype.constructor = com_zimbra_myZimlet_HandlerObject;
 * </code>
 * 
 * @extends	ZmObjectHandler
 * @see		#init
 */
ZmZimletBase = function() {
	// do nothing
};

/**
 * This defines the Panel Menu.
 * 
 * @see #menuItemSelected}
 */
ZmZimletBase.PANEL_MENU = 1;
/**
 * This defines the Content Object Menu.
 * 
 * @see		#menuItemSelected}
 */
ZmZimletBase.CONTENTOBJECT_MENU = 2;

ZmZimletBase.PROXY = "/service/proxy?target=";

ZmZimletBase.prototype = new ZmObjectHandler();

/**
 * @private
 */
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

/**
 * This method is called by the Zimlet framework to indicate that
 * the zimlet it being initialized. This method can be overridden to initialize the zimlet.
 * 
 */
ZmZimletBase.prototype.init = function() {};

/**
 * Returns a string representation of the zimlet.
 * 
 * @return		{string}		a string representation of the zimlet
 */
ZmZimletBase.prototype.toString =
function() {
	return this.name;
};

/**
 * Gets the shell for the zimlet.
 * 
 * @return	{DwtShell}		the shell
 */
ZmZimletBase.prototype.getShell =
function() {
	return this._dwtShell;
};

/**
 * Adds an item to the search toolbar drop-down. A listener (if specified)
 * will be called when the item is selected.
 * 
 * @param	{string}	icon		the icon (style class) to use or <code>null</code> for no icon
 * @param	{string}	label		the label for the item
 * @param	{AjxListener}	listener		the listener or <code>null</code> for none
 * @param	{string}	id			the unique id of the item to add
 * @return	{ZmButtonToolBar}	<code>null</code> if item not created
 */
ZmZimletBase.prototype.addSearchDomainItem =
function(icon, label, listener, id) {
	var searchToolbar = appCtxt.getSearchController().getSearchToolbar();
	return searchToolbar ? searchToolbar.createCustomSearchBtn(icon, label, listener, id) : null;
};

/**
 * Gets the text field value entered in the search bar.
 * 
 * @return	{string}		the search field value or <code>null</code> for none
 */ 
ZmZimletBase.prototype.getSearchQuery =
function() {
	var searchToolbar = appCtxt.getSearchController().getSearchToolbar();
	return searchToolbar ? searchToolbar.getSearchFieldValue() : null;
};

/**
 * Gets the zimlet manager.
 * 
 * @return	{ZmZimletMgr}		the zimlet manager
 */
ZmZimletBase.prototype.getZimletManager =
function() {
	return appCtxt.getZimletMgr();
};

/**
 * @private
 */
ZmZimletBase.prototype.xmlObj =
function(key) {
	return !key ? this._zimletContext : this._zimletContext.getVal(key);
};

/**
 * Gets the zimlet context.
 * 
 * @return	{ZimletContext}	the context
 */
ZmZimletBase.prototype.getZimletContext =
function() {
	return	this._zimletContext;
}

/*
 * 
 *  Panel Item Methods
 *  
 */

/**
 * This method is called when an item is dragged on the Zimlet drop target
 * in the panel. This method is only called for the valid types that the
 * Zimlet accepts as defined by the <code>&lt;dragSource&gt;</code> Zimlet Definition File XML.
 *
 * @param	{ZmAppt|ZmConv|ZmContact|ZmFolder|ZmMailMsg|ZmNotebook|ZmTask}	zmObject		the dragged object
 * @return	{boolean}	<code>true</code> if the drag should be allowed; otherwise, <code>false</code>
 */
ZmZimletBase.prototype.doDrag =
function(zmObject) {
	return true;
};

/**
 * This method is called when an item is dropped on the Zimlet in the panel.
 * 
 * @param	{ZmAppt|ZmConv|ZmContact|ZmFolder|ZmMailMsg|ZmNotebook|ZmTask}	zmObject		the dropped object
 */
ZmZimletBase.prototype.doDrop =
function(zmObject) {};

/**
 * @private
 */
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

/**
 * This method gets called when a single-click is performed.
 *
 * @param	{Object}	canvas		the canvas
 * @see		#doubleClicked
 */
ZmZimletBase.prototype.singleClicked = function(canvas) {};

/**
 * This method gets called when a double-click is performed. By default, this method
 * will create the default property editor for editing user properties.
 * 
 * @param	{Object}	canvas		the canvas
 * @see		#singleClicked
 * @see		#createPropertyEditor
 */
ZmZimletBase.prototype.doubleClicked =
function(canvas) {
	this.createPropertyEditor();
};

/*
 *
 * Application hook methods.
 * 
 */

/**
 * This method is called by the Zimlet framework when a user clicks-on a message in the mail application.
 * 
 * @param	{ZmMailMsg}		msg		the clicked message
 * @param	{ZmMailMsg}		oldMsg	the previous clicked message or <code>null</code> if this is the first message clicked
 */
ZmZimletBase.prototype.onMsgView = function(msg, oldMsg) {};

/**
 * This method is called by the Zimlet framework when a user clicks-on a message in either the message or conversation view).
 * 
 * @param	{ZmMailMsg}			msg			the clicked message
 * @param	{ZmObjectManager}	objMgr		the object manager
 */
ZmZimletBase.prototype.onFindMsgObjects = function(msg, objMgr) {};

/**
 * This method is called by the Zimlet framework when a contact is clicked-on in the contact list view.
 * 
 * @param	{ZmContact}		contact		the contact being viewed
 * @param	{string}		elementId	the element Id
 */
ZmZimletBase.prototype.onContactView = function(contact, elementId) {};

/**
 * This method is called by the Zimlet framework when a contact is edited.
 * 
 * @param	{ZmEditContactView}	view	the edit contact view
 * @param	{ZmContact}		contact		the contact being edited
 * @param	{string}		elementId	the element Id
 */
ZmZimletBase.prototype.onContactEdit = function(view, contact, elementId) {};

/**
 * This method is called by the Zimlet framework when application toolbars are initialized.
 * 
 * @param	{ZmApp}				app				the application
 * @param	{ZmButtonToolBar}	toolbar			the toolbar
 * @param	{ZmController}		controller		the application controller
 * @param	{string}			viewId			the view Id
 */
ZmZimletBase.prototype.initializeToolbar = function(app, toolbar, controller, viewId) {};

/**
 * This method is called by the Zimlet framework when showing an application view.
 * 
 * @param	{string}		view		the name of the view
 */
ZmZimletBase.prototype.onShowView = function(view) {};

/**
 * This method is called by the Zimlet framework when a search is performed.
 * 
 * @param	{string}		queryStr		the search query string
 */
ZmZimletBase.prototype.onSearch = function(queryStr) {};

/**
 * This method is called by the Zimlet framework when the search button is clicked.
 * 
 * @param	{string}		queryStr		the search query string
 * @see		#onKeyPressSearchField
 */
ZmZimletBase.prototype.onSearchButtonClick = function(queryStr) {};

/**
 * This method is called by the Zimlet framework when enter is pressed in the search field.
 * 
 * @param	{string}		queryStr		the search query string
 * @see		#onSearchButtonClick
 */
ZmZimletBase.prototype.onKeyPressSearchField = function(queryStr) {};

/**
 * This method gets called by the Zimlet framework when the action menu is initialized on the from/sender of an email message.
 * 
 * @param	{ZmController}		controller		the controller
 * @param	{ZmActionMenu}		actionMenu		the action menu
 */
ZmZimletBase.prototype.onParticipantActionMenuInitialized = function(controller, actionMenu) {};

/**
 * This method gets called by the Zimlet framework when the action menu is initialized
 * on the subject/fragment of an email message.
 * 
 * <p>
 * This method is called twice:
 * <ul>
 * <li>The first-time a right-click is performed on a message in Conversation View.</li>
 * <li>The first-time a right-click is performed on a message in Message View.</li>
 * </ul>
 * </p>
 * 
 * @param	{ZmController}		controller		the controller
 * @param	{ZmActionMenu}		actionMenu		the action menu
 */
ZmZimletBase.prototype.onActionMenuInitialized = function(controller, actionMenu) {};

/**
 * This method is called by the Zimlet framework when an email message is flagged.
 * 
 * @param	{ZmMailMsg[]|ZmConv[]}		items		an array of items
 * @param	{boolean}		on		<code>true</code> if the flag is being set; <code>false</code> if the flag is being unset
 */
ZmZimletBase.prototype.onMailFlagClick = function(items, on) {};

/**
 * This method is called by the Zimlet framework when an email message is tagged.
 * 
 * @param	{ZmMailMsg[]|ZmConv[]}		items		an array of items
 * @param	{ZmTag}			tag			the tag
 * @param	{boolean}		doTag		<code>true</code> if the tag is being set; <code>false</code> if the tag is being removed
 */
ZmZimletBase.prototype.onTagAction = function(items, tag, doTag) {};

/**
 * This method is called by the Zimlet framework when a message is about to be sent.
 * 
 * <p>
 * To fail the error check, the zimlet must return a <code>boolAndErrorMsgArray</code> array
 * with the following syntax:
 * <br />
 * <br />
 * <code>{hasError:&lt;true or false&gt;, errorMsg:&lt;error msg&gt;, zimletName:&lt;zimlet name&gt;}</code>
 *</p>
 *
 * @param	{ZmMailMsg}		msg		the message
 * @param	{array}		boolAndErrorMsgArray	an array of error messages, if any
 */
ZmZimletBase.prototype.emailErrorCheck = function(msg, boolAndErrorMsgArray) {};

/**
 * This method is called by the Zimlet framework when adding a signature to an email message.
 * 
 * <p>
 * To append extra signature information, the zimlet should push text into the <code>bufferArray</code>.
 * 
 * <pre>
 * bufferArray.push("Have fun, write a Zimlet!");
 * </pre>
 * </p>
 * 
 * @param	{ZmMailMsg}		contact		the clicked message
 * @param	{ZmMailMsg}		oldMsg	the previous clicked message or <code>null</code> if this is the first message clicked
 */
ZmZimletBase.prototype.appendExtraSignature = function(bufferArray) {};

/**
 * This method is called by the Zimlet framework when the message confirmation dialog is presented.
 * 
 * @param	{ZmMailConfirmView}		confirmView		the confirm view
 * @param	{ZmMailMsg}		msg		the message
 */
ZmZimletBase.prototype.onMailConfirm = function(confirmView, msg) {};

/**
 * This method is called by the Zimlet framework when a new chat widget is initialized.
 * 
 * @param	{ZmChatWidget}		widget		the chat widget
 */
ZmZimletBase.prototype.onNewChatWidget = function(widget) {};

/*
 * 
 * Portlet methods
 */

/**
 * This method is called by the Zimlet framework when the portlet is created.
 * 
 * @param	{ZmPortlet}	portlet		the portlet
 */
ZmZimletBase.prototype.portletCreated =
function(portlet) {
    DBG.println("portlet created: " + portlet.id);
};

/**
 * This method is called by the Zimlet framework when the portlet is refreshed.
 * 
 * @param	{ZmPortlet}	portlet		the portlet
 */
ZmZimletBase.prototype.portletRefreshed =
function(portlet) {
	DBG.println("portlet refreshed: " + portlet.id);
};

/*
 * 
 * Content Object methods
 * 
 */

/**
 * This method is called when content (e.g. a mail message) is being parsed.
 * The match method may be called multiple times for a given piece of content and
 * should apply the pattern matching as defined for a given zimlet <code>&lt;regex&gt;</code>.
 * Zimlets should also use the "g" option when constructing their <code>&lt;regex&gt;</code>.
 *
 * <p>
 * The return should be an array in the form:
 *  
 * <pre>
 * result[0...n] // should be matched string(s)
 * result.index // should be location within line where match occurred
 * result.input // should be the input parameter content
 * </pre>
 * </p>
 * 
 * @param	{string}	content		the content line to perform a match against
 * @param	{number}	startIndex	the start index (i.e. where to begin the search)
 * @return	{array}	the matching content object from the <code>startIndex</code> if the content matched the specified zimlet handler regular expression; otherwise <code>null</code>
 */
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

/**
 * This method is called when a zimlet content object is clicked.
 *
 * @param	{Object}		spanElement		the enclosing span element
 * @param	{string}		contentObjText	the content object text
 * @param	{array}		matchContent	the match content
 * @param	{DwtMouseEvent}	event			the mouse click event
 */
ZmZimletBase.prototype.clicked =
function(spanElement, contentObjText, matchContext, event) {
	var c = this.xmlObj("contentObject.onClick");
	if (c && c.actionUrl) {
		var obj = this._createContentObj(contentObjText, matchContext);
        var x = event.docX;
        var y = event.docY;
        this.xmlObj().handleActionUrl(c.actionUrl, c.canvas, obj, null, x, y);
	}
};

/**
 * This method is called when the tool tip is popping-up.
 *
 * @param	{Object}	spanElement		the enclosing span element
 * @param	{string}	contentObjText	the content object text
 * @param	{array}		matchContent	the matched content
 * @param	{Object}	canvas			the canvas
 */
ZmZimletBase.prototype.toolTipPoppedUp =
function(spanElement, contentObjText, matchContext, canvas) {
	var c = this.xmlObj("contentObject");
	if (c && c.toolTip) {
		var obj = this._createContentObj(contentObjText, matchContext);
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

/**
 * This method is called when the tool tip is popping-down.
 *
 * @param	{Object}		spanElement		the enclosing span element
 * @param	{string}		contentObjText	the content object text
 * @param	{array}		matchContent	the matched content
 * @param	{Object}	canvas			the canvas
 * @return	{string}	<code>null</code> if the tool tip may be popped-down; otherwise, a string indicating why the tool tip should not be popped-down
 */
ZmZimletBase.prototype.toolTipPoppedDown =
function(spanElement, contentObjText, matchContext, canvas) {
};

/**
 * @private
 */
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

/*
 *
 * Common methods
 * 
 */

/**
 * This method is called when a context menu item is selected.
 * 
 * @param	{ZmZimletBase.PANEL_MENU|ZmZimletBase.CONTENTOBJECT_MENU}	contextMenu		the context menu
 * @param	{string}		menuItemId		the selected menu item Id
 * @param	{Object}		spanElement		the enclosing span element
 * @param	{string}		contentObjText	the content object text
 * @param	{Object}		canvas		the canvas
 */
ZmZimletBase.prototype.menuItemSelected =
function(contextMenu, menuItemId, spanElement, contentObjText, canvas) {};

/**
 * This method is called if there are <code>&lt;userProperties&gt;</code> elements specified in the
 * Zimlet Definition File. When the zimlet panel item is double-clicked, the property
 * editor will be presented to the user.
 * 
 * <p>
 * This method creates the property editor for the set of <code>&lt;property&gt;</code> elements defined
 * in the <code>&lt;userProperties&gt;</code> element. The default implementation of this
 * method will auto-create a property editor based on the attributes of the user properties.
 * </p>
 * <p>
 * Override this method if a custom property editor is required.
 * </p>
 * 
 * @param	{AjxCallback}	callback	the callback method for saving user properties
 */
ZmZimletBase.prototype.createPropertyEditor =
function(callback) {
	var userprop = this.xmlObj().userProperties;

	if (!userprop) {return;}

    for (var i = 0; i < userprop.length; ++i) {
        userprop[i].label = this._zimletContext.processMessage(userprop[i].label);
        if (userprop[i].type == "enum") {
        	var items = userprop[i].item;
        	for (var j=0; items != null && j < items.length; j++) {
        		if (items[j] == null)
        			continue;
        		var item = items[j];
        		item.label = this._zimletContext.processMessage(item.label);
        	}
        }
	}

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


/*
 *
 * Helper methods
 * 
 */


/**
 * Displays the specified error message in the standard error dialog.
 * 
 * @param	{string}	msg		the error message to display
 * @param	{string}	data	the error message details
 * @param	{string}	title	the error message dialog title
 */
ZmZimletBase.prototype.displayErrorMessage =
function(msg, data, title) {
	if (title == null)
		title = this.xmlObj("description") + " error";
	var dlg = appCtxt.getErrorDialog();
	dlg.reset();
	dlg.setMessage(msg, data, DwtMessageDialog.WARNING_STYLE, title);
	dlg.popup(null, true);
};

/**
 * Displays the specified status message.
 * 
 * @param	{string}	msg		the status message to display
 */
ZmZimletBase.prototype.displayStatusMessage =
function(msg) {
	appCtxt.setStatusMsg(msg);
};

/**
 * Gets the fully qualified resource Url.
 *
 * @param	{string}	resourceName	the resource name
 * @return	{string}	the fully qualified resource Url
 */
ZmZimletBase.prototype.getResource =
function(resourceName) {
	return this.xmlObj().getUrl() + resourceName;
};

/**
 * @private
 */
ZmZimletBase.prototype.getType =
function() {
	return this.type;
};

/**
 * This method is called when a request finishes.
 * 
 * @param	{AjxCallback}	callback	the callback method or <code>null</code> for none
 * @param	{boolean}	passErrors	<code>true</code> to pass errors to the error display; <code>null</code> or <code>false</code> otherwise
 * @see		#sendRequest()
 * @private
 */
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

/**
 * Sends the request content (via Ajax) to the specified server.
 * 
 * @param	{string}	requestStr		the request content to send
 * @param	{string}	serverURL		the server url
 * @param	{string[]}	requestHeaders	the request headers (may be <code>null</code>)
 * @param	{AjxCallback}	callback	the callback for asynchronous requests or <code>null</code> for none
 * @param	{boolean}	useGet		<code>true</code> to use HTTP GET; <code>null</code> or <code>false</code> otherwise
 * @param	{boolean}	passErrors	<code>true</code> to pass errors; <code>null</code> or <code>false</code> otherwise
 * @return	{Object}	the return value
 */
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

/**
 * Enables the specified context menu item.
 * 
 * @param	{ZmZimletBase.PANEL_MENU|ZmZimletBase.CONTENTOBJECT_MENU}	contextMenu		the context menu
 * @param	{string}		menuItemId		the menu item Id
 * @param	{boolean}		enabled			<code>true</code> to enable the menu item; <code>false</code> to disable the menu item
 */
ZmZimletBase.prototype.enableContextMenuItem =
function(contextMenu, menuItemId, enabled) {};

/**
 * Gets the configuration property.
 * 
 * @param	{string}		propertyName	the name of the property to retrieve
 * @return	{string}	the value of the property or <code>null</code> if no such property exists
 */
ZmZimletBase.prototype.getConfigProperty =
function(propertyName) {};

/**
 * Gets the user property.
 * 
 * @param	{string}	propertyName the name of the property to retrieve
 * @return	{string}	the value of the property or <code>null</code> if no such property exists 
 */
ZmZimletBase.prototype.getUserProperty =
function(propertyName) {
	return this.xmlObj().getPropValue(propertyName);
};

/**
 * Sets the value of a given user property
 * 
 * @param	{string}	propertyName	the name of the property
 * @param	{string}	value			the property value
 * @param	{boolean}	save			if <code>true</code>, the property will be saved (along with any other modified properties) 
 * @param	{AjxCallback}	callback	the callback to invoke after the user properties save
 * @throws	ZimletException		if no such property exists or if the value is not valid for the property type
 * @see		#saveUserProperties
 */
ZmZimletBase.prototype.setUserProperty =
function(propertyName, value, save, callback) {
	this.xmlObj().setPropValue(propertyName, value);
	if (save)
		this.saveUserProperties(callback);
};

/**
 * This method is called by the zimlet framework prior to user properties being saved.
 *
 * @param	{array}	props		an array of objects with the following properties:
 * <ul>
 * <li>props[...].label {string} the property label</li>
 * <li>props[...].name {string} the property name</li>
 * <li>props[...].type {string} the property type</li>
 * <li>props[...].value {string} the property value</li>
 * </ul>
 * @return	{boolean}	<code>true</code> if properties are valid; otherwise, <code>false</code> or {String} if an error message will be displayed in the standard error dialog.
 */
ZmZimletBase.prototype.checkProperties =
function(props) {
	return true;
};

/**
 * Sets the busy icon. The Zimlet framework usually calls this method during SOAP
 * calls to provide some end-user feedback.
 * 
 * The default is a animated icon.
 * 
 * @private
 */
ZmZimletBase.prototype.setBusyIcon =
function() {
	this.setIcon("ZimbraIcon DwtWait16Icon");
};

/**
 * Sets the zimlet icon in the panel.
 * 
 * @param	{string}	icon		the icon (style class) for the zimlet
 * @private
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
 * Resets the zimlet icon to the one specified in the Zimlet Definition File (if originally set).
 * 
 * @private
 */
ZmZimletBase.prototype.resetIcon =
function() {
	this.setIcon(this._origIcon);
};

/**
 * Saves the user properties.
 * 
 * @param	{AjxCallback}	callback		the callback to invoke after the save
 * @return	{string}		an empty string or an error message
 */
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

/**
 * Gets the user property info for the specified property.
 * 
 * @param	{string}	propertyName		the property
 * @return	{string}	the value of the user property
 */
ZmZimletBase.prototype.getUserPropertyInfo =
function(propertyName) {
	return this.xmlObj().getProp(propertyName);
};

/**
 * Gets the message property.
 * 
 * @param	{string}	msg		the message
 * @return	{string}	the message property or <code>"???" + msg + "???"</code> if not found
 */
ZmZimletBase.prototype.getMessage =
function(msg) {
	//Missing properties should not be catastrophic.
	var p = window[this.xmlObj().name];
	return p ? p[msg] : '???'+msg+'???';
};

/**
 * Gets the message properties.
 * 
 * @return	{string[]}		an array of message properties
 */
ZmZimletBase.prototype.getMessages =
function() {
	return window[this.xmlObj().name] || {};
};

/**
 * @private
 */
ZmZimletBase.prototype.getConfig =
function(configName) {
	return this.xmlObj().getConfig(configName);
};

/**
 * @private
 */
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

/**
 * @private
 */
ZmZimletBase.prototype.setEnabled =
function(enabled) {
	if (arguments.length == 0)
		enabled = true;
	this.__zimletEnabled = enabled;
};

/**
 * @private
 */
ZmZimletBase.prototype.getEnabled =
function() {
	return this.__zimletEnabled;
};

/**
 * Gets the current username.
 *
 * @return	{string}		the current username
 */
ZmZimletBase.prototype.getUsername =
function() {
	return appCtxt.get(ZmSetting.USERNAME);
};

/**
 * Gets the current user id.
 *
 * @return	{string}	the current user id
 */
ZmZimletBase.prototype.getUserID =
function() {
	return appCtxt.get(ZmSetting.USERID);
};

/**
 * Creates DOM safe ids.
 * 
 * @private
 */
ZmZimletBase.encodeId =
function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

/**
 * @private
 */
ZmZimletBase.prototype.hoverOver =
function(object, context, x, y, span) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.setContent('<div id="zimletTooltipDiv"/>', true);
	this.toolTipPoppedUp(span, object, context, document.getElementById("zimletTooltipDiv"));
	tooltip.popup(x, y, true, new AjxCallback(this, this.hoverOut, object, context, span));
};

/**
 * @private
 */
ZmZimletBase.prototype.hoverOut =
function(object, context, span) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
	this.toolTipPoppedDown(span, object, context, document.getElementById("zimletTooltipDiv"));
};

/**
 * @private
 */
ZmZimletBase.prototype.makeCanvas =
function(canvasData, url, x, y) {
	if(canvasData && canvasData.length)
        canvasData = canvasData[0];    
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
		var contentObject = this.xmlObj("contentObject");
        if(contentObject && !canvasData.width && contentObject.onClick ) {
            if(contentObject.onClick.canvas.props == "")
                canvas = window.open(browserUrl);
            else if(contentObject.onClick.canvas.props != "")
                canvas = window.open(browserUrl, this.xmlObj("name"), contentObject.onClick.canvas.props);
        }
        else{
            var props = canvasData.props ? [ canvasData.props ] : [ "toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes"];
            if (canvasData.width)
                props.push("width=" + canvasData.width);
            if (canvasData.height)
                props.push("height=" + canvasData.height);
            props = props.join(",");
            canvas = window.open(browserUrl, this.xmlObj("name"), props);
        }
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

        case "tooltip":
        var shell = DwtShell.getShell(window);
	    var canvas = shell.getToolTip();
	    canvas.setContent('<div id="zimletTooltipDiv" />', true);
        var el = document.createElement("iframe");
        el.setAttribute("width",canvasData.width);
        el.setAttribute("height",canvasData.height);
        el.setAttribute("style","border:0px");        
        el.src = url;
        document.getElementById("zimletTooltipDiv").appendChild(el);
        canvas.popup(x, y, true);
        break;
    }
	return canvas;
};

/**
 * This method will apply and XSL transformation to an XML document. For example, content
 * returned from a services call.
 * 
 * @param	{string}	xsltUrl		the URL to the XSLT style sheet
 * @param	{string|AjxXmlDoc}	doc		the XML document to apply the style sheet
 * @return	{AjxXmlDoc}	the XML document representing the transformed document
 */
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

/**
 * Creates a "tab" application and registers this zimlet to
 * receive {@link #appActive} and {@link #appLaunch} events.
 * 
 * @param	{string}	label	the label to use on the application tab
 * @param	{string}	image	the image (style class) to use on the application tab
 * @param	{string}	tooltip	the tool tip to display when hover-over the application tab
 * @param	{number}		[index]	the index to insert the tab (must be > 0). 0 is first location. Default is last location.
 * @return	{string}	the name of the newly created application
 */
ZmZimletBase.prototype.createApp =
function(label, image, tooltip, index) {

	AjxDispatcher.require("ZimletApp");

	var appName = [this.name, Dwt.getNextId()].join("_");
	var controller = appCtxt.getAppController();

	var params = {
			text:label,
			image:image,
			tooltip:tooltip
		};
	
	if (index != null && index >= 0)
		params.index = index;

	controller.getAppChooser().addButton(appName, params);

	// TODO: Do we have to call ZmApp.registerApp?

	var app = new ZmZimletApp(appName, this, DwtShell.getShell(window));
	controller.addApp(app);

	return appName;
};

/**
 * This method gets called each time the "tab" application is opened or closed.
 * 
 * @param	{string} appName        the application name
 * @param	{boolean} active        if <code>true</code>, the application status is open; otherwise, <code>false</code>
 * @see		#createApp
 */
ZmZimletBase.prototype.appActive = function(appName, active) { };

/**
 * This method gets called when the "tab" application is opened for the first time.
 * 
 * @param    {string} appName        the application name
 * @see		#createApp
 */
ZmZimletBase.prototype.appLaunch = function(appName) { };

/**
 * This method by the Zimlet framework when an application button is pressed.
 * 
 * @param	{string} id        the id of the application button
 */
ZmZimletBase.prototype.onSelectApp = function(id) { };

/**
 * This method by the Zimlet framework when an application action occurs.
 * 
 * @param	{string}	type        the type of action (for example: "app", "menuitem", "treeitem")
 * @param	{string}	action		the action
 * @param	{string}	currentViewId		the current view Id
 * @param	{string}	lastViewId		the last view Id
 */
ZmZimletBase.prototype.onAction = function(id, action, currentViewId, lastViewId) { };

/*
 *
 * Internal functions -- overriding is not recommended
 * 
 */

/**
 * Creates the object that describes the match, and is passed around to url generation routines
 * 
 * @private
 */
ZmZimletBase.prototype._createContentObj =
function(contentObjText, matchContext) {
	var obj = { objectContent: contentObjText };
	if (matchContext && (matchContext instanceof Array)) {
		for (var i = 0; i < matchContext.length; ++i) {
			obj["$"+i] = matchContext[i];
		}
	}
	return obj;
};

/**
 * @private
 */
ZmZimletBase.prototype._createDialog =
function(params) {
	params.parent = this.getShell();
	return new ZmDialog(params);
};

/**
 * Overrides default ZmObjectHandler methods for Zimlet API compat
 * 
 * @private
 */
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

/**
 * Gets the mail messages for the conversation.
 * 
 * @param	{AjxCallback}		callback		the callback method
 * @param	{ZmConv}		conv			the conversation
 */
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

/**
 * @private
 */
ZmZimletBase.prototype._handleTranslatedConv =
function(callback, conv) {
	if (callback) {
		callback.run(ZmZimletContext._translateZMObject(conv.msgs.getArray()));
	}
};

