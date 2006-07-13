/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmAttachmentIconView(parent, className, posStyle, controller) {

	ZmMailListView.call(this, parent, className, posStyle, ZmController.ATT_ICON_VIEW, ZmItem.ATT, controller);

	this.getHtmlElement().style.backgroundColor = "white";
}

ZmAttachmentIconView.prototype = new ZmMailListView;
ZmAttachmentIconView.prototype.constructor = ZmAttachmentIconView;

ZmAttachmentIconView.prototype.toString = 
function() {
	return "ZmAttachmentIconView";
}

ZmAttachmentIconView.prototype._createItemHtml =
function(attachment, now) {
	var div;
	var htmlArr = new Array(50);
	var idx = 0;
	var id = attachment.getMessageId();
	var msg = attachment.getMessage();
	div = document.createElement("div");
	div.style.display = "inline";
	this.associateItemWithElement(attachment, div, DwtListView.TYPE_LIST_ITEM);
		
	htmlArr[idx++] = "<table cellspacing='0' cellpadding='10' style='background-color:white; display:inline;'>";

	var ct = attachment.getContentType();
	var url = this._appCtxt.getCsfeMsgFetcher() + "id=" + id + "&amp;part=" + attachment.getPartName();
	var name = attachment.getName() || attachment.getFilename();
	name = AjxStringUtil.htmlEncode(name);
	var subject = AjxStringUtil.htmlEncode(attachment.getSubject());
	var from = null;
	if (msg) {
		var fromAddr = msg._addrs[ZmEmailAddress.FROM].get(0)
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
		var mimeInfo = ZmMimeTable.getInfo(ct);
		fieldId = this._getFieldId(attachment, ZmItem.F_ICON);
		htmlArr[idx++] = "<td class='Icon'><a href='" + url + "'>";
		htmlArr[idx++] = AjxImg.getImageHtml(mimeInfo ? mimeInfo.imageLarge : "GenericDoc_48", ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</a></td>";
	}
	htmlArr[idx++] = "<tr><td overflow='hidden'>" + name + "</td></tr>";
	fieldId = this._getFieldId(attachment, ZmItem.F_SUBJECT);
	htmlArr[idx++] = "<tr><td overflow='hidden' id='" + 
					  fieldId + "'>" +
					  subject + "</td></tr>";
	if (from) {
		fieldId = this._getFieldId(attachment, ZmItem.F_FROM);
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

ZmAttachmentIconView.prototype._mouseOverAction =
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
