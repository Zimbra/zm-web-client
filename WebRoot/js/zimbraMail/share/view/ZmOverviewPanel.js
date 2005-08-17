function ZmOverviewPanel(parent, className, posStyle, appCtxt) {

	DwtComposite.call(this, parent, className, posStyle);

	this._appCtxt = appCtxt;
	this.setScrollStyle(DwtControl.CLIP);
	this._createFolderTree();
}

ZmOverviewPanel.prototype = new DwtComposite();
ZmOverviewPanel.prototype.constructor = ZmOverviewPanel;

ZmOverviewPanel.prototype.toString = 
function() {
	return "ZmOverviewPanel";
}

ZmOverviewPanel.prototype.getFolderTree =
function() {
	return this._tree;
}

ZmOverviewPanel.prototype.reset =
function() {
	this._treePanel.dispose();
	this._treePanel = null;
	this._tree.dispose();
	this._tree = null;
	this._createElements();
}

ZmOverviewPanel.prototype._createElements =
function() {
	this._createFolderTree();
}

ZmOverviewPanel.prototype._createFolderTree =
function() {
	this._treePanel = new DwtComposite(this, "OverviewTreePanel", DwtControl.RELATIVE_STYLE);
	this._treePanel.setScrollStyle(DwtControl.SCROLL);
	this._tree = new DwtTree(this._treePanel, DwtTree.SINGLE_STYLE, "OverviewTree", DwtControl.STATIC_STYLE);
}
