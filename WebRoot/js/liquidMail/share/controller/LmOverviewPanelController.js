function LmOverviewPanelController(appCtxt, container) {

	LmController.call(this, appCtxt, container);
}

LmOverviewPanelController.prototype = new LmController;
LmOverviewPanelController.prototype.constructor = LmOverviewPanelController;

LmOverviewPanelController.DEFAULT_FOLDER_ID = LmFolder.ID_INBOX;

LmOverviewPanelController.prototype.toString = 
function() {
	return "LmOverviewPanelController";
}

LmOverviewPanelController.prototype.getOverviewPanel =
function() {
	return this._overviewPanel;
}

LmOverviewPanelController.prototype.getTagTreeController =
function() {
	return this._tagTreeController;
}

LmOverviewPanelController.prototype.getFolderTreeController =
function() {
	return this._folderTreeController;
}

LmOverviewPanelController.prototype.setView =
function() {
	if (this._overviewPanel) {
		this._overviewPanel.reset();
	} else {
		this._overviewPanel = new LmOverviewPanel(this._container, "OverviewPanel", DwtControl.ABSOLUTE_STYLE, this._appCtxt);
	}
	this._buildFolderTree();
	var id = LmOverviewPanelController.DEFAULT_FOLDER_ID;
	var folder = this._appCtxt.getFolderTree().getById(id);
	this._folderTreeController.getTreeView().setSelected(folder, true);
}

LmOverviewPanelController.prototype._buildFolderTree =
function() {
	var tree = this._overviewPanel.getFolderTree();
	
	var folders = [LmFolder.ID_USER];
	if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED))
		folders.push(LmFolder.ID_SEP, LmFolder.ID_SEARCH);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		folders.push(LmFolder.ID_SEP, LmFolder.ID_TAGS);
	this._folderTreeController = new LmFolderTreeController(this._appCtxt, tree);
	var ttc = this._folderTreeController.show(folders, true);
	if (ttc)
		this._tagTreeController = ttc;
	this._setExpanded(LmFolder.ID_USER);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		this._setExpanded(LmFolder.ID_TAGS);
	if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED))
		this._setExpanded(LmFolder.ID_SEARCH);
}

LmOverviewPanelController.prototype._setExpanded =
function(id, recurse) {
	var node = this._folderTreeController.getTreeView().getTreeItemById(id);
	node.setExpanded(true, recurse);
}
