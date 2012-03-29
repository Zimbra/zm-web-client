/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a mime part.
 * @class
 * This class represents a mime part. Note that the content of the node is
 * not copied into this object, for performance reasons. It is typically
 * available via the 'bodyParts' list that is populated during node parsing.
 * 
 * @extends		ZmModel
 */
ZmMimePart = function(parent) {
	
	ZmModel.call(this, ZmEvent.S_ATT);
	
	this.parent = parent;
	this.children = new AjxVector();
};

ZmMimePart.prototype = new ZmModel;
ZmMimePart.prototype.constructor = ZmMimePart;

ZmMimePart.prototype.isZmMimePart = true;
ZmMimePart.prototype.toString = function() { return "ZmMimePart"; };

/**
 * Returns a ZmMimePart constructed from the given JSON object. If a context
 * hash is provided with 'attachments' and 'bodyParts' arrays, and a hash
 * 'contentTypes', those will be populated as the node is recursively parsed.
 * 
 * @param	{object}		node	JSON representation of MIME part
 * @param	{hash}			ctxt	optional context
 * @return	{ZmMimePart}			a MIME part
 */
ZmMimePart.createFromDom =
function(node, ctxt, parent) {
	var mimePart = new ZmMimePart(parent);
	mimePart._loadFromDom(node, ctxt);
	return mimePart;
};

/**
 * Returns this part's content.
 * 
 * @return	{string}	content		the content
 */
ZmMimePart.prototype.getContent = 
function() {
	return this.content || (this.node && this.node.content) || "";
};

/**
 * Returns content of the given type, in or below this part.
 * 
 * @param	{string}	contentType		the content type
 * @return	{string}					the content
 * 
 */
ZmMimePart.prototype.getContentForType = 
function(contentType) {

	if (this.contentType == contentType) {
		return this.getContent();
	}
	else {
		var children = this.children.getArray();
		if (children.length) {
			for (var i = 0; i < children.length; i++) {
				var content = children[i].getContentForType(contentType);
				if (content) {
					return content;
				}
			}
		}
	}
	return "";
};

/**
 * Sets the content, overriding the original content.
 * 
 * @param	{string}	content		the content
 */
ZmMimePart.prototype.setContent = 
function(content) {
	this.content = content;
};

/**
 * Returns the content disposition.
 * 
 * @return	{string}	the content disposition
 */
ZmMimePart.prototype.getContentDisposition =
function() {
	return this.contentDisposition;
};

/**
 * Returns the content type.
 * 
 * @return	{string}	the content type
 */
ZmMimePart.prototype.getContentType =
function() {
	return this.contentType;
};

/**
 * Sets the content type, , overriding the original content type.
 * 
 * @param	{string}	contentType		the content type
 */
ZmMimePart.prototype.setContentType =
function(contentType) {
	this.contentType = contentType;
};

/**
 * Sets the 'is body' flag, overriding the original part's value.
 * 
 * @param	{boolean}	isBody		if true, this part is the body
 */
ZmMimePart.prototype.setIsBody = 
function(isBody) {
	this.isBody = isBody;
};

/**
 * Returns the filename.
 * 
 * @return	{string}	the filename
 */
ZmMimePart.prototype.getFilename =
function() {
	return this.fileName;
};

/**
 * Returns true if this part should not be considered to be an attachment.
 * 
 * @return	{boolean}
 */
ZmMimePart.prototype.isIgnoredPart =
function() {
	// bug fix #5889 - if parent node was multipart/appledouble,
	// ignore all application/applefile attachments - YUCK
	if (this.parent && this.parent.contentType == ZmMimeTable.MULTI_APPLE_DBL &&
		this.contentType == ZmMimeTable.APP_APPLE_DOUBLE)
	{
		return true;
	}

	// bug fix #7271 - dont show renderable body parts as attachments anymore
	if (this.isBody && this.getContent() && 
		(this.contentType == ZmMimeTable.TEXT_HTML || this.contentType == ZmMimeTable.TEXT_PLAIN))
	{
		return true;
	}

	if (this.contentType == ZmMimeTable.MULTI_DIGEST) {
		return true;
	}

	return false;
};

ZmMimePart.prototype._loadFromDom =
function(node, ctxt) {
	
	this._loadProps(node);
	
	if (node.content) {
		this._loaded = true;
	}
	
	if (ctxt.contentTypes) {
		ctxt.contentTypes[node.ct] = true;
	}

	var isAtt = false;
	if (this.contentDisposition == "attachment" || 
		this.contentType == ZmMimeTable.MSG_RFC822 || this.contentType == ZmMimeTable.TEXT_CAL ||            
		this.fileName || this.contentId || this.contentLocation) {

		if (!this.isIgnoredPart()) {
			if (ctxt.attachments) {
				ctxt.attachments.push(this);
			}
			isAtt = true;
		}
	}

	if (this.isBody) {
		var hasContent = AjxUtil.isSpecified(node.content);
		if ((ZmMimeTable.isRenderableImage(this.contentType) || hasContent)) {
			if (ctxt.bodyParts) {
				if (this.contentType == ZmMimeTable.MULTI_ALT) {
					ctxt.bodyParts.push({});
				}
				else if (this.parent && this.parent.contentType == ZmMimeTable.MULTI_ALT) {
					var altPart = {};
					altPart[this.contentType] = this;
					ctxt.bodyParts.push(altPart);
				}
				else {
					ctxt.bodyParts.push(this);
				}
			}
			if (isAtt && ctxt.attachments) {
				//To avoid duplication, Remove attachment that was just added as bodypart.
				ctxt.attachments.pop();
			}
		} else if (!isAtt && this.size != 0 && !this.isIgnoredPart()){
			if (ctxt.attachments) {
				ctxt.attachments.push(this);
			}
			isAtt = true;
		}
	}

	// bug fix #4616 - dont add attachments part of a rfc822 msg part
	if (node.mp && this.contentType != ZmMimeTable.MSG_RFC822) {
		for (var i = 0; i < node.mp.length; i++) {
			this.children.add(ZmMimePart.createFromDom(node.mp[i], ctxt, this));
		}
	}
};

ZmMimePart.prototype._loadProps =
function(node) {

	this.node				= node;
	
	// the middle column is for backward compatibility
	this.contentType		= this.ct			= node.ct;
	this.name									= node.name;
	this.part									= node.part;
	this.size				= this.s			= node.s;
	this.contentDisposition	= this.cd			= node.cd;
	this.contentId			= this.ci			= node.ci;
	this.contentLocation	= this.cl			= node.cl;
	this.fileName			= this.filename		= node.filename;
	this.isTruncated		= this.truncated	= !!(node.truncated);
	this.isBody				= this.body			= !!(node.body);
};

/**
 * Checks within the given node tree for content within a multipart/alternative part that
 * we don't have, and then creates and adds a MIME part for it. Assumes that there will be
 * at most one multipart/alternative.
 * 
 * @param {object}		node			
 * @param {string}		contentType
 * @param {int}			index
 * 
 * @return {ZmMimePart}		the MIME part that was created and added
 */
ZmMimePart.prototype.addAlternativePart =
function(node, contentType, index) {

	// replace this part if we got new content
	if (node.ct == contentType && (this.parent && this.parent.contentType == ZmMimeTable.MULTI_ALT) && node.body && !this.getContent()) {
		var mimePart = new ZmMimePart(this);
		mimePart._loadProps(node);
		this.parent.children.replace(index, mimePart);
		return mimePart;
	}
	if (node.mp && node.mp.length) {
		for (var i = 0; i < node.mp.length; i++) {
			var mimePart = this.children.get(i);
			var altPart = mimePart.addAlternativePart(node.mp[i], contentType, i);
			if (altPart) {
				return altPart;
			}
		}
	}
};
