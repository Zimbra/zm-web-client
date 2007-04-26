/*
 * Package: IM
 * 
 * Supports: The IM (chat) application
 * 
 * Loaded: When the user goes to the IM application
 */

// Probably need just one of these two
AjxPackage.require("ajax.dwt.core.DwtDragTracker");
AjxPackage.require("ajax.dwt.widgets.DwtResizableWindow");

AjxPackage.require("zimbraMail.im.model.ZmRosterTree");
AjxPackage.require("zimbraMail.im.model.ZmRosterTreeGroup");
AjxPackage.require("zimbraMail.im.model.ZmRosterTreeItem");
AjxPackage.require("zimbraMail.im.model.ZmRoster");
AjxPackage.require("zimbraMail.im.model.ZmRosterItem");
AjxPackage.require("zimbraMail.im.model.ZmRosterItemList");
AjxPackage.require("zimbraMail.im.model.ZmRosterPresence");
AjxPackage.require("zimbraMail.im.model.ZmChat");
AjxPackage.require("zimbraMail.im.model.ZmChatList");
AjxPackage.require("zimbraMail.im.model.ZmChatMessage");
AjxPackage.require("zimbraMail.im.model.ZmAssistantBuddy");

AjxPackage.require("zimbraMail.im.view.ZmChatWindowManager");
AjxPackage.require("zimbraMail.im.view.ZmChatWindow");
AjxPackage.require("zimbraMail.im.view.ZmChatTabs");
AjxPackage.require("zimbraMail.im.view.ZmChatWidget");
AjxPackage.require("zimbraMail.im.view.ZmChatMemberListView");
AjxPackage.require("zimbraMail.im.view.ZmChatBaseView");
AjxPackage.require("zimbraMail.im.view.ZmChatMultiWindowView");
AjxPackage.require("zimbraMail.im.view.ZmNewImDialog");
AjxPackage.require("zimbraMail.im.view.ZmNewRosterItemDialog");

AjxPackage.require("zimbraMail.im.controller.ZmChatListController");
AjxPackage.require("zimbraMail.im.controller.ZmRosterTreeController");
