/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Static class for handling MIME types.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts ZmMimeTable
 */
Ext.define('ZCS.common.mail.ZtMimeTable', {
	
	singleton: true,

	alternateClassName: 'ZCS.mime',

	getType: function(type) {
		return (type.split('/'))[0];
	},

	getSubType: function(type) {
		return (type.split('/'))[1];
	},

	/**
	 * Returns true if the type is a renderable image.
	 *
	 * @param	{string}	type		content type
	 * @return	{boolean}	true if the type is a renderable image
	 */
	isRenderableImage: function(type) {
		return ZCS.mime.IS_RENDERABLE_IMAGE[type];
	},

	/**
	 * Returns true if the type is a text type other than text/plain or text/html.
	 *
	 * @param	{string}	type		content type
	 * @return {Boolean}    true if the type is a text type
	 */
	isTextType: function(type) {
		return (ZCS.mime.getType(type) === ZCS.mime.TEXT && type !== ZCS.mime.TEXT_HTML && type !== ZCS.mime.TEXT_CAL);
	},

	/**
	 * Returns the name of the CSS class that can be used to show an image for the given type.
	 *
	 * @param	{string}	type		content type
	 * @return {String}     CSS class
	 */
	getIconClass: function(type) {
		var entry = ZCS.mime.table[type];
		return entry ? 'Img' + entry.image : '';
	},

	/**
	 * Returns the URL for an image for the given type.
	 *
	 * @param	{string}	type		content type
	 * @return {String}     image URL
	 */
	getIconUrl: function(type) {
		var entry = ZCS.mime.table[type];
		return entry ? ZCS.constant.IMAGE_URL_BASE + entry.image + '.png' : '';
	}
});

// MIME types (IGNORE denotes types that are not shown as attachments)
ZCS.mime.APP					= 'application';
ZCS.mime.APP_ADOBE_PDF			= 'application/pdf';
ZCS.mime.APP_ADOBE_PS			= 'application/postscript';
ZCS.mime.APP_APPLE_DOUBLE 		= 'application/applefile';		// IGNORE
ZCS.mime.APP_EXE				= 'application/exe';
ZCS.mime.APP_MS_DOWNLOAD		= 'application/x-msdownload';
ZCS.mime.APP_MS_EXCEL			= 'application/vnd.ms-excel';
ZCS.mime.APP_MS_PPT				= 'application/vnd.ms-powerpoint';
ZCS.mime.APP_MS_PROJECT			= 'application/vnd.ms-project';
ZCS.mime.APP_MS_TNEF			= 'application/ms-tnef'; 		// IGNORE
ZCS.mime.APP_MS_TNEF2 			= 'application/vnd.ms-tnef'; 	// IGNORE (added per bug 2339)
ZCS.mime.APP_SIGNATURE          = 'application/pkcs7-signature'; // IGNORE (added per bug 69476)
ZCS.mime.APP_MS_VISIO			= 'application/vnd.visio';
ZCS.mime.APP_MS_WORD			= 'application/msword';
ZCS.mime.APP_OCTET_STREAM		= 'application/octet-stream';
ZCS.mime.APP_OPENXML_DOC		= 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
ZCS.mime.APP_OPENXML_EXCEL		= 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
ZCS.mime.APP_OPENXML_PPT		= 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
ZCS.mime.APP_XML     			= 'application/xml';
ZCS.mime.APP_ZIMBRA_DOC			= 'application/x-zimbra-doc';
ZCS.mime.APP_ZIMBRA_SLIDES		= 'application/x-zimbra-slides';
ZCS.mime.APP_ZIMBRA_SPREADSHEET	= 'application/x-zimbra-xls';
ZCS.mime.APP_ZIP				= 'application/zip';
ZCS.mime.APP_ZIP2				= 'application/x-zip-compressed';

ZCS.mime.AUDIO					= 'audio';
ZCS.mime.AUDIO_WAV				= 'audio/x-wav';
ZCS.mime.AUDIO_MP3				= 'audio/mpeg';

ZCS.mime.IMG					= 'image';
ZCS.mime.IMG_GIF				= 'image/gif';
ZCS.mime.IMG_BMP				= 'image/bmp';
ZCS.mime.IMG_JPEG				= 'image/jpeg';
ZCS.mime.IMG_PJPEG				= 'image/pjpeg';				// bug 23607
ZCS.mime.IMG_PNG				= 'image/png';
ZCS.mime.IMG_TIFF				= 'image/tiff';

ZCS.mime.MSG_RFC822				= 'message/rfc822';
ZCS.mime.MSG_READ_RECEIPT		= 'message/disposition-notification';

ZCS.mime.MULTI_ALT				= 'multipart/alternative'; 		// IGNORE
ZCS.mime.MULTI_MIXED			= 'multipart/mixed'; 			// IGNORE
ZCS.mime.MULTI_RELATED			= 'multipart/related'; 			// IGNORE
ZCS.mime.MULTI_APPLE_DBL 		= 'multipart/appledouble'; 		// IGNORE
ZCS.mime.MULTI_DIGEST			= 'multipart/digest';			// IGNORE

ZCS.mime.TEXT					= 'text';
ZCS.mime.TEXT_RTF				= 'text/enriched';
ZCS.mime.TEXT_HTML				= 'text/html';
ZCS.mime.TEXT_CAL				= 'text/calendar'; 				// IGNORE
ZCS.mime.TEXT_JAVA				= 'text/x-java';
ZCS.mime.TEXT_VCARD				= 'text/x-vcard';
ZCS.mime.TEXT_DIRECTORY  	    = 'text/directory';
ZCS.mime.TEXT_PLAIN				= 'text/plain';
ZCS.mime.TEXT_XML				= 'text/xml';

ZCS.mime.VIDEO					= 'video';
ZCS.mime.VIDEO_WMV				= 'video/x-ms-wmv';

ZCS.mime.XML_ZIMBRA_SHARE		= 'xml/x-zimbra-share';

// Content dispositions
ZCS.mime.DISP_ATTACHMENT        = 'attachment';

// Formats for text/plain
ZCS.mime.FORMAT_FLOWED			= 'flowed';

ZCS.mime.table = {};

ZCS.mime.table[ZCS.mime.APP]					= { desc: ZtMsg.mimeApplication, image: 'ExeDoc' };
ZCS.mime.table[ZCS.mime.APP_ADOBE_PDF]		    = { desc: ZtMsg.mimeAdobePdfDocument, image: 'PDFDoc' };
ZCS.mime.table[ZCS.mime.APP_ADOBE_PS]		    = { desc: ZtMsg.mimeAdobePsDocument, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.APP_EXE]				= { desc: ZtMsg.mimeApplication, image: 'ExeDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_DOWNLOAD]		= { desc: ZtMsg.mimeMsDownload, image: 'ExeDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_EXCEL]		    = { desc: ZtMsg.mimeMsExcelDocument, image: 'MSExcelDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_PPT]			    = { desc: ZtMsg.mimeMsPPTDocument, image: 'MSPowerpointDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_PROJECT]		    = { desc: ZtMsg.mimeMsProjectDocument, image: 'MSProjectDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_VISIO]		    = { desc: ZtMsg.mimeMsVisioDocument, image: 'MSVisioDoc' };
ZCS.mime.table[ZCS.mime.APP_MS_WORD]			= { desc: ZtMsg.mimeMsWordDocument, image: 'MSWordDoc' };
ZCS.mime.table[ZCS.mime.APP_OCTET_STREAM]	    = { desc: ZtMsg.mimeUnknownBinaryType, image: 'UnknownDoc' };
ZCS.mime.table[ZCS.mime.APP_OPENXML_DOC]		= { desc: ZtMsg.mimeMsWordDocument, image: 'MSWordDoc' };
ZCS.mime.table[ZCS.mime.APP_OPENXML_EXCEL]	    = { desc: ZtMsg.mimeMsExcelDocument, image: 'MSExcelDoc' };
ZCS.mime.table[ZCS.mime.APP_OPENXML_PPT]		= { desc: ZtMsg.mimeMsPPTDocument, image: 'MSPowerpointDoc' };
ZCS.mime.table[ZCS.mime.APP_XML]			    = { desc: ZtMsg.mimeXmlDocument, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_DOC]  	    = { desc: ZtMsg.mimeZimbraDocument, image: 'Doc' };
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_SLIDES]	    = { desc: ZtMsg.mimeZimbraPresentation, image: 'Presentation' };
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_SPREADSHEET] = { desc: ZtMsg.mimeZimbraSpreadsheet, image: 'ZSpreadSheet' };
ZCS.mime.table[ZCS.mime.APP_ZIP]				= { desc: ZtMsg.mimeZipFile, image: 'ZipDoc' };
ZCS.mime.table[ZCS.mime.APP_ZIP2]   			= { desc: ZtMsg.mimeZipFile, image: 'ZipDoc' };
ZCS.mime.table[ZCS.mime.AUDIO]		    		= { desc: ZtMsg.mimeAudio, image: 'AudioDoc' };
ZCS.mime.table[ZCS.mime.AUDIO_WAV]		    	= { desc: ZtMsg.mimeWaveAudio, image: 'AudioDoc' };
ZCS.mime.table[ZCS.mime.AUDIO_MP3]			    = { desc: ZtMsg.mimeMp3Audio, image: 'AudioDoc' };
ZCS.mime.table[ZCS.mime.VIDEO]				    = { desc: ZtMsg.mimeVideo, image: 'VideoDoc' };
ZCS.mime.table[ZCS.mime.VIDEO_WMV]			    = { desc: ZtMsg.mimeMsWMV, image: 'VideoDoc' };
ZCS.mime.table[ZCS.mime.IMG]					= { desc: ZtMsg.mimeImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.IMG_BMP]				= { desc: ZtMsg.mimeBmpImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.IMG_GIF]				= { desc: ZtMsg.mimeGifImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.IMG_JPEG]			    = { desc: ZtMsg.mimeJpegImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.IMG_PNG]				= { desc: ZtMsg.mimePngImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.IMG_TIFF]			    = { desc: ZtMsg.mimeTiffImage, image: 'ImageDoc' };
ZCS.mime.table[ZCS.mime.MSG_RFC822]			    = { desc: ZtMsg.mimeMailMessage, image: 'MessageDoc' };
ZCS.mime.table[ZCS.mime.TEXT]	    			= { desc: ZtMsg.mimeTextDocuments, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.TEXT_RTF]	    		= { desc: ZtMsg.mimeEnrichedText, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.TEXT_HTML]		    	= { desc: ZtMsg.mimeHtmlDocument, image: 'HtmlDoc' };
ZCS.mime.table[ZCS.mime.TEXT_JAVA]			    = { desc: ZtMsg.mimeJavaSource, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.TEXT_PLAIN]			    = { desc: ZtMsg.mimeTextFile, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.TEXT_XML]			    = { desc: ZtMsg.mimeXmlDocument, image: 'GenericDoc' };
ZCS.mime.table[ZCS.mime.TEXT_CAL]			    = { desc: ZtMsg.mimeCalendar, image: 'CalendarFolder' };

ZCS.mime.IS_RENDERABLE_IMAGE = {};
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_JPEG] = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_GIF]  = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_BMP]  = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_PNG]  = true;
