/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmBriefcaseTabView = function(parent,className,posStyle) {

    if (arguments.length == 0) return;

    DwtTabViewPage.call(this,parent,className,Dwt.STATIC_STYLE);

    this.setScrollStyle(Dwt.SCROLL);
};

ZmBriefcaseTabView.prototype = new DwtTabViewPage;
ZmBriefcaseTabView.prototype.constructor = ZmBriefcaseTabView;

ZmBriefcaseTabView.prototype.toString = function(){
    return "ZmBriefcaseTabView";
};

ZmBriefcaseTabView.prototype.showMe = function(){
    DwtTabViewPage.prototype.showMe.call(this);
    this.setSize(Dwt.DEFAULT, "235");
    this.showFolder(this._folderId || ZmOrganizer.ID_BRIEFCASE);
};

ZmBriefcaseTabView.prototype.hideMe = function(){
    DwtTabViewPage.prototype.hideMe.call(this);
};

//Create UI for Briefcase Tab UI
ZmBriefcaseTabView.prototype._createHtml = function(){
    this._contentEl =  this.getContentHtmlElement();
    this._tableID = Dwt.getNextId();
    this._folderTreeCellId = Dwt.getNextId();
    this._folderListId = Dwt.getNextId();
    var html = [];
    var idx = 0;
    html[idx++] = ['<table class="ZmBriefcaseTabView_Table" id="', this._tableID, '" cellspacing="0" cellpadding="0" border="0">'].join("");
    html[idx++] = '<tr>';
    html[idx++] = ['<td width="30%" valign="top" id="', this._folderTreeCellId, '">'].join("");
    html[idx++] = '</td>';
    html[idx++] = ['<td width="70%" valign="top" id="', this._folderListId, '">'].join("");
    html[idx++] = '</td>';
    html[idx++] = '</tr>';
    html[idx++] = '</table>';
    this._contentEl.innerHTML = html.join("");

    var bController = this._briefcaseController = AjxDispatcher.run("GetBriefcaseController");

    this.showBriefcaseTreeView();

    var params = {parent: bController._container, className: "BriefcaseTabBox BriefcaseList", posStyle: DwtControl.ABSOLUTE_STYLE, view: ZmId.VIEW_BRIEFCASE_ICON, type: ZmItem.ATT, controller: bController};
    var bcView = this._tabBriefcaseView = new ZmBriefcaseIconView(params);
    bcView.reparentHtmlElement(this._folderListId);
    bcView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
    Dwt.setPosition(bcView.getHtmlElement(),Dwt.RELATIVE_STYLE);
    //this.showFolder(ZmOrganizer.ID_BRIEFCASE);
};

ZmBriefcaseTabView.prototype.setSize =
function(width, height) {
    DwtTabViewPage.prototype.setSize.call(this, width, height);
    var size = this.getSize();

    var treeWidth = size.x*0.40;
    var listWidth = size.x-treeWidth;
    var newHeight = height-15;
    this._overview.setSize(treeWidth, newHeight);
    this._tabBriefcaseView.setSize(listWidth-5, newHeight);
    return this;
};


ZmBriefcaseTabView.prototype.showFolder =
function(folderId) {
    this._folderId = folderId;
    var bController = this._briefcaseController;
    var callback = new AjxCallback(this,this.showFolderContents,[folderId]);
    bController.getItemsInFolder(folderId,callback);
};

ZmBriefcaseTabView.prototype.showFolderContents =
function(folderId,items) {
    if(items){
        this._list = items;
    }else{
        this._list = new ZmList(ZmItem.BRIEFCASE);
    }
    var bcView = this._tabBriefcaseView;
    bcView.set(folderId, this._list);
};

ZmBriefcaseTabView.prototype._listSelectionListener =
function(ev) {
    if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
        var item = ev.item;
        if (item && item.restUrl) {
            this.uploadFiles([{id: item.id, ct: item.contentType, s: item.size}]);
        }else if(item && item.isFolder){
            this.showFolder(item.id);
        }
    }
};

ZmBriefcaseTabView.prototype._handleKeys = function(ev){
    var key = DwtKeyEvent.getCharCode(ev);
    return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};

ZmBriefcaseTabView.prototype.gotAttachments =
function() {
    return false;
};

ZmBriefcaseTabView.prototype.uploadFiles =
function(docIds) {
    if(!docIds){
        docIds = [];
        var bcView = this._tabBriefcaseView;
        var items =bcView.getSelection();
        if(!items || (items.length == 0)) {
            var attachDialog = appCtxt.getAttachDialog();
            attachDialog.setFooter(ZmMsg.attachSelectMessage);
            return;
        }
        for(var i in items) {
            docIds.push({id: items[i].id, ct: items[i].contentType, s: items[i].size});
        }

    }

    if(!(docIds instanceof Array)){
        docIds = [docIds];
    }

    this._composerCtrl = appCtxt.getApp(ZmApp.MAIL).getComposeController();
    var callback = new AjxCallback(this, this._composerCtrl._handleResponseSaveDraftListener);
    this._composerCtrl.sendDocs(docIds,true,callback);
};

ZmBriefcaseTabView.prototype.showBriefcaseTreeView =
function() {
    var base = this.toString();
    var acct = appCtxt.getActiveAccount();
    var params = {
        treeIds: [ZmOrganizer.BRIEFCASE],
        fieldId: this._folderTreeCellId,
        overviewId: (appCtxt.multiAccounts) ? ([base, acct.name].join(":")) : base,
        account: acct
    };
    this._setOverview(params);

};

ZmBriefcaseTabView.prototype._setOverview =
function(params) {
    var overviewId = params.overviewId;
    var opc = appCtxt.getOverviewController();
    var overview = opc.getOverview(overviewId);
    if (!overview) {
        var ovParams = {
            overviewId: overviewId,
            overviewClass: "BriefcaseTabBox",
            headerClass: "DwtTreeItem",
            noTooltips: true,
            treeIds: params.treeIds
        };
        overview = this._overview = opc.createOverview(ovParams);
        overview.set(params.treeIds, {}, params.account, true)
        document.getElementById(params.fieldId).appendChild(overview.getHtmlElement());
        var treeView = overview.getTreeView(ZmOrganizer.BRIEFCASE);
        treeView.addSelectionListener(new AjxListener(this, this._treeListener));
        this._hideRoot(treeView);
    } else if (params.account) {
        overview.account = params.account;
    }
};

ZmBriefcaseTabView.prototype._treeListener =
function(ev) {
    if (ev.detail == DwtTree.ITEM_SELECTED) {
        var ti = ev.item;
        var folder = ti.getData(Dwt.KEY_OBJECT);
        if(folder) {
            this.showFolder(folder.id);
        }
    }
};

ZmBriefcaseTabView.prototype._hideRoot =
function(treeView) {
    var ti = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
    if (!ti) {
        var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT)
        ti = treeView.getTreeItemById(rootId);
    }
    ti.showCheckBox(false);
    ti.setExpanded(true);
    ti.setVisible(false, true);
};