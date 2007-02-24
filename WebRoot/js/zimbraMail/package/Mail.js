/*
 * Package: Mail
 * 
 * Supports: The Mail application
 * 
 * Loaded:
 * 	- When the user goes to the Mail application (typically on startup)
 * 	- When composing a message
 */
AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmConv");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailList");

AjxPackage.require("zimbraMail.mail.view.object.ZmAddressObjectHandler");
AjxPackage.require("zimbraMail.mail.view.object.ZmEmoticonObjectHandler");
AjxPackage.require("zimbraMail.mail.view.object.ZmImageAttachmentObjectHandler");

AjxPackage.require("zimbraMail.mail.view.ZmMailListView");
AjxPackage.require("zimbraMail.mail.view.ZmDoublePaneView");
AjxPackage.require("zimbraMail.mail.view.ZmAttachmentIconView");
AjxPackage.require("zimbraMail.mail.view.ZmAttachmentListView");
AjxPackage.require("zimbraMail.mail.view.ZmAttachmentToolBar");
AjxPackage.require("zimbraMail.mail.view.ZmComposeView");
AjxPackage.require("zimbraMail.mail.view.ZmConvView");
AjxPackage.require("zimbraMail.mail.view.ZmTradView");
AjxPackage.require("zimbraMail.mail.view.ZmConvListView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgListView");
AjxPackage.require("zimbraMail.mail.view.ZmMailAssistant");

AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmDoublePaneController");
AjxPackage.require("zimbraMail.mail.controller.ZmAttachmentListController");
AjxPackage.require("zimbraMail.mail.controller.ZmComposeController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvListController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvController");
AjxPackage.require("zimbraMail.mail.controller.ZmTradController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
