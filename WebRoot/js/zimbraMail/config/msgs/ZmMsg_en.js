/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmMsg() {
}

ZmMsg.CRLF = "\r\n";
ZmMsg.CRLF2 = "\r\n\r\n";
ZmMsg.DASHES = "-----";

ZmMsg.accepted = "Accepted";
ZmMsg.addAttachment = "Add Attachment";
ZmMsg.addAttachments = "Add Attachments";
ZmMsg.addBcc = "Add Bcc";
ZmMsg.addCc = "Add Cc";
ZmMsg.addSignature = "Add Signature";
ZmMsg.adobePdfDocument = "Adobe PDF";
ZmMsg.adobePsDocument = "Adobe Postscript";
ZmMsg.addSearch = "Add a search to the current query.";
ZmMsg.advanced = "Advanced";
ZmMsg.advancedSearch = "Search Builder";
ZmMsg.all = "All";
ZmMsg.allTags = "All Tags";
ZmMsg.anyAtt = "Any Attachment";
ZmMsg.anywhere = "Anywhere";
ZmMsg.appExitWarning = "Doing so will terminate Zimbra Collaboration Suite";
ZmMsg.application = "Application";
ZmMsg.applicationDocument = "Application Document";
ZmMsg.appointment = "Appointment";
ZmMsg.appointmentEditTitle = "Edit Appointment";
ZmMsg.appointmentNewTitle = "New Appointment";
ZmMsg.allMail = "All Mail";
ZmMsg.arrange = "Arrange";
ZmMsg.askDeleteTag = 'Delete tag "$0"?';
ZmMsg.askLeaveCompose = "Cancel compose? (If you cancel, your message will not be saved.)";
ZmMsg.askSaveContact = "Would you like to save your changes?";
ZmMsg.askSaveDraft = "Save current message as draft?"
ZmMsg.attachFile = "Attach";
ZmMsg.attachment = "Attachment";
ZmMsg.attachments = "Attachments";
ZmMsg.attachmentTooltip = "Attach one or more files to the message";
ZmMsg.attendees = "Attendees";
ZmMsg.audio = "Audio";
ZmMsg.autoAddContacts = "Enable auto adding of contacts";
ZmMsg.awayMessage = "Away message";
ZmMsg.awayMessageEnabled = "Away message Enabled";
ZmMsg.back = "Back";
ZmMsg.badTargetFolder = "You cannot move the folder to the selected destination folder.";
ZmMsg.badTargetFolderItems = "You cannot move items to the selected destination folder.";
ZmMsg.badUsername = "Your username must be a valid email address.";
ZmMsg.basic = "Basic";
ZmMsg.basicSearch = "Basic Search";
ZmMsg.bcc = "Bcc";
ZmMsg.blue = "Blue";
ZmMsg.boldText = "Bold (Ctrl+B)"
ZmMsg.bothNewPasswordsMustMatch = "Both new passwords must match. Please retype them.";
ZmMsg.brokenHeart = "broken heart";
ZmMsg.browse = "Browse";
ZmMsg.bulletedList = "Bulleted List";
ZmMsg.byAttachment = "By Attachment";
ZmMsg.byConversation = "By Conversation";
ZmMsg.byMessage = "By Message";
ZmMsg.bytes = "bytes";
ZmMsg.calendar = "Calendar";
ZmMsg.calendarAppointment = "Calendar Appointment";
ZmMsg.calendarInitialView = "Initial calendar view";
ZmMsg.call = "Call";
ZmMsg.calViewDay = "Day View";
ZmMsg.calViewMonth = "Month View";
ZmMsg.calViewWeek = "7 Day Week View";
ZmMsg.calViewWorkWeek = "Work Week View";
ZmMsg.cancel = "Cancel";
ZmMsg.cancelled = "Cancelled";
ZmMsg.cancelTooltip = "Return to previous view";
ZmMsg.cc = "Cc";
ZmMsg.centerJustify = "Align Center (Ctrl+E)"; 
ZmMsg.change = "Change";
ZmMsg.changePassword = "Change password";
ZmMsg.chooseSearchType = "Choose which types of items are returned by your search";
ZmMsg.clearAdvSearch = "Clear Search Builder";
ZmMsg.close = "Close";
ZmMsg.closeSearchBuilder = "Close Search Builder";
ZmMsg.closeTooltip = "Return to previous view";
ZmMsg.clown = "clown";
ZmMsg.code = "Code";
ZmMsg.company = "Company";
ZmMsg.compBadAddresses = "<p>The following addresses appear to be invalid: $0</p><p>Send anyway?</p>";
ZmMsg.compose = "Compose";
ZmMsg.composeInNewWin = "Always compose in new window";
ZmMsg.composeMailUsing = "Always compose mail using";
ZmMsg.compSubjectMissing = "No subject. Send anyway?";
ZmMsg.confirmed = "Confirmed";
ZmMsg.confirmDeleteContact = "Are you sure you want to delete this contact?";
ZmMsg.confirmDeleteRule = "Are you sure you want to delete this rule?";
ZmMsg.confirmDeleteRules = "Are you sure you want to delete these rules?";
ZmMsg.confirmExitPreferences = "Would you like to save your changes?";
ZmMsg.confirmFilterDetailsSave = "Your filter rule is incomplete. Do you want to continue saving locally?";
ZmMsg.confirmPassword = "Confirm new password";
ZmMsg.confirmPasswordHasWhitespace = "The confirm password field has whitespace. Please correct this, and resubmit your change request.";
ZmMsg.convCountTooltip = "Total Messages in Conversation";
ZmMsg.conversation = "Conversation";
ZmMsg.contact = "Contact";
ZmMsg.contactList = "Contact List";
ZmMsg.contacts = "Contacts";
ZmMsg.contactCreated = "New contact successfully created.";
ZmMsg.contactModify = "Contact successfully modified.";
ZmMsg.contactsImported = "contact(s) have been successfully imported.";
ZmMsg.contactsPerPage = "Number of contacts to display per page";
ZmMsg.content = "Content";
ZmMsg.count = "Count";
ZmMsg.createNewMsg = "Create New Message";
ZmMsg.createNewAppt = "Create New Appointment";
ZmMsg.createNewContact = "Create New Contact";
ZmMsg.createNewFolder = "Create New Folder";
ZmMsg.createNewTag = "Create New Tag";
ZmMsg.crying = "crying";
ZmMsg.custom = "Custom";
ZmMsg.cyan = "Cyan";
ZmMsg.date = "Date";
ZmMsg.day = "Day";
ZmMsg.declined = "Declined";
ZmMsg.dedupeNone = "Receive the message as normal";
ZmMsg.dedupeSecondCopy = "Only receive the message if I'm in To: or Cc:";
ZmMsg.dedupeMoveToInbox = "Move the sent message to Inbox";
ZmMsg.dedupeAll = "Do not receive the message";
ZmMsg.def = "Default";
ZmMsg.defaultInviteReplyAcceptMessage = "Yes, I will attend.\r\n\r\n";
ZmMsg.defaultInviteReplyDeclineMessage = "No, I won't attend.\r\n\r\n";
ZmMsg.defaultInviteReplyTentativeMessage = "I might attend.\r\n\r\n";
ZmMsg.defaultInviteReplyNewTimeMessage = "I would like to propose a time change.\r\n\r\n";
ZmMsg.defaultCalendarTimezone = "Default timezone for new appointments";
ZmMsg.defaultsRestored = "Defaults restored, press Save to save changes";
ZmMsg.del = "Delete";
ZmMsg.delConv = "Delete Conversation";
ZmMsg.deleteInstance = "Delete Instance";
ZmMsg.deleteTooltip = "Move selected item(s) to Trash";
ZmMsg.deletePermanentTooltip = "Delete selected item(s) permanently";
ZmMsg.deleteRecurringItem = "Delete Recurring Item";
ZmMsg.deleteSeries = "Delete Series";
ZmMsg.detach = "New Window";
ZmMsg.detachAnyway = "You will have to reattach your file(s). Open in new window anyway?";
ZmMsg.detachTooltip = "Compose in a separate window";
ZmMsg.detailedCards = "Detailed Cards";
ZmMsg.devil = "devil";
ZmMsg.displayCalendar = "Choose how the calendar is displayed";
ZmMsg.displayContacts = "Choose how contacts are displayed";
ZmMsg.displayMail = "Choose how mail is displayed";
ZmMsg.domain = "Domain";
ZmMsg.domains = "Domains";
ZmMsg.done = "Done";
ZmMsg.dontInclude = "Don't include";
ZmMsg.draft = "Draft";
ZmMsg.drafts = "Drafts";
ZmMsg.draftSaved = "Draft saved successfully.";
ZmMsg.edit = "Edit";
ZmMsg.editInviteReply = "Would you like to edit the invite reply?";
ZmMsg.editReply = "Edit Reply";
ZmMsg.editTooltip = "Edit the selected item";
ZmMsg.email = "Email";
ZmMsg.emptyContact = "Empty contact not saved.";
ZmMsg.emptyJunk = "Empty Junk";
ZmMsg.emptyTrash = "Empty Trash";
ZmMsg.enrichedText = "Enriched Text";
ZmMsg.enterUsername = "Please enter your username and password";
ZmMsg.errorApplication = "An unknown application error has occurred.";
ZmMsg.errorContact = "If the problem persists, please contact your System Aministrator.";
ZmMsg.errorCreateContact = "Unable to create contact.";
ZmMsg.errorModifyContact = "Unable to modify contact.";
ZmMsg.errorGeneric = "Could not complete operation.";
ZmMsg.errorImporting = "An error occurred importing your contacts";
ZmMsg.errorInvalidName = 'Sorry, "$0" is not a valid name. It contains at least one invalid character.';
ZmMsg.errorInvalidPass = "You have entered an invalid password.";
ZmMsg.errorInvalidPrefName = "Invalid preference name.";
ZmMsg.errorInvalidPrefValue = "Invalid preference value.";
ZmMsg.errorNoActiveX = "You need to enable ActiveX controls in order to use the Zimbra Collaboration Suite.";
ZmMsg.errorNoSuchAcct = "No such account exists.";
ZmMsg.errorNoSuchConv = "No such conversation exists.";
ZmMsg.errorNoSuchFolder = "No such folder exists.";
ZmMsg.errorNoSuchMsg = "No such message exists.";
ZmMsg.errorNoSuchPart = "No such message part exists.";
ZmMsg.errorNoSuchSavedSearch = "No such saved search exists.";
ZmMsg.errorNoSuchTag = "No such tag exists.";
ZmMsg.errorParse = "A parsing error has occurred.";
ZmMsg.errorPassRecentlyUsed = "The password you submitted has recently been used.";
ZmMsg.errorPermission = "Permission denied.";
ZmMsg.errorQueryParse = "Unable to parse the search query.";
ZmMsg.errorQuotaExceeded = "Your message could not be sent because you have exceeded your mail quota.";
ZmMsg.errorNetwork = "A network error has occurred."
ZmMsg.errorService = "A network service error has occurred."
ZmMsg.errorTryAgain = "Please correct any errors and retry.";
ZmMsg.errorUnknownDoc = "Unknown document.";
ZmMsg.event = "Event";
ZmMsg.execute = "Execute";
ZmMsg.expandAll = "Expand All";
ZmMsg._export = "Export";
ZmMsg.fileAs = "File As";
ZmMsg.filterAdd = "Add";
ZmMsg.filterEdit = "Edit";
ZmMsg.filterMoveUp = "Move Up";
ZmMsg.filterMoveDown= "Move Down";
ZmMsg.filterRemove = "Remove";
ZmMsg.filterRules = "Filter Rules";
ZmMsg.flag = "Flag";
ZmMsg.flagged = "Flagged";
ZmMsg.flags = "Flags";
ZmMsg.folder = "Folder";
ZmMsg.folderName = "Folder name";
ZmMsg.folderNameExists = "A folder with that name exists. Please use another name.";
ZmMsg.folderNoLocation = "You must select a location for the folder.";
ZmMsg.folderOrSearchNameExists = "A folder or saved search with that name exists. Please use another name.";
ZmMsg.folders = "Folders";
ZmMsg.foldersSearches = "Folders and Saved Searches";
ZmMsg.fontBackground = "Font Background";
ZmMsg.fontColor = "Font Color";
ZmMsg.format = "Format";
ZmMsg.formatTooltip = "Choose the format to compose in";
ZmMsg.forward = "Forward";
ZmMsg.forwardAtt = "Forward as Attachment";
ZmMsg.forwarded = "Forwarded";
ZmMsg.forwardedMessage = "Forwarded Message";
ZmMsg.forwardInclude = "Forward includes original text";
ZmMsg.forwardInline = "Forward Inline";
ZmMsg.forwardTooltip = "Forward the selected message";
ZmMsg.forwardTooltipConv = "Forward the most recent message in the conversation";
ZmMsg.fragment = "Fragment";
ZmMsg.from = "From";
ZmMsg.fw = "Fw";
ZmMsg.fwd = "Fwd";
ZmMsg.GAL = "Global Address List";
ZmMsg.gb = "gigabytes (GB)";
ZmMsg.general = "General";
ZmMsg.gifImage = "GIF Image";
ZmMsg.goToCalendar = "Go to Calendar";
ZmMsg.goToContacts = "Show all Contacts";
ZmMsg.goToHelp = "Read online help documentation";
ZmMsg.goToMail = "Go to Mail";
ZmMsg.goToOptions = "View or edit your options";
ZmMsg.green = "Green";
ZmMsg.groupMailBy = "Group mail by";
ZmMsg.happy = "happy";
ZmMsg.header = "Header";
ZmMsg.help = "Help";
ZmMsg.horizRule = "Horizontal Rule";
ZmMsg.htmlDocument = "HTML";
ZmMsg.icon = "Icon";
ZmMsg.image = "Image";
ZmMsg._import = "Import";
ZmMsg.importingContacts = "Please wait while importing contacts...";
ZmMsg.inbox = "Inbox";
ZmMsg.includeAsAttach = "As an attachment";
ZmMsg.includeInBody = "In the body";
ZmMsg.includePrefix = "In the body with a prefix";
ZmMsg.includeJunk = "Also search Junk";
ZmMsg.includeJunkFolder = "Include Junk folder in searches";
ZmMsg.includeTrash = "Also search Trash";
ZmMsg.includeTrashFolder = "Include Trash folder in searches";
ZmMsg.inContacts = "In Personal Address Book";
ZmMsg.indent = "Increase Indent";
ZmMsg.inGal = "In Global Address List";
ZmMsg.initialMailSearch = "Initial mail search";
ZmMsg.insertImage = "Insert Image";
ZmMsg.insertLink = "Insert Link";
ZmMsg.insertTable = "Insert Table";
ZmMsg.invalidEmail = "$0 is not a valid email address."
ZmMsg.isAfter = "is after";
ZmMsg.isBefore = "is before";
ZmMsg.isOn = "is on";
ZmMsg.italicText = "Italic (Ctrl+I)"
ZmMsg.itemsPerPage = "Number of items to display per page";
ZmMsg.javaSource = "Java Source Code";
ZmMsg.jpegImage = "JPEG Image";
ZmMsg.junk = "Junk";
ZmMsg.junkTooltip = "Mark selected item(s) as Junk";
ZmMsg.justify = "Justify (Ctrl+J)"; 
ZmMsg.kb = "kilobytes (KB)";
ZmMsg.larger = "is larger than";
ZmMsg.lastModified = "Last Modified";
ZmMsg.lastSaved = "Last Saved";
ZmMsg.leftJustify = "Align Left (Ctrl+L)"; 
ZmMsg.list = "List";
ZmMsg.location = "Location";
ZmMsg.login = " Log On ";
ZmMsg.loginHeader = "Acme Corporation";
ZmMsg.loginError = "The username or password is incorrect. Verify that CAPS LOCK is not on, and " + 
		           "then retype the current username and password";
ZmMsg.loginAsDiff = "Log in as a different user";
ZmMsg.logOff = "Log Off";
ZmMsg.mail = "Mail";
ZmMsg.mailMessage = "Mail Message";
ZmMsg.mailNotifAddress = "Address for new mail notifications";
ZmMsg.mailNotifEnabled = "Enable address for new mail notifications";
ZmMsg.mailSendFailure = "Could not send message: $0";
ZmMsg.markAllRead = "Mark All as Read";
ZmMsg.markAsRead = "Mark As Read";
ZmMsg.markAsUnread = "Mark As Unread";
ZmMsg.mb = "megabytes (MB)";
ZmMsg.meetingStatus = "Meeting Status";
ZmMsg.message = "Message";
ZmMsg.messageSent = "Your message has been sent.";
ZmMsg.messageStatus = "Message Status";
ZmMsg.method = "Method";
ZmMsg.mobile = "Mobile";
ZmMsg.modifySearch = "Modify Search";
ZmMsg.month = "Month";
ZmMsg.move = "Move";
ZmMsg.moveItem = "Move Item";
ZmMsg.moveItems = "Move Items";
ZmMsg.moveConversation = "Move Conversation";
ZmMsg.moveConversations = "Move Conversations";
ZmMsg.moveFolder = 'Move Folder "$0"';
ZmMsg.moveMessage = "Move Message";
ZmMsg.moveMessages = "Move Messages";
ZmMsg.moveTooltip = "Move selected item(s)";
ZmMsg.mp3Audio = "MP3 Audio";
ZmMsg.msDownload = "Microsoft DLL";
ZmMsg.msExcelDocument = "Microsoft Excel";
ZmMsg.msWinmailDat = "Microsoft Outlook (TNEF)";
ZmMsg.msPPTDocument = "Microsoft PowerPoint";
ZmMsg.msProjectDocument = "Microsoft Project";
ZmMsg.msVisioDocument = "Microsoft Visio";
ZmMsg.msWMV = "Windows Media Video";
ZmMsg.msWordDocument = "Microsoft Word";
ZmMsg.multipartAlternative = "Multipart Alternative"
ZmMsg.multipartMixed = "Multipart Mixed";
ZmMsg.myFolders = "My Folders";
ZmMsg._name = "Name"; // has different prefix b/c "name" is a keyword
ZmMsg.nameEmpty = "You must specify a value for the name.";
ZmMsg.nameTooLong = "The name must be at most $0 characters long";
ZmMsg._new = "New";
ZmMsg.needsAction = "Needs Action";
ZmMsg.newAppt = "New Appointment";
ZmMsg.newApptTooltip = "Create a new calendar appointment";
ZmMsg.newContact = "New Contact";
ZmMsg.newContactTooltip = "Create a new contact";
ZmMsg.newEmail = "New Email";
ZmMsg.newFolder = "New Folder";
ZmMsg.newFolderParent = "Select where to place the new folder";
ZmMsg.newFolderTooltip = "Create a new folder";
ZmMsg.newIM = "New IM"; // IM HACK
ZmMsg.newMessageTooltip = "Compose a new message";
ZmMsg.newName = "New name";
ZmMsg.newPassword = "New password";
ZmMsg.newPasswordHasWhitespace = "The new password field has whitespace. Please correct this, and resubmit your change request.";
ZmMsg.newPasswordTooShort = "Your new password must be at least 6 characters long.";
ZmMsg.newSearchParent = "Select where to place the new saved search";
ZmMsg.newTag = "New Tag";
ZmMsg.newTagName = "New Tag Name";
ZmMsg.newTagTooltip = "Create a new tag";
ZmMsg.next = "Next";
ZmMsg.noAddresses = "There must be at least one address in the To:, Cc:, or Bcc: fields";
ZmMsg.noAtt  = "No Attachments";
ZmMsg.noSubject = "<No Subject>";
ZmMsg.noWhere = "<No Where>";
ZmMsg.none = "None";
ZmMsg.notJunk = "Not Junk";
ZmMsg.notJunkTooltip = "Mark selected item(s) as not Junk";
ZmMsg.noTargetFolder = "You must select a destination folder";
ZmMsg.note = "Note";
ZmMsg.noteForward = "Note: Forwarded message attached";
ZmMsg.notes = "Notes";
ZmMsg.numberedList = "Numbered List";
ZmMsg.object = "Object";
ZmMsg.objects = "Objects";
ZmMsg.off = "Off";
ZmMsg.oldPassword = "Old password";
ZmMsg.oldPasswordHasWhitespace = "The old password field has whitespace. Please correct this, and resubmit your change request.";
ZmMsg.oldPasswordIsIncorrect = "The old password you submitted, is incorrect.";
ZmMsg.on = "On";
ZmMsg.onlyWholeNumbersError = "Only whole numbers are accepted";
ZmMsg.openInstance = "Open instance";
ZmMsg.openRecurringItem = "Open Recurring Item";
ZmMsg.openSearchBuilder = "Open Search Builder";
ZmMsg.openSeries = "Open series";
ZmMsg.options = "Options";
ZmMsg.optionsSaved = "Your options have been saved.";
ZmMsg.orange = "Orange";
ZmMsg.origMsg = "Original Message";
ZmMsg.organizer = "Organizer:";
ZmMsg.outdent = "Decrease Indent";
ZmMsg.outRpcCache = "Out of RPC cache";
ZmMsg.page = "Page";
ZmMsg.participantStatus = "Participant Status";
ZmMsg.party = "party";
ZmMsg.password = "Password";
ZmMsg.passwordChangeSucceeded = "Your password has been changed.";
ZmMsg.passwordFieldMissing = "You must fill in all the password fields";
ZmMsg.phone = "Phone";
ZmMsg.phoneNumber = "Phone Number";
ZmMsg.pink = "Pink";
ZmMsg.pickADate = "Pick a date";
ZmMsg.pickATag = "Pick a tag";
ZmMsg.plainText = "Plain Text";
ZmMsg.pngImage = "PNG Image";
ZmMsg.po = "Purchase Order";
ZmMsg.popupBlocker = "Oops! It appears your browser is blocking popups.";
ZmMsg.positiveNumberError = "This must be a positive number."
ZmMsg.preferences = "Preferences";
ZmMsg.prefix = "Prefix each included line with";
ZmMsg.previous = "Previous";
ZmMsg.print = "Print";
ZmMsg.printTooltip = "Print selected item(s)";
ZmMsg.publicComputer = "Remember me on this computer";
ZmMsg.purple = "Purple";
ZmMsg.quick = "Quick";
ZmMsg.quota = "Quota";
ZmMsg.received = "Received";
ZmMsg.re = "Re";
ZmMsg.read = "Read";
ZmMsg.readingPane = "Reading Pane";
ZmMsg.red = "Red";
ZmMsg.remove = "Remove";
ZmMsg.removeAddr = "Remove $0";
ZmMsg.removeAll = "Remove All";
ZmMsg.removeDupesToSelf = "If I send a message that I then receive";
ZmMsg.removeTag = "Remove Tag"
ZmMsg.renameFolder = "Rename Folder";
ZmMsg.renameSearch = "Rename Search";
ZmMsg.renameTag = "Rename Tag";
ZmMsg.replied = "Replied";
ZmMsg.reply = "Reply";
ZmMsg.replyForwardInSameFormat = "Reply/Forward using format of the original message";
ZmMsg.replyAccept = "Accept";
ZmMsg.replyAll = "Reply to All";
ZmMsg.replyAllTooltip = "Reply to all recipients of the selected message";
ZmMsg.replyAllTooltipConv = "Reply to all recipients of the most recent message in the conversation";
ZmMsg.replyDecline = "Decline";
ZmMsg.replyInclude = "Reply includes original text";
ZmMsg.replyNewTime = "Propose New Time";
ZmMsg.replySender = "Reply to Sender";
ZmMsg.replyTentative = "Tentative";
ZmMsg.replyTo = "Reply To";
ZmMsg.replyToAddress = "Reply-to address";
ZmMsg.replyTooltip = "Reply to the sender of the selected message";
ZmMsg.replyTooltipConv = "Reply to the sender of the most recent message in the conversation";
ZmMsg.report = "Report";
ZmMsg.restoreDefaults = "Restore Defaults";
ZmMsg.rightJustify = "Align Right (Ctrl+R)"; 
ZmMsg.rotfl = "rolling on the floor laughing";
ZmMsg.save = "Save";
ZmMsg.saveCurrentSearch = "Save the current search";
ZmMsg.saveDraft = "Save Draft";
ZmMsg.saveDraftTooltip = "Save message to Drafts folder";
ZmMsg.savedSearch = "Saved Search";
ZmMsg.savedSearches = "Saved Searches";
ZmMsg.savePrefs = "Save current options";
ZmMsg.saveSearch = "Save Search";
ZmMsg.saveToSent = "Save copies of messages to sent folder";
ZmMsg.scheduleAttendees = "Schedule Attendees";
ZmMsg.search = "Search";
//ZmMsg.searchAll = "Search All";
ZmMsg.searchAll = "All Item Types";
ZmMsg.searchBuilder = "Search Builder";
ZmMsg.searchByAttachment = "Search by attachment type";
ZmMsg.searchByBasic = "Search by address, subject, or content";
ZmMsg.searchByCustom = "Add text to the search query";
ZmMsg.searchByDate = "Search on, before, or after a certain date";
ZmMsg.searchByDomain = "Search by address domain";
ZmMsg.searchByFlag = "Search by message flag or status";
ZmMsg.searchByFolder = "Search by folder";
ZmMsg.searchByObject = "Search by object (URL, phone, etc)";
ZmMsg.searchBySavedSearch = "Invoke a saved search";
ZmMsg.searchBySize = "Search by size";
ZmMsg.searchByTag = "Search by tag";
ZmMsg.searchByTime = "Search by relative time/date";
//ZmMsg.searchCalendar = "Search Calendar";
ZmMsg.searchCalendar = "Calendar Appointments";
ZmMsg.searchContacts = "Search Contacts";
ZmMsg.searches = "Searches";
ZmMsg.searchForAny = "Search for anything";
ZmMsg.searchForAppts = "Search for appointments";
ZmMsg.searchForConvs = "Search for mail conversations";
ZmMsg.searchForMessages = "Search for mail messages";
//ZmMsg.searchGALContacts = "Search for contacts in global address list (GAL)";
ZmMsg.searchGALContacts = "Global address list (GAL) Contacts";
//ZmMsg.searchMail = "Search Mail";
ZmMsg.searchMail = "Email Messages";
ZmMsg.searchName = "Name for the saved search";
ZmMsg.searchNameEmpty = "You must specify a value for the name of the saved search.";
ZmMsg.searchNameExists = "A saved search with that name exists. Please use another name.";
ZmMsg.searchNoLocation = "You must select a location for the saved search.";
ZmMsg.searchNotes = "Search Notes";
//ZmMsg.searchPersonalContacts = "Search for contacts in personal address book";
ZmMsg.searchPersonalContacts = "Personal Contacts";
ZmMsg.searchResults = "Search results";
ZmMsg.selectAddresses = "Select Addresses";
ZmMsg.send = "Send";
ZmMsg.sendTooltip = "Send message";
ZmMsg.sent = "Sent";
ZmMsg.sentMail = "Sent Mail";
ZmMsg.sessionExpired = "Your session has expired. Please login again.";
ZmMsg.shouldShowTimezone = "Show timezone list in appointment view";
ZmMsg.showFragments = "Show fragments in conversation/message lists";
ZmMsg.showOccurrenceMessage =  "\"$0\" is a recurring appointment. Would you like to open only this instance, or the series?";
ZmMsg.showOccurrenceDeleteMessage =  "\"$0\" is a recurring appointment. Would you like to delete only this instance, or the series?";
ZmMsg.showNames = "Show names from";
ZmMsg.showOrig = "Show Original";
ZmMsg.showSearchString = "Always Show Search String";
ZmMsg.signature = "Signature";
ZmMsg.signatureEnabled = "Add signature to all outgoing messages";
ZmMsg.signatureStyle = "Use standard Internet signature style";
ZmMsg.size = "Size";
ZmMsg.smaller = "is smaller than";
ZmMsg.smartInclude = "Smart Include";
ZmMsg.sortByFrom = "Sort by From";
ZmMsg.sortByReceived = "Sort by Received";
ZmMsg.sortBySubject = "Sort by Subject";
ZmMsg.specAtt = "Specific Attachment";
ZmMsg.special = "Special";
ZmMsg.spellcheck = "Spellcheck";
ZmMsg.status = "Status";
ZmMsg.strikeThruText = "Strikethrough (Ctrl+S)"
ZmMsg.subject = "Subject";
ZmMsg.subjectAccept = "Accept";
ZmMsg.subjectDecline = "Decline";
ZmMsg.subjectTentative = "Tentative";
ZmMsg.subjectNewTime = "New Time Proposed";
ZmMsg.subscript = "Subscript";
ZmMsg.superscript = "Superscript";
ZmMsg.switchToText = "Switching to text will discard all HTML formatting. Continue?";
ZmMsg.tag = "Tag";
ZmMsg.tagItem = "Tag Item";
ZmMsg.tagItems = "Tag Items";
ZmMsg.tags = "Tags";
ZmMsg.tagColor = "Tag Color";
ZmMsg.tagConversation = "Tag Conversation";
ZmMsg.tagConversations = "Tag Conversations";
ZmMsg.tagMessage = "Tag Message";
ZmMsg.tagMessages = "Tag Messages";
ZmMsg.tagName = "Tag name";
ZmMsg.tagNameEmpty = "You must specify a value for the tag name.";
ZmMsg.tagNameExists = "A tag with that name exists. Please use another name. (Tag names are case-insensitive.)";
ZmMsg.tagSelectLocation = "You must select a location for the tag.";
ZmMsg.tagTooltip = "Tag selected item(s)";
ZmMsg.targetFolder = "Select the destination folder";
ZmMsg.targetTag = "Select a tag";
ZmMsg.task = "Task";
ZmMsg.tentative = "Tentative";
ZmMsg.text = "Text";
ZmMsg.textDocuments = "Text Documents";
ZmMsg.textFile = "Text File";
ZmMsg.tiffImage = "TIFF Image";
ZmMsg.time = "Time";
ZmMsg.to = "To";
ZmMsg.toCc = "To / Cc";
ZmMsg.today = "Today";
ZmMsg.todayTooltip = "Show the calendar for today";
ZmMsg.tracking = "Package Tracking Number";
ZmMsg.trash = "Trash";
ZmMsg.underlineText = "Underline (Ctrl+U)"
ZmMsg.unflagged = "Unflagged";
ZmMsg.units = "Units";
ZmMsg.unknown = "Unknown";
ZmMsg.unknownBinaryType = "Unknown Binary Type";
ZmMsg.unread = "Unread";
ZmMsg.url = "URL";
ZmMsg.username = "Username";
ZmMsg.value = "Value";
ZmMsg.video = "Video";
ZmMsg.view = "View";
ZmMsg.viewAppointment = "Open";
ZmMsg.viewAppointmentInstance = "Open Instance";
ZmMsg.viewAppointmentSeries = "Open Series";
ZmMsg.viewContacts = "Default contact view";
ZmMsg.viewDay = "Day";
ZmMsg.viewDayTooltip = "Show calendar for the currently selected day";
ZmMsg.viewMailAsHtml = "View mail as HTML (when possible)";
ZmMsg.viewMonth = "Month";
ZmMsg.viewMonthTooltip = "Show calendar for the currently selected month";
ZmMsg.viewWeek = "Week";
ZmMsg.viewWeekTooltip = "Show calendar for the currently selected week";
ZmMsg.viewWorkWeek = "Work Week";
ZmMsg.viewWorkWeekTooltip = "Show calendar for the currently selected work week";
ZmMsg.waveAudio = "WAV Audio";
ZmMsg.welcome = "Welcome";
ZmMsg.week = "Week";
ZmMsg.when = "When";
ZmMsg.workWeek= "Work Week";
ZmMsg.wrote = "wrote";
ZmMsg.xmlDocument = "XML";
ZmMsg.yellow = "Yellow";
ZmMsg.zimbraTitle = "Zimbra";
ZmMsg.zipFile = "Zip File"

// pickers

ZmMsg.P_TIME_TITLE = "Time";
ZmMsg.P_TIME_LAST_HOUR = "last hour";
ZmMsg.P_TIME_LAST_4_HOURS = "last 4 hours";
ZmMsg.P_TIME_TODAY = "today";
ZmMsg.P_TIME_YESTERDAY = "yesterday";
ZmMsg.P_TIME_THIS_WEEK = "this week";
ZmMsg.P_TIME_LAST_WEEK = "last week";
ZmMsg.P_TIME_THIS_MONTH = "this month";
ZmMsg.P_TIME_LAST_MONTH = "last month";
ZmMsg.P_TIME_THIS_YEAR = "this year";
ZmMsg.P_TIME_LAST_YEAR = "last year";

ZmMsg.AB_ADDR_WORK = "Business Address";
ZmMsg.AB_ADDR_HOME = "Home Address";
ZmMsg.AB_ADDR_OTHER = "Other Address";
ZmMsg.AB_EDIT_CONTACT = "Edit Contact";
ZmMsg.AB_ADD_CONTACT = "Add To Contacts";

ZmMsg.AB_MOVE_CONTACT = "Move Contact";
ZmMsg.AB_MOVE_CONTACTS = "Move Contacts";
ZmMsg.AB_TAG_CONTACT = "Tag Contact";
ZmMsg.AB_TAG_CONTACTS = "Tag Contacts";

// these need to be kept in sync with ZmContact.F_*
ZmMsg.AB_FIELD = {
	firstName: "First",
	lastName: "Last",
	middleName: "Middle",
	fullName: "Full Name",
	jobTitle: "Job Title",
	company: "Company",
	
	// email addresses
	email: "E-mail",
	email2: "E-mail 2",
	email3: "E-mail 3",	

	// work address
	workStreet: "Street",
	workCity: "City",
	workState: "State/Province",
	workPostalCode: "Postal Code",
	workCountry: "Country/Region",
	workURL: "Web Page",

	// work phone numbers
	workPhone: "Phone",
	workPhone2: "Phone 2",
	workFax: "Fax",	
	assistantPhone: "Assistant",
	companyPhone: "Company Phone",
	callbackPhone: "Callback",
	
	// home address
	homeStreet: "Street",
	homeCity: "City",
	homeState: "State/Province",
	homePostalCode: "Postal Code",
	homeCountry: "Country/Region",
	homeURL: "Web Page",

	// home phone numbers
	homePhone: "Phone",
	homePhone2: "Phone 2",
	homeFax: "Fax",
	mobilePhone: "Mobile",
	pager: "Pager",
	carPhone: "Car",
	
	// other address
	otherStreet: "Street",
	otherCity: "City",
	otherState: "State/Province",
	otherPostalCode: "Postal Code",
	otherCountry: "Country/Region",
	otherURL: "Web Page",
	
	// other phone numbers
	otherPhone: "Phone",
	otherFax: "Fax"
};

// these need to be kept in sync with ZmContact.FA_*
ZmMsg.AB_FILE_AS = {
	1: "Last, First",
	2: "First Last",
	3: "Company",
	4: "Last, First (Company)",
	5: "First Last (Company)",
	6: "Company (Last, First)",
	7: "Company (First Last)"
};

ZmMsg.preferenceResetButtonLabel = "Reset";

// Full timezone names
ZmMsg.TZF_internationalDateLineWest = "(GMT-12:00) International Date Line West";
ZmMsg.TZF_MidwayIsland ="(GMT-11:00) Midway Island, Samoa";
ZmMsg.TZF_Hawaii ="(GMT-10:00) Hawaii";
ZmMsg.TZF_Alaska ="(GMT-09:00) Alaska";
ZmMsg.TZF_PacificTime ="(GMT-08:00) Pacific Time (US & Canada); Tijuana";
ZmMsg.TZF_Arizona ="(GMT-07:00) Arizona";
ZmMsg.TZF_Chihuahua ="(GMT-07:00) Chihuahua, La Paz, Mazatlan";
ZmMsg.TZF_MountainTime ="(GMT-07:00) Mountain Time (US & Canada)";
ZmMsg.TZF_CentralAmerica ="(GMT-06:00) Central America";
ZmMsg.TZF_CentralTime ="(GMT-06:00) Central Time (US & Canada)";
ZmMsg.TZF_Guadalajara ="(GMT-06:00) Guadalajara, Mexico City, Monterrey";
ZmMsg.TZF_Saskatchewan ="(GMT-06:00) Saskatchewan";
ZmMsg.TZF_Lima ="(GMT-05:00) Bogota, Lima, Quito";
ZmMsg.TZF_Eastern ="(GMT-05:00) Eastern Time (US & Canada)";
ZmMsg.TZF_Indiana ="(GMT-05:00) Indiana (East)";
ZmMsg.TZF_Atlantic ="(GMT-04:00) Atlantic Time (Canada)";
ZmMsg.TZF_Caracas ="(GMT-04:00) Caracas, La Paz";
ZmMsg.TZF_Santiago ="(GMT-04:00) Santiago";
ZmMsg.TZF_Newfoundland ="(GMT-03:30) Newfoundland";
ZmMsg.TZF_Brasilia ="(GMT-03:00) Brasilia";
ZmMsg.TZF_BuenosAires ="(GMT-03:00) Buenos Aires, Georgetown";
ZmMsg.TZF_Greenland ="(GMT-03:00) Greenland";
ZmMsg.TZF_MidAtlanitc ="(GMT-02:00) Mid-Atlantic";
ZmMsg.TZF_Azores ="(GMT-01:00) Azores";
ZmMsg.TZF_CapeVerde ="(GMT-01:00) Cape Verde Is.";
ZmMsg.TZF_Casablanca ="(GMT) Casablanca, Monrovia";
ZmMsg.TZF_GMT ="(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London";
ZmMsg.TZF_Amsterdam ="(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna";
ZmMsg.TZF_Belgrade ="(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague";
ZmMsg.TZF_Brussels ="(GMT+01:00) Brussels, Copenhagen, Madrid, Paris";
ZmMsg.TZF_Sarajevo ="(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb";
ZmMsg.TZF_WestCentralAfrica ="(GMT+01:00) West Central Africa";
ZmMsg.TZF_Athens ="(GMT+02:00) Athens, Beirut, Istanbul, Minsk";
ZmMsg.TZF_Budapest ="(GMT+02:00) Bucharest";
ZmMsg.TZF_Cairo ="(GMT+02:00) Cairo";
ZmMsg.TZF_Harare ="(GMT+02:00) Harare, Pretoria";
ZmMsg.TZF_Helsinki ="(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius";
ZmMsg.TZF_Jerusalem ="(GMT+02:00) Jerusalem";
ZmMsg.TZF_Baghdad ="(GMT+03:00) Baghdad";
ZmMsg.TZF_Kuwait ="(GMT+03:00) Kuwait, Riyadh";
ZmMsg.TZF_Moscow ="(GMT+03:00) Moscow, St. Petersburg, Volgograd";
ZmMsg.TZF_Nairobi ="(GMT+03:00) Nairobi";
ZmMsg.TZF_Tehran ="(GMT+03:30) Tehran";
ZmMsg.TZF_AbuDhabi ="(GMT+04:00) Abu Dhabi, Muscat";
ZmMsg.TZF_Baku ="(GMT+04:00) Baku, Tbilisi, Yerevan";
ZmMsg.TZF_Kabul ="(GMT+04:30) Kabul";
ZmMsg.TZF_Ekaterinburg ="(GMT+05:00) Ekaterinburg";
ZmMsg.TZF_Islamabad ="(GMT+05:00) Islamabad, Karachi, Tashkent";
ZmMsg.TZF_Chennai ="(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi";
ZmMsg.TZF_Katmandu ="(GMT+05:45) Kathmandu";
ZmMsg.TZF_Almaty ="(GMT+06:00) Almaty, Novosibirsk";
ZmMsg.TZF_Astanda ="(GMT+06:00) Astana, Dhaka";
ZmMsg.TZF_SriJaywardenepura ="(GMT+06:00) Sri Jayawardenepura";
ZmMsg.TZF_Rangoon ="(GMT+06:30) Rangoon";
ZmMsg.TZF_Bangkok ="(GMT+07:00) Bangkok, Hanoi, Jakarta";
ZmMsg.TZF_Krasnoyarsk ="(GMT+07:00) Krasnoyarsk";
ZmMsg.TZF_Beijing ="(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi";
ZmMsg.TZF_Irkutsk ="(GMT+08:00) Irkutsk, Ulaan Bataar";
ZmMsg.TZF_KualaLumpur ="(GMT+08:00) Kuala Lumpur, Singapore";
ZmMsg.TZF_Perth ="(GMT+08:00) Perth";
ZmMsg.TZF_Taipei ="(GMT+08:00) Taipei";
ZmMsg.TZF_Osaka ="(GMT+09:00) Osaka, Sapporo, Tokyo";
ZmMsg.TZF_Seoul ="(GMT+09:00) Seoul";
ZmMsg.TZF_Takutsk ="(GMT+09:00) Yakutsk";
ZmMsg.TZF_Adelaide ="(GMT+09:30) Adelaide";
ZmMsg.TZF_Darwin ="(GMT+09:30) Darwin";
ZmMsg.TZF_Brisbane ="(GMT+10:00) Brisbane";
ZmMsg.TZF_Canberra ="(GMT+10:00) Canberra, Melbourne, Sydney";
ZmMsg.TZF_Guam ="(GMT+10:00) Guam, Port Moresby";
ZmMsg.TZF_Hobart ="(GMT+10:00) Hobart";
ZmMsg.TZF_Vladivostok ="(GMT+10:00) Vladivostok";
ZmMsg.TZF_Magadan ="(GMT+11:00) Magadan, Solomon Is., New Calenodia";
ZmMsg.TZF_Aukland ="(GMT+12:00) Auckland, Wellington";
ZmMsg.TZF_Fiji ="(GMT+12:00) Fiji, Kamchatka, Marshall Is.";
ZmMsg.TZF_Nukualofa ="(GMT+13:00) Nuku'alofa";

// Abbreviated timezone names
ZmMsg.TZA_internationalDateLineWest = "Int'l Date Line West";
ZmMsg.TZA_MidwayIsland = "Midway Island, Samoa";
ZmMsg.TZA_Hawaii = "Hawaii";
ZmMsg.TZA_Alaska = "Alaska";
ZmMsg.TZA_PacificTime = "Pacific Time (US & Canada)";
ZmMsg.TZA_Arizona = "Arizona";
ZmMsg.TZA_Chihuahua = "Chihuahua, La Paz";
ZmMsg.TZA_MountainTime = "Mountain Time (US & Canada)";
ZmMsg.TZA_CentralAmerica = "Central America";
ZmMsg.TZA_CentralTime = "Central Time (US & Canada)";
ZmMsg.TZA_Guadalajara = "Guadalajara, Mexico City";
ZmMsg.TZA_Saskatchewan = "Saskatchewan";
ZmMsg.TZA_Lima = "Bogota, Lima, Quito";
ZmMsg.TZA_Eastern = "Eastern Time (US & Canada)";
ZmMsg.TZA_Indiana = "Indiana (East)";
ZmMsg.TZA_Atlantic = "Atlantic Time (Canada)";
ZmMsg.TZA_Caracas = "Caracas, La Paz";
ZmMsg.TZA_Santiago = "Santiago";
ZmMsg.TZA_Newfoundland = "Newfoundland";
ZmMsg.TZA_Brasilia = "Brasilia";
ZmMsg.TZA_BuenosAires = "Buenos Aires, Georgetown";
ZmMsg.TZA_Greenland = "Greenland";
ZmMsg.TZA_MidAtlanitc = "Mid-Atlantic";
ZmMsg.TZA_Azores = "Azores";
ZmMsg.TZA_CapeVerde = "Cape Verde Is.";
ZmMsg.TZA_Casablanca = "Casablanca, Monrovia";
ZmMsg.TZA_GMT = "GMT: London, Dublin";
ZmMsg.TZA_Amsterdam = "Amsterdam, Berlin";
ZmMsg.TZA_Belgrade = "Belgrade, Prague";
ZmMsg.TZA_Brussels = "Brussels, Paris";
ZmMsg.TZA_Sarajevo = "Sarajevo, Warsaw";
ZmMsg.TZA_WestCentralAfrica = "West Central Africa";
ZmMsg.TZA_Athens = "Athens, Beirut";
ZmMsg.TZA_Budapest = "Bucharest";
ZmMsg.TZA_Cairo = "Cairo";
ZmMsg.TZA_Harare = "Harare, Pretoria";
ZmMsg.TZA_Helsinki = "Helsinki, Kyiv";
ZmMsg.TZA_Jerusalem = "Jerusalem";
ZmMsg.TZA_Baghdad = "Baghdad";
ZmMsg.TZA_Kuwait = "Kuwait, Riyadh";
ZmMsg.TZA_Moscow = "Moscow, St. Petersburg";
ZmMsg.TZA_Nairobi = "Nairobi";
ZmMsg.TZA_Tehran = "Tehran";
ZmMsg.TZA_AbuDhabi = "Abu Dhabi, Muscat";
ZmMsg.TZA_Baku = "Baku, Tbilisi, Yerevan";
ZmMsg.TZA_Kabul = "Kabul";
ZmMsg.TZA_Ekaterinburg = "Ekaterinburg";
ZmMsg.TZA_Islamabad = "Islamabad, Karachi";
ZmMsg.TZA_Chennai = "Chennai, Kolkata";
ZmMsg.TZA_Katmandu = "Kathmandu";
ZmMsg.TZA_Almaty = "Almaty, Novosibirsk";
ZmMsg.TZA_Astanda = "Astana, Dhaka";
ZmMsg.TZA_SriJaywardenepura = "Sri Jayawardenepura";
ZmMsg.TZA_Rangoon = "Rangoon";
ZmMsg.TZA_Bangkok = "Bangkok, Jakarta";
ZmMsg.TZA_Krasnoyarsk = "Krasnoyarsk";
ZmMsg.TZA_Beijing = "Beijing, Hong Kong";
ZmMsg.TZA_Irkutsk = "Irkutsk, Ulaan Bataar";
ZmMsg.TZA_KualaLumpur = "Kuala Lumpur, Singapore";
ZmMsg.TZA_Perth = "Perth";
ZmMsg.TZA_Taipei = "Taipei";
ZmMsg.TZA_Osaka = "Osaka, Tokyo";
ZmMsg.TZA_Seoul = "Seoul";
ZmMsg.TZA_Takutsk = "Yakutsk";
ZmMsg.TZA_Adelaide = "Adelaide";
ZmMsg.TZA_Darwin = "Darwin";
ZmMsg.TZA_Brisbane = "Brisbane";
ZmMsg.TZA_Canberra = "Canberra, Sydney";
ZmMsg.TZA_Guam = "Guam, Port Moresby";
ZmMsg.TZA_Hobart = "Hobart";
ZmMsg.TZA_Vladivostok = "Vladivostok";
ZmMsg.TZA_Magadan = "Magadan, New Calenodia";
ZmMsg.TZA_Aukland = "Auckland, Wellington";
ZmMsg.TZA_Fiji = "Fiji, Marshall Is.";
ZmMsg.TZA_Nukualofa = "Nuku\'alofa";
