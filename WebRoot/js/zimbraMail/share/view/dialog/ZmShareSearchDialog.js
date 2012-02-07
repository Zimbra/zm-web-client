/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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

ZmShareSearchDialog = function(params) {
    // initialize params
    params.className = params.className || "ZmShareSearchDialog DwtDialog";
    params.title = ZmMsg.sharedFoldersAddTitle;
    params.standardButtons = [ ZmShareSearchDialog.ADD_BUTTON, DwtDialog.CANCEL_BUTTON ];
	params.id = "ZmShareSearchDialog";
	
    // setup auto-complete
    // NOTE: This needs to be done before default construction so
    // NOTE: that it is available when we initialize the email
    // NOTE: input field.
    var acparams = {
        dataClass:		appCtxt.getAutocompleter(),
        matchValue:		ZmAutocomplete.AC_VALUE_EMAIL,
        keyUpCallback:	this._acKeyUpListener.bind(this),
		contextId:		this.toString()
    };
    this._acAddrSelectList = new ZmAutocompleteListView(acparams);
    
    // default construction
    DwtDialog.call(this, params);

    // set custom button label
    this.getButton(ZmShareSearchDialog.ADD_BUTTON).setText(ZmMsg.add);

    // insert form elements into tab group
    var tabGroup = this._tabGroup;
    tabGroup.addMemberBefore(this._form.getTabGroupMember(), tabGroup.getFirstMember());
};
ZmShareSearchDialog.prototype = new DwtDialog;
ZmShareSearchDialog.prototype.constructor = ZmShareSearchDialog;

ZmShareSearchDialog.prototype.isZmShareSearchDialog = true;
ZmShareSearchDialog.prototype.toString = function() { return "ZmShareSearchDialog"; };

//
// Constants
//

ZmShareSearchDialog.ADD_BUTTON = DwtDialog.OK_BUTTON; //++DwtDialog.LAST_BUTTON;

ZmShareSearchDialog._APP_TYPES = [ZmApp.MAIL, ZmApp.CONTACTS, ZmApp.CALENDAR, ZmApp.TASKS, ZmApp.BRIEFCASE];
ZmShareSearchDialog._APP_KEY = {};
ZmShareSearchDialog._APP_KEY[ZmApp.MAIL]		= "mailSharesOnly";
ZmShareSearchDialog._APP_KEY[ZmApp.TASKS]		= "taskSharesOnly";
ZmShareSearchDialog._APP_KEY[ZmApp.BRIEFCASE]	= "briefcaseSharesOnly";
ZmShareSearchDialog._APP_KEY[ZmApp.CALENDAR]    = "calendarSharesOnly";
ZmShareSearchDialog._APP_KEY[ZmApp.CONTACTS]    = "addrbookSharesOnly";

//
// Data
//

ZmShareSearchDialog.prototype.CONTENT_TEMPLATE = "share.Widgets#ZmShareSearchView";


//
// Public methods
//

ZmShareSearchDialog.prototype.getShares = function() {
    var treeView = this._form.getControl("TREE");
    var root = this._getNode(ZmOrganizer.ID_ROOT);
    var shares = [];
    this._collectShares(treeView, root, shares);
    return shares;
};

//
// Protected methods
//

ZmShareSearchDialog.prototype._collectShares = function(treeView, node, shares) {
    if (node.shareInfo) {
        var treeItem = treeView.getTreeItemById(node.id);
        // NOTE: Only collect shares that are checked *and* visible.
        // NOTE: In other words, we should never mount a share that
        // NOTE: is not visible even if the user had checked it before
        // NOTE: applying a filter. Otherwise they would be left
        // NOTE: wondering why it was mounted.
        if (treeItem.getChecked() && treeItem.getVisible()) {
            shares.push(node.shareInfo);
        }
    }
    else {
        var children = node.children.getArray();
        for (var i = 0; i < children.length; i++) {
            this._collectShares(treeView, children[i], shares);
        }
    }
};

ZmShareSearchDialog.prototype._filterResults = function() {
    var treeView = this._form.getControl("TREE");
    var root = this._getNode(ZmOrganizer.ID_ROOT);
    var text = this._form.getValue("FILTER") || "";
    this._filterNode(treeView, root, text.toLowerCase());
};

ZmShareSearchDialog.prototype._filterNode = function(treeView, node, text) {
    // process children
    var count = node.children.size();
    var app = this._form.getValue("APP") || "";
    if (count > 0) {
        var filtered = 0;
        for (var i = 0; i < count; i++) {
            var child = node.children.get(i);
            filtered += this._filterNode(treeView, child, text) ? 1 : 0;
        }
        var parentItem = treeView.getTreeItemById(node.id);
        parentItem.setVisible(node.id == ZmOrganizer.ID_ROOT || filtered > 0);
        return parentItem.getVisible();
    }

    // filter child node
    var isInfoNode = String(node.id).match(/^-/);
    var textMatches = !text || (node.name.toLowerCase().indexOf(text) != -1);
    var appMatches = !app || (node.shareInfo && node.shareInfo.view == app);
    var matches = !isInfoNode && textMatches && appMatches;
    var childItem = treeView.getTreeItemById(node.id);
    childItem.setVisible(matches);
    return matches;
};

ZmShareSearchDialog.prototype._createOrganizer = function(parent, id, name) {
    // NOTE: The caller is responsible for adding the new node
    // NOTE: to the parent's children.
    return new ZmShareProxy({parent:parent,id:id,name:name,tree:(parent&&parent.tree)});
};

ZmShareSearchDialog.prototype._resetTree = function() {
    // create new tree
    var tree = new ZmTree(ZmOrganizer.SHARE);
    // NOTE: The root should never be seen
    tree.root = this._createOrganizer(null, ZmOrganizer.ID_ROOT, "[Root]");

    // setup tree view
    var treeView = this._form.getControl("TREE");
    treeView.set({ dataTree: tree });
    var treeItem = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
    treeItem.setVisible(false, true);
    treeItem.setExpanded(true);
    treeItem.enableSelection(false);
    treeItem.showCheckBox(false);
};

ZmShareSearchDialog.prototype._doGroupSearch = function() {
    this._setSearching(true);
    this._appendInfoNode(ZmOrganizer.ID_ROOT, ZmShareProxy.ID_LOADING, ZmMsg.sharedFoldersLoading);

    // perform group search
    var params = {
        jsonObj: {
            GetShareInfoRequest: {
                _jsns: "urn:zimbraAccount",
                includeSelf: 0,
                grantee: { type: "grp" }
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this, this._handleGroupSearchResults),
        errorCallback: new AjxCallback(this, this._handleGroupSearchError)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmShareSearchDialog.prototype._doUserSearch = function(emails) {
    // collect unique email addresses
    emails = emails.split(/\s*[;,]\s*/);
    var emailMap = {};
    for (var i = 0; i < emails.length; i++) {
        var email = AjxStringUtil.trim(emails[i]);
        if (!email) continue;
        if (email == appCtxt.get(ZmSetting.USERNAME)) continue;
        emailMap[email.toLowerCase()] = email;
    }

    // build request
    var requests = [], requestIdMap = {};
    var i = 0;
    for (var emailId in emailMap) {
        // add request
        requests.push({
            _jsns: "urn:zimbraAccount",
            requestId: i,
            includeSelf: 0,
            owner: { by: "name", _content: emailMap[emailId] }
        });

        // add loading placeholder node
        if (!this._loadingUserFormatter) {
            this._loadingUserFormatter = new AjxMessageFormat(ZmMsg.sharedFoldersLoadingUser);
        }
        var text = this._loadingUserFormatter.format([email]);
        var loadingId = [ZmShareProxy.ID_LOADING,Dwt.getNextId("share")].join(":");
        this._appendInfoNode(ZmOrganizer.ID_ROOT, loadingId, AjxStringUtil.htmlEncode(text));

        // remember the placeholder nodes
        emailMap[emailId] = loadingId;
        requestIdMap[i] = loadingId;
        i++;
    }

    // anything to do?
    if (requests.length == 0) {
        return;
    }

    // perform user search
    this._setSearching(true);
    var params = {
        jsonObj: {
            BatchRequest: {
                _jsns: "urn:zimbra",
                GetShareInfoRequest: requests
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this, this._handleUserSearchResults, [emailMap, requestIdMap]),
        errorCallback: new AjxCallback(this, this._handleUserSearchError)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmShareSearchDialog.prototype._setSearching = function(searching) {
    this._form.setEnabled(!searching);
};

ZmShareSearchDialog.prototype._handleGroupSearchResults = function(resp) {
    this._setSearching(false);

    // remove loading node
    this._removeNode(ZmShareProxy.ID_LOADING);

    // add shares
    var shares = AjxUtil.get(resp.getResponse(), "GetShareInfoResponse", "share");
    if (shares && shares.length > 0) {
        // get list of owners with their shares, in alphabetical order
        var owners = {};
        this._addToOwnerMap(owners, shares);
        owners = AjxUtil.values(owners);
        owners.sort(ZmShareSearchDialog.__byOwnerName);

        // add nodes for shares
        this._appendShareNodes(owners);

        // search for individual shares from these users
        var emails = new Array(shares.length);
        for (var i = 0; i < shares.length; i++) {
            emails[i] = shares[i].ownerEmail;
        }
        this._doUserSearch(emails.join(";"));
    }

    // no shares found
    else {
        this._appendInfoNode(ZmOrganizer.ID_ROOT, ZmShareProxy.ID_NONE_FOUND, ZmMsg.sharedFoldersNoGroupsFound);
    }
};

ZmShareSearchDialog.prototype._handleGroupSearchError = function(resp) {
    this._setSearching(false);
    this._removeNode(ZmShareProxy.ID_LOADING);
    var treeItem = this._appendInfoNode(ZmOrganizer.ID_ROOT, ZmShareProxy.ID_ERROR, ZmMsg.sharedFoldersError);
//    treeItem.setToolTipContent("[Error tooltip]"); // TODO
};

ZmShareSearchDialog.prototype._handleUserSearchResults = function(emailMap, requestIdMap, resp) {
    this._setSearching(false);

    // remove placeholder nodes
    for (var email in emailMap) {
        this._removeNode(emailMap[email]);
    }

    // add nodes for results
    var batchResponse = AjxUtil.get(resp.getResponse(), "BatchResponse");
    var responses = AjxUtil.get(batchResponse, "GetShareInfoResponse");
    if (responses) {
        // get list of owners with their shares, in alphabetical order
        var owners = {};
        for (var i = 0; i < responses.length; i++) {
            var response = responses[i];
            this._addToOwnerMap(owners, response.share);
        }
        owners = AjxUtil.values(owners);
        owners.sort(ZmShareSearchDialog.__byOwnerName);

        // add shares
        this._appendShareNodes(owners);
    }

    // apply current filter
    this._filterResults();

    // handle errors
    var faults = AjxUtil.get(batchResponse, "Fault");
    if (faults) {
        var treeView = this._form.getControl("TREE");
        for (var i = 0; i < faults.length; i++) {
            var fault = faults[i];

            // replace placeholder node with error node
            var faultNodeId = ZmShareProxy.ID_ERROR;// TODO: create unique error item id
            var loadingNode = this._getNode(requestIdMap[fault.requestId]);
            var faultNode = this._createOrganizer(loadingNode.parent, faultNodeId, ZmMsg.sharedFoldersError);
            treeView.replaceNode(faultNode, loadingNode);

            // set error message as tooltip
            var treeItem = treeView.getTreeItemById(faultNodeId);
            treeItem.showCheckBox(false);
            treeItem.setToolTipContent(AjxStringUtil.htmlEncode(fault.Reason.Text));
        }
    }
};

ZmShareSearchDialog.prototype._addToOwnerMap = function(owners, shares) {
    if (!shares) return;

    for (var j = 0; j < shares.length; j++) {
        var share = shares[j];
        var owner = owners[share.ownerId];
        if (!owner) {
            owner = owners[share.ownerId] = {
                ownerId: share.ownerId,
                ownerName: share.ownerName || share.ownerEmail,
                ownerEmail: share.ownerEmail,
                shares: []
            };
        }
        owner.shares.push(share);
    }
};

ZmShareSearchDialog.prototype._handleUserSearchError = function(resp) {
    this._setSearching(false);
    // TODO
};

// node management

ZmShareSearchDialog.prototype._getNode = function(id) {
    var treeView = this._form.getControl("TREE");
    var treeItem = treeView.getTreeItemById(id);
    return treeItem && treeItem.getData(Dwt.KEY_OBJECT);
};

ZmShareSearchDialog.prototype._removeNode = function(nodeId) {
    var treeView = this._form.getControl("TREE");
    treeView.removeNode(this._getNode(nodeId));
};

ZmShareSearchDialog.prototype._appendChild = function(childNode, parentNode, checkable, tooltip) {
    var treeView = this._form.getControl("TREE");
    var treeItem = treeView.appendChild(childNode, parentNode, null, tooltip);
    treeItem.setExpanded(true);
    treeItem.enableSelection(false);
    treeItem.showCheckBox(checkable);
    treeItem.setVisible(false);   //filterResults will set visibility
    return treeItem;
};

ZmShareSearchDialog.prototype._appendShareNodes = function(owners) {
    // is there anything to do?
    if (!owners) return;

    // run through owners
    for (var j = 0; j < owners.length; j++) {
        // create parent node, if needed
        var owner = owners[j];
        var parentNode = this._getNode(owner.ownerId);
        if (!parentNode) {
            var root = this._getNode(ZmOrganizer.ID_ROOT);
            parentNode = this._createOrganizer(root, owner.ownerId, owner.ownerName || owner.ownerEmail);
            this._appendChild(parentNode, root);
        }

        // add share nodes
        var shares = owner.shares;
        if (shares.length > 0) {
            shares.sort(ZmShareSearchDialog.__byFolderPath);
            for (var i = 0; i < shares.length; i++) {
                var share = shares[i];
                var shareId = [share.ownerId,share.folderId].join(":");
                if (this._getNode(shareId) != null) continue;

                 // NOTE: strip the leading slash from folder path
                var shareName = share.folderPath.substr(1).replace(/\//g, " ");
                var shareNode = this._createOrganizer(parentNode, shareId, shareName);
                shareNode.shareInfo = share;

                // augment share info
                share.icon = shareNode.getIcon();
                share.role = ZmShare.getRoleFromPerm(share.rights);
                share.roleName = ZmShare.getRoleName(share.role);
                share.roleActions = ZmShare.getRoleActions(share.role);
                share.normalizedOwnerName = share.ownerName || share.ownerEmail;
                share.normalizedGranteeName = share.granteeDisplayName || share.granteeName;
                share.normalizedFolderPath = shareName;
                share.defaultMountpointName = ZmShare.getDefaultMountpointName(share.normalizedOwnerName, share.normalizedFolderPath);

                // set tooltip
                var tooltip = AjxTemplate.expand(shareNode.TOOLTIP_TEMPLATE, share);
                this._appendChild(shareNode, parentNode, true, tooltip);
            }
        }

        // no shares found
        else {
            this._appendInfoNode(parentNode, ZmShareProxy.ID_NONE_FOUND, ZmMsg.sharedFoldersNoneFound);
        }
    }
};

ZmShareSearchDialog.prototype._appendInfoNode = function(parentId, id, text, tooltip) {
    var parent = this._getNode(parentId);
    var node = this._createOrganizer(parent, id, text);
    return this._appendChild(node, parent, null, tooltip);
};

// sorting

ZmShareSearchDialog.__byOwnerName = AjxCallback.simpleClosure(AjxUtil.byStringProp, window, "ownerName");
ZmShareSearchDialog.__byFolderPath = AjxCallback.simpleClosure(AjxUtil.byStringProp, window, "folderPath");

// auto-complete

ZmShareSearchDialog.prototype._acKeyUpListener = function(event, aclv, result) {
	// TODO: Does anything need to be done here?
};

//
// DwtDialog methods
//

ZmShareSearchDialog.prototype.popup = function(organizerType, addCallback, cancelCallback) {
    this.reset();
    if (addCallback) this._buttonDesc[ZmShareSearchDialog.ADD_BUTTON].callback = addCallback;
    if (cancelCallback) this._buttonDesc[DwtDialog.CANCEL_BUTTON].callback = cancelCallback;

    if (appCtxt.multiAccounts) {
        var acct =   appCtxt.getActiveAccount() || appCtxt.accountList.mainAccount;
        this._acAddrSelectList.setActiveAccount(acct);
    }

    var form = this._form;
    form.setValue("FILTER", "");
    form.setValue("EMAIL", "");
    form.setEnabled("SEARCH", false);   //disable search button by default
    this._selectApplicationOption();
    this._resetTree();
    this._doGroupSearch();

    DwtDialog.prototype.popup.call(this);

    form.getControl("EMAIL").focus();
};

ZmShareSearchDialog.prototype.popdown = function() {
	if (this._acAddrSelectList) {
		this._acAddrSelectList.reset();
		this._acAddrSelectList.show(false);
	}
	DwtDialog.prototype.popdown.call(this);
};

//
// DwtBaseDialog methods
//

ZmShareSearchDialog.prototype._createHtmlFromTemplate = function(templateId, data) {
    DwtDialog.prototype._createHtmlFromTemplate.apply(this, arguments);

    // create form
    var params = {
        parent: this,
        className: "ZmShareSearchView",
        form: {
            template: this.CONTENT_TEMPLATE,
            items: [
                { id: "FILTER", type: "DwtInputField", hint: ZmMsg.sharedFoldersFilterHint,
                    onchange: "this.parent._filterResults()"
                },
                { id: "TREE", type: "ZmShareTreeView", style: DwtTree.CHECKEDITEM_STYLE },
                { id: "EMAIL", type: "DwtInputField", hint: ZmMsg.sharedFoldersUserSearchHint },
                { id: "SEARCH", type: "DwtButton", label: ZmMsg.searchInput,
                    enabled: "get('EMAIL')", onclick: "this.parent._doUserSearch(get('EMAIL'))"
                },
                { id: "APP", type: "DwtSelect",  items: this._getAppOptions(), onchange: "this.parent._filterResults()"

                }
            ]
        },
	    id: "ZmShareSearchView"
    };
    this._form = new DwtForm(params);
    this.setView(this._form);

    var inputEl = this._form.getControl("EMAIL").getInputElement();
    var onkeyupHandlers = [inputEl.onkeyup];
    if (this._acAddrSelectList) {
        this._acAddrSelectList.handle(inputEl);
        onkeyupHandlers.push(inputEl.onkeyup);
    }
    onkeyupHandlers.push(AjxCallback.simpleClosure(this._handleEmailEnter, this));

    var handler = AjxCallback.simpleClosure(ZmShareSearchDialog.__onKeyUp, window, onkeyupHandlers);
    Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, handler);
};

ZmShareSearchDialog.__onKeyUp = function(handlers, htmlEvent) {
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](htmlEvent);
    }
};

ZmShareSearchDialog.prototype._handleEmailEnter = function(htmlEvent) {
    // TODO: on enter, run search
    if (false) {
        this._doUserSearch(this.getValue("EMAIL"));
    }
};

/**
 * Gets the include applications options.
 *
 * @return	{Array}	an array of include shares options
 */
ZmShareSearchDialog.prototype._getAppOptions = function() {
	var options = [];
    options.push({value: "", label: ZmMsg.allApplications});
    for (var i = 0; i < ZmShareSearchDialog._APP_TYPES.length; i++) {
		var appType = ZmShareSearchDialog._APP_TYPES[i];
	    var key = ZmShareSearchDialog._APP_KEY[appType];
	    var appEnabled = appCtxt.get(ZmApp.SETTING[appType]);
	    if (appEnabled) {
		    var shareKey = ZmApp.ORGANIZER[appType];
		    if (AjxUtil.isArray1(ZmOrganizer.VIEWS[shareKey])) {
				options.push({id: appType, value: ZmOrganizer.VIEWS[shareKey][0], label: ZmMsg[key]});
		    }
	    }
	}

    return options;
};

ZmShareSearchDialog.prototype._selectApplicationOption = function() {
  var activeApp = appCtxt.getCurrentApp();
  var appSelect = this._form.getControl("APP");
  var appOptions = this._getAppOptions();

  if (!activeApp || !appSelect || !appOptions)
    return;

  for (var i=0; i<appOptions.length; i++) {
      if (appOptions[i].hasOwnProperty('id') &&
          appOptions[i].id == activeApp.getName()) {
            appSelect.setSelectedValue(appOptions[i].value);
            return;
      }
  }

};