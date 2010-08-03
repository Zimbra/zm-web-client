/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: Extras
 * 
 * Supports: Miscellaneous rarely-used functionality
 * 	- DwtSpinner: used by ZmTableEditor
 *  - ZmClientCmdHandler: handles special search cmds
 * 	- ZmChooseFolderDialog: export contacts, tie identity to folder,
 *							pop mail to folder, move mail or folder,
 *							create a filter, create a folder shortcut
 * 	- ZmRenameFolderDialog: rename a folder
 * 	- ZmRenameTagDialog: rename a tag
 * 	- ZmPickTagDialog: create a filter, create a tag shortcut
 * 	- ZmTableEditor: edit cell or table properties in HTML table
 * 	- ZmSpellChecker: spell check a composed message
 */
AjxPackage.require("ajax.dwt.widgets.DwtSpinner");

AjxPackage.require("ajax.util.AjxDlgUtil");

AjxPackage.require("zimbraMail.core.ZmClientCmdHandler");

AjxPackage.require("zimbraMail.share.view.dialog.ZmDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmChooseFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmChooseAccountDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmPickTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmUploadDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDebugLogDialog");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmTableEditor");
AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmSpellChecker");
