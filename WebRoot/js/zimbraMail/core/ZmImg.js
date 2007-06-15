/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmImg = function() {
}

// Data for images = filename, width, height]

// Miscellaneous images
ZmImg.M_BANNER 			= ["AppBanner", 200, 38];			// COULDN'T FIND
ZmImg.M_DND_MULTI_NO  	= ["DndMultiNo_48", 52, 52];		// ---
ZmImg.M_DND_MULTI_YES  	= ["DndMultiYes_48", 52, 52];		// ---

ZmImg.I_TMP  			= ["ImgTMPIcon", 100, 100];

// Icons
ZmImg.I_APPT 			= ["CalendarApp", 16, 16];			// ---
ZmImg.I_APPT_EXCEPTION  = ["ApptException", 16, 13];		// ---
ZmImg.I_APPT_MEETING  	= ["ApptMeeting", 16, 13];			//
ZmImg.I_APPT_RECUR 		= ["ApptRecur", 16, 13];			// ---
ZmImg.I_APPT_REMINDER 	= ["ApptReminder", 16, 13];			// ---
ZmImg.I_ATTACHMENT 		= ["Attachment", 16, 16];			// ---
ZmImg.I_AUDIO  			= ["AudioDoc", 16, 16];				// ---
ZmImg.I_BACK_ARROW 		= ["LeftArrow", 16, 16];			// ---
ZmImg.I_BINARY 			= ["UnknownDoc", 16, 16];			// ---
ZmImg.I_BLANK 			= [null, 16, 16];					// SWITCHED to Blank_16
ZmImg.I_BMP 			= ["BmpDoc", 16, 16];				// UNUSED
ZmImg.I_BOLD_TEXT 		= ["Bold", 16, 16];				// ---
ZmImg.I_BROWSE 			= ["SearchBuilder", 16, 16];		// ---
ZmImg.I_BULLETED_LIST 	= ["BulletedList", 16, 16];			// ---
ZmImg.I_CENTER_JUSTIFY 	= ["CenterJustify", 16, 16];		// ---
ZmImg.I_CONTACT 		= ["ContactsApp", 16, 16];			// ---
ZmImg.I_CONTACT_PICKER 	= ["ContactsPicker", 16, 16];		// ---
ZmImg.I_CONV 			= ["Conversation", 16, 16];			// ---
ZmImg.I_COPY 			= ["Copy", 16, 16];					// UNUSED
ZmImg.I_CRITICAL 		= ["Critical_32", 32, 32];			// USING DWT IMAGE
ZmImg.I_DATE 			= ["Date", 16, 16];					// ---
ZmImg.I_DAY_VIEW 		= ["DayView", 16, 16];				// ---
ZmImg.I_DBL_BACK_ARROW  = ["LeftDoubleArrow", 16, 16];		// --- 
ZmImg.I_DBL_FORW_ARROW  = ["RightDoubleArrow", 16, 16];		// ---
ZmImg.I_DELETE 			= ["Delete", 16, 16];				// ---
ZmImg.I_DELETE_CONV 	= ["DeleteConversation", 16, 16];	// ---
ZmImg.I_DELETE_TAG 		= ["DeleteTag", 16, 16];			// ---
ZmImg.I_DETACH 			= ["OpenInNewWindow", 16, 16];		// ---
ZmImg.I_DOCUMENT 		= ["GenericDoc", 16, 16];			// ---
ZmImg.I_DOMAIN 			= ["Domain", 16, 16];				// UNUSED -- ADMIN IS USED INSTEAD
ZmImg.I_DOOR 			= ["Door", 16, 16];					// UNUSED
ZmImg.I_DOWN_ARROW 		= ["DownArrow", 16, 16];			// ---
ZmImg.I_DRAFT_FOLDER 	= ["DraftFolder", 16, 16];			// ---  ADD "SaveDraft"?
ZmImg.I_DRAFT_MSG 		= ["DraftMsg", 16, 16];				// ---  
ZmImg.I_ENVELOPE 		= ["Envelope", 16, 16];				// UNUSED
ZmImg.I_MESSAGE 		= ["MessageDoc", 16, 16];			// ---
ZmImg.I_FLAG_ON 		= ["FlagRed", 16, 16];				// ---
ZmImg.I_FLAG_OFF 		= ["FlagRedDis", 16, 16];			// ---
ZmImg.I_FOLDER 			= ["Folder", 16, 16];				// ---
ZmImg.I_FONT_BACKGROUND = ["FontBackground", 16, 16];		// --- 
ZmImg.I_FONT_COLOR 		= ["FontColor", 16, 16];			// ---
ZmImg.I_FORMAT 			= ["Format", 16, 16];				// ---
ZmImg.I_FORWARD 		= ["Forward", 20, 16];				// ---
ZmImg.I_FORWARD_ARROW 	= ["RightArrow", 16, 16];			// ---
ZmImg.I_FORWARD_STATUS 	= ["MsgStatusForward", 20, 16];		// ---
ZmImg.I_FULL_JUSTIFY 	= ["FullJustify", 16, 16];			// ---
ZmImg.I_GAL 			= ["GAL", 16, 16];					// --
ZmImg.I_GIF 			= ["GifDoc", 15, 16];				// UNUSED (using ImageDoc)
ZmImg.I_GLOBE 			= ["Globe", 16, 16];				// UNUSED
ZmImg.I_CHECK 			= ["Check", 16, 16];				// ---
ZmImg.I_HELP 			= ["Help", 16, 16];					// ---
ZmImg.I_HORIZ_RULE 		= ["HorizRule", 16, 16];			// ---
ZmImg.I_HTML 			= ["HtmlDoc", 16, 16];				// ---
ZmImg.I_ICON 			= ["Icon", 16, 16];					// UNUSED?
ZmImg.I_IM 				= ["ImStartChat", 11, 15];			// (using a different chat icon)
ZmImg.I_IMAGE 			= ["ImageDoc", 16, 16];				// ---
ZmImg.I_INDENT 			= ["Indent", 16, 16];				// ---
ZmImg.I_INSERT_TABLE 	= ["InsertTable", 16, 16];			// UNUSED
ZmImg.I_ITALIC_TEXT 	= ["Italics", 16, 16];				// ---
ZmImg.I_JPEG 			= ["JpegDoc", 16, 16];				// ---
ZmImg.I_LEFT_JUSTIFY 	= ["LeftJustify", 16, 16];			// ---
ZmImg.I_LIST 			= ["ListView", 16, 16];				// ---
ZmImg.I_LOGOFF 			= ["Logoff", 16, 16];				// ---
ZmImg.I_MAIL 			= ["MailApp", 16, 16];				// ---
ZmImg.I_INBOX		 	= ["Inbox", 16, 16];				// NEW
ZmImg.I_MAIL_FOLDER 	= ["MailFolder", 16, 16];			// ---
ZmImg.I_MAIL_MSG 		= ["NewMessage", 16, 16];			// ---
ZmImg.I_MAIL_READ 		= ["MsgStatusRead", 20, 16];		// ---
ZmImg.I_MAIL_RULE 		= ["MailRule", 16, 16];				// UNUSED
ZmImg.I_MAIL_SENT 		= ["MsgStatusSent", 20, 16];		// ---
ZmImg.I_MAIL_STATUS 	= ["MsgStatus", 16, 16];			// ---
ZmImg.I_MAIL_UNREAD 	= ["MsgStatusUnread", 20, 16];		// ---
ZmImg.I_MEETING_REQUEST = ["MeetingRequest", 16, 16];		// UNUSED
ZmImg.I_MINI_TAG 		= ["MiniTag", 16, 16];				// ---
ZmImg.I_MINI_TAG_BLUE 	= ["MiniTagBlue", 16, 16];			// ---
ZmImg.I_MINI_TAG_CYAN 	= ["MiniTagCyan", 16, 16];			// ---
ZmImg.I_MINI_TAG_GREEN 	= ["MiniTagGreen", 16, 16];			// ---
ZmImg.I_MINI_TAG_ORANGE = ["MiniTagOrange", 16, 16];		// ---
ZmImg.I_MINI_TAG_PINK 	= ["MiniTagPink", 16, 16];			// ---
ZmImg.I_MINI_TAG_PURPLE = ["MiniTagPurple", 16, 16];		// ---
ZmImg.I_MINI_TAG_RED 	= ["MiniTagRed", 16, 16];			// ---
ZmImg.I_MINI_TAG_STACK 	= ["MiniTagStack", 16, 16];			// ---
ZmImg.I_MINI_TAG_YELLOW = ["MiniTagYellow", 16, 16];		// ---
ZmImg.I_MINUS 			= ["Minus", 16, 16];				// ---
ZmImg.I_MONTH_VIEW 		= ["MonthView", 16, 16];			// ---
ZmImg.I_MOVE 			= ["MoveToFolder", 16, 16];			// ---
ZmImg.I_MS_EXCEL 		= ["MSExcelDoc", 16, 16];			// ---
ZmImg.I_MS_POWERPOINT 	= ["MSPowerpointDoc", 16, 16];		// ---
ZmImg.I_MS_PROJECT 		= ["MSProjectDoc", 16, 16];			// ---
ZmImg.I_MS_VISIO 		= ["MSVisioDoc", 16, 16];			// ---
ZmImg.I_MS_WMV 			= ["AudioDoc", 16, 16];				// ---
ZmImg.I_MS_WORD 		= ["MSWordDoc", 16, 16];			// ---
ZmImg.I_NEW_FOLDER 		= ["NewFolder", 16, 16];			// ---
ZmImg.I_NEW_TAG 		= ["NewTag", 16, 16];				// ---
ZmImg.I_NEW_TIME 		= ["NewTime", 7, 11];				// MISSING
ZmImg.I_NOTE 			= ["SearchNote", 16, 16];			// ---
ZmImg.I_NUMBERED_LIST 	= ["NumberedList", 16, 16];			// ---
ZmImg.I_OUTDENT 		= ["Outdent", 16, 16];				// ---
ZmImg.I_PADLOCK 		= ["Padlock", 16, 16];				// UNUSED -- Za.PADLOCK is used
ZmImg.I_PANE_DOUBLE 	= ["SplitPane", 16, 16];			// ---
ZmImg.I_PANE_SINGLE 	= ["SinglePane", 16, 16];			// ---
ZmImg.I_PDF 			= ["PDFDoc", 16, 16];				// ---
ZmImg.I_PO 				= ["PurchaseOrder", 16, 16];		// ---
ZmImg.I_PLUS 			= ["Plus", 16, 16];					// ---
ZmImg.I_PREFERENCES 	= ["Preferences", 16, 16];			// ---
ZmImg.I_PRINTER 		= ["Print", 16, 16];				// ---
ZmImg.I_PROPERTIES 		= ["Properties", 16, 16];			// UNUSED
ZmImg.I_QUESTION_MARK 	= ["QuestionMark", 16, 16];			// ---
ZmImg.I_READ_MSG 		= ["ReadMessage", 16, 16];			// ---
ZmImg.I_RED_X 			= ["Cancel", 16, 16];				// ---
ZmImg.I_RED_CLOSE_ 		= ["Close", 16, 16];				// ---
ZmImg.I_RENAME 			= ["Rename", 16, 16];				// ---
ZmImg.I_REPLY 			= ["Reply", 20, 16];				// ---
ZmImg.I_REPLY_ALL 		= ["ReplyAll", 16, 16];				// ---
ZmImg.I_REPLY_STATUS 	= ["MsgStatusReply", 20, 16];		// ---
ZmImg.I_RIGHT_JUSTIFY 	= ["RightJustify", 16, 16];			// ---
ZmImg.I_SAVE 			= ["Save", 16, 16];					// ---
ZmImg.I_SEARCH 			= ["Search", 16, 16];				// ---
ZmImg.I_SEARCH_ALL 		= ["SearchAll", 20, 16];			// ---
ZmImg.I_SEARCH_CALENDAR = ["SearchCalendar", 20, 16];		// ---
ZmImg.I_SEARCH_CONTACTS = ["SearchContacts", 20, 16];		// ---
ZmImg.I_SEARCH_FOLDER 	= ["SearchFolder", 16, 16];			// ---
ZmImg.I_SEARCH_GAL 		= ["SearchGAL", 20, 16];			// ---
ZmImg.I_SEARCH_MAIL 	= ["SearchMail", 20, 16];			// ---
ZmImg.I_SENT_FOLDER 	= ["SentFolder", 16, 16];			// ---
ZmImg.I_SPAM_FOLDER 	= ["SpamFolder", 16, 16];			// --
ZmImg.I_SUBSCRIPT 		= ["Subscript", 16, 16];			// ---
ZmImg.I_STRIKETHRU_TEXT = ["StrikeThru", 16, 16];			// ---
ZmImg.I_SUPERSCRIPT 	= ["Superscript", 16, 16];			// ---
ZmImg.I_TASK 			= ["Task", 16, 16];					// ---
ZmImg.I_TAG 			= ["Tag", 16, 16];					// ---
ZmImg.I_TAG_BLUE 		= ["TagBlue", 16, 16];				// ---
ZmImg.I_TAG_CYAN 		= ["TagCyan", 16, 16];				// ---
ZmImg.I_TAG_FOLDER 		= ["TagFolder", 16, 16];			// ---
ZmImg.I_TAG_GREEN 		= ["TagGreen", 16, 16];				// ---
ZmImg.I_TAG_ORANGE 		= ["TagOrange", 16, 16];			// ---
ZmImg.I_TAG_PINK 		= ["TagPink", 16, 16];				// ---
ZmImg.I_TAG_PURPLE 		= ["TagPurple", 16, 16];			// ---
ZmImg.I_TAG_RED 		= ["TagRed", 16, 16];				// ---
ZmImg.I_TAG_YELLOW 		= ["TagYellow", 16, 16];			// ---
ZmImg.I_TELEPHONE 		= ["Telephone", 16, 16];			// ---
ZmImg.I_TO 				= ["MailTo", 16, 16];				// UNUSED
ZmImg.I_TRASH 			= ["Trash", 16, 16];				// ---
ZmImg.I_URL 			= ["URL", 16, 16];					// ---
ZmImg.I_UNDERLINE_TEXT 	= ["Underline", 16, 16];			// ---
ZmImg.I_UNDO 			= ["Undo", 16, 16];					// UNUSED
ZmImg.I_UP_ARROW 		= ["UpArrow", 16, 16];				// ---
ZmImg.I_WEEK_VIEW 		= ["WeekView", 16, 16];				// ---
ZmImg.I_WORK_WEEK_VIEW 	= ["WorkWeekView", 16, 16];			// ---
ZmImg.I_ZIP 			= ["ZipDoc", 16, 16];				// ---

// Disabled icons
ZmImg.ID_ATTACHMENT 	= ["AttachmentDis", 16, 16];		// ---
ZmImg.ID_BACK_ARROW 	= ["LeftArrowDis", 16, 16];		// ---
ZmImg.ID_BROWSE 		= ["SearchBuilderDis", 16, 16];	// ---
ZmImg.ID_COLOR_WHEEL 	= ["ColorWheelDis", 16, 16];		// UNUSED? 
ZmImg.ID_CONV 			= ["ConversationDis", 16, 16];		// UNUSED
ZmImg.ID_DAY_VIEW 		= ["DayViewDis", 16, 16];			// ---
ZmImg.ID_DBL_BACK_ARROW = ["LeftDoubleArrowDis", 16, 16];	// ---
ZmImg.ID_DBL_FORW_ARROW = ["RightDoubleArrowDis", 16, 16];	// ---
ZmImg.ID_DELETE 		= ["DeleteDis", 16, 16];			// ---
ZmImg.ID_DELETE_TAG 	= ["DeleteTagDis", 16, 16];		// UNUSED
ZmImg.ID_DOWN_ARROW 	= ["DownArrowDis", 16, 16];		// ---
ZmImg.ID_FORMAT 		= ["FormatDis", 16, 16];			// ---
ZmImg.ID_FORWARD 		= ["ForwardDis", 16, 16];			// ---
ZmImg.ID_FORWARD_ARROW 	= ["RightArrowDis", 16, 16];		// ---
ZmImg.ID_IM 			= ["IMUnavailable", 11, 15];		// ---
ZmImg.ID_MAIL_MSG 		= ["NewMessageDis", 16, 16];		// ---
ZmImg.ID_MONTH_VIEW 	= ["MonthViewDis", 16, 16];		// ---
ZmImg.ID_MOVE 			= ["MoveToFolderDis", 16, 16];		// ---
ZmImg.ID_PRINTER 		= ["PrintDis", 16, 16];			// ---
ZmImg.ID_REPLY 			= ["ReplyDis", 16, 16];			// ---
ZmImg.ID_REPLY_ALL 		= ["ReplyAllDis", 16, 16];			// ---
ZmImg.ID_SAVE 			= ["SaveDis", 16, 16];				// ---
ZmImg.ID_SEARCH 		= ["SearchDis", 16, 16];			// ---
ZmImg.ID_SPAM_FOLDER 	= ["SpamFolderDis", 16, 16];		// ---
ZmImg.ID_TAG 			= ["TagDis", 16, 16];				// ---
ZmImg.ID_TAG_FOLDER 	= ["TagFolderDis", 16, 16];		// ---
ZmImg.ID_UP_ARROW 		= ["UpArrowDis", 16, 16];			// ---
ZmImg.ID_WEEK_VIEW 		= ["WeekViewDis", 16, 16];			// ---
ZmImg.ID_WORK_WEEK_VIEW = ["WorkWeekViewDis", 16, 16];		// ---

// Large icons
ZmImg.IL_AUDIO 			= ["AudioDoc_48", 48, 47];			// ---
ZmImg.IL_BINARY 		= ["BinaryDoc_48", 48, 48];			// ---
ZmImg.IL_BMP 			= ["Bmp48", 48, 48];				// ---
ZmImg.IL_DOCUMENT 		= ["GenericDoc_48", 48, 48];		// ---
ZmImg.IL_ENVELOPE 		= ["MessageDoc_48", 48, 48];		// ---
ZmImg.IL_GIF 			= ["GifDoc_48", 48, 48];			// UNUSED
ZmImg.IL_HTML 			= ["HtmlDoc_48", 48, 48];			// ---
ZmImg.IL_IMAGE 			= ["ImageDoc_48", 48, 48];			// ---
ZmImg.IL_JPEG 			= ["JpegDoc_48", 48, 48];			// UNUSED
ZmImg.IL_MS_EXCEL 		= ["MSExcelDoc_48", 48, 48];		// ---
ZmImg.IL_MS_POWERPOINT 	= ["MSPPTDoc_48", 48, 48];			// ---
ZmImg.IL_MS_PROJECT 	= ["MSProjectDoc_48", 48, 48];		// ---
ZmImg.IL_MS_VISIO 		= ["MSVisioDoc_48", 48, 48];		// ---
ZmImg.IL_MS_WMV 		= ["AudioDoc_48", 48, 48];			// ---
ZmImg.IL_MS_WORD 		= ["MSWordDoc_48", 48, 48];			// ---
ZmImg.IL_PDF 			= ["PDFDoc_48", 48, 48];			// ---
ZmImg.IL_ZIP 			= ["ZipDoc_48", 48, 48];			// ---



// free/busy images
ZmImg.CAL_FB_KEY = ["FreeBusyKey", 300, 75];				// ---
ZmImg.CAL_FB_NEXT_DAY = ["FreeBusyNextDay", 20, 254];		// ---
ZmImg.CAL_FB_PREV_DAY = ["FreeBusyPrevDay", 20, 254];		// ---
