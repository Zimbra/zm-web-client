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
 * This class displays the content of a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgBody', {

	extend: 'Ext.Container',

	requires: [
		'ZCS.common.mail.ZtQuotedContent',
		'ZCS.view.ux.ZtIframe'
	],

	xtype: 'msgbody',

	config: {
		padding: 5,
		tpl: Ext.create('Ext.XTemplate', ZCS.template.MsgBody),

		usingIframe: false
	},

	/**
	 * Renders the given msg.
	 *
	 * @param {ZtMailMsg}   msg     a mail message
	 * @param {boolean}     isLast  true if this is the last msg in the conv to be rendered,
	 *                              in which case its quoted text will not be trimmed
	 *
	 * @adapts ZmMailMsgView._renderMessageBody1
	 */
	render: function(msg, isLast) {

		Ext.Logger.conv('ZtMsgBody render into element ' + this.element.id);

		var html = msg.getContentAsHtml(),
			iframe = this.iframe;

		if (!isLast) {
			html = ZCS.quoted.getOriginalContent(html, false);
		}

		// TODO: images and info bar
		// TODO: invites
		// TODO: truncation

		this.setUsingIframe(msg.hasHtmlPart());

		if (this.getUsingIframe()) {
			Ext.Logger.conv('Use IFRAME for [' + msg.get('fragment') + ']');
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					// TODO: components are reused, should name iframe after msgview index
					name: 'ZCSIframe-' + msg.getId()
				});
				this.add(iframe);
			}
			this.setHtml('');
			iframe.setContent(html);
			this.fixImages(msg, iframe.getBody());
			iframe.show();
		}
		else {
			Ext.Logger.conv('No IFRAME for [' + msg.get('fragment') + ']');
			if (iframe) {
				iframe.hide();
			}
			this.setHtml(html);
		}
	},

	fixImages: function(msg, containerEl) {

		var images = containerEl.getElementsByTagName('img'),
			ln = images.length,
			isExternal = false,
			hasExternalImages = false,
			me = this,
			onloadHandler, i, img;

		if (this.getUsingIframe()) {
			onloadHandler = function() {
				me.iframe.resizeToContent();
				this.onload = null; // scope is an <img> - clear its onload handler
			};
		}

		for (i = 0; i < ln; i++) {
			img = images[i];
			var external = !!img.getAttribute('dfsrc');
			if (!external) {
				// inline image of some sort
				this.restoreImage(msg, img, 'src', false);
				if (onloadHandler) {
					img.onload = onloadHandler;
				}
			}
			else {
				// placeholder for img until user decides to load images
				img.src = '/t/resources/icons/1x1-trans.png';
			}
			hasExternalImages = external || hasExternalImages;
		}
		// fix all elems with "background" attribute
//		hasExternalImages = this._fixMultipartRelatedImagesRecurse(msg, this._usingIframe ? parent.body : parent) || hasExternalImages;

		// did we get them all?
		return !hasExternalImages;
	},

	/**
	 * Reverses the work of the (server-side) defanger, so that images are displayed.
	 *
	 * @param {ZmMailMsg}	msg			mail message
	 * @param {Element}		elem		element to be checked (img)
	 * @param {string}		aname		attribute name
	 * @param {boolean}		external	if true, look only for external images
	 *
	 * @return	true if the image is external
	 */
	restoreImage: function(msg, elem, aname, external) {

		var avalue, pnsrc;
		try {
			if (external) {
				avalue = elem.getAttribute('df' + aname);
			}
			else {
				pnsrc = avalue = elem.getAttribute('pn' + aname);
				avalue = avalue || elem.getAttribute(aname);
			}
		}
		catch(e) {
			Ext.Logger.warn('ZtMsgBody.restoreImages: exception accessing attribute ' + aname + ' in ' + elem.nodeName);
		}

		if (avalue) {
			if (avalue.indexOf('cid:') === 0) {
				// image came as a related part keyed by Content-ID
				var cid = '<' + decodeURIComponent(avalue.substr(4)) + '>';
				avalue = msg.getPartUrl('contentId', cid);
				if (avalue) {
					elem.setAttribute(aname, avalue);
				}
				return false;
			} else if (avalue.indexOf('doc:') === 0) {
				// image is in Briefcase
				avalue = [ZCS.session.getSetting(ZCS.constant.SETTING_REST_URL), '/', avalue.substring(4)].join('');
				if (avalue) {
					elem.setAttribute(aname, avalue);
					return false;
				}
			} else if (pnsrc) {
				// image came as a related part keyed by Content-Location
				avalue = msg.getPartUrl('contentLocation', avalue);
				if (avalue) {
					elem.setAttribute(aname, avalue);
					return false;
				}
			} else if (avalue.indexOf('data:') === 0) {
				return false;
			}
			return true;	// not recognized as inline img
		}
		return false;
	}
});
