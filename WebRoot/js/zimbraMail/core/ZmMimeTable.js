/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the mime table information utility class.
 * 
 */

/**
 * Creates the mime table class
 * @class
 * This class represents a mime table that contains utility methods for managing mime types.
 * 
 */
ZmMimeTable = function() {
};

// IGNORE means the client will not display these attachment types to the user
ZmMimeTable.APP						= "application";
ZmMimeTable.APP_ADOBE_PDF			= "application/pdf";
ZmMimeTable.APP_ADOBE_PS			= "application/postscript";
ZmMimeTable.APP_APPLE_DOUBLE 		= "application/applefile";		// IGNORE
ZmMimeTable.APP_EXE					= "application/exe";
ZmMimeTable.APP_MS_DOWNLOAD			= "application/x-msdownload";
ZmMimeTable.APP_MS_EXCEL			= "application/vnd.ms-excel";
ZmMimeTable.APP_MS_PPT				= "application/vnd.ms-powerpoint";
ZmMimeTable.APP_MS_PROJECT			= "application/vnd.ms-project";
ZmMimeTable.APP_MS_TNEF				= "application/ms-tnef"; 		// IGNORE
ZmMimeTable.APP_MS_TNEF2 			= "application/vnd.ms-tnef"; 	// IGNORE (added per bug 2339)
ZmMimeTable.APP_SIGNATURE           = "application/pkcs7-signature"; // IGNORE (added per bug 69476)
ZmMimeTable.APP_MS_VISIO			= "application/vnd.visio";
ZmMimeTable.APP_MS_WORD				= "application/msword";
ZmMimeTable.APP_OCTET_STREAM		= "application/octet-stream";
ZmMimeTable.APP_OPENXML_DOC			= "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
ZmMimeTable.APP_OPENXML_EXCEL		= "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
ZmMimeTable.APP_OPENXML_PPT			= "application/vnd.openxmlformats-officedocument.presentationml.presentation";
ZmMimeTable.APP_XML     			= "application/xml";
ZmMimeTable.APP_ZIMBRA_DOC			= "application/x-zimbra-doc";
ZmMimeTable.APP_ZIP					= "application/zip";
ZmMimeTable.APP_ZIP2				= "application/x-zip-compressed";
ZmMimeTable.AUDIO					= "audio";
ZmMimeTable.AUDIO_WAV				= "audio/x-wav";
ZmMimeTable.AUDIO_MP3				= "audio/mpeg";
ZmMimeTable.IMG						= "image";
ZmMimeTable.IMG_GIF					= "image/gif";
ZmMimeTable.IMG_BMP					= "image/bmp";
ZmMimeTable.IMG_JPEG				= "image/jpeg";
ZmMimeTable.IMG_PJPEG				= "image/pjpeg";				// bug 23607
ZmMimeTable.IMG_PNG					= "image/png";
ZmMimeTable.IMG_TIFF				= "image/tiff";
ZmMimeTable.MSG_RFC822				= "message/rfc822";
ZmMimeTable.MSG_READ_RECEIPT		= "message/disposition-notification";
ZmMimeTable.MULTI_ALT				= "multipart/alternative"; 		// IGNORE
ZmMimeTable.MULTI_MIXED				= "multipart/mixed"; 			// IGNORE
ZmMimeTable.MULTI_RELATED			= "multipart/related"; 			// IGNORE
ZmMimeTable.MULTI_APPLE_DBL 		= "multipart/appledouble"; 		// IGNORE
ZmMimeTable.MULTI_DIGEST			= "multipart/digest";			// IGNORE
ZmMimeTable.TEXT					= "text";
ZmMimeTable.TEXT_RTF				= "text/enriched";
ZmMimeTable.TEXT_HTML				= "text/html";
ZmMimeTable.TEXT_CAL				= "text/calendar"; 				// IGNORE
ZmMimeTable.TEXT_JAVA				= "text/x-java";
ZmMimeTable.TEXT_VCARD				= "text/x-vcard";
ZmMimeTable.TEXT_DIRECTORY  	    = "text/directory";
ZmMimeTable.TEXT_PLAIN				= "text/plain";
ZmMimeTable.TEXT_XML				= "text/xml";
ZmMimeTable.TEXT_CSV				= "text/csv";
ZmMimeTable.VIDEO					= "video";
ZmMimeTable.VIDEO_WMV				= "video/x-ms-wmv";
ZmMimeTable.XML_ZIMBRA_SHARE		= "xml/x-zimbra-share";
ZmMimeTable.SWF						= "application/x-shockwave-flash";
ZmMimeTable.VCF						= "text/vcard";

// Formats for text/plain
ZmMimeTable.FORMAT_FLOWED			= "flowed";

ZmMimeTable._icons = {
	doc: "data:image/png;base64,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",
	exe: "data:image/png;base64,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",
	generic: "data:image/png;base64,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",
	image: "data:image/png;base64,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",
	audio: "data:image/png;base64,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",
	presentation: "data:image/png;base64,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",
	html: "data:image/png;base64,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",
	video: "data:image/png;base64,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",
	spreadsheet: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAAEgBckRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABOFJREFUeNpiYMABGEGEQqHrf6wSP3/+hEv8/vOH4c/v3wwsIM6xY8cY3r59C1ft4ODIwITN/D9//0KM+vL163+Q9j9//oIF//37ywAQQAw4XYXNRWAJZBdBXPgL6DKoqzZv3oyi2s7eHrur/oJcBTIKph0k8Bfsqv8MAAGEM0hwAbDdZkq6eBX9//8fjFHCFj0Y0YGjkxPDf5iT0L0OipB/f/+BQ/Lvv39ghf/+/wP7gQWmiJAN1jY2YGfB4wiXif+BNMQPYN8wAASgnIx1AARhIKqNnyUDkyz8L274TQRMTERbiIQEVOh86T16x9A7Y89JcTT0Okx/GeQ5pAp8iQ8srD/jMYwxOp31aZqUsmhd+A+cB5fmN1w+YlWRcgyf5WKtLZEWIYZVqcJhZqyORJtrQ6lT0AnpDYO2BjGqd+c0IFeTmLoEANstgGA57jyQMmCgMnjQv5uR5CxNIiA9rZKce7CVAKQCUIkBTv9I+fkfEH/58gWRjqhpMCyz/QcmAAwLsBVNuPITNgDKY6D0CbOEhdphDvYNw3/cFujo6DD8BqZz9KAwNTMDOQvhfRCGlj1gF0OcDc0PDPC8gGHBlStXMILIzc2d4fSpU0T5AJbn/0MtJSqI8NbM2MoIWG3wH62iIpQq4JEHD2NYUKBWM9Bak+H7928HGGE2P3v+fD/EkP8oXoSLQXWi0tCwh5v9H85kBpZDioqKDQABxECXnEyjsugCsLAzZAIavp9GjgeXzjQv7Ia+BSxGcpoMLCyUFUmw5iI6+wHDbgbGV69e7efn53cg13BwvQxq8aKXU0AsJCjISFEQ4TMc5hMmWhkOswAj8NErFlBlAypdQRURISAoKMhgYGhIHR9gj2wG6gURDiuQLKBRPkAvuolKpsREKKrLIWwJcXFGjEhGry4FgBEHrJAYPn38CK+DEfUGap3BzMzCwM3DjRJEWJstyMAD2N4GGX769GmCwcPPL8Cgq6eLEkQE4+Df//8k9Lf+o7QoiLIAOcmRaglNLED3AUoqIje1oBqKMFxaSpKR6Q+wqUILw+FBBLTgIC0M//XrN6JV8fTp0wZGRkZ71PYmlA3rc6G3Q5HCG71NBAIqysqOIBogQHtWs9ogEIRHMFVQNGdFqIHmKO3Vi/SYp2r6Zs0TNBffwGsDlRQES6y7VNkfdTfJJtHSuayMIvPt/Ow3sxrpoJphrOslgXHLpqZDa5Z3IcULTEteEZAmzRKYniRXYV2Tp43/AGSap3OprwppxlrQ09qTbSd697XfvwVB8KzfegePNbw9v6GHD43d8BbAoZIDkKYpfNaEbkjiOMZrnud4SHNMK0cxA0Zv2zY8LJccAPJkFgJAxg/N/KlxVVlKfyvHDBm613oIbh9CsuSTDi2SJ1UTACAkeFMBQBredMiyOdAkqExVcVwXd3GnVBU+xrsNZ6/MhABEF3e49Vyt8N8/djvpkbCMuPM5RFHUCaJSGUJkM36RJB7whBoAxBXBBQoRsCNw5UmM5/I9B5SaiRPdCJPPQgC+7+PBW9eJWRFuRs+GaUIYhsy3fD/bqWP0SO4Mk0tcdo90EVfxPE9YVQ6/fzUMA+5rAKdUld5Q4XS0LzCAoijAcRzQNO1skqXO8O4dBybX2qlElmXvlmU96rMZfwKOyPCy/Ea3odvFInyCvyA/oHKrnTBRFkEAAAAASUVORK5CYII=",
	archive: "data:image/png;base64,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"
};

ZmMimeTable._table = {};

// only add types which are NOT ignored by the client	
ZmMimeTable._table[ZmMimeTable.APP]					= {desc: ZmMsg.application, image: "ExeDoc", imageLarge: "ExeDoc_48", dataUri: ZmMimeTable._icons.exe, query: "application/*"};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PDF]		= {desc: ZmMsg.adobePdfDocument, image: "Doc", imageLarge: "Doc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PS]		= {desc: ZmMsg.adobePsDocument, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.APP_EXE]				= {desc: ZmMsg.application, image: "ExeDoc", imageLarge: "ExeDoc_48", dataUri: ZmMimeTable._icons.exe};
ZmMimeTable._table[ZmMimeTable.APP_MS_DOWNLOAD]		= {desc: ZmMsg.msDownload, image: "ExeDoc", imageLarge: "ExeDoc_48", dataUri: ZmMimeTable._icons.exe};
ZmMimeTable._table[ZmMimeTable.APP_MS_EXCEL]		= {desc: ZmMsg.msExcelDocument, image: "MSExcelDoc", imageLarge: "MSExcelDoc_48", dataUri: ZmMimeTable._icons.spreadsheet, query: "excel"};
ZmMimeTable._table[ZmMimeTable.APP_MS_PPT]			= {desc: ZmMsg.msPPTDocument, image: "MSPowerpointDoc", imageLarge: "MSPowerpointDoc_48", dataUri: ZmMimeTable._icons.presentation, query: "powerpoint"};
ZmMimeTable._table[ZmMimeTable.APP_MS_PROJECT]		= {desc: ZmMsg.msProjectDocument, image: "MSProjectDoc", imageLarge: "MSProjectDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.APP_MS_VISIO]		= {desc: ZmMsg.msVisioDocument, image: "MSVisioDoc", imageLarge: "MSVisioDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.APP_MS_WORD]			= {desc: ZmMsg.msWordDocument, image: "MSWordDoc", imageLarge: "MSWordDoc_48", dataUri: ZmMimeTable._icons.doc, query: "word"};
ZmMimeTable._table[ZmMimeTable.APP_OCTET_STREAM]	= {desc: ZmMsg.unknownBinaryType, image: "UnknownDoc", imageLarge: "UnknownDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.APP_OPENXML_DOC]		= {desc: ZmMsg.msWordDocument, image: "MSWordDoc", imageLarge: "MSWordDoc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.APP_OPENXML_EXCEL]	= {desc: ZmMsg.msExcelDocument, image: "MSExcelDoc", imageLarge: "MSExcelDoc_48", dataUri: ZmMimeTable._icons.spreadsheet};
ZmMimeTable._table[ZmMimeTable.APP_OPENXML_PPT]		= {desc: ZmMsg.msPPTDocument, image: "MSPowerpointDoc", imageLarge: "MSPowerpointDoc_48", dataUri: ZmMimeTable._icons.presentation};
ZmMimeTable._table[ZmMimeTable.APP_XML]			    = {desc: ZmMsg.xmlDocument, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.APP_ZIMBRA_DOC]  	= {desc: ZmMsg.zimbraDocument, image: "Doc", imageLarge: "Doc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.APP_ZIP]				= {desc: ZmMsg.zipFile, image: "ZipDoc", imageLarge: "ZipDoc_48", dataUri: ZmMimeTable._icons.archive};
ZmMimeTable._table[ZmMimeTable.APP_ZIP2]			= {desc: ZmMsg.zipFile, image: "ZipDoc", imageLarge: "ZipDoc_48", dataUri: ZmMimeTable._icons.archive};
ZmMimeTable._table[ZmMimeTable.AUDIO]				= {desc: ZmMsg.audio, image: "AudioDoc", imageLarge: "AudioDoc_48", dataUri: ZmMimeTable._icons.audio};
ZmMimeTable._table[ZmMimeTable.AUDIO_WAV]			= {desc: ZmMsg.waveAudio, image: "AudioDoc", imageLarge: "AudioDoc_48", dataUri: ZmMimeTable._icons.audio};
ZmMimeTable._table[ZmMimeTable.AUDIO_MP3]			= {desc: ZmMsg.mp3Audio, image: "AudioDoc", imageLarge: "AudioDoc_48", dataUri: ZmMimeTable._icons.audio};
ZmMimeTable._table[ZmMimeTable.IMG]					= {desc: ZmMsg.image, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image, query: "image/*"};
ZmMimeTable._table[ZmMimeTable.IMG_BMP]				= {desc: ZmMsg.bmpImage, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image, query: "bmp"};
ZmMimeTable._table[ZmMimeTable.IMG_GIF]				= {desc: ZmMsg.gifImage, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image, query: "gif"};
ZmMimeTable._table[ZmMimeTable.IMG_JPEG]			= {desc: ZmMsg.jpegImage, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image, query: "jpeg"};
ZmMimeTable._table[ZmMimeTable.IMG_PNG]				= {desc: ZmMsg.pngImage, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image, query: "png"};
ZmMimeTable._table[ZmMimeTable.IMG_TIFF]			= {desc: ZmMsg.tiffImage, image: "ImageDoc", imageLarge: "ImageDoc_48", dataUri: ZmMimeTable._icons.image};
ZmMimeTable._table[ZmMimeTable.MSG_RFC822]			= {desc: ZmMsg.mailMessage, image: "MessageDoc", imageLarge: "MessageDoc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.TEXT]				= {desc: ZmMsg.textDocuments, image: "Doc", imageLarge: "Doc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.TEXT_RTF]			= {desc: ZmMsg.enrichedText, image: "Doc", imageLarge: "Doc_48", dataUri: ZmMimeTable._icons.doc};
ZmMimeTable._table[ZmMimeTable.TEXT_HTML]			= {desc: ZmMsg.htmlDocument, image: "HtmlDoc", imageLarge: "HtmlDoc_48", dataUri: ZmMimeTable._icons.html};
ZmMimeTable._table[ZmMimeTable.TEXT_JAVA]			= {desc: ZmMsg.javaSource, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.TEXT_PLAIN]			= {desc: ZmMsg.textFile, image: "Doc", imageLarge: "Doc_48", dataUri: ZmMimeTable._icons.doc, query: "text"};
ZmMimeTable._table[ZmMimeTable.TEXT_XML]			= {desc: ZmMsg.xmlDocument, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.TEXT_CSV]			= {desc: ZmMsg.csvDocument, image: "MSExcelDoc", imageLarge: "MSExcelDoc_48", dataUri: ZmMimeTable._icons.spreadsheet};
ZmMimeTable._table[ZmMimeTable.VIDEO]				= {desc: ZmMsg.video, image: "VideoDoc", imageLarge: "VideoDoc_48", dataUri: ZmMimeTable._icons.video};
ZmMimeTable._table[ZmMimeTable.VIDEO_WMV]			= {desc: ZmMsg.msWMV, image: "VideoDoc", imageLarge: "VideoDoc_48", dataUri: ZmMimeTable._icons.video};
ZmMimeTable._table[ZmMimeTable.SWF]					= {desc: ZmMsg.swf, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.TEXT_DIRECTORY]		= {desc: ZmMsg.vcf, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};
ZmMimeTable._table[ZmMimeTable.VCF]					= {desc: ZmMsg.vcf, image: "GenericDoc", imageLarge: "GenericDoc_48", dataUri: ZmMimeTable._icons.generic};

ZmMimeTable.getInfo =
function(type, createIfUndefined) {
	var entry = ZmMimeTable._table[type];
	if (!entry && createIfUndefined) {
		entry = ZmMimeTable._table[type] = {desc: type, image: "UnknownDoc", imageLarge: "UnknownDoc_48", dataUri: ZmMimeTable._icons.generic};
	}
	if (entry) {
		if (!entry.type) {
			entry.type = type;
		}
	} else {
		// otherwise, check if main category is in table
		var baseType = type.split("/")[0];
		if (baseType) {
			entry = ZmMimeTable._table[baseType];
		}
	}
	return entry;
};

/**
 * Checks if the type is ignored.
 * 
 * @param	{constant}	type		the type
 * @return	{Boolean}	<code>true</code> if the type is ignored
 */
ZmMimeTable.isIgnored = 
function(type) {
	return (type == ZmMimeTable.MULTI_ALT ||
			type == ZmMimeTable.MULTI_MIXED ||
			type == ZmMimeTable.MULTI_RELATED ||
			type == ZmMimeTable.MULTI_APPLE_DBL ||
			type == ZmMimeTable.APP_MS_TNEF ||
			type == ZmMimeTable.APP_MS_TNEF2 ||
            type == ZmMimeTable.APP_SIGNATURE);
};

/**
 * Checks if the type is renderable.
 * 
 * @param	{constant}	type		the type
 * @return	{Boolean}	<code>true</code> if the type is renderable
 */
ZmMimeTable.isRenderable =
function(type, textOnly) {
	return (type === ZmMimeTable.TEXT_HTML ||
			type === ZmMimeTable.TEXT_PLAIN ||
			(!textOnly && ZmMimeTable.isRenderableImage(type)) ||
			(!textOnly && type === ZmMimeTable.APP_ADOBE_PDF));
};

ZmMimeTable.isTextType =
function(type){
    return (type.match(/^text\/.*/) &&
            type != ZmMimeTable.TEXT_HTML &&
            type != ZmMimeTable.TEXT_CAL);  
};

/**
 * Checks if the type is a renderable image.
 * 
 * @param	{constant}	type		the type
 * @return	{Boolean}	<code>true</code> if the type is a renderable image
 */
ZmMimeTable.isRenderableImage =
function(type) {
	return (type == ZmMimeTable.IMG_JPEG ||
			type == ZmMimeTable.IMG_GIF ||
			type == ZmMimeTable.IMG_BMP ||
			type == ZmMimeTable.IMG_PNG);
};

/**
 * Checks if the type has an HTML version.
 * 
 * @param	{constant}	type		the type
 * @return	{Boolean}	<code>true</code> if the type has an HTML version
 */
ZmMimeTable.hasHtmlVersion =
function(type) {
	return (!(ZmMimeTable.isIgnored(type) ||
			type.match(/^text\/plain/) ||
			type.match(/^image/) ||
			type.match(/^audio/) ||
			type.match(/^video/)));
};

ZmMimeTable.isMultiMedia =
function(type){
    return (type.match(/^audio/) ||
			type.match(/^video/));
};

ZmMimeTable.isWebDoc =
function(type) {
    return (type == ZmMimeTable.APP_ZIMBRA_DOC);
};
