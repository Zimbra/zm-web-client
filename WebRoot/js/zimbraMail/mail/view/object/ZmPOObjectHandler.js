function ZmPOObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, "po", null);
}

ZmPOObjectHandler.prototype = new ZmObjectHandler;
ZmPOObjectHandler.prototype.constructor = ZmPOObjectHandler;

ZmPOObjectHandler.PO_RE = /\bGR\w{6}-\w{5}\b/g;

ZmPOObjectHandler.prototype.match =
function(line, startIndex) {
	ZmPOObjectHandler.PO_RE.lastIndex = startIndex;
	return ZmPOObjectHandler.PO_RE.exec(line);
}

ZmPOObjectHandler.NEITHER = 0;
ZmPOObjectHandler.APPROVED = 1;
ZmPOObjectHandler.REJECTED = 2;

ZmPOObjectHandler.PO_DATA = {
	"GR9328B2-3X499": { req: "Steve Patterson", desc: "Cisco Catalyst 2912MF XL 12-port Switch", total: "$25,437.38", state: ZmPOObjectHandler.REJECTED },
	"GR9328X2-3Y847": { req: "Jeanine Martin", desc: "Software for Graphics Artists in Marketing", total: "$1,298.00", state: ZmPOObjectHandler.APPROVED },
	"GR738B64-8774Q": { req: "Arlene Johnson", desc: "Telecom Hardware for new office building", total: "$12,736.17", state:ZmPOObjectHandler.NEITHER }
};


ZmPOObjectHandler.prototype.getPOData =
function(obj) {
	var po = ZmPOObjectHandler.PO_DATA[obj];
	if (po == null)
		po = ZmPOObjectHandler.PO_DATA["GR9328B2-3X499"];
	return po;
}

ZmPOObjectHandler.prototype.getClassName =
function(obj) {
	var po = this.getPOData(obj);

	switch(po.state) {
		case ZmPOObjectHandler.APPROVED: return "POObjectApproved";
		case ZmPOObjectHandler.REJECTED: return "POObjectRejected";
		default: return "POObject";
	}
}

ZmPOObjectHandler.prototype._addEntryRow =
function(field, data, html, idx) {
	html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b>";
	html[idx++] = AjxStringUtil.htmlEncode(field) + ":";
	html[idx++] = "</b></td><td align='left' style='width:50%;'><div style='white-space:nowrap;'>";
	html[idx++] = AjxStringUtil.htmlEncode(data);
	html[idx++] = "</div></td></tr>";
	return idx;
}

ZmPOObjectHandler.prototype.getToolTipText =
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
	html[idx++] = "<b>"+AjxStringUtil.htmlEncode("PO# "+obj)+"</b>";
	html[idx++] = "</td>";
	html[idx++] = "<td align='right'>";
	html[idx++] = AjxImg.getImageHtml(ZmImg.I_TASK);
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

ZmPOObjectHandler.APPROVE_ITEM = 1;
ZmPOObjectHandler.REJECT_ITEM = 2;
ZmPOObjectHandler.SHOWFULL_ITEM = 3;

ZmPOObjectHandler.prototype.getActionMenu =
function(obj, span) {
	if (this._menu == null) {
		this._menu =  new ZmPopupMenu(this._appCtxt.getShell(), "ActionMenu");
		this._menu.createMenuItem(ZmPOObjectHandler.APPROVE_ITEM, ZmImg.I_CHECK, "Approve", null, true);
		this._menu.createMenuItem(ZmPOObjectHandler.REJECT_ITEM, ZmImg.I_RED_X, "Reject", null, true);
		this._menu.createSeparator();
		this._menu.createMenuItem(ZmPOObjectHandler.SHOWFULL_ITEM, ZmImg.I_TASK, "View Full PO", null, true);
		this._menu.addSelectionListener(ZmPOObjectHandler.APPROVE_ITEM, new AjxListener(this, ZmPOObjectHandler.prototype._approveListener));
		this._menu.addSelectionListener(ZmPOObjectHandler.REJECT_ITEM, new AjxListener(this, ZmPOObjectHandler.prototype._rejectListener));		
	}
	this._actionObject = obj;
	this._actionSpan = span;	
	return this._menu;
}

ZmPOObjectHandler.prototype._approveListener =
function(ev) {
	var obj = this._actionObject;
	var po = this.getPOData(obj);
	po.state = ZmPOObjectHandler.APPROVED;	
	this._actionSpan.className = this.getClassName(obj);	
}

ZmPOObjectHandler.prototype._rejectListener =
function(ev) {
	var obj = this._actionObject;
	var po = this.getPOData(obj);
	
	po.state = ZmPOObjectHandler.REJECTED;	
	this._actionSpan.className = this.getClassName(obj);
}
