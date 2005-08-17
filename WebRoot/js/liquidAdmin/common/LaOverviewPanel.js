function LaOverviewPanel(parent, className, posStyle) {

	DwtComposite.call(this, parent, className, posStyle);

	this.setScrollStyle(DwtControl.CLIP);
	this.addControlListener(new LsListener(this, this._panelControlListener));
	this._createFolderTree();
	this._layout();
}

LaOverviewPanel.prototype = new DwtComposite();
LaOverviewPanel.constructor = LaOverviewPanel;

LaOverviewPanel._MIN_FOLDERTREE_SIZE = 100;

LaOverviewPanel.prototype.toString = 
function() {
	return "LaOverviewPanel";
}

LaOverviewPanel.prototype.getFolderTree =
function() {
	return this._tree;
}

LaOverviewPanel.prototype._createFolderTree =
function() {
	this._treePanel = new DwtComposite(this, "OverviewTreePanel", DwtControl.ABSOLUTE_STYLE);
	this._treePanel.setScrollStyle(DwtControl.SCROLL);
	this._tree = new DwtTree(this._treePanel, DwtTree.SINGLE_STYLE, "OverviewTree" , DwtControl.ABSOLUTE_STYLE);
}
	
LaOverviewPanel.prototype._layout =
function() {
	var opSz = this.getSize();
	opSz.x+=100;
	var h = opSz.y;
	h = (h > LaOverviewPanel._MIN_FOLDERTREE_SIZE) ? h : LaOverviewPanel._MIN_FOLDERTREE_SIZE;
	
	this._treePanel.setBounds(0, 0, opSz.x, h);
	var tfBds = this._treePanel.getBounds();
}

LaOverviewPanel.prototype._panelControlListener =
function(ev) {
	this._layout();
}
