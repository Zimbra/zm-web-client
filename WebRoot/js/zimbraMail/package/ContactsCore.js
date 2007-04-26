/*
 * Package: ContactsCore
 * 
 * Supports: Loading of contacts and address books
 * 
 * Loaded:
 * 	- When user contacts are loaded during startup
 * 	- If the <refresh> block has address books
 * 	- If a search for contacts returns results
 */
AjxPackage.require("zimbraMail.abook.model.ZmAddrBook");
AjxPackage.require("zimbraMail.abook.model.ZmContact");
AjxPackage.require("zimbraMail.abook.model.ZmContactList");
AjxPackage.require("zimbraMail.abook.view.ZmContactPicker");
AjxPackage.require("zimbraMail.abook.view.ZmOneContactPicker");
