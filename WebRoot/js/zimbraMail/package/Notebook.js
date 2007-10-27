/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/*
 * Package: Notebook
 * 
 * Supports: The Notebook (wiki) application
 * 
 * Loaded:
 * 	- When the user goes to the Notebook application
 * 	- When the user creates a new notebook or page
 */
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");
AjxPackage.require("zimbraMail.notebook.view.conv.ZmWikiConverter");

AjxPackage.require("zimbraMail.notebook.view.ZmNotebookPageView");
AjxPackage.require("zimbraMail.notebook.view.ZmNotebookFileView");
AjxPackage.require("zimbraMail.notebook.view.ZmPageEditView");
AjxPackage.require("zimbraMail.notebook.view.ZmFileListView");

AjxPackage.require("zimbraMail.notebook.view.wiklet.ZmWiklet");
AjxPackage.require("zimbraMail.notebook.view.wiklet.ZmWikletContext");
AjxPackage.require("zimbraMail.notebook.view.wiklet.ZmWikletProcessor");

AjxPackage.require("zimbraMail.notebook.view.ZmNewNotebookDialog");
AjxPackage.require("zimbraMail.notebook.view.ZmUploadDialog");
AjxPackage.require("zimbraMail.notebook.view.ZmUploadConflictDialog");
AjxPackage.require("zimbraMail.notebook.view.ZmPageConflictDialog");
AjxPackage.require("zimbraMail.notebook.view.ZmNotebookObjectHandler");

AjxPackage.require("zimbraMail.notebook.controller.ZmNotebookController");
AjxPackage.require("zimbraMail.notebook.controller.ZmNotebookPageController");
AjxPackage.require("zimbraMail.notebook.controller.ZmNotebookFileController");
AjxPackage.require("zimbraMail.notebook.controller.ZmPageEditController");
AjxPackage.require("zimbraMail.notebook.controller.ZmNotebookTreeController");
