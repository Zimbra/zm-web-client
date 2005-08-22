/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmMimeTable() {
};

// IGNORE means the client will not display these attachment types to the user
ZmMimeTable.APP					= "application";
ZmMimeTable.APP_ADOBE_PDF		= "application/pdf";
ZmMimeTable.APP_ADOBE_PS		= "application/postscript";
ZmMimeTable.APP_APPLE_DOUBLE 	= "application/applefile";		// IGNORE
ZmMimeTable.APP_EXE				= "application/exe";
ZmMimeTable.APP_MS_DOWNLOAD		= "application/x-msdownload";
ZmMimeTable.APP_MS_EXCEL		= "application/vnd.ms-excel";
ZmMimeTable.APP_MS_PPT			= "application/vnd.ms-powerpoint";
ZmMimeTable.APP_MS_PROJECT		= "application/vnd.ms-project";
ZmMimeTable.APP_MS_TNEF			= "application/ms-tnef"; 		// IGNORE
ZmMimeTable.APP_MS_TNEF2 		= "application/vnd.ms-tnef"; 	// IGNORE (added per bug 2339)
ZmMimeTable.APP_MS_VISIO		= "application/vnd.visio";
ZmMimeTable.APP_MS_WORD			= "application/msword";
ZmMimeTable.APP_OCTET_STREAM	= "application/octet-stream";
ZmMimeTable.APP_ZIP				= "application/zip";
ZmMimeTable.APP_ZIP2			= "application/x-zip-compressed";
ZmMimeTable.AUDIO				= "audio";
ZmMimeTable.AUDIO_WAV			= "audio/x-wav";
ZmMimeTable.AUDIO_MP3			= "audio/mpeg";
ZmMimeTable.IMG					= "image";
ZmMimeTable.IMG_GIF				= "image/gif";
ZmMimeTable.IMG_JPEG			= "image/jpeg";
ZmMimeTable.IMG_PNG				= "image/png";
ZmMimeTable.IMG_TIFF			= "image/tiff";
ZmMimeTable.MSG_RFC822			= "message/rfc822";
ZmMimeTable.MULTI_ALT			= "multipart/alternative"; 		// IGNORE
ZmMimeTable.MULTI_MIXED			= "multipart/mixed"; 			// IGNORE
ZmMimeTable.MULTI_RELATED		= "multipart/related"; 			// IGNORE
ZmMimeTable.TEXT				= "text";
ZmMimeTable.TEXT_RTF			= "text/enriched";
ZmMimeTable.TEXT_HTML			= "text/html";
ZmMimeTable.TEXT_CAL			= "text/calendar"; 				// IGNORE
ZmMimeTable.TEXT_JAVA			= "text/x-java";
ZmMimeTable.TEXT_PLAIN			= "text/plain";
ZmMimeTable.TEXT_XML			= "text/xml";
ZmMimeTable.VIDEO				= "video";
ZmMimeTable.VIDEO_WMV			= "video/x-ms-wmv";

ZmMimeTable._table = new Object();

// only add types which are NOT ignored by the client	
ZmMimeTable._table[ZmMimeTable.APP]					= {desc: ZmMsg.unknownBinaryType, image: ZmImg.I_BINARY, imageLarge: ZmImg.IL_BINARY};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PDF]		= {desc: ZmMsg.adobePdfDocument, image: ZmImg.I_PDF, imageLarge: ZmImg.IL_PDF};
ZmMimeTable._table[ZmMimeTable.APP_ADOBE_PS]		= {desc: ZmMsg.adobePsDocument, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};
ZmMimeTable._table[ZmMimeTable.APP_EXE]				= {desc: ZmMsg.application, image: ZmImg.I_BINARY, imageLarge: ZmImg.IL_BINARY};
ZmMimeTable._table[ZmMimeTable.APP_MS_DOWNLOAD]		= {desc: ZmMsg.msDownload, image: ZmImg.I_BINARY, imageLarge: ZmImg.IL_BINARY};
ZmMimeTable._table[ZmMimeTable.APP_MS_EXCEL]		= {desc: ZmMsg.msExcelDocument, image: ZmImg.I_MS_EXCEL, imageLarge: ZmImg.IL_MS_EXCEL};
ZmMimeTable._table[ZmMimeTable.APP_MS_PPT]			= {desc: ZmMsg.msPPTDocument, image: ZmImg.I_MS_POWERPOINT, imageLarge: ZmImg.IL_MS_POWERPOINT};
ZmMimeTable._table[ZmMimeTable.APP_MS_PROJECT]		= {desc: ZmMsg.msProjectDocument, image: ZmImg.I_MS_PROJECT, imageLarge: ZmImg.IL_MS_PROJECT};
ZmMimeTable._table[ZmMimeTable.APP_MS_VISIO]		= {desc: ZmMsg.msVisioDocument, image: ZmImg.I_MS_VISIO, imageLarge: ZmImg.IL_MS_VISIO};
ZmMimeTable._table[ZmMimeTable.APP_MS_WORD]			= {desc: ZmMsg.msWordDocument, image: ZmImg.I_MS_WORD, imageLarge: ZmImg.IL_MS_WORD};
ZmMimeTable._table[ZmMimeTable.APP_OCTET_STREAM]	= {desc: ZmMsg.unknownBinaryType, image: ZmImg.I_BINARY, imageLarge: ZmImg.IL_BINARY};
ZmMimeTable._table[ZmMimeTable.APP_ZIP]				= {desc: ZmMsg.zipFile, image: ZmImg.I_ZIP, imageLarge: ZmImg.IL_ZIP};
ZmMimeTable._table[ZmMimeTable.APP_ZIP2]			= {desc: ZmMsg.zipFile, image: ZmImg.I_ZIP, imageLarge: ZmImg.IL_ZIP};
ZmMimeTable._table[ZmMimeTable.AUDIO]				= {desc: ZmMsg.audio, image: ZmImg.I_AUDIO, imageLarge: ZmImg.IL_AUDIO};
ZmMimeTable._table[ZmMimeTable.AUDIO_WAV]			= {desc: ZmMsg.waveAudio, image: ZmImg.I_AUDIO, imageLarge: ZmImg.IL_AUDIO};
ZmMimeTable._table[ZmMimeTable.AUDIO_MP3]			= {desc: ZmMsg.mp3Audio, image: ZmImg.I_AUDIO, imageLarge: ZmImg.IL_AUDIO};
ZmMimeTable._table[ZmMimeTable.VIDEO]				= {desc: ZmMsg.video, image: ZmImg.I_MS_WMV, imageLarge: ZmImg.IL_MS_WMV};
ZmMimeTable._table[ZmMimeTable.VIDEO_WMV]			= {desc: ZmMsg.msWMV, image: ZmImg.I_MS_WMV, imageLarge: ZmImg.IL_MS_WMV};
ZmMimeTable._table[ZmMimeTable.IMG]					= {desc: ZmMsg.image, image: ZmImg.I_IMAGE, imageLarge: ZmImg.IL_IMAGE};
ZmMimeTable._table[ZmMimeTable.IMG_GIF]				= {desc: ZmMsg.gifImage, image: ZmImg.I_GIF, imageLarge: ZmImg.IL_GIF};
ZmMimeTable._table[ZmMimeTable.IMG_JPEG]			= {desc: ZmMsg.jpegImage, image: ZmImg.I_JPEG, imageLarge: ZmImg.IL_JPEG};
ZmMimeTable._table[ZmMimeTable.IMG_PNG]				= {desc: ZmMsg.pngImage, image: ZmImg.I_IMAGE, imageLarge: ZmImg.IL_IMAGE};
ZmMimeTable._table[ZmMimeTable.IMG_TIFF]			= {desc: ZmMsg.tiffImage, image: ZmImg.I_IMAGE, imageLarge: ZmImg.IL_IMAGE};
ZmMimeTable._table[ZmMimeTable.MSG_RFC822]			= {desc: ZmMsg.mailMessage, image: ZmImg.I_ENVELOPE, imageLarge: ZmImg.IL_ENVELOPE};
ZmMimeTable._table[ZmMimeTable.TEXT]				= {desc: ZmMsg.textDocuments, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};
ZmMimeTable._table[ZmMimeTable.TEXT_RTF]			= {desc: ZmMsg.enrichedText, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};
ZmMimeTable._table[ZmMimeTable.TEXT_HTML]			= {desc: ZmMsg.htmlDocument, image: ZmImg.I_HTML, imageLarge: ZmImg.IL_HTML};
ZmMimeTable._table[ZmMimeTable.TEXT_JAVA]			= {desc: ZmMsg.javaSource, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};
ZmMimeTable._table[ZmMimeTable.TEXT_PLAIN]			= {desc: ZmMsg.textFile, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};
ZmMimeTable._table[ZmMimeTable.TEXT_XML]			= {desc: ZmMsg.xmlDocument, image: ZmImg.I_DOCUMENT, imageLarge: ZmImg.IL_DOCUMENT};

ZmMimeTable.getInfo =
function(type, createIfUndefined) {
	var entry = ZmMimeTable._table[type];
	if (!entry && createIfUndefined) {
		entry = ZmMimeTable._table[type] = {desc: type, image: ZmImg.I_BINARY, imageLarge: ZmImg.IL_BINARY};
	}
	if (entry) {
		if (!entry.type)
			entry.type = type;
	} else {
		// otherwise, check if main category is in table
		var baseType = type.split("/")[0];
		if (baseType)
			entry = ZmMimeTable._table[baseType];
	}
	return entry;
};

ZmMimeTable.isIgnored = 
function(type) {
	if (type == ZmMimeTable.MULTI_ALT || 
		type == ZmMimeTable.MULTI_MIXED || 
		type == ZmMimeTable.TEXT_CAL || 
		type == ZmMimeTable.MULTI_RELATED || 
		type == ZmMimeTable.APP_MS_TNEF ||
		type == ZmMimeTable.APP_MS_TNEF2 || 
		type == ZmMimeTable.APP_APPLE_DOUBLE)
	{
		return true;
	}
	return false;
};
