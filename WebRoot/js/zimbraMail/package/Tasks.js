/*
 * Package: Tasks
 * 
 * Supports: The Tasks application
 * 
 * Loaded: When the user goes to the Tasks application
 */
AjxPackage.require("ajax.dwt.widgets.DwtListEditView");

// base class for ZmApptView
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");

AjxPackage.require("zimbraMail.calendar.model.ZmRecurrence");
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");

AjxPackage.require("zimbraMail.calendar.view.ZmApptRecurDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptViewHelper");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemEditView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");

AjxPackage.require("zimbraMail.tasks.view.ZmTaskEditView");
AjxPackage.require("zimbraMail.tasks.view.ZmNewTaskFolderDialog");

AjxPackage.require("zimbraMail.tasks.controller.ZmTaskController");
AjxPackage.require("zimbraMail.tasks.controller.ZmTaskTreeController");
