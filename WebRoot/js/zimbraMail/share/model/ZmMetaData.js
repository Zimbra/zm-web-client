/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * Store generic data to the server via [Set|Get]MailboxMetadataRequest
 *
 * @constructor
 * @class
 * This class provides a general way to store per-user data using arbitrary
 * key/value pairs. NOTE: the server does not support modifying data so if there
 * are any changes, *all* the data must be re-set per section.
 *
 * The section data is mapped into ZmSettings (based on the key name) to allow
 * for easy access. When creating/setting a *new* key/value, naming conventions
 * should be followed as defined by prefs in ZmSettings. For example, if adding
 * a new key called "foo", the name for the key should be "zimbraPrefFoo" and
 * should be added to the list of settings in ZmSettings with type set to
 * ZmSetting.T_METADATA
 *
 * @param account		[ZmAccount]		account this meta data belongs to
 *
 * @author Parag Shah
 */
ZmMetaData = function(account) {

	this._sections = {};
	this._account = account;
};

ZmMetaData.prototype.constructor = ZmMetaData;


// Consts

ZmMetaData.NAMESPACE		= "zwc";
ZmMetaData.DEFAULT_SECTIONS	= [
	ZmSetting.M_IMPLICIT,
	ZmSetting.M_OFFLINE
];


// Public Methods

ZmMetaData.prototype.toString =
function() {
	return "ZmMetaData";
};

/**
 * Saves the given section and corresponding key/value pair to the server.
 *
 * @param section		[String]			Name of the section to save
 * @param data			[Object]*			List of key/value pairs
 * @param batchCommand	[ZmBatchCommand]*	If part of a batch command
 * @param callback		[AjxCallback]*		Callback to trigger on successful save
 * @param errorCallback	[AjxCallback]*		Error callback to trigger on error
 */
ZmMetaData.prototype.set =
function(section, data, batchCommand, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("SetMailboxMetadataRequest", "urn:zimbraMail");
	var metaNode = soapDoc.set("meta");
	metaNode.setAttribute("section", [ZmMetaData.NAMESPACE, section].join(":"));

	for (var i in data) {
		var a = soapDoc.set("a", data[i], metaNode);
		a.setAttribute("n", i);
	}

	if (batchCommand) {
		batchCommand.addNewRequestParams(soapDoc, callback, errorCallback);
	}
	else {
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: callback,
			errorCallback: errorCallback,
			accountName: this._account.name
		};

		appCtxt.getAppController().sendRequest(params);
	}
};

/**
 * Fetches the given section name from the server unless its already been
 * fetched (and therefore cached)
 *
 * @param section		[String]			section of meta data to fetch
 * @param batchCommand	[ZmBatchCommand]*	Given if part of a separate batch command
 * @param callback		[AjxCallback]*		Callback to trigger once meta data is fetched
 * @param errorCallback	[AjxCallback]*		Error callback to trigger on error
 */
ZmMetaData.prototype.get =
function(section, batchCommand, callback, errorCallback) {
	var command = batchCommand || (new ZmBatchCommand());
	var sectionName = [ZmMetaData.NAMESPACE, section].join(":");

	var cachedSection = this._sections[sectionName];

	// if not yet cached, go fetch it
	if (!cachedSection) {
		var soapDoc = AjxSoapDoc.create("GetMailboxMetadataRequest", "urn:zimbraMail");
		var metaNode = soapDoc.set("meta");
		metaNode.setAttribute("section", sectionName);

		command.addNewRequestParams(soapDoc);

		if (!batchCommand) {
			command.run(callback, errorCallback);
		}
	}
	else {
		if (callback) {
			callback.run(cachedSection);
		} else {
			return cachedSection;
		}
	}
};

/**
 * Loads meta data from the server
 *
 * @param callback
 * @param batchCommand
 */
ZmMetaData.prototype.load =
function(callback, batchCommand) {
	var command = batchCommand || (new ZmBatchCommand());
	var sectionList = ZmMetaData.DEFAULT_SECTIONS;
	for (var i = 0; i < sectionList.length; i++) {
		if (sectionList[i] == ZmSetting.M_OFFLINE && !appCtxt.isOffline) { continue; }
		this.get(sectionList[i], command);
	}

	if (!batchCommand) {
		if (command.size() > 0) {
			var respCallback = new AjxCallback(this, this._handleLoad, [callback]);
			command.run(respCallback);
		}
	} else {
		if (callback) {
			callback.run(this._sections);
		}
	}
};

ZmMetaData.prototype._handleLoad =
function(callback, result) {
	this._sections = {};

	var metaDataResp = result.getResponse().BatchResponse.GetMailboxMetadataResponse;
	for (var i = 0; i < metaDataResp.length; i++) {
		var data = metaDataResp[i].meta[0];
		this._sections[data.section] = data._attrs;
	}

	if (callback) {
		callback.run(this._sections);
	}
};

/**
 * Saves all data within the given section out to the server. If section is not
 * provided, all sections are saved.
 *
 * @param section			[String]*			Section to save out.
 * @param callback			[AjxCallback]*		Callback called on successful save.
 * @param batchCommand		[ZmBatchCommand]*	Batch command the request should be a part of.
 */
ZmMetaData.prototype.save =
function(section, callback, batchCommand) {
	if (!section) {
		section = ZmMetaData.DEFAULT_SECTIONS;
	} else {
		if (!(section instanceof Array)) {
			section = [section];
		}
	}

	var command = batchCommand || (new ZmBatchCommand(null, this._account.name));

	for (var i = 0; i < section.length; i++) {
		var s = section[i];
		var sectionName = [ZmMetaData.NAMESPACE, s].join(":");
		var sectionData = this._sections[sectionName];
		if (sectionData) {
			this.set(s, sectionData, command);
		}
	}

	if (!batchCommand) {
		if (command.size() > 0) {
			command.run(callback);
		}
	} else {
		if (callback) {
			callback.run();
		}
	}
};

/**
 * Updates the local section cache with the given key/value pair.
 *
 * @param section	[String]		section to update
 * @param key		[String]		key to update
 * @param value		[String]		new value
 */
ZmMetaData.prototype.update =
function(section, key, value) {
	var sectionName = [ZmMetaData.NAMESPACE, section].join(":");
	var sectionObj = this._sections[sectionName];
	if (!sectionObj) {
		sectionObj = this._sections[sectionName] = {};
	}
	sectionObj[key] = value;
};
