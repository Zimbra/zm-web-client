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
		cls:            'zcs-msg-body',
		padding:        5,

		msg:            null,       // msg being displayed
		usingIframe:    false,      // true if msg content is within an IFRAME
		quotedLinkId:   ''          // ID for show/hide quoted text link
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
			isInvite = msg.get('isInvite'),
			trimQuotedText = !isLast && !isInvite,
			html = msg.getContentAsHtml(this.getId(), trimQuotedText),
			container = this.htmlContainer,
			iframe = this.iframe;

		// TODO: truncation

		this.setMsg(msg);
		this.setUsingIframe(msg.hasHtmlPart() && !isInvite);

		// Sencha Touch reuses list items, so hide any extra components
		if (this.attachmentsArea) {
			this.attachmentsArea.hide();
		}
		if (this.infoBar) {
			this.infoBar.hide();
			this.hiddenImages = null;
		}

		var quotedLinkId = ZCS.util.getUniqueId({
			type:   ZCS.constant.IDTYPE_QUOTED_LINK,
			msgId:  msg.getId()
		});
		this.setQuotedLinkId(quotedLinkId);
		var quotedLink = ZCS.view.mail.ZtMsgBody.quotedLinkTpl.apply({ id: quotedLinkId });
		html = ZCS.htmlutil.trimAndWrapContent(html/*, quotedLink*/);

		if (this.getUsingIframe()) {
			Ext.Logger.conv('Use IFRAME for [' + msg.get('fragment') + ']');
			if (container) {
				container.setHtml('');
				container.hide();
			}
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					name: 'ZCSIframe-' + this.up('msgview').getId(),
					css: ZCS.session.msgBodyCss
				});

				iframe.on('msgContentResize', function () {
					me.fireEvent('msgContentResize');
				}, this);

				this.add(iframe);
			}

			iframe.setContent(html);

/*
			var doc = iframe.getDoc(),
				el = doc && doc.getElementById(this.getQuotedLinkId()),
				quotedTextEl = el && new Ext.dom.Element(el);

			if (quotedTextEl) {
				quotedTextEl.on('tap', function() {
					Ext.Logger.iframe('Quoted text TAP');
				});
			}
*/

			// We hide external images if user wants us to, or this is Spam, and the user hasn't
			// already pressed the button to display them.
			var parsedId = ZCS.util.parseId(msg.get('folderId')),
				isSpam = (parsedId && parsedId.localId === ZCS.constant.ID_JUNK),
				isTrusted = msg.hasTrustedSender(),
				imagesShown = ZCS.view.mail.ZtMsgBody.externalImagesShown[msg.getId()],
				showExternalImages = ZCS.session.getSetting(ZCS.constant.SETTING_DISPLAY_IMAGES),
				hideExternalImages = (!showExternalImages || isSpam) && !isTrusted && !imagesShown;

			this.hiddenImages = this.fixImages(msg, iframe.getBody(), hideExternalImages);

			iframe.show();
		}
		else {
			Ext.Logger.conv('No IFRAME for [' + msg.get('fragment') + ']');
			if (iframe) {
				iframe.hide();
			}
			if (!container) {
				container = this.htmlContainer = Ext.create('Ext.Component', {
					cls: 'zcs-html-container'
				});
				this.add(this.htmlContainer);
			}
			container.setHtml(html);
			container.show();
		}

		var attInfo = msg.getAttachmentInfo();
		if (attInfo.length > 0) {
			this.showAttachments(attInfo);
		}

		if (this.hiddenImages && this.hiddenImages.length > 0) {
			this.showInfoBar(this.attachmentsArea ? 1 : 0);
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
	 * @return {Array}    list of hidden images
	 */
	fixImages: function(msg, containerEl, hideExternalImages) {

		if (!containerEl) {
			return [];
		}

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
				value = msg.getPartUrlByField('contentId', cid, 'foundInMsgBody');
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
				value = msg.getPartUrlByField('contentLocation', value, 'foundInMsgBody');
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
	 *
	 * @param {int}     index       index at which to insert component if creating it
	 * @private
	 */
	showInfoBar: function(index) {

		if (!this.infoBar) {
			this.infoBar = Ext.create('Ext.Container', {
				layout: {
					type: 'hbox',
					align: 'center',
					pack: 'center'
				},
				cls: 'zcs-info-bar',
				items: [
					{
						flex: 2,
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
			this.insert(index || 0, this.infoBar);
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
	},

	/**
	 * Shows a section below the msg header with a bubble for each attachment.
	 */
	showAttachments: function(attInfo) {

		var area = this.attachmentsArea;
		if (!area) {
			area = this.attachmentsArea = Ext.create('Ext.Component', {
				cls: 'zcs-attachments'
			});
			this.insert(0, this.attachmentsArea);
		}
		else {
			area.show();
		}

		var html = [],
			idx = 0,
			ln = attInfo.length, i;

		for (i = 0; i < ln; i++) {
			var attInfo = attInfo[i],
				id = ZCS.util.getUniqueId({
					type:   ZCS.constant.IDTYPE_ATTACHMENT,
					url:    attInfo.url
				});

			attInfo.id = id;
			html[idx++] = ZCS.view.mail.ZtMsgBody.attachmentTpl.apply(attInfo);
		}
		area.setHtml(html.join(''));
	}
},
	function (thisClass) {
		thisClass.attachmentTpl = Ext.create('Ext.XTemplate', ZCS.template.Attachment);
		thisClass.quotedLinkTpl = Ext.create('Ext.XTemplate', ZCS.template.QuotedLink);
	}
);
