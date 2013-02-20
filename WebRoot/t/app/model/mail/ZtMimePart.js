/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents a MIME part of a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMimePart', {

	requires: [
		'ZCS.common.mail.ZtMimeTable'
	],

	config: {
		parent:             null,
		children:           [],
		node:               null,
		contentType:        '',
		format:             '',  // optional for text/plain
		name:               '',
		part:               '',
		cachekey:           '',
		size:               0,
		contentDisposition: '',
		contentId:          '',
		contentLocation:    '',
		fileName:           '',
		isTruncated:        false,
		isBody:             false,
		hasContent:         false
	},

	constructor: function(config) {
		this.initConfig(config);
	},

	statics: {
		/**
		 * Returns a ZtMimePart constructed from the given JSON object. If a context
		 * hash is provided with 'attachments' and 'bodyParts' arrays, and a hash
		 * 'contentTypes', those will be populated as the node is recursively parsed.
		 *
		 * @param	{object}		node	JSON representation of MIME part
		 * @param	{hash}			ctxt	optional context
		 * @return	{ZtMimePart}			a MIME part
		 */
		fromJson: function(node, ctxt, parent) {

			var part = new ZCS.model.mail.ZtMimePart({
				parent:             parent,             // ZtMimePart
				node:               node,               // JSON node from which this was created
				contentType:        node.ct,            // ZCS.mime.*
				format:             node.format,        // applies only to text/plain, can be 'flowed'
				name:               node.name,
				part:               node.part,
				cachekey:           node.cachekey,
				size:               node.s,
				contentDisposition: node.cd,
				contentId:          node.ci,
				contentLocation:    node.cl,
				fileName:           node.filename,
				isTruncated:        !!node.truncated,
				isBody:             !!node.body,        // server flags viewable content
				hasContent:         !!node.content
			});

			part.load(node, ctxt);

			return part;
		}
	},

	/**
	 * Loads the MIME part contained in the given JSON node. Since we're mainly interested in
	 * attachments and body parts (which are parts the server has told us are worth displaying
	 * to the user), we compile an ongoing list of those so we don't have to walk the message's
	 * MIME structure later to get them. After processing the given node, this function
	 * recursively loads the node's children.
	 *
	 * NOTE: As long as we're forcing user prefs to display mail as HTML and reply as text,
	 * we don't need special processing for multipart/alternative. We'll just add whichever
	 * alternative part has content (which the server will mark as a body part). If we start
	 * to honor user prefs so that the user can reply in a different format from when they
	 * viewed the message, we will have to add back multipart/alternative processing.
	 *
	 * @param {object}  node        JSON with MIME part ('mp' node from server)
	 * @param {object}  ctxt        ongoing set of attachments, body parts, and content types
	 *
	 * @private
	 */
	load: function(node, ctxt) {

		var	disp = this.getContentDisposition(),
			type = this.getContentType(),

			isAttDisp = (disp === ZCS.mime.DISP_ATTACHMENT),
			isAttType = (type === ZCS.mime.MSG_RFC822 || type === ZCS.mime.TEXT_CAL),
			hasAttProp = !!(this.getFileName() || this.getContentId() || this.getContentLocation()),
			isIgnored = this.isIgnoredPart(),
			isAtt = !isIgnored && (isAttDisp || isAttType || hasAttProp),

			isBody = this.getIsBody(),
			hasContent = (ZCS.mime.IS_RENDERABLE_IMAGE[type] || this.getHasContent()),
			hasSize = (this.getSize() > 0),

			addAsAtt = isAtt || (isBody && !hasContent && hasSize && !isIgnored),
			addAsBodyPart = isBody && hasContent;

		if (ctxt.contentTypes) {
			ctxt.contentTypes[type] = true;
		}

		if (addAsAtt && ctxt.attachments) {
			ctxt.attachments.push(this);
		}

		if (addAsBodyPart && ctxt.bodyParts) {
			ctxt.bodyParts.push(this);
		}

		// don't descend into attached message, it's considered a single attachment
		if (node.mp && type !== ZCS.mime.MSG_RFC822) {
			for (var i = 0; i < node.mp.length; i++) {
				this.getChildren().push(ZCS.model.mail.ZtMimePart.fromJson(node.mp[i], ctxt, this));
			}
		}
	},

	/**
	 * Adds the given part to this part's children.
	 *
	 * @param {ZtMimePart}  part
	 */
	add: function(part) {
		this.getChildren().push(part);
	},

	/**
	 * Returns the textual content of this part.
	 * @return {string}
	 */
	getContent: function() {
		var node = this.getNode();
		return this.content || (node && node.content) || '';
	},

	/**
	 * Sets the textual content of this part. Used when creating a message to be sent.
	 *
	 * @param {string}  content
	 */
	setContent: function(content) {
		this.content = content;
	},

	/**
	 * Returns true if this part should not be considered to be an attachment.
	 *
	 * @private
	 * @return	{boolean}
	 */
	isIgnoredPart: function() {

		var type = this.getContentType(),
			parent = this.getParent(),
			parentType = parent && parent.getContentType();

		// bug fix #5889 - if parent node was multipart/appledouble,
		// ignore all application/applefile attachments - YUCK
		if (parentType === ZCS.mime.MULTI_APPLE_DBL && type === ZCS.mime.APP_APPLE_DOUBLE) {
			return true;
		}

		// bug fix #7271 - don't show renderable body parts as attachments anymore
		if (this.getIsBody() && this.getHasContent() && (type === ZCS.mime.TEXT_HTML || type === ZCS.mime.TEXT_PLAIN)) {
			return true;
		}

		if (type === ZCS.mime.MULTI_DIGEST) {
			return true;
		}

		return false;
	}
});
