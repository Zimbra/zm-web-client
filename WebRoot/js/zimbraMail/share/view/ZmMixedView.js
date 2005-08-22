function ZmMixedView(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	ZmListView.call(this, parent, className, posStyle, ZmController.MIXED_VIEW, ZmList.MIXED, headerList, dropTgt);
	this._controller = controller;
};

ZmMixedView.prototype = new ZmListView;
ZmMixedView.prototype.constructor = ZmMixedView;

// Consts

ZmMixedView.REPLENISH_THRESHOLD 	= 0;

ZmMixedView.COLWIDTH_ICON 			= 16;
ZmMixedView.COLWIDTH_FROM 			= 145;
ZmMixedView.COLWIDTH_DATE 			= 60;

ZmMixedView.prototype.toString = 
function() {
	return "ZmMixedView";
};

ZmMixedView.prototype._createItemHtml =
function(item, now, isDndIcon) {
	if (item.type == ZmItem.CONTACT) {
		return ZmContactSimpleView.prototype._createContactHtmlForMixed.call(this, item, now, isDndIcon);
	} else if (item.type == ZmItem.CONV) {
		return ZmConvListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	} else if (item.type == ZmItem.MSG) {
		return ZmMailMsgListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	}
};

ZmMixedView.prototype._getParticipantHtml = 
function(conv, fieldId) {
	return ZmConvListView.prototype._getParticipantHtml.call(this, conv, fieldId);
};

ZmMixedView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	return ZmMailListView.prototype._fitParticipants.call(this, participants, participantsElided, width);
};

ZmMixedView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();
	
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ICON], null, ZmImg.I_GLOBE, ZmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, ZmImg.I_FLAG_ON, ZmMixedView.COLWIDTH_ICON));
	
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, ZmImg.I_MINI_TAG, ZmMixedView.COLWIDTH_ICON));
	}
	
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT], ZmMsg.from, null, ZmMixedView.COLWIDTH_FROM, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, ZmImg.I_ATTACHMENT, ZmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmMixedView.COLWIDTH_DATE));
	
	return headerList;
};
