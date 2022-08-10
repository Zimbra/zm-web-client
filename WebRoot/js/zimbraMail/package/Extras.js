/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: Extras
 * 
 * Supports: Miscellaneous rarely-used functionality
 *  - ZmClientCmdHandler: handles special search cmds
 * 	- ZmChooseFolderDialog: export contacts, tie identity to folder,
 *							pop mail to folder, move mail or folder,
 *							create a filter, create a folder shortcut
 * 	- ZmRenameFolderDialog: rename a folder
 * 	- ZmRenameTagDialog: rename a tag
 * 	- ZmPickTagDialog: create a filter, create a tag shortcut
 * 	- ZmSpellChecker: spell check a composed message
 */

AjxPackage.require("ajax.util.AjxDlgUtil");

AjxPackage.require("zimbraMail.core.ZmClientCmdHandler");

AjxPackage.require("zimbraMail.share.ZmUploadManager");
AjxPackage.require("zimbraMail.share.view.dialog.ZmChooseFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmChooseAccountDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDumpsterDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameFolderDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmRenameTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmPasswordUpdateDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmPickTagDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmUploadDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmUploadConflictDialog");
AjxPackage.require("zimbraMail.share.view.dialog.ZmDebugLogDialog");

AjxPackage.require("zimbraMail.share.view.htmlEditor.ZmSpellChecker");
