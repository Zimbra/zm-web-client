/*
 * Package: Extras
 * 
 * Supports: Miscellaneous rarely-used functionality
 * 	- DwtSpinner: used by ZmTableEditor
 * 	- ZmPrintView: print an item or a list of items
 * 	- ZmChangePasswordDialog: change login password
 * 	- ZmChooseFolderDialog: export contacts, tie identity to folder,
 *							pop mail to folder
 * 	- ZmRenameFolderDialog: rename a folder
 * 	- ZmRenameTagDialog: rename a tag
 * 	- ZmPickTagDialog: create a filter, create a tag shortcut
 * 	- ZmMoveToDialog: move mail, create a filter, create a folder shortcut
 * 	- ZmTableEditor: edit cell or table properties in HTML table
 * 	- ZmSpellChecker: spell check a composed message
 */
AjxPackage.require("ajax.dwt.widgets.DwtSpinner");

AjxPackage.require("ajax.util.AjxDlgUtil");

AjxPackage.require("zimbraMail.share.view.ZmPrintView");

AjxPackage.require("zimbraMail.share.view.dialog.ZmChangePasswordDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmChooseFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmPickTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmMoveToDialog");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmTableEditor");
AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmSpellChecker");
