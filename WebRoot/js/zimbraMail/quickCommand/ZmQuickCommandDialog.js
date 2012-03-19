/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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

/**
 *
 * @author Prashant Jain
 *
 *
 * @extends
 */

ZmQuickCommandDialog =
function(parent, className, title) {
    DwtDialog.call(this, {parent:parent, className:className, title:title, id:Dwt.getNextId("ZmQuickCommandDialog") });

    this._addActionHandlerClosure	       = this._addActionHandler.bind(this);
    this._removeActionHandlerClosure       = this._removeActionHandler.bind(this);
    this._itemTypeChangeHandlerClosure     = this._itemTypeChangeHandler.bind(this);
    this._actionTypeChangeHandlerClosure   = this._actionTypeChangeHandler.bind(this);
    this._browseFolderHandlerClosure       = this._browseFolderHandler.bind(this);
    this._browseTagHandlerClosure          = this._browseTagHandler.bind(this);
    this._okButtonClickHandlerClosure      = this._okButtonClickHandler.bind(this);
    this._cancelButtonClickHandlerClosure  = this._cancelButtonClickHandler.bind(this);
    this._prePopDownClosure                = this._prePopDown.bind(this);

    this.setButtonListener(DwtDialog.OK_BUTTON, this._okButtonClickHandlerClosure);
    this.setButtonListener(DwtDialog.CANCEL_BUTTON, this._cancelButtonClickHandlerClosure);

    this._createChildren();
};

ZmQuickCommandDialog.prototype = new DwtDialog;
ZmQuickCommandDialog.prototype.constructor = ZmQuickCommandDialog;

ZmQuickCommandDialog.prototype.toString =
function() {
    return "ZmQuickCommandDialog";
};

ZmQuickCommandDialog.prototype._createChildren =
function() {
	var id                     = this._htmlElId;
	this._nameInputId          = id + "_name";
	this._activeCheckboxId     = id + "_active";
	this._actionsTableId       = id + "_actions";
    this._descriptionInputId   = id + "_description";
    this._itemTypeContainerId  = id + "_itemTypeContainer";
    this._addButtonContainerId = id + "_addButtonContainer";
    this._actionsTbodyId       = id + "_actionsTbody";

	// content html
	var contentHTML = AjxTemplate.expand("prefs.Pages#QuickCommandDialog", id);
    this.setContent(contentHTML);

    //create the action type select box
    this._itemTypeSelect = new DwtSelect({parent:this, parentElement:this._itemTypeContainerId});
    var selectedItemType;
    if (this.quickCommand) {
        selectedItemType = this.quickCommand.itemType;
    } else {
        selectedItemType = ZmQuickCommand.ITEM_MSG;
    }
    for (var i = 0; i < ZmQuickCommand.itemTypes.length; i++) {
        var itemType = ZmQuickCommand.itemTypes[i];
        var selected = itemType.itemType == selectedItemType;
        var o = new DwtSelectOption(itemType.id, selected, itemType.label);
        this._itemTypeSelect.addOption(o);
    }
    this._itemTypeSelect.addChangeListener(this._itemTypeChangeHandlerClosure);

    //create the Add button
    var button = new DwtButton({parent:this, parentElement:this._addButtonContainerId});
    button.setImage("Plus");
    button.addSelectionListener(this._addActionHandlerClosure);

    this._actionsContainer = document.getElementById(this._actionsTbodyId);
    this._rowIdToRowDetailsMap = {};
};

ZmQuickCommandDialog.prototype.popup =
function(quickCommand, postCRUDCallback) {
    this.setTitle(quickCommand ? ZmMsg.quickCommandEdit : ZmMsg.quickCommandAdd);
    this._parentPostCRUDCallback = postCRUDCallback;
    this._removeAllActionsFromUI();
    
    this._editMode = !!quickCommand;
    if (quickCommand) {
        this.originalQuickCommand = quickCommand;
        this.quickCommand = quickCommand.clone();
    } else {
        this.originalQuickCommand = null;
        var newId = ZmQuickCommands.getInstance().getMaxQuickCommandId() + 1;
        this.quickCommand = ZmQuickCommand.getDummyQuickCommand(newId, ZmQuickCommand[ZmId.ITEM_MSG]);
    }

    //set the quick command data on the ui components
	var nameField = Dwt.byId(this._nameInputId);
	nameField.value = this.quickCommand.name || "";

    var descriptionField = Dwt.byId(this._descriptionInputId);
	descriptionField.value = this.quickCommand.description || "";

	var activeField = Dwt.byId(this._activeCheckboxId);
	activeField.checked = this.quickCommand.isActive;

    var itemTypeId = this.quickCommand.itemType ? this.quickCommand.itemType.id : null;
    this._itemTypeSelect.setSelectedValue(itemTypeId);

	DwtDialog.prototype.popup.call(this);

    var len = this.quickCommand.actionsCount();
    for (var i = 0; i < len; i++) {
        var quickCommandAction = this.quickCommand.actions[i];
        this._addActionToUI(quickCommandAction);
    }

    nameField.focus();
};

ZmQuickCommandDialog.prototype._okButtonClickHandler = function(evt) {
    this._getUIData();

    var originalJSON = "";
    if (this.originalQuickCommand) {
        originalJSON = this.originalQuickCommand.toJSON();
    }
    var modifiedJSON = this.quickCommand.toJSON();

    if (originalJSON != modifiedJSON) {
        var errors = this.quickCommand.validate();
        var isValid = errors.length == 0;
        if (isValid) {
            var crud = this._editMode ? ZmId.OP_EDIT : ZmId.OP_ADD;
            ZmQuickCommands.getInstance().crudQuickCommand(this.quickCommand, crud, this._prePopDownClosure);
        } else {
            var msg = errors.join("<BR>");
            var msgDialog = appCtxt.getMsgDialog();
            msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
            msgDialog.popup();
        }
    } else {
        this._prePopDown();
    }
};

ZmQuickCommandDialog.prototype._prePopDown = function(result) {
    if (result && result.isException()) {
        //PRAJAIN: pending show error message to user
    } else {
        if (this._parentPostCRUDCallback) {
            this._parentPostCRUDCallback(result);
        }
        this.popdown();
    }
};

ZmQuickCommandDialog.prototype._cancelButtonClickHandler = function(evt) {
    this.popdown();
};

ZmQuickCommandDialog.prototype._itemTypeChangeHandler = function(evt) {
	var newItemTypeId = evt._args.newValue;
	var oldItemTypeId = evt._args.oldValue;
    if (newItemTypeId == oldItemTypeId) {return;}

    //first remove all actions and ui rows
    this.quickCommand.removeAllActions();
    this._removeAllActionsFromUI();

    //now add a default action
    var newItemType = ZmQuickCommand.getSupportedItemTypeByItemTypeId(newItemTypeId);
    this.quickCommand.itemType = newItemType;
    var newId = this.quickCommand.getMaxQuickCommandActionId() + 1;
    var dummyAction = ZmQuickCommandAction.getDummyQuickCommandAction(newId, newItemType.actions[0]);
    this.quickCommand.addAction(dummyAction);
    this._addActionToUI(dummyAction);
};

ZmQuickCommandDialog.prototype._actionTypeChangeHandler = function(evt) {
	var newActionTypeId = evt._args.newValue;
	var oldActionTypeId = evt._args.oldValue;
    if (newActionTypeId == oldActionTypeId) {return;}

    var rowId = evt._args.selectObj.getData(ZmQuickCommandDialog.ROW_ID);
    var newActionType = ZmQuickCommandAction.getActionTypeByActionTypeId(newActionTypeId);
    this._createValueTypeControl(newActionType, null, rowId);
};

ZmQuickCommandDialog.prototype._addActionHandler =
function(evt) {
    var newId = this.quickCommand.getMaxQuickCommandActionId() + 1;
	var action = ZmQuickCommandAction.getDummyQuickCommandAction(newId, this.quickCommand.itemType.actions[0]);
    this.quickCommand.addAction(action);
    this._addActionToUI(action);
};

ZmQuickCommandDialog.prototype._removeActionHandler =
function(evt) {
    if (this.quickCommand.actionsCount() < 2) {return;}

    var rowId = this.getRowIdFromButtonEvent(evt);
    var rowDetails = this._rowIdToRowDetailsMap[rowId];
    var action = rowDetails.data;
    this.quickCommand.removeAction(action);
    this._removeActionFromUI(rowId);
};

ZmQuickCommandDialog.prototype._removeAllActionsFromUI = function() {
    for (var rowId in this._rowIdToRowDetailsMap) {
        this._removeActionFromUI(rowId);
    }
};

ZmQuickCommandDialog.prototype._removeActionFromUI = function(rowId) {
    var rowDetails = this._rowIdToRowDetailsMap[rowId];

    this._disposeRow(rowId);
    delete this._rowIdToRowDetailsMap[rowId];
};

ZmQuickCommandDialog.prototype._addActionToUI = function(quickCommandAction) {
    var rowId = Dwt.getNextId("ZmQuickCommandRow_");
    var rowDetails = {data:quickCommandAction};
    this._rowIdToRowDetailsMap[rowId] = rowDetails;

    //create the row and its children
	var rowHTMLString = AjxTemplate.expand("prefs.Pages#QuickCommandDialogActionRow", rowId);
    var rowElement = Dwt.parseHtmlFragment(rowHTMLString, true);
    this._actionsContainer.appendChild(rowElement);

	var idTypeContainer    = rowId + "_typeContainer";
	rowDetails.idValueContainer   = rowId + "_valueContainer";
	var idActiveContainer  = rowId + "_activeContainer";
	var idButtonsContainer = rowId + "_buttonsContainer";

    //create the active Checkbox
    var activeCheckbox = new DwtCheckbox({parent:this, checked:true, parentElement:idActiveContainer});
	activeCheckbox.setSelected(quickCommandAction.isActive);
    rowDetails.activeCheckbox = activeCheckbox;
    activeCheckbox.setData(ZmQuickCommandDialog.ROW_ID, rowId);


    //create the action type dropDown
    var actionTypeSelect = new DwtSelect({parent:this, parentElement:idTypeContainer, id: idTypeContainer});
    var availableActionTypes = this.quickCommand.itemType.actions;
    if (availableActionTypes) {
        for (var i = 0; i < availableActionTypes.length; i++) {
            var availableActionType = availableActionTypes[i];
            var selected = quickCommandAction.type.id == availableActionType.id;
            var label = availableActionType.label ? availableActionType.label : "";
            var o = new DwtSelectOption(availableActionType.id, selected, availableActionType.label);
            o.setItem(availableActionType);
            actionTypeSelect.addOption(o);
        }
    }
    actionTypeSelect.addChangeListener(this._actionTypeChangeHandlerClosure);
    rowDetails.actionTypeSelect = actionTypeSelect;
    actionTypeSelect.setData(ZmQuickCommandDialog.ROW_ID, rowId);

    
    //create the remove button
    var removeButton = new DwtButton({parent:this, parentElement:idButtonsContainer});
    removeButton.setImage("Minus");
    removeButton.addSelectionListener(this._removeActionHandlerClosure);
    rowDetails.removeButton = removeButton;
    removeButton.setData(ZmQuickCommandDialog.ROW_ID, rowId);

    //create the value type control
    this._createValueTypeControl(quickCommandAction.type, quickCommandAction.value, rowId);
};

ZmQuickCommandDialog.prototype._createValueTypeControl = function(actionType, actionValue, rowId) {
    this._disposeValueTypeControls(rowId);
    var rowDetails = this._rowIdToRowDetailsMap[rowId];

    //now create the required control.
    if (actionType) {
        var valueType = actionType.valueType;
        var controlType = valueType.param;
        var organizer;
        if (controlType == ZmQuickCommandAction.TYPE_FOLDER_PICKER) {
            var folderTree = appCtxt.getFolderTree();
            if (folderTree && actionValue) {
                organizer = folderTree.getById(actionValue, true);
            }
            var folderValue = organizer ? AjxStringUtil.htmlEncode(organizer.getName(false, null, true)) : "";
            var folderText = folderValue ? folderValue : ZmMsg.browse;

            var valueControlFolderPicker = new DwtButton({parent:this, parentElement:rowDetails.idValueContainer});
            valueControlFolderPicker.addSelectionListener(this._browseFolderHandlerClosure);
            valueControlFolderPicker.setText(folderText);
            valueControlFolderPicker.setData(ZmFilterRuleDialog.DATA, actionValue);
            rowDetails.valueControlFolderPicker = valueControlFolderPicker;
            valueControlFolderPicker.setData(ZmQuickCommandDialog.ROW_ID, rowId);

        } else if (controlType == ZmQuickCommandAction.TYPE_TAG_PICKER) {
            var tagTree = appCtxt.getTagTree();
            if (tagTree && actionValue) {
                organizer = tagTree.getById(actionValue);
            }
            var tagValue = organizer ? AjxStringUtil.htmlEncode(organizer.getName(false, null, true)) : "";
            var tagText = tagValue ? tagValue : ZmMsg.browse;
            var id = rowId + "_" + ZmQuickCommandAction.TYPE_TAG_PICKER;

            var valueControlTagPicker = new DwtButton({parent:this, parentElement:rowDetails.idValueContainer, id: id});
            valueControlTagPicker.addSelectionListener(this._browseTagHandlerClosure);
            valueControlTagPicker.setText(tagText);
            valueControlTagPicker.setData(ZmFilterRuleDialog.DATA, actionValue);
            rowDetails.valueControlTagPicker = valueControlTagPicker;
            valueControlTagPicker.setData(ZmQuickCommandDialog.ROW_ID, rowId);

        } else if (controlType == ZmQuickCommandAction.TYPE_SELECT) {
            var id = rowId + "_" + actionType.label + "_" +  ZmQuickCommandAction.TYPE_SELECT;
            var valueControlSelect = new DwtSelect({parent:this, parentElement:rowDetails.idValueContainer, id: id});

            var options = valueType.pOptions;
            for (var i = 0; i < options.length; i++) {
                var o = options[i];
                var value = o.value;
                var label = o.label;
                var selected = actionValue == value;
                valueControlSelect.addOption(new DwtSelectOptionData(value, label, selected));
            }
            rowDetails.valueControlSelect = valueControlSelect;
            valueControlSelect.setData(ZmQuickCommandDialog.ROW_ID, rowId);

        } else if (controlType == ZmQuickCommandAction.TYPE_INPUT) {
            var valueControlTextInput = new DwtInputField({parent:this, type:DwtInputField.STRING, initialValue:actionValue, parentElement:rowDetails.idValueContainer});
            rowDetails.valueControlTextInput = valueControlTextInput;
            valueControlTextInput.setData(ZmQuickCommandDialog.ROW_ID, rowId);
        }
    }

    return null;
};

ZmQuickCommandDialog.prototype._disposeRow = function(rowId) {
    var rowDetails = this._rowIdToRowDetailsMap[rowId];

    this._disposeValueTypeControls(rowId);

    if (rowDetails.activeCheckbox) {
        rowDetails.activeCheckbox.dispose();
        delete rowDetails.activeCheckbox;
    }

    if (rowDetails.actionTypeSelect) {
        var opt = rowDetails.actionTypeSelect.getOptions() && rowDetails.actionTypeSelect.getOptions().get(0);
        if (opt && opt.getItem().parent){
            var menu = opt.getItem().parent;
            menu.dispose();
            delete menu;
            menu = null;
        }
        rowDetails.actionTypeSelect.clearOptions();
        rowDetails.actionTypeSelect.clearContent();
        rowDetails.actionTypeSelect.dispose();
        delete rowDetails.actionTypeSelect;
    }

    if (rowDetails.removeButton) {
        rowDetails.removeButton.dispose();
        delete rowDetails.removeButton;
    }

    var rowElement = document.getElementById(rowId);
    this._actionsContainer.removeChild(rowElement);    

};

ZmQuickCommandDialog.prototype._disposeValueTypeControls = function(rowId) {
    var rowDetails = this._rowIdToRowDetailsMap[rowId];

    if (rowDetails.valueControlFolderPicker) {
        rowDetails.valueControlFolderPicker.dispose();
        delete rowDetails.valueControlFolderPicker;
    }

    if (rowDetails.valueControlTextInput) {
        rowDetails.valueControlTextInput.dispose();
        delete rowDetails.valueControlTextInput;
    }

    if (rowDetails.valueControlTagPicker) {
        rowDetails.valueControlTagPicker.dispose();
        delete rowDetails.valueControlTagPicker;
    }

    if (rowDetails.valueControlSelect) {
        rowDetails.valueControlSelect.dispose();
        delete rowDetails.valueControlSelect;
    }


    var valueContainer = document.getElementById(rowDetails.idValueContainer);
    if (valueContainer) {
        while (valueContainer.hasChildNodes()) {
          valueContainer.removeChild(valueContainer.firstChild);
        }
    }
};

ZmQuickCommandDialog.prototype.popdown =
function() {
	this._removeAllActionsFromUI();
    this.originalQuickCommand = null;
    this.quickCommand = null;
    this._parentPostCRUDCallback = null;
	DwtDialog.prototype.popdown.call(this);
};

ZmQuickCommandDialog.prototype._browseFolderHandler =
function(evt) {
    var rowId = this.getRowIdFromButtonEvent(evt);
	var dialog = appCtxt.getChooseFolderDialog();
    var overviewId = dialog.getOverviewId(ZmApp.MAIL);
	if (appCtxt.multiAccounts) {
		overviewId = [overviewId, "-", appCtxt.getActiveAccount().name, this.toString()].join("");
	}

	dialog.reset();
	dialog.setTitle(ZmMsg.chooseFolder);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseFolderOKHandler, this, [rowId, dialog]);
	dialog.popup({overviewId:overviewId, appName:ZmApp.MAIL, forceSingle:true});
};

ZmQuickCommandDialog.prototype._browseFolderOKHandler =
function(rowId, dialog, organizer) {
    var rowDetails = this._rowIdToRowDetailsMap[rowId];
    
	if (organizer) {
		if (organizer.nId == ZmFolder.ID_ROOT) {return;}

        rowDetails.valueControlFolderPicker.setText(AjxStringUtil.htmlEncode(organizer.getName(false, null, true)));
        //var value = organizer.getPath(false, false, null, true, true);
        var value = organizer.id;
        rowDetails.valueControlFolderPicker.setData(ZmFilterRuleDialog.DATA, value);
	}
	dialog.popdown();
};

ZmQuickCommandDialog.prototype._browseTagHandler =
function(evt) {
    var rowId = this.getRowIdFromButtonEvent(evt);
	var dialog = appCtxt.getPickTagDialog();
    var overviewId;
	if (appCtxt.multiAccounts) {
		overviewId = [overviewId, "-", appCtxt.getActiveAccount().name, this.toString()].join("");
	}

	dialog.reset();
	dialog.setTitle(ZmMsg.chooseTag);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseTagOKHandler, this, [rowId, dialog]);
	dialog.popup({overviewId:overviewId, appName:ZmApp.MAIL, forceSingle:true});
};

ZmQuickCommandDialog.prototype._browseTagOKHandler =
function(rowId, dialog, organizer) {
    var rowDetails = this._rowIdToRowDetailsMap[rowId];

	if (organizer) {
        rowDetails.valueControlTagPicker.setText(AjxStringUtil.htmlEncode(organizer.getName(false, null, true)));
        //var value = organizer.getName(false, null, true);
        var value = organizer.id;
        rowDetails.valueControlTagPicker.setData(ZmFilterRuleDialog.DATA, value);
	}
	dialog.popdown();
};

ZmQuickCommandDialog.prototype.getRowIdFromButtonEvent = function(evt) {
    if (!evt || !evt.item) {return null;}
    var button = evt.item;
    var rowId = button.getData(ZmQuickCommandDialog.ROW_ID);
    return rowId;
};

ZmQuickCommandDialog.prototype._getUIData = function() {
	var nameField = Dwt.byId(this._nameInputId);
	var activeField = Dwt.byId(this._activeCheckboxId);
    var descriptionField = Dwt.byId(this._descriptionInputId);
    var quickCommand = this.quickCommand;
    
    quickCommand.name        = nameField.value;
    quickCommand.description = descriptionField.value;
    var itemTypeId           = this._itemTypeSelect.getValue();
	quickCommand.type        = ZmQuickCommand.getSupportedItemTypeByItemTypeId(itemTypeId);
    quickCommand.isActive    = activeField.checked;

    if (quickCommand.type) {
        for (var rowId in this._rowIdToRowDetailsMap) {
            var rowDetails = this._rowIdToRowDetailsMap[rowId];
            var action = rowDetails.data;

            var actionTypeId = rowDetails.actionTypeSelect.getValue();
            action.type = ZmQuickCommandAction.getActionTypeByActionTypeId(actionTypeId);
            action.isActive = rowDetails.activeCheckbox.isSelected();

            var value = null;
            var controlType = action.type.valueType.param;
            if (controlType == ZmQuickCommandAction.TYPE_FOLDER_PICKER) {
                value = rowDetails.valueControlFolderPicker.getData(ZmFilterRuleDialog.DATA);

            } else if (controlType == ZmQuickCommandAction.TYPE_INPUT) {
                value = rowDetails.valueControlTextInput.getValue();

            } else if (controlType == ZmQuickCommandAction.TYPE_TAG_PICKER) {
                value = rowDetails.valueControlTagPicker.getData(ZmFilterRuleDialog.DATA);

            } else if (controlType == ZmQuickCommandAction.TYPE_SELECT) {
                value = rowDetails.valueControlSelect.getValue();
            }
            action.value = value;
        }
    }
};


//static members
ZmQuickCommandDialog.getInstance = function() {
    if (!ZmQuickCommandDialog.INSTANCE) {
        //reuse filter dialog styles.
        ZmQuickCommandDialog.INSTANCE = new ZmQuickCommandDialog(appCtxt.getShell(), "ZmFilterRuleDialog", "");
    }
    return ZmQuickCommandDialog.INSTANCE;
};

ZmQuickCommandDialog.ROW_ID = "_rowid_";
//-----------------------------------------------------------------------------
