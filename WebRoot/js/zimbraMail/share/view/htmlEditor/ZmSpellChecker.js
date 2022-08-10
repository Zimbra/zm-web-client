/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Makes server request to check spelling of given text.
 * Use this class to check spelling of any text via {@link check} method.
 *
 * @author Mihai Bazon
 * 
 * @param {ZmHtmlEditor}	parent		the parent needing spell checking
 *
 * @class
 * @constructor
 */
ZmSpellChecker = function(parent) {
	this._parent = parent;
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmSpellChecker.prototype.toString =
function() {
	return "ZmSpellChecker";
};

/**
 * Checks the spelling.
 *
 * @param {Object|String}	textOrParams  the text to check or an object with "text" and "ignore" properties
 * @param {AjxCallback}		callback      the callback for success
 * @param {AjxCallback}		errCallback   	the error callback
 */
ZmSpellChecker.prototype.check =
function(textOrParams, callback, errCallback) {
	var params = typeof textOrParams == "string" ? { text: textOrParams } : textOrParams;
	var soapDoc = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soapDoc.getMethod().appendChild(soapDoc.getDoc().createTextNode(params.text));
	if (params.ignore) {
		soapDoc.getMethod().setAttribute("ignore", params.ignore);
	}
	var callback = new AjxCallback(this, this._checkCallback, callback);
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback, errorCallback: errCallback});
};

ZmSpellChecker.prototype._checkCallback =
function(callback, result) {
	var words = result._isException ? null : result.getResponse().CheckSpellingResponse;

	if (callback)
		callback.run(words);
};
