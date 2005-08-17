function LmAttachmentListView(parent, className, posStyle) {

	var headerList = this._getHeaderList(parent);
	LmMailListView.call(this, parent, className, posStyle, LmController.ATT_LIST_VIEW, LmItem.ATT, headerList);
}

LmAttachmentListView.prototype = new LmMailListView;
LmAttachmentListView.prototype.constructor = LmAttachmentListView;

LmAttachmentListView.prototype.toString = 
function() {
	return "LmAttachmentListView";
}

LmAttachmentListView._MIME_PART = 1;
LmAttachmentListView._MSG = 2;

LmAttachmentListView.prototype._createItemHtml =
function(attachment, now) {
	var htmlArr = new Array();
	var idx = 0;
	var msg = attachment.getMessage();
	var id = attachment.getMessageId();
	var div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(attachment, div, DwtList.TYPE_LIST_ITEM);
	htmlArr[idx++] = "<table width='100%' cellspacing='0' cellpadding='1'>";
	htmlArr[idx++] = "<col style='width: 21px;'/>";		// icon
	htmlArr[idx++] = "<col style='width: 145px;'/>";	// file name
	htmlArr[idx++] = "<col style='width: 145px;'/>";	// from
	htmlArr[idx++] = "<col/>";							// subject
	htmlArr[idx++] = "<col style='width: 76px;'/>";		// size
	htmlArr[idx++] = "<col style='width: 76px;'/>";		// date
	
	var fieldId;
	
	// Icon
	var mimeInfo = LmMimeTable.getInfo(attachment.getContentType());
	fieldId = this._getFieldId(attachment, LmItem.F_ICON);
	htmlArr[idx++] = "<td class='Icon'>";
	htmlArr[idx++] = LsImg.getImageHtml(mimeInfo ? mimeInfo.image : LmImg.I_DOCUMENT, null, ["id='", fieldId, "'"].join(""));
	htmlArr[idx++] = "</td>";
		
	// Name
	htmlArr[idx++] = "<td>";
	var name = attachment.getName() || attachment.getFilename();
	if (name) {
		var url = this._csfeMsgFetchSvc + "id=" + attachment.messageId + "&amp;part=" + attachment.getPartName();
		name = "<a class='AttLink' href='" + url + "'>" + LsStringUtil.htmlEncode(name) + "</a>";
	}
	htmlArr[idx++] = name ? name : " ";
	htmlArr[idx++] = "</td>";
	
	if (msg) {
		// Sender
		var fromAddr = msg._addrs[LmEmailAddress.FROM].get(0);
		if (fromAddr) {
			fieldId = this._getFieldId(attachment, LmItem.F_FROM);
	    	htmlArr[idx++] = "<td id='" + fieldId;
    		htmlArr[idx++] = "'>";
    		var name = fromAddr.getName() || " ";
 			htmlArr[idx++] = LsStringUtil.htmlEncode(name);
    		htmlArr[idx++] = "</td>";
		}
		// Subject
		fieldId = this._getFieldId(attachment, LmItem.F_SUBJECT);
		htmlArr[idx++] = "<td id='" + fieldId;
		htmlArr[idx++] = "'>";
		var subject = attachment.getSubject() || msg.getSubject() || " ";
		htmlArr[idx++] = LsStringUtil.htmlEncode(subject);
		htmlArr[idx++] = "</td>";
	}

DBG.println(LsDebug.DBG2, "Content type: " + attachment.getContentType() + " - " + name);
			
	// Size
	htmlArr[idx++] = "<td>"
	var size = attachment.getSize();
	if (size >= 1024000)
		size = Math.round(size / 1024000) + "MB";
	else if (size > 1023)
		size = Math.round(size / 1024) + "KB";
	else
		size = size + "B";
	htmlArr[idx++] = size;
			
	// Date
	var dateStr = LsDateUtil.computeDateStr(now, attachment.date);
	fieldId = this._getFieldId(attachment, LmItem.F_DATE);
	htmlArr[idx++] = "</td><td id='" + fieldId;
	htmlArr[idx++] = "'>";
	htmlArr[idx++] = dateStr;
	htmlArr[idx++] = "</td></tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
}

LmAttachmentListView.prototype._mouseOverAction =
function(ev, div) {
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var id = element.id;
	if (!id)
		return true;
		
	var m = this._parseId(id);
	
	var msg = this.getItemFromElement(div).getMessage();
	if (m && m.field && msg) {
		if (m.field == LmListView.FIELD_PREFIX[LmItem.F_FROM]) {
			var fromAddr = msg._addrs[LmEmailAddress.FROM].get(0);
			this._setParticipantToolTip(fromAddr);
		} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) {
			this.setToolTipContent(LsStringUtil.htmlEncode(msg.fragment));
		} else {
			this.setToolTipContent(null);
		}
	} else {
		this.setToolTipContent(null);
	}

	return true;
}

LmAttachmentListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();

	headerList.push(new DwtListHeaderItem("", null, LmImg.I_ATTACHMENT, 16));
	headerList.push(new DwtListHeaderItem("", LmMsg._name, null, 145));
	headerList.push(new DwtListHeaderItem("", LmMsg.from, null, 145));
	headerList.push(new DwtListHeaderItem("", LmMsg.subject, null, null));
	headerList.push(new DwtListHeaderItem("", LmMsg.size, null, 76));
	headerList.push(new DwtListHeaderItem("", LmMsg.date, null, 76));

	return headerList;
}
