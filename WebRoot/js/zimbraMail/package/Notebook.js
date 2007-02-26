/*
 * Package: Notebook
 * 
 * Supports: The Notebook (wiki) application
 * 
 * Loaded:
 * 	- When the user goes to the Notebook application
 * 	- When the user creates a new notebook or page
 */
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
