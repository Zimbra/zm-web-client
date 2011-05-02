/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @class
 * This class is the main, and only in this example, HelloWorld controller. This
 * controller brings joy and peace to the world.
 *
 * @param container {DwtShell}
 * @param helloWorldApp {ZmHelloWorldApp} The HelloWorld application.
 *
 * @extends	ZmController
 */
ZmHelloWorldController = function(container, helloWorldApp) {

	if (arguments.length == 0) { return; }

	ZmController.call(this, container, helloWorldApp);

	this._listeners = {};
//    this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
//    this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._backListener);
};
ZmHelloWorldController.prototype = new ZmController;
ZmHelloWorldController.prototype.constructor = ZmHelloWorldController;


//----------------------------------------------------------- Properties
/**
 * Pointer to our app view "shell", the view that contains everything
 * else.
 * @type ZmHelloWorldView
 */
ZmHelloWorldController.prototype._view = null;
//
// Inherit other properties, like _app which points to the ZmHelloWorldApp
// object in the super.
//

//----------------------------------------------------------- Methods
/**
 * What's my name?
 * @return {string} Name of the object.
 */
ZmHelloWorldController.prototype.toString =
function() {
    return "ZmHelloWorldController";
};

/**
 * Shows the Hello World page.
 */
ZmHelloWorldController.prototype.show =
function() {
    // Initialize our view, only if we need to (function must prevent
    // unnecessary creation of views)...
	this._buildView();

    // ... but we must always push the view onto the view stack.
    // To show our view, we pass the view ID of type string, not the view
    // object.
    // This supposedly clears all other views off the stack and officially
    // puts our view in control.
    this._app.pushView(ZmId.VIEW_HELLOWORLD);
};

/**
 * Creates the HelloWorld view and attaches it to the controller.
 * This can potentially be called multiple times, protect thy code.
 * @private
 */
ZmHelloWorldController.prototype._buildView =
function() {
    var callbacks,
        elements;

	if (!this._view) {

        // The view object.
        this._view = new ZmHelloWorldView({
            parent: this._container,
            posStyle: Dwt.ABSOLUTE_STYLE,
            controller: this
        });

        // NOTE: We will need the HTML element. Now we need to make an element
        // that takes over the whole view.
        //console.log(this._view.getHtmlElement());

        // Minimal set of events that our application must respond to.
        // Note: Callbacks is not needed if we don't need to clean anything up
        // or if we don't need to respond to any events.
        callbacks = {};
        callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
//        callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
        callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
//        callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);

        // Minimal set of "elements" that make up our application.
        // We want to take over the full view of the screen, hence
        // the ZmAppViewMgr.C_APP_CONTENT_FULL setting.
        elements = {};
        elements[ZmAppViewMgr.C_APP_CONTENT_FULL] = this._view;
//        elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;

        // Inform the application object that we have built our view.
        // Pass our view id, and then pass all of the elements that we wish
        // to use in our view.
        this._app.createView({
            // Declare the id of our application view
            viewId: ZmId.VIEW_HELLOWORLD,
            elements: elements,
            callbacks: callbacks,
            isAppView: true
        });

//      this._initializeTabGroup();
	}
};


/**
 * Called during a hide event.
 * @return {boolean} Return true to allow the action to proceed.
 */
ZmHelloWorldController.prototype._preHideCallback =
function() {
    ZmController.prototype._preHideCallback.call(this);

    // !!!HACK ALERT!!!
    // We must allow the search bar and toolbar to be shown.
    // @TODO there has to be an official way to do this.
    document.getElementById("skin_tr_search").style.display = '';
    document.getElementById("skin_tr_toolbar").style.display = '';

    //var viewMgr = appCtxt.getAppViewMgr();
    //viewMgr.fitAll()

    return true;
};

/**
 * Called during an unload event.
 * @return {boolean} Return true to allow the action to proceed.
 */
ZmHelloWorldController.prototype._preUnloadCallback =
function() {
    return true;
};

/**
 * Called before a show event.
 * @return {boolean} Return true to allow the action to proceed.
 */
ZmHelloWorldController.prototype._preShowCallback =
function() {
    // !!!HACK ALERT!!!
    // If we want a completely clean canvas to work with, we can hide
    // the search bar and the toolbar.
    // They must be unhidden before we leave this app.
    // @TODO there has to be an official way to do this.
    document.getElementById("skin_tr_search").style.display = 'none';
    document.getElementById("skin_tr_toolbar").style.display = 'none';

    return true;
};

/**
 * Called after a show event.
 */
ZmHelloWorldController.prototype._postShowCallback =
function() {
    ZmController.prototype._postShowCallback.call(this);
    // NOTE: Some pages need to know when they are being shown again in order to
    //       display the state correctly.
	//this._view.reset();
};
