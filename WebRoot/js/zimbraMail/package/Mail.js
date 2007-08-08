/*
 * Package: Mail
 * 
 * Supports: The Mail application
 * 
 * Loaded:
 * 	- When composing a message
 *  - To attach a file
 *  - When viewing a single msg or conv
 */
AjxPackage.require("zimbraMail.mail.view.ZmComposeView");
AjxPackage.require("zimbraMail.mail.view.ZmConvView");
AjxPackage.require("zimbraMail.mail.view.ZmMailAssistant");

AjxPackage.require("zimbraMail.mail.controller.ZmComposeController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
AjxPackage.require("zimbraMail.mail.controller.ZmConvController");
