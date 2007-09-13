/*
 * NewWindow, part 2
 * 
 * Special package to support actions in a new window. So far, there is
 * just composing a message and displaying a RFC attachment in a new window.
 * Everything that might be needed for those is in here: HTML editor,
 * contact picker (search, timezone, list view), msg view, attachments, etc.
 * 
 * NOTE: This package is not optimized at all - it contains everythings that
 * might possibly be needed in a new window.
 */
AjxPackage.require("ajax.dwt.keyboard.DwtTabGroupEvent");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyMap");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyMapMgr");
AjxPackage.require("ajax.dwt.keyboard.DwtKeyboardMgr");
AjxPackage.require("ajax.dwt.keyboard.DwtTabGroup");

AjxPackage.require("ajax.dwt.dnd.DwtDropEvent");
AjxPackage.require("ajax.dwt.dnd.DwtDropTarget");

AjxPackage.require("zimbra.csfe.ZmBatchCommand");
AjxPackage.require("zimbra.csfe.ZmCsfeCommand");
AjxPackage.require("zimbra.csfe.ZmCsfeException");
AjxPackage.require("zimbra.csfe.ZmCsfeResult");

AjxPackage.require("zimbraMail.share.model.events.ZmEvent");
AjxPackage.require("zimbraMail.share.model.events.ZmAppEvent");
AjxPackage.require("zimbraMail.share.model.ZmModel");
AjxPackage.require("zimbraMail.share.model.ZmSetting");
AjxPackage.require("zimbraMail.core.ZmAppCtxt");
AjxPackage.require("zimbraMail.core.ZmOperation");
AjxPackage.require("zimbraMail.core.ZmMimeTable");

AjxPackage.require("zimbraMail.share.model.ZmSettings");
AjxPackage.require("zimbraMail.share.model.ZmKeyMap");
AjxPackage.require("zimbraMail.share.model.ZmTimezone");
AjxPackage.require("zimbraMail.share.model.ZmItem");
AjxPackage.require("zimbraMail.share.model.ZmOrganizer");
AjxPackage.require("zimbraMail.share.model.ZmFolder");
AjxPackage.require("zimbraMail.share.model.ZmSearch");
AjxPackage.require("zimbraMail.share.model.ZmSearchResult");
AjxPackage.require("zimbraMail.share.model.ZmTree");
AjxPackage.require("zimbraMail.share.model.ZmFolderTree");
AjxPackage.require("zimbraMail.share.model.ZmList");
AjxPackage.require("zimbraMail.share.model.ZmAccount");
AjxPackage.require("zimbraMail.share.model.ZmZimbraAccount");
AjxPackage.require("zimbraMail.share.model.ZmTimezone");

AjxPackage.require("zimbraMail.core.ZmApp");

AjxPackage.require("zimbraMail.share.view.ZmToolBar");
AjxPackage.require("zimbraMail.share.view.ZmButtonToolBar");
AjxPackage.require("zimbraMail.share.view.ZmPopupMenu");
AjxPackage.require("zimbraMail.share.view.ZmActionMenu");
AjxPackage.require("zimbraMail.share.view.ZmAutocompleteListView");
AjxPackage.require("zimbraMail.share.view.ZmSearchToolBar");
AjxPackage.require("zimbraMail.share.view.ZmStatusView");

AjxPackage.require("zimbraMail.share.view.dialog.ZmAttachDialog");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmHtmlEditor");

AjxPackage.require("zimbraMail.share.controller.ZmController");
AjxPackage.require("zimbraMail.share.controller.ZmListController");

AjxPackage.require("zimbraMail.core.ZmAppViewMgr");
AjxPackage.require("zimbraMail.core.ZmRequestMgr");
AjxPackage.require("zimbraMail.core.ZmZimbraMail");
AjxPackage.require("zimbraMail.core.ZmNewWindow");

AjxPackage.require("zimbraMail.prefs.ZmPreferencesApp");
AjxPackage.require("zimbraMail.mail.ZmMailApp");
AjxPackage.require("zimbraMail.abook.ZmContactsApp");

AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailList");
AjxPackage.require("zimbraMail.mail.view.ZmComposeView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.controller.ZmComposeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
