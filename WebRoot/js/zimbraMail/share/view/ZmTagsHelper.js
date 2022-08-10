/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * A static helper class used to do most of the stuff related to an item's tags - get the bubbles HTML, add listeners for changes, and inform the view to redraw the new html whenever needed.
 * The parent view itself will set  * the html into the view - this also allows the parent to do special things - for example for empty list of tags in mail message view - hide the "Tags:" row altogether.
 */

ZmTagsHelper = {};

ZmTagsHelper.setupListeners = function(view) {

	if (appCtxt.isChildWindow) {
		return;
	}
	// Add change listener to taglist to track changes in tag color, tag name, etc.
	view._tagList = appCtxt.getTagTree();
	if (!view._tagList) {
		return;
	}
	view._tagChangeHandler = ZmTagsHelper._tagChangeListener.bind(view);
	view._tagList.addChangeListener(view._tagChangeHandler);
};

ZmTagsHelper.disposeListeners =
function(view) {
	view._tagList && view._tagList.removeChangeListener(view._tagChangeHandler);
};

/**
 * gets the tags HTML (the bubbles html) for the item's tags
 * @param item
 */
ZmTagsHelper.getTagsHtml =
function(item, view) {

	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		return "";
	}

	var tags = item && item.getSortedTags();
	if (!(tags && tags.length)) {
		return "";
	}

	var html = [], i = 0;
	for (var j = 0; j < tags.length; j++) {
		var tag = tags[j];
		if (!tag) {
			continue;
		}
		var tagParams = {
			tag:		tag,
			html:		html,
			i:			i,
			view:		view,
			readOnly:	item.isReadOnly()
		};
		i = ZmTagsHelper._getTagHtml(tagParams);
	}
	return html.join("");
};

ZmTagsHelper._getTagHtml =
function(params) {
	params = params || {};
	var tag			= params.tag;
	var html		= params.html;
	var i			= params.i;
	var view		= params.view;
	var readOnly	= params.readOnly;

	var tagClick = ['ZmTagsHelper._tagClick("', view._htmlElId, '","', AjxStringUtil.encodeQuotes(tag.name), '");'].join("");
	var removeClick = ['ZmTagsHelper._removeTagClick("', view._htmlElId, '","', AjxStringUtil.encodeQuotes(tag.name), '");'].join("");

	html[i++] = "<span class='addrBubble TagBubble' notoggle=1 >";

	html[i++] = "<span class='TagImage' onclick='";
	html[i++] = tagClick;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml({
		imageName: tag.getIconWithColor(),
		altText: ZmMsg.tag
	});
	html[i++] = "</span>";

	html[i++] = "<span class='TagName' onclick='";
	html[i++] = tagClick;
	html[i++] = "'>";
	html[i++] = AjxStringUtil.htmlEncodeSpace(tag.name);
	html[i++] = "&nbsp;</span>";

    if (!readOnly) {
        html[i++] = "<span class='ImgBubbleDelete' onclick='";
        html[i++] = removeClick;
        html[i++] = "'>";
        html[i++] = "</span>";
    }
	html[i++] = "</span>";

	return i;
};


ZmTagsHelper._tagClick =
function(parentId, tagName) {
	if (appCtxt.isChildWindow) {
		return;
	}
	var tag = ZmTagsHelper._getTagClicked(tagName);
	var view = DwtControl.fromElementId(parentId);
	appCtxt.getSearchController().search({query: tag.createQuery(), inclSharedItems: true});
};

ZmTagsHelper._removeTagClick =
function(parentId, tagName) {
	var tag = ZmTagsHelper._getTagClicked(tagName);
	var view = DwtControl.fromElementId(parentId);
	ZmListController.prototype._doTag.call(view._controller, view._item, tag, false);
};

ZmTagsHelper._getTagClicked =
function(tagName) {
	var tagList = appCtxt.getAccountTagList();
	return tagList.getByNameOrRemote(tagName);
};

ZmTagsHelper._tagChangeListener =
function(ev) {
	//note - "this" is bound to the view.
	if (ev.type != ZmEvent.S_TAG) {	return; }
	if (this._disposed) { return; }

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MODIFY || ev.event == ZmEvent.E_CREATE) {
		//note - create is needed in case of a tag that was not in local tag list (due to sharing) that now is.
		this._setTags();
	}
};



