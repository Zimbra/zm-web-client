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
 * Creates a calendar.
 * @constructor
 * @class
 *
 * @author Andy Clark
 *
 * @param {Hash}		params			a hash of parameters:
 * @param {int}			params.id		the numeric ID
 * @param {String}		params.name		the name
 * @param {ZmOrganizer}	params.parent	the parent organizer
 * @param {ZmTree}		params.tree		the tree model that contains this organizer
 * @param {constant}	params.color	the color for this calendar
 * @param {String}		params.url		the URL for this organizer's feed
 * @param {String}		params.owner	the owner of this calendar
 * @param {String}		params.zid		the Zimbra id of owner, if remote share
 * @param {String}		params.rid		the remote id of organizer, if remote share
 * @param {String}		params.restUrl	the REST URL of this organizer
 * 
 * @extends		ZmFolder
 */
ZmCalendar = function(params) {
	params.type = ZmOrganizer.CALENDAR;
	ZmFolder.call(this, params);
	this.reminder = params.reminder;
};

ZmCalendar.prototype = new ZmFolder;
ZmCalendar.prototype.constructor = ZmCalendar;

ZmCalendar.prototype.isZmCalendar = true;
ZmCalendar.prototype.toString = function() { return "ZmCalendar"; };

// Consts

ZmCalendar.ID_CALENDAR = ZmOrganizer.ID_CALENDAR;

// Public methods

/**
 * Creates a new calendar. The color and flags will be set later in response
 * to the create notification. This function is necessary because calendar
 * creation needs custom error handling.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmCalendar.create =
function(params) {
	params.errorCallback = new AjxCallback(null, ZmCalendar._handleErrorCreate, params);
	ZmOrganizer.create(params);
};

ZmCalendar._handleErrorCreate =
function(params, ex) {
	if (params.url && (ex.code == ZmCsfeException.SVC_PARSE_ERROR)) {
		msg = AjxMessageFormat.format(ZmMsg.calFeedInvalid, params.url);
		ZmOrganizer._showErrorMsg(msg);
		return true;
	}
	return ZmOrganizer._handleErrorCreate(params, ex);
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmCalendar.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)	{ return null; }
	if (this.link)							{ return "SharedCalendarFolder"; }
	return "CalendarFolder";
};

/**
 * Sets the free/busy.
 * 
 * @param	{Boolean}	        exclude		    if <code>true</code>, exclude free busy
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback	the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmCalendar.prototype.setFreeBusy = 
function(exclude, callback, errorCallback, batchCmd) {
	if (this.excludeFreeBusy == exclude) { return; }
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"},
                           callback: callback, errorCallback: errorCallback, batchCmd: batchCmd});
};

ZmCalendar.prototype.setChecked = 
function(checked, batchCmd) {
	if (this.isChecked == checked) { return; }
	this.checkAction(checkAction, batchCmd);
};

ZmCalendar.prototype.checkAction = 
function(checked, batchCmd) {
	var action = checked ? "check" : "!check";
	var checkedCallback = new AjxCallback(this, this.checkedCallback, [checked]);
	this._organizerAction({action: action, batchCmd: batchCmd,callback: checkedCallback});
};

ZmCalendar.prototype.checkedCallback = 
function(checked, result) {
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(this.type);
	var overviewId = appCtxt.getCurrentApp().getOverviewId();
	var treeView = treeController.getTreeView(overviewId);

	if (treeView && this.id && treeView._treeItemHash[this.id]) {
		treeView._treeItemHash[this.id].setChecked(checked);
	}
};

/**
 * Checks if the given object(s) may be placed in this folder.
 *
 * For calendars being dragged, the current target cannot:
 *   - Be the parent of the dragged calendar
 *   - Be the dragged calendar
 *   - Be an ancestor of the dragged calendar
 *   - Contain a calendar with the same name as the dragged calendar
 *   - Be a shared calendar
 *
 * @param {Object}	what		the object(s) to possibly move into this folder (item or organizer)
 * @return	{Boolean}	<code>true</code> if the object may be placed in this folder
 */
ZmCalendar.prototype.mayContain =
function(what) {
    if (!what) { return true; }

    var invalid = false;
    if (what instanceof ZmCalendar) {
        // Calendar DnD, possibly nesting calendars
        invalid = ((what.parent == this) ||  (what.id == this.id)  || this.isChildOf(what) ||
                   (!this.isInTrash() && this.hasChild(what.name)) || this.link);
    } else {
        //exclude the deleted folders
        if(this.noSuchFolder) return invalid;

		if (this.nId == ZmOrganizer.ID_ROOT) {
			// cannot drag anything onto root folder
			invalid = true;
		} else if (this.link) {
			// cannot drop anything onto a read-only addrbook
			invalid = this.isReadOnly();
		}

		if (!invalid) {
			// An item or an array of items is being moved
			var items = (what instanceof Array) ? what : [what];
			var item = items[0];

			// can't move items to folder they're already in; we're okay if
			// we have one item from another folder
			if (item.folderId) {
				invalid = true;
				for (var i = 0; i < items.length; i++) {
                    var folder = appCtxt.getById(items[i].folderId);
                    if(items[i].isReadOnly() && folder.owner != this.owner) {
                        invalid = true;
                        break;
                    }
					if (item.viewMode == ZmCalItem.MODE_NEW || folder != this) {
						invalid = false;
						break;
					}

				}
			}
		}

	}

	return !invalid;
};


// Callbacks

ZmCalendar.prototype.notifyCreate =
function(obj) {
	var calendar = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(calendar, ZmCalendar.sortCompare);
	this.children.add(calendar, index);
	calendar._notify(ZmEvent.E_CREATE);
};

ZmCalendar.prototype.notifyModify =
function(obj) {
	ZmFolder.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = {};
	if (obj.f != null && !obj._isRemote) {
		this._parseFlags(obj.f);
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		fields["excludeFreeBusy"] = true;
		doNotify = true;
	}
	if (obj.reminder !== undefined && !obj._isRemote) {
		this.reminder = obj.reminder;
		fields["reminder"] = true;
		doNotify = true;
	}

	if (doNotify) {
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
	}
};

ZmCalendar.prototype.notifyDelete =
function(obj) {

    if(this.isRemote() && !this._deleteAction){
        var overviewController = appCtxt.getOverviewController();
        var treeController = overviewController.getTreeController(this.type);
        var overviewId = appCtxt.getCurrentApp().getOverviewId();
        var treeView = treeController.getTreeView(overviewId);
        var node = treeView.getTreeItemById(this.id);        
        this.noSuchFolder = true;
        node.setText(this.getName(true));
    }else{
        ZmFolder.prototype.notifyDelete.call(this, obj);
    }
};

ZmCalendar.prototype._delete = function(){
    this._deleteAction = true;
    ZmFolder.prototype._delete.call(this);
};

// Static methods

/**
 * Checks the calendar name.
 * 
 * @param	{String}	name		the name to check
 * @return	{String}	the valid calendar name
 */
ZmCalendar.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmCalendar.sortCompare = 
function(calA, calB) {
	var check = ZmOrganizer.checkSortArgs(calA, calB);
	if (check != null) { return check; }

	// links appear after personal calendars
	if (calA.link != calB.link) {
		return calA.link ? 1 : -1;
	}

	// sort by calendar name
	var calAName = calA.name.toLowerCase();
	var calBName = calB.name.toLowerCase();
	if (calAName < calBName) return -1;
	if (calAName > calBName) return 1;
	return 0;
};

ZmCalendar.prototype.supportsPrivatePermission =
function() {
	return true;
};

// overriding ZmFolder.prototype.supportsPublicAccess
ZmCalendar.prototype.supportsPublicAccess =
function() {
	// calendars can be accessed outside of ZCS
	return true;
};

ZmCalendar.prototype.getRestUrl =
function(acct) {

    if(!appCtxt.multiAccounts){
        return ZmFolder.prototype.getRestUrl.call(this);
    }

	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	url = this._generateRestUrl(acct);
	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};

ZmCalendar.prototype._generateRestUrl =
function(acct) {
	var loc = document.location;
	var owner = this.getOwner();
	var uname = owner || appCtxt.get(ZmSetting.USERNAME);
    if (appCtxt.multiAccounts) {
        uname = appCtxt.get(ZmSetting.USERNAME, null, acct)
    }
	var m = uname.match(/^(.*)@(.*)$/);
	var host = loc.host || (m && m[2]);

	// REVISIT: What about port? For now assume other host uses same port
	if (loc.port && loc.port != 80 && (owner == appCtxt.get(ZmSetting.USERNAME))) {
		host = host + ":" + loc.port;
	}

	return [
		loc.protocol, "//", host, "/service/user/", uname, "/",
		AjxStringUtil.urlEncode(this.getSearchPath(true))
	].join("");
};


/**
 * Checks if the calendar is read-only.
 *
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmCalendar.prototype.isReadOnly =
function() {
	if (this.isFeed()) {
		return true; //feed calendar is read-only
	}
	return ZmFolder.prototype.isReadOnly.call(this);
};


/**
 * Sets the reminder flag
 *
 * @param	{Boolean}	        sharedReminder  if <code>true</code>, display reminders from shared calendars
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback	the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmCalendar.prototype.setSharedReminder =
function(sharedReminder, callback, errorCallback, batchCmd) {
	if (this.reminder == sharedReminder) { return; }

    var soapDoc = AjxSoapDoc.create("EnableSharedReminderRequest", "urn:zimbraMail");

    var linkNode = soapDoc.set("link");
    linkNode.setAttribute("id", this.id);
    linkNode.setAttribute("reminder", sharedReminder ? "1" : "0");

    if (batchCmd) {
        batchCmd.addRequestParams(soapDoc, callback, errorCallback);
    } else {
        appCtxt.getAppController().sendRequest({soapDoc:soapDoc,
                                                asyncMode:true,
                                                callback:callback,
                                                errorCallback:errorCallback});
    }
};

/**
 * Checks if the calendar supports public access.
 *
 * @return	{Boolean}	always returns <code>true</code>
 */
ZmCalendar.prototype.supportsPublicAccess =
function() {
	// Overridden to allow sharing of calendar outside of ZCS
	return true;
};