/*
 * Package: NotebookCore
 * 
 * Supports: Loading of a notebook
 * 
 * Loaded:
 * 	- When a notebook object arrives in a <refresh> block
 * 	- When a search for pages/documents returns data
 */
AjxPackage.require("zimbraMail.notebook.model.ZmNotebook");
AjxPackage.require("zimbraMail.notebook.model.ZmNotebookItem");
AjxPackage.require("zimbraMail.notebook.model.ZmDocument");
AjxPackage.require("zimbraMail.notebook.model.ZmPage");
AjxPackage.require("zimbraMail.notebook.model.ZmPageList");
AjxPackage.require("zimbraMail.notebook.model.ZmNotebookCache");
