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

		msg:            null,       // msg being displayed
		usingIframe:    false       // true if msg content is within an IFRAME
	},

	statics: {
		externalImagesShown:    {}  // lookup hash of IDs of msgs whose external images user has loaded
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

		var me = this,
			html = msg.getContentAsHtml(),
			iframe = this.iframe;

		if (!isLast) {
			html = ZCS.quoted.getOriginalContent(html, false);
		}

		// TODO: images and info bar
		// TODO: invites
		// TODO: truncation

		this.setMsg(msg);
		this.setUsingIframe(msg.hasHtmlPart());

		if (this.getUsingIframe()) {
			Ext.Logger.conv('Use IFRAME for [' + msg.get('fragment') + ']');
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					name: 'ZCSIframe-' + this.up('msgview').getId()
				});

				iframe.on('msgContentResize', function () {
					me.fireEvent('msgContentResize');
				}, this);

				this.add(iframe);
			}
			this.setHtml('');
			iframe.setContent(html);

			if (this.infoBar) {
				this.infoBar.hide();
			}
			// We hide external images if user wants us to, or this is Spam, and the user hasn't
			// already pressed the button to display them.
			var parsedId = ZCS.util.parseId(msg.get('folderId')),
				isSpam = (parsedId && parsedId.localId === ZCS.constant.ID_JUNK),
				imagesShown = ZCS.view.mail.ZtMsgBody.externalImagesShown[msg.getId()],
				showExternalImages = ZCS.session.getSetting(ZCS.constant.SETTING_DISPLAY_IMAGES),
				hideExternalImages = (!showExternalImages || isSpam) && !imagesShown;

			this.hiddenImages = this.fixImages(msg, iframe.getBody(), hideExternalImages);
			if (this.hiddenImages.length > 0) {
				this.showInfoBar();
			}

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

	/**
	 * Goes through the message DOM looking for images to fix, including those that are used
	 * as background images (usually in BODY or TD). Internal images will get their URLs set
	 * to grab a part from the server. External images will be hidden or shown based on a user
	 * setting.
	 *
	 * @param {ZtMailMsg}       msg                     msg being displayed
	 * @param {Element}         containerEl             top-level element of DOM
	 * @param {boolean}         hideExternalImages      if true, hide external images
	 *
	 * @return {Boolean}    true if any external images were hidden
	 */
	fixImages: function(msg, containerEl, hideExternalImages) {

		var	els = containerEl.getElementsByTagName('*'),
			ln = els.length,
			html = containerEl.innerHTML,
			checkBackground = (html.indexOf('dfbackground') !== -1) ||
			                  (html.indexOf('pnbackground') !== -1),
			hiddenImages = [],
			onloadHandler;

/*
		if (this.getUsingIframe()) {
			// TODO: would be smarter to only resize once, when all images have loaded
			// TODO: maybe skip onload if img has height and width
			// TODO: for background image, maybe use timer since they don't have onload event
			onloadHandler = function() {
				me.iframe.resizeToContent();
				this.onload = null; // scope is an <img> - clear its onload handler
			};
		}
*/

		for (var i = 0; i < ln; i++) {

			var el = els[i],
				nodeName = el.nodeName.toLowerCase(),
				isImg = (nodeName === 'img');

			if ((isImg && this.fixImage(msg, el, 'src', hideExternalImages)) ||
				(checkBackground && this.fixImage(msg, el, 'background', hideExternalImages))) {

				hiddenImages.push(el);
			}
		}

		return hiddenImages;
	},

	/**
	 * Rewrites the src reference for internal images so that they display, and optionally
	 * does the same for external images. Internal images will have 'cid', 'doc', and 'pnsrc'
	 * converted to a URL with a part value that can be used to fetch the image from our
	 * server. The part value is taken from the message's MIME parts.
	 *
	 * @param {ZmMailMsg}	msg			        mail message
	 * @param {Element}		el		            element to be checked (img)
	 * @param {string}		attr		        attribute name
	 * @param {boolean}     hideExternalImages  if true, replace external image with placeholder
	 *
	 * @return	true if the image is external and was replaced
	 */
	fixImage: function(msg, el, attr, hideExternalImages) {

		var dfAttr = 'df' + attr,
			pnAttr = 'pn' + attr,
			baseValue, dfValue, pnValue, value;

		try {
			baseValue = el.getAttribute(attr);
			dfValue = el.getAttribute(dfAttr);
			pnValue = el.getAttribute(pnAttr);
		}
		catch(e) {
			Ext.Logger.warn('ZtMsgBody.restoreImages: exception accessing base attribute ' + attr + ' in ' + el.nodeName);
		}

		value = baseValue || dfValue || pnValue;

		if (value) {
			if (value.indexOf('cid:') === 0) {
				// image came as a related part keyed by Content-ID
				var cid = '<' + decodeURIComponent(value.substr(4)) + '>';
				value = msg.getPartUrl('contentId', cid);
				if (value) {
					el.setAttribute(attr, value);
				}
			}
			else if (value.indexOf('doc:') === 0) {
				// image is in Briefcase
				value = [ZCS.session.getSetting(ZCS.constant.SETTING_REST_URL), '/', value.substring(4)].join('');
				if (value) {
					el.setAttribute(attr, value);
				}
			}
			else if (pnValue) {
				// image came as a related part keyed by Content-Location
				value = msg.getPartUrl('contentLocation', value);
				if (value) {
					el.setAttribute(attr, value);
				}
			}
			else if (dfValue) {
				if (hideExternalImages) {
					if (attr === 'src') {
						el.src = '/img/zimbra/1x1-trans.png';
					}
					return true;
				}
				else {
					el.src = dfValue;
				}
			}
			else if (value.indexOf('data:') === 0) {
			}
		}
		return false;
	},

	/**
	 * Shows a section below the msg header that allows the user to press a button to load
	 * external images.
	 */
	showInfoBar: function() {

		if (!this.infoBar) {
			this.infoBar = Ext.create('Ext.Container', {
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'center'
				},
				height: 80,
				cls: 'zcs-info-bar',
				items: [
					{
						flex: 1,
						html: ZtMsg.imagesNotLoaded
					},
					{
						xtype: 'button',
						flex: 1,
						text: ZtMsg.loadImages,
						handler: function() {
							Ext.Logger.info('load images');
							this.up('msgbody').showExternalImages();
						}
					}
				]
			});
			this.insert(0, this.infoBar);
		}
		else {
			this.infoBar.show();
		}
	},

	/**
	 * Shows external images (including background images) by changing the "defanged" attribute
	 * into the real one.
	 */
	showExternalImages: function() {

		Ext.each(this.hiddenImages, function(el) {
			var attr = (el.nodeName.toLowerCase() === 'img') ? 'src' : 'background';
			el.setAttribute(attr, el.getAttribute('df' + attr));
		}, this);
		var msgId = this.getMsg().getId();
		ZCS.view.mail.ZtMsgBody.externalImagesShown[msgId] = true;
		this.infoBar.hide();
	}
});
