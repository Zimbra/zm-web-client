function LmPOObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "po", null);
}

LmPOObjectHandler.prototype = new LmObjectHandler;
LmPOObjectHandler.prototype.constructor = LmPOObjectHandler;

LmPOObjectHandler.PO_RE = /\bGR\w{6}-\w{5}\b/g;

LmPOObjectHandler.prototype.match =
function(line, startIndex) {
	LmPOObjectHandler.PO_RE.lastIndex = startIndex;
	return LmPOObjectHandler.PO_RE.exec(line);
}

LmPOObjectHandler.NEITHER = 0;
LmPOObjectHandler.APPROVED = 1;
LmPOObjectHandler.REJECTED = 2;

LmPOObjectHandler.PO_DATA = {
	"GR9328B2-3X499": { req: "Steve Patterson", desc: "Cisco Catalyst 2912MF XL 12-port Switch", total: "$25,437.38", state: LmPOObjectHandler.REJECTED },
	"GR9328X2-3Y847": { req: "Jeanine Martin", desc: "Software for Graphics Artists in Marketing", total: "$1,298.00", state: LmPOObjectHandler.APPROVED },
	"GR738B64-8774Q": { req: "Arlene Johnson", desc: "Telecom Hardware for new office building", total: "$12,736.17", state:LmPOObjectHandler.NEITHER }
};


LmPOObjectHandler.prototype.getPOData =
function(obj) {
	var po = LmPOObjectHandler.PO_DATA[obj];
	if (po == null)
		po = LmPOObjectHandler.PO_DATA["GR9328B2-3X499"];
	return po;
}

LmPOObjectHandler.prototype.getClassName =
function(obj) {
	var po = this.getPOData(obj);

	switch(po.state) {
		case LmPOObjectHandler.APPROVED: return "POObjectApproved";
		case LmPOObjectHandler.REJECTED: return "POObjectRejected";
		default: return "POObject";
	}
}

LmPOObjectHandler.prototype._addEntryRow =
function(field, data, html, idx) {
	html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b>";
	html[idx++] = LsStringUtil.htmlEncode(field) + ":";
	html[idx++] = "</b></td><td align='left' style='width:50%;'><div style='white-space:nowrap;'>";
	html[idx++] = LsStringUtil.htmlEncode(data);
	html[idx++] = "</div></td></tr>";
	return idx;
}

LmPOObjectHandler.prototype.getToolTipText =
function(obj) {
	var po = this.getPOData(obj);	
	var html = new Array(20);
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
	html[idx++] = "<div style='border-bottom: 1px solid black; white-space:nowrap;'>";
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' width=100%;'>";
	html[idx++] = "<tr valign='center'>";
	html[idx++] = "<td>";	
	html[idx++] = "<b>"+LsStringUtil.htmlEncode("PO# "+obj)+"</b>";
	html[idx++] = "</td>";
	html[idx++] = "<td align='right'>";
	html[idx++] = LsImg.getImageHtml(LmImg.I_TASK);
	html[idx++] = "</td>";
	html[idx++] = "</table>";		
	html[idx++] ="</div>";
	html[idx++] = "</td></tr>";
	idx = this._addEntryRow("Requestor", po.req, html, idx);
	idx = this._addEntryRow("Description", po.desc, html, idx);
	idx = this._addEntryRow("Total", po.total, html, idx);
	html[idx++] = "</table>";
	return html.join("");
}

LmPOObjectHandler.APPROVE_ITEM = 1;
LmPOObjectHandler.REJECT_ITEM = 2;
LmPOObjectHandler.SHOWFULL_ITEM = 3;

LmPOObjectHandler.prototype.getActionMenu =
function(obj, span) {
	if (this._menu == null) {
		this._menu =  new LmPopupMenu(this._appCtxt.getShell(), "ActionMenu");
		this._menu.createMenuItem(LmPOObjectHandler.APPROVE_ITEM, LmImg.I_CHECK, "Approve", null, true);
		this._menu.createMenuItem(LmPOObjectHandler.REJECT_ITEM, LmImg.I_RED_X, "Reject", null, true);
		this._menu.createSeparator();
		this._menu.createMenuItem(LmPOObjectHandler.SHOWFULL_ITEM, LmImg.I_TASK, "View Full PO", null, true);
		this._menu.addSelectionListener(LmPOObjectHandler.APPROVE_ITEM, new LsListener(this, LmPOObjectHandler.prototype._approveListener));
		this._menu.addSelectionListener(LmPOObjectHandler.REJECT_ITEM, new LsListener(this, LmPOObjectHandler.prototype._rejectListener));		
	}
	this._actionObject = obj;
	this._actionSpan = span;	
	return this._menu;
}

LmPOObjectHandler.prototype._approveListener =
function(ev) {
	var obj = this._actionObject;
	var po = this.getPOData(obj);
	po.state = LmPOObjectHandler.APPROVED;	
	this._actionSpan.className = this.getClassName(obj);	
}

LmPOObjectHandler.prototype._rejectListener =
function(ev) {
	var obj = this._actionObject;
	var po = this.getPOData(obj);
	
	po.state = LmPOObjectHandler.REJECTED;	
	this._actionSpan.className = this.getClassName(obj);
}
