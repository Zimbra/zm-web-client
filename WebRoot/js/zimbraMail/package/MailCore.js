/*
 * Package: MailCore
 * 
 * Supports: The Mail application msg and conv list views
 * 
 * Loaded:
 * 	- When the user goes to the Mail application (typically on startup)
 */
AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmConv");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailList");

AjxPackage.require("zimbraMail.mail.view.object.ZmImageAttachmentObjectHandler");

AjxPackage.require("zimbraMail.mail.view.ZmMailListView");
AjxPackage.require("zimbraMail.mail.view.ZmDoublePaneView");
AjxPackage.require("zimbraMail.mail.view.ZmTradView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgListView");
AjxPackage.require("zimbraMail.mail.view.ZmConvListView");

AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmDoublePaneController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvListController");
AjxPackage.require("zimbraMail.mail.controller.ZmTradController");

AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.model.ZmIdentityCollection");
AjxPackage.require("zimbraMail.mail.model.ZmDataSource");
AjxPackage.require("zimbraMail.mail.model.ZmDataSourceCollection");
AjxPackage.require("zimbraMail.mail.model.ZmPopAccount");
AjxPackage.require("zimbraMail.mail.model.ZmImapAccount");
AjxPackage.require("zimbraMail.mail.model.ZmSignature");
AjxPackage.require("zimbraMail.mail.model.ZmSignatureCollection");
