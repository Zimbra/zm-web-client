/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Store generic data to the server via [Set|Get]MailboxMetadataRequest
 *
 * @constructor
 * @class
 * This class provides the web client a general, extensive way to store per-
 * user data using arbitrary key/value pairs.
 *
 * @author Parag Shah
 */
ZmMetaData = function() {
};

ZmMetaData.prototype.constructor = ZmMetaData;


// Consts

ZmMetaData.NAMESPACE = "zwc";


// Public Methods

ZmMetaData.prototype.toString =
function() {
	return "ZmMetaData";
};

/**
 * Saves the given section and corresponding key/value pair to the server. If no
 * key/value is provided, all data stored within the cached section is saved out.
 *
 * @param section		[String]			Name of the section to save
 * @param key			[String]*			Key
 * @param value			[String]*			Value
 * @param batchCommand	[ZmBatchCommand]*	If part of a batch command
 * @param callback		[AjxCallback]*		Callback to trigger on successful save
 * @param errorCallback	[AjxCallback]*		Error callback to trigger on error
 */
ZmMetaData.prototype.set =
function(section, key, value, batchCommand, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("SetMailboxMetadataRequest", "urn:zimbraMail");
	var metaNode = soapDoc.set("meta");
	metaNode.setAttribute("section", [ZmMetaData.NAMESPACE, section].join(":"));
	var a = soapDoc.set("a", value, metaNode);
	a.setAttribute("n", key);

	if (batchCommand) {
		batchCommand.addNewRequestParams(soapDoc, callback, errorCallback);
	}
	else {
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: callback,
			errorCallback: errorCallback,
			accountName: (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null)
		};

		appCtxt.getAppController().sendRequest(params);
	}
};

/**
 * Fetches the given section name from the server unless its already been
 * fetched (and therefore cached)
 *
 * @param sections		[Array]				A list of sections to fetch
 * @param batchCommand	[ZmBatchCommand]*	Given if part of a separate batch command
 * @param callback		[AjxCallback]*		Callback to trigger once meta data is fetched
 * @param errorCallback	[AjxCallback]*		Error callback to trigger on error
 */
ZmMetaData.prototype.get =
function(sections, batchCommand, callback, errorCallback) {
	if (!(sections instanceof Array)) { sections = [sections]; }

	var accountName = appCtxt.multiAccounts ? appCtxt.accountList.mainAccount : null;
	var command = batchCommand || (new ZmBatchCommand(null, accountName));

	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		var soapDoc = AjxSoapDoc.create("GetMailboxMetadataRequest", "urn:zimbraMail");
		var metaNode = soapDoc.set("meta");
		metaNode.setAttribute("section", [ZmMetaData.NAMESPACE, section].join(":"));

		command.addNewRequestParams(soapDoc);
	}

	if (!batchCommand) {
		command.run(callback, errorCallback);
	}
};
