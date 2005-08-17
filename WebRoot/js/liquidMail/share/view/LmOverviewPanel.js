function LmOverviewPanel(parent, className, posStyle, appCtxt) {

	DwtComposite.call(this, parent, className, posStyle);

	this._appCtxt = appCtxt;
	this.setScrollStyle(DwtControl.CLIP);
	this._createFolderTree();
}

LmOverviewPanel.prototype = new DwtComposite();
LmOverviewPanel.prototype.constructor = LmOverviewPanel;

LmOverviewPanel.prototype.toString = 
function() {
	return "LmOverviewPanel";
}

LmOverviewPanel.prototype.getFolderTree =
function() {
	return this._tree;
}

LmOverviewPanel.prototype.reset =
function() {
	this._treePanel.dispose();
	this._treePanel = null;
	this._tree.dispose();
	this._tree = null;
	this._createElements();
}

LmOverviewPanel.prototype._createElements =
function() {
	this._createFolderTree();
}

LmOverviewPanel.prototype._createFolderTree =
function() {
	this._treePanel = new DwtComposite(this, "OverviewTreePanel", DwtControl.RELATIVE_STYLE);
	this._treePanel.setScrollStyle(DwtControl.SCROLL);
	this._tree = new DwtTree(this._treePanel, DwtTree.SINGLE_STYLE, "OverviewTree", DwtControl.STATIC_STYLE);
}
