/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 *
 * @author Prashant Jain
 *
 *
 * @extends
 */

ZmQuickCommands = function() {
    if (ZmQuickCommands.INSTANCE) {
        return ZmQuickCommands.INSTANCE;
    }
    
    this.commands = new AjxVector();
    this._itemTypeIdToQuickCommandsMap = {};
    this._loadCommandsFromSettings();
};

ZmQuickCommands.prototype.toString =
function() {
    return "ZmQuickCommands";
};

ZmQuickCommands.prototype.addCommand =
function(quickCommand) {
    if (quickCommand) {
        this.commands.add(quickCommand);
        this._addCommandToMap(quickCommand);
    }
};

ZmQuickCommands.prototype._addCommandToMap =
function(quickCommand) {
    if (!quickCommand) {return;}
    var quickCommands = this._itemTypeIdToQuickCommandsMap[quickCommand.itemType.id];
    if (!quickCommands) {
        this._itemTypeIdToQuickCommandsMap[quickCommand.itemType.id] = quickCommands = [];
    }

    var idx = ZmQuickCommands.getQuickCommandIndex(quickCommand, quickCommands);
    if (idx == -1) {
        quickCommands.push(quickCommand);
    }
};

ZmQuickCommands.prototype.removeCommand =
function(quickCommand) {
    if (quickCommand) {
        this.commands.remove(quickCommand);
        this._removeCommandFromMap(quickCommand);
    }
};

ZmQuickCommands.prototype._removeCommandFromMap =
function(quickCommand) {
    if (!quickCommand) {return;}
    var quickCommands = this._itemTypeIdToQuickCommandsMap[quickCommand.itemType.id];
    if (!quickCommands) {return}

    AjxUtil.arrayRemove(quickCommands, quickCommand);
};

ZmQuickCommands.prototype._removeAllCommands = function() {
    var len = this.commands.size();
    for (var i = len-1; i >= 0; i--) {
        var quickCommand = this.commands.get(i);
        this.removeCommand(quickCommand);
    }
};

ZmQuickCommands.prototype.crudQuickCommand = function(crudQuickCommand, crud, callback) {
    if (!crudQuickCommand) {return;}

    var allQuickCommands = this.commands.clone();
    allQuickCommands = allQuickCommands.getArray();

    var len = allQuickCommands.length;
    var foundAtIndex = -1;
    for (var i = 0; i < len; i++) {
        var quickCommand = allQuickCommands[i];
        if (quickCommand == crudQuickCommand || quickCommand.id == crudQuickCommand.id) {
            foundAtIndex = i;
            break;
        }
    }

    var canSaveAllQuickCommands = false;
    if (crud == ZmId.OP_ADD) {
        allQuickCommands.push(crudQuickCommand);
        canSaveAllQuickCommands = true;
    } else if (crud == ZmId.OP_DELETE) {
        if (foundAtIndex > -1) {
            allQuickCommands.splice(foundAtIndex, 1);
            canSaveAllQuickCommands = true;
        }

    } else if (crud == ZmId.OP_EDIT) {
        if (foundAtIndex > -1) {
            allQuickCommands[foundAtIndex] = crudQuickCommand;
            canSaveAllQuickCommands = true;
        }
    }

    if (canSaveAllQuickCommands) {
        this._saveQuickCommands(allQuickCommands, callback);
    }
};

ZmQuickCommands.prototype._saveQuickCommands = function(quickCommands, callback) {
    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");

    var len = quickCommands.length;
    if (!len){
		var node = soapDoc.set("pref", ""); // No quick commands
		node.setAttribute("name", "zimbraPrefQuickCommand");
    } else {
	    for (var i = 0; i < len; i++) {
		var quickCommand = quickCommands[i];
		var quickCommandJSON = quickCommand.toJSON();
		var node = soapDoc.set("pref", AjxStringUtil.trim(quickCommandJSON));
		node.setAttribute("name", "zimbraPrefQuickCommand");
	    }
    }
    var postSaveClosure = this._postSave.bind(this, quickCommands, callback);
    appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:postSaveClosure});
};

ZmQuickCommands.prototype._postSave = function(quickCommands, callback, result) {
    if (!result.isException()) {
        var i;
        var quickCommand;

        //first remove all the old commands
        this._removeAllCommands();

        //now add all new commands
        len = quickCommands.length;
        for (i = 0; i < len; i++) {
            quickCommand = quickCommands[i];
            this.addCommand(quickCommand);
        }
    }

    if (callback) {
        callback(result);
    }
};

ZmQuickCommands.prototype._loadCommandsFromSettings = function(result) {
    this.commands.removeAll();

    var jsonArray = appCtxt.get("QUICK_COMMAND_LIST");
    if (jsonArray) {
        var len = jsonArray.length;
        for (var i = 0; i < len; i++) {
            var json = jsonArray[i];
            var jsonObject = JSON.parse(json);
            var quickCommand = ZmQuickCommand.buildFromJSONObject(jsonObject);
            this.addCommand(quickCommand);
        }
    }
};

ZmQuickCommands.prototype.getMaxQuickCommandId = function() {
    var maxId = 0;
    var len = this.commands.size();
    for (var i = 0; i < len; i++) {
        var quickCommand = this.commands.get(i);
        if (AjxUtil.isNumber(quickCommand.id)) {
            maxId = maxId > quickCommand.id ? maxId : quickCommand.id;
        }
    }
    return maxId;
};

ZmQuickCommands.prototype.getQuickCommandsByItemType = function(itemType, includeInactive) {
    if (includeInactive !== true) {includeInactive = false;}
    var ret = this._itemTypeIdToQuickCommandsMap[itemType.id];

    if (!includeInactive && ret) {
        ret = ret.concat();
        var len = ret.length;
        for (var i = len - 1; i >= 0; i--) {
            var quickCommand = ret[i];
            if (!quickCommand.isActive) {ret.splice(i, 1);}
        }
    }

    return ret;
};

ZmQuickCommands.prototype.getQuickCommandByIndex =
function(index) {
    return this.commands.get(index);
};

//static members
ZmQuickCommands.getInstance =
function() {
	if (!ZmQuickCommands.INSTANCE) {
        ZmQuickCommands.INSTANCE = new ZmQuickCommands();
    }
    return ZmQuickCommands.INSTANCE;
};

ZmQuickCommands.getQuickCommandIndex = function(quickCommand, quickCommands) {
    if (!quickCommand) {return -1;}

    var len = quickCommands.length;
    for (var i = 0; i < len; i++) {
        if (quickCommand == quickCommands[i]) {
            return i;
        }
    }
    return -1;
};
