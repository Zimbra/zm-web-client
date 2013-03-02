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
		externalImagesShown:    {},     // lookup hash of IDs of msgs whose external images user has loaded
		numImgsToLoad:          0,      // number of images whose 'src' has been set so they load
		numImgsLoaded:          0,      // number of images whose 'onload' handlers have fired

		/**
		 * Resizes the IFRAME after all of the fixed images have loaded. The alternative is to resize
		 * the IFRAME after each image loads, but that could be a lot of resizing. This approach should
		 * be much more efficient, with the risk that a single slow-loading or failing image could
		 * prevent the resize.
		 *
		 * Only IMG elements are handled this way. For background images, we set a timer to do the
		 * resize, since there is no 'onload' event fired when a background image has loaded. (One way
		 * to get around that is by 'image preloading', but I don't think it's worth it.)
		 *
		 * @param {ZtMsgBody}   me      the msg body object
		 * @param {Element}     img     the IMG whose onload handler was invoked
		 *
		 * @private
		 */
		imgOnloadHandler: function(me, img) {

			ZCS.view.mail.ZtMsgBody.numImgsLoaded += 1;
			var toLoad = ZCS.view.mail.ZtMsgBody.numImgsToLoad,
				loaded = ZCS.view.mail.ZtMsgBody.numImgsLoaded;

			Ext.Logger.image('Img onload handler: ' + loaded + ' / ' + toLoad);
			if (toLoad > 0 && loaded === toLoad) {
				Ext.Logger.image('Img onload handler: resize iframe');
				me.iframe.resizeToContent();
			}
			img.onload = null;
		}
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
				isTrusted = msg.hasTrustedSender(),
				imagesShown = ZCS.view.mail.ZtMsgBody.externalImagesShown[msg.getId()],
				showExternalImages = ZCS.session.getSetting(ZCS.constant.SETTING_DISPLAY_IMAGES),
				hideExternalImages = (!showExternalImages || isSpam) && !isTrusted && !imagesShown;

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
			onloadHandler,
			fixedBackground = false;

		if (this.getUsingIframe()) {
			ZCS.view.mail.ZtMsgBody.numImgsToLoad = 0;
			ZCS.view.mail.ZtMsgBody.numImgsLoaded = 0;
			onloadHandler = ZCS.view.mail.ZtMsgBody.imgOnloadHandler;
		}

		for (var i = 0; i < ln; i++) {

			var el = els[i],
				nodeName = el.nodeName.toLowerCase(),
				isImg = (nodeName === 'img');

			if ((isImg && this.fixImage(msg, el, 'src', hideExternalImages, onloadHandler)) ||
				(checkBackground && this.fixImage(msg, el, 'background', hideExternalImages))) {

				hiddenImages.push(el);
				if (!isImg) {
					fixedBackground = true;
				}
			}
		}

		if (fixedBackground) {
			Ext.Logger.image('Background handled, resize on timer');
			Ext.defer(this.iframe.resizeToContent, 500, this.iframe);
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
	fixImage: function(msg, el, attr, hideExternalImages, onloadHandler) {

		var dfAttr = 'df' + attr,
			pnAttr = 'pn' + attr,
			baseValue, dfValue, pnValue, value,
			imgChanged = false,
			me = this;

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
					imgChanged = true;
				}
			}
			else if (value.indexOf('doc:') === 0) {
				// image is in Briefcase
				value = [ZCS.session.getSetting(ZCS.constant.SETTING_REST_URL), '/', value.substring(4)].join('');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (pnValue) {
				// image came as a related part keyed by Content-Location
				value = msg.getPartUrl('contentLocation', value);
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
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
					imgChanged = true;
				}
			}
			else if (value.indexOf('data:') === 0) {
			}
		}

		if (imgChanged && onloadHandler) {
			el.onload = onloadHandler.bind(null, me, el);
			ZCS.view.mail.ZtMsgBody.numImgsToLoad += 1;
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

		var onloadHandler = ZCS.view.mail.ZtMsgBody.imgOnloadHandler,
			fixedBackground = false,
			me = this;

		ZCS.view.mail.ZtMsgBody.numImgsToLoad = 0;
		ZCS.view.mail.ZtMsgBody.numImgsLoaded = 0;

		Ext.each(this.hiddenImages, function(el) {
			var isImg = (el.nodeName.toLowerCase() === 'img'),
				attr = isImg ? 'src' : 'background';

			el.setAttribute(attr, el.getAttribute('df' + attr));
			if (isImg) {
				ZCS.view.mail.ZtMsgBody.numImgsToLoad += 1;
				el.onload = onloadHandler.bind(null, me, el);
			}
			else {
				fixedBackground = true;
			}
		}, this);

		if (fixedBackground) {
			Ext.Logger.image('External background loaded, resize on timer');
			Ext.defer(this.iframe.resizeToContent, 500, this.iframe);
		}

		var msgId = this.getMsg().getId();
		ZCS.view.mail.ZtMsgBody.externalImagesShown[msgId] = true;
		this.infoBar.hide();
	}
});
