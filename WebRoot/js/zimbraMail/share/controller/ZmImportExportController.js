/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the import/export controller.
 *
 */

/**
 * Creates an import/export controller.
 * @class
 * This class represents an import/export controller.
 * 
 * @extends		ZmController
 */
ZmImportExportController = function() {
	ZmController.call(this, null);
};

ZmImportExportController.prototype = new ZmController;
ZmImportExportController.prototype.constructor = ZmImportExportController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmImportExportController.prototype.toString = function() {
	return "ZmImportExportController";
};

//
// Constants
//

ZmImportExportController.IMPORT_TIMEOUT = 300;

/**
 * Defines the "CSV" type.
 * @type {String}
 */
ZmImportExportController.TYPE_CSV = "csv";
/**
 * Defines the "ICS" type.
 * @type {String}
 */
ZmImportExportController.TYPE_ICS = "ics";
/**
 * Defines the "TGZ" type.
 * @type {String}
 */
ZmImportExportController.TYPE_TGZ = "tgz";

/**
 * Defines the default type.
 * 
 * @see		ZmImportExportController.TYPE_TGZ
 */
ZmImportExportController.TYPE_DEFAULT = ZmImportExportController.TYPE_TGZ;

/**
 * Defines the sub-type default array
 */
ZmImportExportController.SUBTYPE_DEFAULT = {};
ZmImportExportController.SUBTYPE_DEFAULT[ZmImportExportController.TYPE_TGZ] = ZmImportExportController.SUBTYPE_ZIMBRA_TGZ;
ZmImportExportController.SUBTYPE_DEFAULT[ZmImportExportController.TYPE_CSV] = ZmImportExportController.SUBTYPE_ZIMBRA_CSV;
ZmImportExportController.SUBTYPE_DEFAULT[ZmImportExportController.TYPE_ICS] = ZmImportExportController.SUBTYPE_ZIMBRA_ICS;

ZmImportExportController.TYPE_EXTS = {};
ZmImportExportController.TYPE_EXTS[ZmImportExportController.TYPE_CSV] = [ "csv", "vcf" ];
ZmImportExportController.TYPE_EXTS[ZmImportExportController.TYPE_ICS] = [ "ics" ];
ZmImportExportController.TYPE_EXTS[ZmImportExportController.TYPE_TGZ] = [ "tgz", "zip", "tar" ];

ZmImportExportController.EXTS_TYPE = {};
AjxUtil.foreach(ZmImportExportController.TYPE_EXTS, function(exts, p) {
	for (var i = 0; i < exts.length; i++) {
		ZmImportExportController.EXTS_TYPE[exts[i]] = p;
	}
});

ZmImportExportController.__FAULT_ARGS_MAPPING = {
	"formatter.INVALID_FORMAT": [ "filename" ],
	"formatter.INVALID_TYPE": [ "view", "path" ],
	"formatter.MISMATCHED_META": [ "path" ],
	"formatter.MISMATCHED_SIZE": [ "path" ],
	"formatter.MISMATCHED_TYPE": [ "path" ],
	"formatter.MISSING_BLOB": [ "path" ],
	"formatter.MISSING_META": [ "path" ],
	"formatter.MISSING_VCARD_FIELDS": [ "path" ],
	"formatter.UNKNOWN_ERROR": [ "path", "message" ],
	"mail.EXPORT_PERIOD_TOO_LONG": [ "limit" ]
};


ZmImportExportController.CSRF_TOKEN_HIDDEN_INPUT_ID = "ZmImportExportCsrfToken";
//
// Public methods
//

/**
 * Imports user data as specified in the <code>params</code> object.
 * 
 * @param {Hash}	params			a hash of parameters
 * @param {Element}	params.form		the form containing file input field
 * @param {String}	params.folderId	the folder id for import. If not specified, assumes import to root folder.
 * @param {String}	params.type		the type (defaults to {@link TYPE_TGZ})
 * @param {String}	params.subType	the sub-type (defaults to <code>SUBTYPE_DEFAULT[type]</code>)
 * @param {String}	params.resolve	resolve duplicates: "" (ignore), "modify", "replace", "reset" (defaults to ignore).
 * @param {String}	params.views	a comma-separated list of views
 * @param {AjxCallback}	callback	the callback for success
 * @param {AjxCallback}	errorCallback	the callback for errors
 *        
 * @return	{Boolean}	<code>true</code> if the import is successful
 */
ZmImportExportController.prototype.importData =
function(params) {
	// error checking
	params = params || {};
	var folderId = params.folderId || -1;
	if (folderId == -1) {
		var params = {
			msg:	ZmMsg.importErrorMissingFolder,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
		return false;
	}

	params.filename = params.form && params.form.elements["file"].value;
	if (!params.filename) {
		var params = {
			msg:	ZmMsg.importErrorMissingFile,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
		return false;
	}

	params.ext = params.filename.replace(/^.*\./,"").toLowerCase();
    if (!ZmImportExportController.EXTS_TYPE[params.ext]) {
        var params = {
            msg:	AjxMessageFormat.format(ZmMsg.importErrorTypeNotSupported, AjxStringUtil.htmlEncode(params.ext)),
            level:	ZmStatusView.LEVEL_CRITICAL
        };
        appCtxt.setStatusMsg(params);
        return false;
    }
	params.defaultType = params.type || ZmImportExportController.EXTS_TYPE[params.ext] || ZmImportExportController.TYPE_DEFAULT;
	var isZimbra = ZmImportExportController.EXTS_TYPE[params.defaultType] == ZmImportExportController.TYPE_TGZ;
	var folder = appCtxt.getById(folderId);
	if (!isZimbra && folder && folder.nId == ZmOrganizer.ID_ROOT) {
		var params = {
			msg:	ZmMsg.importErrorRootNotAllowed,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
		return false;
	}

	if (params.resolve == "reset") {
		var dialog = appCtxt.getOkCancelMsgDialog();
		dialog.registerCallback(DwtDialog.OK_BUTTON, this._confirmImportReset, this, [params]);
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._cancelImportReset, this);
		var msg = ZmMsg.importResetWarning;
		var style = DwtMessageDialog.WARNING_STYLE;
		dialog.setMessage(msg, style);
		dialog.popup();
		return false;
	}

	// import
	return this._doImportData(params);
};

/**
 * Exports user data as specified in the <code>params</code> object.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {String}	params.folderId		the folder id for export. If not specified, all folders want to be exported.
 * @param {String}	params.type			the type (defaults to {@link TYPE_TGZ})
 * @param {String}	params.subType		the sub-type (defaults to <code>SUBTYPE_DEFAULT[type]</code>)
 * @param {String}	params.views		a comma-separated list of views
 * @param {String}	params.filename		the filename for exported file
 * @param {String}	params.searchFilter	the search filter
 * @param {Boolean} params.skipMeta		if <code>true</code>, skip export of meta-data
 * @param {AjxCallback}	callback	the callback for success
 * @param {AjxCallback}	errorCallback	the callback for errors
 *        
 * @return	{Boolean}	<code>true</code> if the export is successful
 */
ZmImportExportController.prototype.exportData = function(params) {
	// error checking
	params = params || {};
	var folderId = params.folderId || -1;
	if (folderId == -1) {
		var params = {
			msg:	ZmMsg.exportErrorMissingFolder,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
		return false;
	}

	var type = params.type = params.type || ZmImportExportController.TYPE_DEFAULT;
	var isZimbra = ZmImportExportController.EXTS_TYPE[type] == ZmImportExportController.TYPE_TGZ;
	var folder = appCtxt.getById(folderId);
	if (!isZimbra && folder && folder.nId == ZmOrganizer.ID_ROOT) {
		var params = {
			msg:	ZmMsg.exportErrorRootNotAllowed,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
		return false;
	}

	// export
	return this._doExportData(params);
};

//
// Protected methods
//

/**
 * @private
 */
ZmImportExportController.prototype._doImportData =
function(params) {
	if (params.folderId == -1 && params.defaultType != ZmImportExportController.TYPE_TGZ) {
		return this._doImportSelectFolder(params);
	}
	return this._doImport(params);
};

/**
 * @private
 */
ZmImportExportController.prototype._doImportSelectFolder =
function(params) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.reset();
	dialog.setTitle(ZmMsg._import);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._doImportSelectFolderDone, this, [params]);

	var overviewId = dialog.getOverviewId(ZmSetting.IMPORT);
	var omit = {};
	omit[ZmFolder.ID_TRASH] = true;
	var type = params.defaultType;
	if (type == ZmImportExportController.TYPE_CSV) {
		AjxDispatcher.require(["ContactsCore", "Contacts"]);
		var noNew = !appCtxt.get(ZmSetting.NEW_ADDR_BOOK_ENABLED);
		dialog.popup({
			treeIds:		[ZmOrganizer.ADDRBOOK],
			title:			ZmMsg.chooseAddrBook,
			overviewId:		overviewId,
			description:	ZmMsg.chooseAddrBookToImport,
			skipReadOnly:	true,
			hideNewButton:	noNew,
			omit:			omit,
			appName:		ZmApp.CONTACTS
		});
	}
	else if (type == ZmImportExportController.TYPE_ICS) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
		dialog.popup({
			treeIds: [ZmOrganizer.CALENDAR],
			title: ZmMsg.chooseCalendar,
			overviewId: overviewId,
			description: ZmMsg.chooseCalendarToImport,
			skipReadOnly: true,
			omit:omit,
			appName:ZmApp.CALENDAR
		});
	}
};

/**
 * @private
 */
ZmImportExportController.prototype._doImportSelectFolderDone =
function(params, organizer) {
	params.folderId = organizer.id;
	this._doImport(params);
};

/**
 * @private
 */
ZmImportExportController.prototype._doImport =
function(params) {
	// create custom callback function for this import request
	var funcName = "ZmImportExportController__callback__"+Dwt.getNextId("import");
	window[funcName] = AjxCallback.simpleClosure(this._handleImportResponse, this, funcName, params);

	// generate request url
	var folder = params.folderId && appCtxt.getById(params.folderId);
	if (folder && folder.nId == ZmOrganizer.ID_ROOT) folder = null;
	var path = folder ? folder.getPath(null, null, null, true, true) : "";
	var type = params.type || params.ext;
	var url = [
		"/home/",
		encodeURIComponent(appCtxt.get(ZmSetting.USERNAME)),
		"/",
		encodeURIComponent(path),
		"?",
		type ? "fmt="+encodeURIComponent(type) : "",
		params.views ? "&types="+encodeURIComponent(params.views) : "",
		params.resolve ? "&resolve="+encodeURIComponent(params.resolve) : "",
		"&callback="+funcName,
		"&charset="+appCtxt.getCharset()
	].join("");

	// initialize form
	var form = params.form;
	form.action = url;
	form.method = "POST";
	form.enctype = "multipart/form-data";

	this._setCsrfTokenInput(form);

	// destination iframe
	var onload = null;
	var onerror = AjxCallback.simpleClosure(this._importError, this, params.errorCallback);
	params.iframe = ZmImportExportController.__createIframe(form, onload, onerror);

	// import
	form.submit();
	return true;
};

/**
 * lazily generate the hidden csrf token input field for the form.
 */
ZmImportExportController.prototype._setCsrfTokenInput =
function(form) {
	var csrfTokenInput = document.getElementById(ZmImportExportController.CSRF_TOKEN_HIDDEN_INPUT_ID);
	if (csrfTokenInput) {
		return;
	}
	csrfTokenInput = document.createElement("input");
	csrfTokenInput.type  = "hidden";
	csrfTokenInput.name  = "csrfToken";
	csrfTokenInput.id    = ZmImportExportController.CSRF_TOKEN_HIDDEN_INPUT_ID;
	csrfTokenInput.value = window.csrfToken;

	var firstChildEl = form.firstChild;
	form.insertBefore(csrfTokenInput, firstChildEl);
};

/**
 * @private
 */
ZmImportExportController.prototype._handleImportResponse =
function(funcName, params, type, fault1 /* , ... , faultN */) {
	// gather error/warning messages
	var messages = [];
	if (fault1) {
		for (var j = 3; j < arguments.length; j++) {
			var fault = arguments[j];
			var code = fault.Detail.Error.Code;
			var message = fault.Reason.Text;
			var args = ZmImportExportController.__faultArgs(fault.Detail.Error.a);
			if (code == "formatter.UNKNOWN_ERROR") {
				args.path = args.path || ["(",ZmMsg.unknown,")"].join("");
				args.message = message;
			}
			var mappings = ZmImportExportController.__FAULT_ARGS_MAPPING[code];
			var formatArgs = new Array(mappings ? mappings.length : 0);
			for (var i = 0; i < formatArgs.length; i++) {
				formatArgs[i] = args[mappings[i]];
			}
			var errorMsg = ZMsg[code] ? AjxMessageFormat.format(ZMsg[code], formatArgs) : "";
			// be a little more verbose if there was a failure
			if (type == "fail") {
				errorMsg = message ? errorMsg + '<br><br>' + AjxStringUtil.htmlEncode(message) : errorMsg;
			}
			else if (type == "warn") {
				errorMsg = errorMsg || message;
			}
			messages.push(errorMsg);
		}
	}
	// show success or failure
	if (type == "fail") {
		this._importError(params.errorCallback, messages[0]);
	}
	else if (type == "warn") {
		this._importWarnings(params.callback, messages);
	}
	else {
		this._importSuccess(params.callback);
		appCtxt.getAppController().sendNoOp(); //send no-op to refresh
	}

	// cleanup
	try {
		delete window[funcName]; // IE fails on this one (bug #57952)
	} catch (e) {
		if (window[funcName]) {
			window[funcName] = undefined;
		}
	}
	var iframe = params.iframe;
	setTimeout(function() { // Right now we are actually in the iframe's onload handler, so we defer killing the iframe until we're out of it
		iframe.parentNode.removeChild(iframe);
	}, 0);
};

/**
 * @private
 */
ZmImportExportController.__faultArgs =
function(array) {
	var args = {};
	for (var i = 0; array && i < array.length; i++) {
		args[array[i].n] = array[i]._content;
	}
	return args;
};

/**
 * @private
 */
ZmImportExportController.prototype._confirmImportReset =
function(params) {
	this._cancelImportReset();
	this._doImportData(params);
};

/**
 * @private
 */
ZmImportExportController.prototype._cancelImportReset =
function() {
	var dialog = appCtxt.getOkCancelMsgDialog();
	dialog.reset();
	dialog.popdown();
};

/**
 * @private
 */
ZmImportExportController.prototype._doExportData =
function(params) {
	// create custom error callback function for this export request
	var funcName = "exportErrorCallback__" + Dwt.getNextId("export");
	ZmImportExportController[funcName] = this._handleExportErrorResponse.bind(this, funcName, params);

	var type = params.type;
	var isTGZ = type == ZmImportExportController.TYPE_TGZ;
	var isCSV = type == ZmImportExportController.TYPE_CSV;
	var subType = params.subType || ZmImportExportController.SUBTYPE_DEFAULT[type];

	var folder = params.folderId && appCtxt.getById(params.folderId);
	if (folder && folder.nId == ZmOrganizer.ID_ROOT) folder = null;
	var path = folder ? folder.getPath(null, null, null, true, true) : "";

	// generate request URL
	var url = [
		"/home/",
		encodeURIComponent(appCtxt.get(ZmSetting.USERNAME)),
		"/",
		encodeURIComponent(path)
	].join("");

	var formParams = { "fmt" : type };
	if (isCSV) {
        formParams[type+"fmt"] = subType;
    }
	var startDate = params.start ? AjxDateUtil.simpleParseDateStr(params.start) : null;
	var endDate = params.end ? AjxDateUtil.simpleParseDateStr(params.end) : null;
	if (isTGZ && params.views) { formParams["types"] = params.views; }
    if (type == ZmImportExportController.TYPE_ICS) {
        formParams["icalAttach"] = "inline";
    }
    if(startDate) {
        formParams["start"] = startDate.getTime();
    }
    if(endDate) {
        endDate = AjxDateUtil.roll(endDate, AjxDateUtil.DAY, 1);
        formParams["end"] = endDate.getTime();
    }
	if (isTGZ && params.searchFilter) { formParams["query"] = params.searchFilter; }
	if (params.skipMeta) { formParams["meta"] = "0"; }
	if (params.filename) { formParams["filename"] = params.filename; }
	formParams.emptyname = ZmMsg.exportEmptyName;
    formParams["charset"] = (subType === "windows-live-mail-csv" || subType === "thunderbird-csv") ? "UTF-8" : appCtxt.getCharset();
	formParams["callback"] = "ZmImportExportController." + funcName;

	// initialize form
	var form = ZmImportExportController.__createForm(url, formParams);

	// destination form
	var onload = null;
	var onerror = this._exportError.bind(this, params.errorCallback);
	params.iframe = ZmImportExportController.__createIframe(form, onload, onerror);
	params.form = form;
	// export
	form.submit();
};

/**
 * @private
 */
ZmImportExportController.prototype._importSuccess =
function(callback) {
	if (callback) {
		callback.run(true);
	}
	ZmImportExportController.__showMessage(ZmMsg.importSuccess, DwtMessageDialog.INFO_STYLE);
	return true;
};

/**
 * @private
 */
ZmImportExportController.prototype._importWarnings =
function(callback, messages) {
	if (callback) {
		callback.run(false);
	}
	// remove duplicates
	var msgmap = {};
	for (var i = 0; i < messages.length; i++) {
		msgmap[messages[i]] = true;
	}
	messages = AjxUtil.map(AjxUtil.keys(msgmap), AjxStringUtil.htmlEncode);
	if (messages.length > 5) {
		var count = messages.length - 5;
		messages.splice(5, count, AjxMessageFormat.format(ZmMsg.importAdditionalWarnings, [count]));
	}
	// show warnings
	var msglist = [];
	for (var i = 0; i < messages.length; i++) {
		msglist.push("<li>", messages[i]);
	}
	var msg = AjxMessageFormat.format(ZmMsg.importSuccessWithWarnings, [ messages.length, msglist.join("") ]);
	ZmImportExportController.__showMessage(msg, DwtMessageDialog.WARNING_STYLE);
	return true;
};

/**
 * @private
 */
ZmImportExportController.prototype._importError =
function(errorCallback, message) {
	if (errorCallback) {
		errorCallback.run(false);
	}
	var msg = message || ZmMsg.importFailed;
	ZmImportExportController.__showMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	return true;
};

/**
 * @private
 */
ZmImportExportController.prototype._handleExportErrorResponse =
function(funcName, params, type, fault1 /* , ... , faultN */) {
	// gather error messages
	var messages = [];
	if (fault1) {
		for (var j = 3; j < arguments.length; j++) {
			var fault = arguments[j];
			var code = fault.Detail.Error.Code;
			var message = fault.Reason.Text;
			var args = ZmImportExportController.__faultArgs(fault.Detail.Error.a);
			if (code == "mail.EXPORT_PERIOD_NOT_SPECIFIED" || code == "mail.EXPORT_PERIOD_TOO_LONG") {
				message = "";
			} else if (code == "formatter.UNKNOWN_ERROR") {
				args.path = args.path || ["(",ZmMsg.unknown,")"].join("");
				args.message = message;
			}
			var mappings = ZmImportExportController.__FAULT_ARGS_MAPPING[code];
			var formatArgs = new Array(mappings ? mappings.length : 0);
			for (var i = 0; i < formatArgs.length; i++) {
				formatArgs[i] = args[mappings[i]];
			}
			var errorMsg = ZMsg[code] ? AjxMessageFormat.format(ZMsg[code], formatArgs) : "";
			if (type == "fail") {
				errorMsg = message ? errorMsg + '<br><br>' + AjxStringUtil.htmlEncode(message) : errorMsg;
			}
			messages.push(errorMsg);
		}
	}
	if (type == "fail") {
		this._exportError(params.errorCallback, messages[0]);
	}
	// cleanup
	try {
		delete ZmImportExportController[funcName]; // IE fails on this one (bug #57952)
	} catch (e) {
		if (ZmImportExportController[funcName]) {
			ZmImportExportController[funcName] = undefined;
		}
	}
	var iframe = params.iframe;
	var form = params.form;
	setTimeout(function() { // Right now we are actually in the iframe's onload handler, so we defer killing the iframe until we're out of it
		iframe.parentNode.removeChild(iframe);
		form.parentNode.removeChild(form);
	}, 0);
};

/**
 * @private
 */
ZmImportExportController.prototype._exportError =
function(errorCallback, message) {
	if (errorCallback) {
		errorCallback.run(false);
	}
	var msg = message || ZmMsg.exportFailed;
	ZmImportExportController.__showMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	return true;
};

//
// Private methods
//

/**
 * @private
 */
ZmImportExportController.__showMessage =
function(msg, level) {
	var dialog = appCtxt.getErrorDialog();
	dialog.setMessage(msg, null, level);
	dialog.popup(null, true);
};

/**
 * @private
 */
ZmImportExportController.__createForm =
function(action, params, method) {
	var form = document.createElement("FORM");
	form.action = action;
	form.method = method || "GET";
	for (var name in params) {
		var value = params[name];
		if (!value) continue;
		var input = document.createElement("INPUT");
		input.type = "hidden";
		input.name = name;
		input.value = value;
		form.appendChild(input);
	}
	form.style.display = "none";
	document.body.appendChild(form);
	return form;
};

/**
 * @private
 */
ZmImportExportController.__createIframe =
function(form, onload, onerror) {
	var id = Dwt.getNextId() + "_iframe";
	var iframe;
	if (AjxEnv.isIE) {
        try {
            // NOTE: This has to be done because IE doesn't recognize the name
            //       attribute if set programmatically. And without that, the
            //       form target will cause it to return in a new window which
            //       breaks the callback.
            var html = [ "<IFRAME id='",id,"' name='",id,"'>" ].join("");
            iframe = document.createElement(html);
        } catch (e) {
            // Unless its IE9+ in non-quirks mode, then the above throws an exception
            iframe = document.createElement("IFRAME");
            iframe.name = iframe.id = id;
        }
	}
	else {
		iframe = document.createElement("IFRAME");
		iframe.name = iframe.id = id;
	}
	// NOTE: Event handlers won't be called when iframe hidden.
//	iframe.style.display = "none";
	iframe.style.position = "absolute";
	iframe.style.width = 1;
	iframe.style.height = 1;
	iframe.style.top = 10;
	iframe.style.left = -10;
	document.body.appendChild(iframe);
	form.target = iframe.name;

	iframe.onload = onload;
	iframe.onerror = onerror;

	return iframe;
};
