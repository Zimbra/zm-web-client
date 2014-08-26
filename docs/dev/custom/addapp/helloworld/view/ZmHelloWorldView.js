/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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
