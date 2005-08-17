function LmMimeTable() {
};

// IGNORE means the client will not display these attachment types to the user
LmMimeTable.APP					= "application";
LmMimeTable.APP_ADOBE_PDF		= "application/pdf";
LmMimeTable.APP_ADOBE_PS		= "application/postscript";
LmMimeTable.APP_APPLE_DOUBLE 	= "application/applefile";		// IGNORE
LmMimeTable.APP_EXE				= "application/exe";
LmMimeTable.APP_MS_DOWNLOAD		= "application/x-msdownload";
LmMimeTable.APP_MS_EXCEL		= "application/vnd.ms-excel";
LmMimeTable.APP_MS_PPT			= "application/vnd.ms-powerpoint";
LmMimeTable.APP_MS_PROJECT		= "application/vnd.ms-project";
LmMimeTable.APP_MS_TNEF			= "application/ms-tnef"; 		// IGNORE
LmMimeTable.APP_MS_TNEF2 		= "application/vnd.ms-tnef"; 	// IGNORE (added per bug 2339)
LmMimeTable.APP_MS_VISIO		= "application/vnd.visio";
LmMimeTable.APP_MS_WORD			= "application/msword";
LmMimeTable.APP_OCTET_STREAM	= "application/octet-stream";
LmMimeTable.APP_ZIP				= "application/zip";
LmMimeTable.APP_ZIP2			= "application/x-zip-compressed";
LmMimeTable.AUDIO				= "audio";
LmMimeTable.AUDIO_WAV			= "audio/x-wav";
LmMimeTable.AUDIO_MP3			= "audio/mpeg";
LmMimeTable.IMG					= "image";
LmMimeTable.IMG_GIF				= "image/gif";
LmMimeTable.IMG_JPEG			= "image/jpeg";
LmMimeTable.IMG_PNG				= "image/png";
LmMimeTable.IMG_TIFF			= "image/tiff";
LmMimeTable.MSG_RFC822			= "message/rfc822";
LmMimeTable.MULTI_ALT			= "multipart/alternative"; 		// IGNORE
LmMimeTable.MULTI_MIXED			= "multipart/mixed"; 			// IGNORE
LmMimeTable.MULTI_RELATED		= "multipart/related"; 			// IGNORE
LmMimeTable.TEXT				= "text";
LmMimeTable.TEXT_RTF			= "text/enriched";
LmMimeTable.TEXT_HTML			= "text/html";
LmMimeTable.TEXT_CAL			= "text/calendar"; 				// IGNORE
LmMimeTable.TEXT_JAVA			= "text/x-java";
LmMimeTable.TEXT_PLAIN			= "text/plain";
LmMimeTable.TEXT_XML			= "text/xml";
LmMimeTable.VIDEO				= "video";
LmMimeTable.VIDEO_WMV			= "video/x-ms-wmv";

LmMimeTable._table = new Object();

// only add types which are NOT ignored by the client	
LmMimeTable._table[LmMimeTable.APP]					= {desc: LmMsg.unknownBinaryType, image: LmImg.I_BINARY, imageLarge: LmImg.IL_BINARY};
LmMimeTable._table[LmMimeTable.APP_ADOBE_PDF]		= {desc: LmMsg.adobePdfDocument, image: LmImg.I_PDF, imageLarge: LmImg.IL_PDF};
LmMimeTable._table[LmMimeTable.APP_ADOBE_PS]		= {desc: LmMsg.adobePsDocument, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};
LmMimeTable._table[LmMimeTable.APP_EXE]				= {desc: LmMsg.application, image: LmImg.I_BINARY, imageLarge: LmImg.IL_BINARY};
LmMimeTable._table[LmMimeTable.APP_MS_DOWNLOAD]		= {desc: LmMsg.msDownload, image: LmImg.I_BINARY, imageLarge: LmImg.IL_BINARY};
LmMimeTable._table[LmMimeTable.APP_MS_EXCEL]		= {desc: LmMsg.msExcelDocument, image: LmImg.I_MS_EXCEL, imageLarge: LmImg.IL_MS_EXCEL};
LmMimeTable._table[LmMimeTable.APP_MS_PPT]			= {desc: LmMsg.msPPTDocument, image: LmImg.I_MS_POWERPOINT, imageLarge: LmImg.IL_MS_POWERPOINT};
LmMimeTable._table[LmMimeTable.APP_MS_PROJECT]		= {desc: LmMsg.msProjectDocument, image: LmImg.I_MS_PROJECT, imageLarge: LmImg.IL_MS_PROJECT};
LmMimeTable._table[LmMimeTable.APP_MS_VISIO]		= {desc: LmMsg.msVisioDocument, image: LmImg.I_MS_VISIO, imageLarge: LmImg.IL_MS_VISIO};
LmMimeTable._table[LmMimeTable.APP_MS_WORD]			= {desc: LmMsg.msWordDocument, image: LmImg.I_MS_WORD, imageLarge: LmImg.IL_MS_WORD};
LmMimeTable._table[LmMimeTable.APP_OCTET_STREAM]	= {desc: LmMsg.unknownBinaryType, image: LmImg.I_BINARY, imageLarge: LmImg.IL_BINARY};
LmMimeTable._table[LmMimeTable.APP_ZIP]				= {desc: LmMsg.zipFile, image: LmImg.I_ZIP, imageLarge: LmImg.IL_ZIP};
LmMimeTable._table[LmMimeTable.APP_ZIP2]			= {desc: LmMsg.zipFile, image: LmImg.I_ZIP, imageLarge: LmImg.IL_ZIP};
LmMimeTable._table[LmMimeTable.AUDIO]				= {desc: LmMsg.audio, image: LmImg.I_AUDIO, imageLarge: LmImg.IL_AUDIO};
LmMimeTable._table[LmMimeTable.AUDIO_WAV]			= {desc: LmMsg.waveAudio, image: LmImg.I_AUDIO, imageLarge: LmImg.IL_AUDIO};
LmMimeTable._table[LmMimeTable.AUDIO_MP3]			= {desc: LmMsg.mp3Audio, image: LmImg.I_AUDIO, imageLarge: LmImg.IL_AUDIO};
LmMimeTable._table[LmMimeTable.VIDEO]				= {desc: LmMsg.video, image: LmImg.I_MS_WMV, imageLarge: LmImg.IL_MS_WMV};
LmMimeTable._table[LmMimeTable.VIDEO_WMV]			= {desc: LmMsg.msWMV, image: LmImg.I_MS_WMV, imageLarge: LmImg.IL_MS_WMV};
LmMimeTable._table[LmMimeTable.IMG]					= {desc: LmMsg.image, image: LmImg.I_IMAGE, imageLarge: LmImg.IL_IMAGE};
LmMimeTable._table[LmMimeTable.IMG_GIF]				= {desc: LmMsg.gifImage, image: LmImg.I_GIF, imageLarge: LmImg.IL_GIF};
LmMimeTable._table[LmMimeTable.IMG_JPEG]			= {desc: LmMsg.jpegImage, image: LmImg.I_JPEG, imageLarge: LmImg.IL_JPEG};
LmMimeTable._table[LmMimeTable.IMG_PNG]				= {desc: LmMsg.pngImage, image: LmImg.I_IMAGE, imageLarge: LmImg.IL_IMAGE};
LmMimeTable._table[LmMimeTable.IMG_TIFF]			= {desc: LmMsg.tiffImage, image: LmImg.I_IMAGE, imageLarge: LmImg.IL_IMAGE};
LmMimeTable._table[LmMimeTable.MSG_RFC822]			= {desc: LmMsg.mailMessage, image: LmImg.I_ENVELOPE, imageLarge: LmImg.IL_ENVELOPE};
LmMimeTable._table[LmMimeTable.TEXT]				= {desc: LmMsg.textDocuments, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};
LmMimeTable._table[LmMimeTable.TEXT_RTF]			= {desc: LmMsg.enrichedText, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};
LmMimeTable._table[LmMimeTable.TEXT_HTML]			= {desc: LmMsg.htmlDocument, image: LmImg.I_HTML, imageLarge: LmImg.IL_HTML};
LmMimeTable._table[LmMimeTable.TEXT_JAVA]			= {desc: LmMsg.javaSource, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};
LmMimeTable._table[LmMimeTable.TEXT_PLAIN]			= {desc: LmMsg.textFile, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};
LmMimeTable._table[LmMimeTable.TEXT_XML]			= {desc: LmMsg.xmlDocument, image: LmImg.I_DOCUMENT, imageLarge: LmImg.IL_DOCUMENT};

LmMimeTable.getInfo =
function(type, createIfUndefined) {
	var entry = LmMimeTable._table[type];
	if (!entry && createIfUndefined) {
		entry = LmMimeTable._table[type] = {desc: type, image: LmImg.I_BINARY, imageLarge: LmImg.IL_BINARY};
	}
	if (entry) {
		if (!entry.type)
			entry.type = type;
	} else {
		// otherwise, check if main category is in table
		var baseType = type.split("/")[0];
		if (baseType)
			entry = LmMimeTable._table[baseType];
	}
	return entry;
};

LmMimeTable.isIgnored = 
function(type) {
	if (type == LmMimeTable.MULTI_ALT || 
		type == LmMimeTable.MULTI_MIXED || 
		type == LmMimeTable.TEXT_CAL || 
		type == LmMimeTable.MULTI_RELATED || 
		type == LmMimeTable.APP_MS_TNEF ||
		type == LmMimeTable.APP_MS_TNEF2 || 
		type == LmMimeTable.APP_APPLE_DOUBLE)
	{
		return true;
	}
	return false;
};
