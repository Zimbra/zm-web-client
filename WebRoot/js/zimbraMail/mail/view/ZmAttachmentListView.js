/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmAttachmentListView(parent, className, posStyle, controller) {

	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, ZmController.ATT_LIST_VIEW, ZmItem.ATT, controller, headerList);
}

ZmAttachmentListView.prototype = new ZmMailListView;
ZmAttachmentListView.prototype.constructor = ZmAttachmentListView;

ZmAttachmentListView.prototype.toString = 
function() {
	return "ZmAttachmentListView";
}

ZmAttachmentListView._MIME_PART = 1;
ZmAttachmentListView._MSG = 2;

ZmAttachmentListView.prototype._createItemHtml =
function(attachment, now) {
	var htmlArr = new Array();
	var idx = 0;
	var msg = attachment.getMessage();
	var id = attachment.getMessageId();
	var div = document.createElement("div");
	div[DwtListView._STYLE_CLASS] = "Row";
	div[DwtListView._SELECTED_STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + "-" + DwtCssStyle.SELECTED;
	div.className = div[DwtListView._STYLE_CLASS];
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
	var mimeInfo = ZmMimeTable.getInfo(attachment.getContentType());
	fieldId = this._getFieldId(attachment, ZmItem.F_ICON);
	htmlArr[idx++] = "<td class='Icon'>";
	htmlArr[idx++] = AjxImg.getImageHtml(mimeInfo ? mimeInfo.image : "GenericDoc" , null, ["id='", fieldId, "'"].join(""));
	htmlArr[idx++] = "</td>";
		
	// Name
	htmlArr[idx++] = "<td>";
	var name = attachment.getName() || attachment.getFilename();
	if (name) {
		var url = this._appCtxt.getCsfeMsgFetcher() + "id=" + attachment.messageId + "&amp;part=" + attachment.getPartName();
		name = "<a class='AttLink' href='" + url + "'>" + AjxStringUtil.htmlEncode(name) + "</a>";
	}
	htmlArr[idx++] = name ? name : " ";
	htmlArr[idx++] = "</td>";
	
	if (msg) {
		// Sender
		var fromAddr = msg._addrs[ZmEmailAddress.FROM].get(0);
		if (fromAddr) {
			fieldId = this._getFieldId(attachment, ZmItem.F_FROM);
	    	htmlArr[idx++] = "<td id='" + fieldId;
    		htmlArr[idx++] = "'>";
    		var name = fromAddr.getName() || " ";
 			htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
    		htmlArr[idx++] = "</td>";
		}
		// Subject
		fieldId = this._getFieldId(attachment, ZmItem.F_SUBJECT);
		htmlArr[idx++] = "<td id='" + fieldId;
		htmlArr[idx++] = "'>";
		var subject = attachment.getSubject() || msg.getSubject() || " ";
		htmlArr[idx++] = AjxStringUtil.htmlEncode(subject);
		htmlArr[idx++] = "</td>";
	}

DBG.println(AjxDebug.DBG2, "Content type: " + attachment.getContentType() + " - " + name);
			
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
	var dateStr = AjxDateUtil.computeDateStr(now, attachment.date);
	fieldId = this._getFieldId(attachment, ZmItem.F_DATE);
	htmlArr[idx++] = "</td><td id='" + fieldId;
	htmlArr[idx++] = "'>";
	htmlArr[idx++] = dateStr;
	htmlArr[idx++] = "</td></tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
}

ZmAttachmentListView.prototype._mouseOverAction =
function(ev, div) {
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var id = element.id;
	if (!id)
		return true;
		
	var m = this._parseId(id);
	
	var msg = this.getItemFromElement(div).getMessage();
	if (m && m.field && msg) {
		if (m.field == ZmListView.FIELD_PREFIX[ZmItem.F_FROM]) {
			var fromAddr = msg._addrs[ZmEmailAddress.FROM].get(0);
			this._setParticipantToolTip(fromAddr);
		} else if (m.field == ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) {
			this.setToolTipContent(AjxStringUtil.htmlEncode(msg.fragment));
		} else {
			this.setToolTipContent(null);
		}
	} else {
		this.setToolTipContent(null);
	}

	return true;
}

ZmAttachmentListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();

	headerList.push(new DwtListHeaderItem("", null, "Attachment", 16));
	headerList.push(new DwtListHeaderItem("", ZmMsg._name, null, 145));
	headerList.push(new DwtListHeaderItem("", ZmMsg.from, null, 145));
	headerList.push(new DwtListHeaderItem("", ZmMsg.subject, null, null));
	headerList.push(new DwtListHeaderItem("", ZmMsg.size, null, 76));
	headerList.push(new DwtListHeaderItem("", ZmMsg.date, null, 76));

	return headerList;
}
