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
 * Static class for handling MIME types.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtMimeTable', {
	
	singleton: true,

	/**
	 * Checks if the type is a renderable image.
	 *
	 * @param	{constant}	type		the type
	 * @return	{Boolean}	<code>true</code> if the type is a renderable image
	 */
	isRenderableImage: function(type) {
		return (type == ZmMimeTable.IMG_JPEG ||
			type == ZmMimeTable.IMG_GIF ||
			type == ZmMimeTable.IMG_BMP ||
			type == ZmMimeTable.IMG_PNG);
	}


});

ZCS.mime = ZCS.common.ZtMimeTable;

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

ZCS.mime.table[ZCS.mime.APP]					= {desc: ZtMsg.application, image: 'ExeDoc', imageLarge: 'ExeDoc_48', query: 'application/*'};
ZCS.mime.table[ZCS.mime.APP_ADOBE_PDF]		    = {desc: ZtMsg.adobePdfDocument, image: 'PDFDoc', imageLarge: 'PDFDoc_48'};
ZCS.mime.table[ZCS.mime.APP_ADOBE_PS]		    = {desc: ZtMsg.adobePsDocument, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};
ZCS.mime.table[ZCS.mime.APP_EXE]				= {desc: ZtMsg.application, image: 'ExeDoc', imageLarge: 'ExeDoc_48'};
ZCS.mime.table[ZCS.mime.APP_MS_DOWNLOAD]		= {desc: ZtMsg.msDownload, image: 'ExeDoc', imageLarge: 'ExeDoc_48'};
ZCS.mime.table[ZCS.mime.APP_MS_EXCEL]		    = {desc: ZtMsg.msExcelDocument, image: 'MSExcelDoc', imageLarge: 'MSExcelDoc_48', query: 'excel'};
ZCS.mime.table[ZCS.mime.APP_MS_PPT]			    = {desc: ZtMsg.msPPTDocument, image: 'MSPowerpointDoc', imageLarge: 'MSPowerpointDoc_48'};
ZCS.mime.table[ZCS.mime.APP_MS_PROJECT]		    = {desc: ZtMsg.msProjectDocument, image: 'MSProjectDoc', imageLarge: 'MSProjectDoc_48'};
ZCS.mime.table[ZCS.mime.APP_MS_VISIO]		    = {desc: ZtMsg.msVisioDocument, image: 'MSVisioDoc', imageLarge: 'MSVisioDoc_48'};
ZCS.mime.table[ZCS.mime.APP_MS_WORD]			= {desc: ZtMsg.msWordDocument, image: 'MSWordDoc', imageLarge: 'MSWordDoc_48', query: 'word'};
ZCS.mime.table[ZCS.mime.APP_OCTET_STREAM]	    = {desc: ZtMsg.unknownBinaryType, image: 'UnknownDoc', imageLarge: 'UnknownDoc_48'};
ZCS.mime.table[ZCS.mime.APP_OPENXML_DOC]		= {desc: ZtMsg.msWordDocument, image: 'MSWordDoc', imageLarge: 'MSWordDoc_48'};
ZCS.mime.table[ZCS.mime.APP_OPENXML_EXCEL]	    = {desc: ZtMsg.msExcelDocument, image: 'MSExcelDoc', imageLarge: 'MSExcelDoc_48'};
ZCS.mime.table[ZCS.mime.APP_OPENXML_PPT]		= {desc: ZtMsg.msPPTDocument, image: 'MSPowerpointDoc', imageLarge: 'MSPowerpointDoc_48'};
ZCS.mime.table[ZCS.mime.APP_XML]			    = {desc: ZtMsg.xmlDocument, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_DOC]  	    = {desc: ZtMsg.zimbraDocument, image: 'Doc', imageLarge: 'Doc_48'};
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_SLIDES]	    = {desc: ZtMsg.zimbraPresentation, image: 'Presentation', imageLarge: 'Presentation_48'};
ZCS.mime.table[ZCS.mime.APP_ZIMBRA_SPREADSHEET] = {desc: ZtMsg.zimbraSpreadsheet, image: 'ZSpreadSheet', imageLarge: 'ZSpreadSheet_48' };
ZCS.mime.table[ZCS.mime.APP_ZIP]				= {desc: ZtMsg.zipFile, image: 'ZipDoc', imageLarge: 'ZipDoc_48'};
ZCS.mime.table[ZCS.mime.APP_ZIP2]   			= {desc: ZtMsg.zipFile, image: 'ZipDoc', imageLarge: 'ZipDoc_48'};
ZCS.mime.table[ZCS.mime.AUDIO]		    		= {desc: ZtMsg.audio, image: 'AudioDoc', imageLarge: 'Doc_48'};
ZCS.mime.table[ZCS.mime.AUDIO_WAV]		    	= {desc: ZtMsg.waveAudio, image: 'AudioDoc', imageLarge: 'AudioDoc_48'};
ZCS.mime.table[ZCS.mime.AUDIO_MP3]			    = {desc: ZtMsg.mp3Audio, image: 'AudioDoc', imageLarge: 'AudioDoc_48'};
ZCS.mime.table[ZCS.mime.VIDEO]				    = {desc: ZtMsg.video, image: 'VideoDoc', imageLarge: 'VideoDoc_48'};
ZCS.mime.table[ZCS.mime.VIDEO_WMV]			    = {desc: ZtMsg.msWMV, image: 'VideoDoc', imageLarge: 'VideoDoc_48'};
ZCS.mime.table[ZCS.mime.IMG]					= {desc: ZtMsg.image, image: 'ImageDoc', imageLarge: 'ImageDoc_48', query: 'image/*'};
ZCS.mime.table[ZCS.mime.IMG_BMP]				= {desc: ZtMsg.bmpImage, image: 'ImageDoc', imageLarge: 'ImageDoc_48', query: 'bmp'};
ZCS.mime.table[ZCS.mime.IMG_GIF]				= {desc: ZtMsg.gifImage, image: 'ImageDoc', imageLarge: 'ImageDoc_48', query: 'gif'};
ZCS.mime.table[ZCS.mime.IMG_JPEG]			    = {desc: ZtMsg.jpegImage, image: 'ImageDoc', imageLarge: 'ImageDoc_48', query: 'jpeg'};
ZCS.mime.table[ZCS.mime.IMG_PNG]				= {desc: ZtMsg.pngImage, image: 'ImageDoc', imageLarge: 'ImageDoc_48', query: 'png'};
ZCS.mime.table[ZCS.mime.IMG_TIFF]			    = {desc: ZtMsg.tiffImage, image: 'ImageDoc', imageLarge: 'ImageDoc_48'};
ZCS.mime.table[ZCS.mime.MSG_RFC822]			    = {desc: ZtMsg.mailMessage, image: 'MessageDoc', imageLarge: 'MessageDoc_48'};
ZCS.mime.table[ZCS.mime.TEXT]	    			= {desc: ZtMsg.textDocuments, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};
ZCS.mime.table[ZCS.mime.TEXT_RTF]	    		= {desc: ZtMsg.enrichedText, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};
ZCS.mime.table[ZCS.mime.TEXT_HTML]		    	= {desc: ZtMsg.htmlDocument, image: 'HtmlDoc', imageLarge: 'HtmlDoc_48'};
ZCS.mime.table[ZCS.mime.TEXT_JAVA]			    = {desc: ZtMsg.javaSource, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};
ZCS.mime.table[ZCS.mime.TEXT_PLAIN]			    = {desc: ZtMsg.textFile, image: 'GenericDoc', imageLarge: 'GenericDoc_48', query: 'text'};
ZCS.mime.table[ZCS.mime.TEXT_XML]			    = {desc: ZtMsg.xmlDocument, image: 'GenericDoc', imageLarge: 'GenericDoc_48'};

ZCS.mime.IS_RENDERABLE_IMAGE = {};
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_JPEG] = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_GIF]  = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_BMP]  = true;
ZCS.mime.IS_RENDERABLE_IMAGE[ZCS.mime.IMG_PNG]  = true;
