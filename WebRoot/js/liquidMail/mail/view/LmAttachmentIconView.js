function LmAttachmentIconView(parent, className, posStyle) {

	LmMailListView.call(this, parent, className, posStyle, LmController.ATT_ICON_VIEW, LmItem.ATT);

	this.getHtmlElement().style.backgroundColor = "white";
}

LmAttachmentIconView.prototype = new LmMailListView;
LmAttachmentIconView.prototype.constructor = LmAttachmentIconView;

LmAttachmentIconView.prototype.toString = 
function() {
	return "LmAttachmentIconView";
}

LmAttachmentIconView.prototype._createItemHtml =
function(attachment, now) {
	var div;
	var htmlArr = new Array(50);
	var idx = 0;
	var id = attachment.getMessageId();
	var msg = attachment.getMessage();
	div = this.getDocument().createElement("div");
	div.style.display = "inline";
	this.associateItemWithElement(attachment, div, DwtListView.TYPE_LIST_ITEM);
		
	htmlArr[idx++] = "<table cellspacing='0' cellpadding='10' style='background-color:white; display:inline;'>";

	var ct = attachment.getContentType();
	var url = this._csfeMsgFetchSvc + "id=" + id + "&amp;part=" + attachment.getPartName();
	var name = attachment.getName() || attachment.getFilename();
	name = LsStringUtil.htmlEncode(name);
	var subject = LsStringUtil.htmlEncode(attachment.getSubject());
	var from = null;
	if (msg) {
		var fromAddr = msg._addrs[LmEmailAddress.FROM].get(0)
		from = fromAddr.getName();
	}
	var size = attachment.getSize();
	if (size >= 1024000)
		size = Math.round(size / 1024000) + "MB";
	else if (size > 1023)
		size = Math.round(size / 1024) + "KB";
	else
		size = size + "B";

	var fieldId;
	
	htmlArr[idx++] = "<td><table>";
	// thumbnail or icon
	if (ct.indexOf("image/") === 0) {
		htmlArr[idx++] = "<tr><td overflow='hidden'><a href='" + url + 
						 "'><img src='" + url + "' width='80' height='80'/></a></td></tr>";
	} else {
		var mimeInfo = LmMimeTable.getInfo(ct);
		fieldId = this._getFieldId(attachment, LmItem.F_ICON);
		htmlArr[idx++] = "<td class='Icon'><a href='" + url + "'>";
		htmlArr[idx++] = LsImg.getImageHtml(mimeInfo ? mimeInfo.imageLarge : LmImg.IL_DOCUMENT, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</a></td>";
	}
	htmlArr[idx++] = "<tr><td overflow='hidden'>" + name + "</td></tr>";
	fieldId = this._getFieldId(attachment, LmItem.F_SUBJECT);
	htmlArr[idx++] = "<tr><td overflow='hidden' id='" + 
					  fieldId + "'>" +
					  subject + "</td></tr>";
	if (from) {
		fieldId = this._getFieldId(attachment, LmItem.F_FROM);
		htmlArr[idx++] = "<tr><td overflow='hidden' id='" +
						  fieldId + "'>" +
						  from + "</td></tr>";
		htmlArr[idx++] = "<tr><td overflow='hidden'>" + size + "</td></tr>";
	}
	htmlArr[idx++] = "</table></td>";
	htmlArr[idx++] = "</tr></table>";
		
	div.innerHTML = htmlArr.join("");
	return div;
}

LmAttachmentIconView.prototype._mouseOverAction =
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
