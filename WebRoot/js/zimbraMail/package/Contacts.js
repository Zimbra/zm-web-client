/*
 * Package: Contacts
 * 
 * Supports: The Contacts (address book) application
 * 
 * Loaded:
 * 	- When the user goes to the Contacts application
 * 	- If the user creates a new contact
 * 	- If the user adds a participant or email address to their address book
 */
AjxPackage.require("zimbraMail.abook.view.ZmContactView");
AjxPackage.require("zimbraMail.abook.view.ZmGroupView");
AjxPackage.require("zimbraMail.abook.view.ZmContactsBaseView");
AjxPackage.require("zimbraMail.abook.view.ZmContactCardsView");
AjxPackage.require("zimbraMail.abook.view.ZmContactSplitView");
AjxPackage.require("zimbraMail.abook.view.ZmNewAddrBookDialog");
AjxPackage.require("zimbraMail.abook.view.ZmContactAssistant");

AjxPackage.require("zimbraMail.abook.controller.ZmContactListController");
AjxPackage.require("zimbraMail.abook.controller.ZmContactController");
AjxPackage.require("zimbraMail.abook.controller.ZmAddrBookTreeController");
