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
 * Creates an empty view for the HelloWorld app.
 * @constructor
 * @class
 * This class represents a simple view for our fake app.
 *
 * @param params {Object} A hash of parameters.
 * @param params.parent {DwtComposite} The parent widget.
 * @param params.posStyle {string} The positioning style.
 * @param params.controller {ZmController} The owning controller.
 * 
 * @extends	DwtComposite
 */
ZmHelloWorldView = function(params) {

    params.className = "ZmHelloWorldView";
    DwtComposite.call(this, params);

    this._controller = params.controller;
};
ZmHelloWorldView.prototype = new DwtComposite;
ZmHelloWorldView.prototype.constructor = ZmHelloWorldView;
