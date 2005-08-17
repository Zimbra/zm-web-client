function LmMixedView(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	LmListView.call(this, parent, className, posStyle, LmController.MIXED_VIEW, LmList.MIXED, headerList, dropTgt);
	this._controller = controller;
};

LmMixedView.prototype = new LmListView;
LmMixedView.prototype.constructor = LmMixedView;

// Consts

LmMixedView.REPLENISH_THRESHOLD 	= 0;

LmMixedView.COLWIDTH_ICON 			= 16;
LmMixedView.COLWIDTH_FROM 			= 145;
LmMixedView.COLWIDTH_DATE 			= 60;

LmMixedView.prototype.toString = 
function() {
	return "LmMixedView";
};

LmMixedView.prototype._createItemHtml =
function(item, now, isDndIcon) {
	if (item.type == LmItem.CONTACT) {
		return LmContactSimpleView.prototype._createContactHtmlForMixed.call(this, item, now, isDndIcon);
	} else if (item.type == LmItem.CONV) {
		return LmConvListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	} else if (item.type == LmItem.MSG) {
		return LmMailMsgListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	}
};

LmMixedView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	return LmMailListView.prototype._fitParticipants.call(this, participants, participantsElided, width);
};

LmMixedView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();
	
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_ICON], null, LmImg.I_GLOBE, LmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_FLAG], null, LmImg.I_FLAG_ON, LmMixedView.COLWIDTH_ICON));
	
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(LmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_TAG], null, LmImg.I_MINI_TAG, LmMixedView.COLWIDTH_ICON));
	}
	
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT], LmMsg.from, null, LmMixedView.COLWIDTH_FROM, null, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT], null, LmImg.I_ATTACHMENT, LmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT], LmMsg.subject, null, null, null, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_DATE], LmMsg.date, null, LmMixedView.COLWIDTH_DATE));
	
	return headerList;
};
