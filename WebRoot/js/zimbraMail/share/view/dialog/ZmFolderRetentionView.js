/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

// Creates a folder retention view for the folder dialog
ZmFolderRetentionView = function(dialog, parent) {
    if (arguments.length == 0) return;
    ZmFolderDialogTabView.call(this, parent);

    this._dialog = dialog;
    this._initialized = false;
	// Make sure mouse down clicks propagate to the select controls
	this._propagateEvent[DwtEvent.ONMOUSEDOWN] = true;
};

ZmFolderRetentionView.prototype = new ZmFolderDialogTabView;
ZmFolderRetentionView.prototype.constructor = ZmFolderRetentionView;

// Data to populate and process the custom units and values
ZmFolderRetentionView._CustomUnitsToDays = { year: 366, month:31, week:7, day:1};
ZmFolderRetentionView._CustomUnits = [
    { id:"day",   label: ZmMsg.days.toLowerCase(),   days: ZmFolderRetentionView._CustomUnitsToDays.day},
    { id:"week",  label: ZmMsg.weeks.toLowerCase(),  days: ZmFolderRetentionView._CustomUnitsToDays.week},
    { id:"month", label: ZmMsg.months.toLowerCase(), days: ZmFolderRetentionView._CustomUnitsToDays.month},
    { id:"year",  label: ZmMsg.years.toLowerCase(),  days: ZmFolderRetentionView._CustomUnitsToDays.year}];



ZmFolderRetentionView.prototype.toString =
function() {
	return "ZmFolderRetentionView";
};

ZmFolderRetentionView.prototype.getTitle =
function() {
    return ZmMsg.folderTabRetention;
}

ZmFolderRetentionView.prototype.showMe =
function() {
	DwtTabViewPage.prototype.showMe.call(this);
    this._dialog.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, false);

	this.setSize(Dwt.DEFAULT, "200");

};

ZmFolderRetentionView.prototype._handleFolderChange =
function() {
    // Read the policies from the server, and add 'Custom'
    if (this._initialized) {
        this._dataBindComponents(this._organizer, ZmOrganizer.RETENTION_KEEP);
        this._dataBindComponents(this._organizer, ZmOrganizer.RETENTION_PURGE);
    } else {
        var systemPolicies = new ZmSystemRetentionPolicy();
        systemPolicies.getPolicies(this._processSystemPolicies.bind(this));
        this._setBusy(true);
    }
}

ZmFolderRetentionView.prototype._processSystemPolicies =
function(systemKeepPolicies, systemPurgePolicies) {

    this._populatePolicySelect(ZmOrganizer.RETENTION_KEEP,  systemKeepPolicies);
    this._populatePolicySelect(ZmOrganizer.RETENTION_PURGE, systemPurgePolicies);

    this._dataBindComponents(this._organizer, ZmOrganizer.RETENTION_KEEP);
    this._dataBindComponents(this._organizer, ZmOrganizer.RETENTION_PURGE);

    this._initialized = true;
    this._setBusy(false);
}


ZmFolderRetentionView.prototype._dataBindComponents =
function(organizer, policyElement) {
    var components = this._components[policyElement];
    components.policyEnable.checked = false;

    var policy = organizer.getRetentionPolicy(policyElement);
    if (policy) {
        // The organizer has a retention policy
        components.policyEnable.checked = true;

        if (policy.type == "user") {
            // Custom policy defined.
            components.policySelect.selectedIndex = components.policySelect.options.length-1;
            // parseInt will discard the unit
            var lifetime = parseInt(policy.lifetime);
            // In case someone used SOAP to specify a custom policy, convert it
            // to days (which is the smallest unit we can handle via the UI).
            var conversionFactor = 1;
            // Intervals taken from DateUtil.java
            var interval = policy.lifetime.slice(policy.lifetime.length-1);
            switch (interval) {
                case  "d": conversionFactor =  1; break;
                case  "h": conversionFactor = 24; break;
                case  "m": conversionFactor = AjxDateUtil.MINUTES_PER_DAY; break;
                case  "s": conversionFactor = AjxDateUtil.SECONDS_PER_DAY; break;
                case "ms": conversionFactor = AjxDateUtil.MSEC_PER_DAY;    break;
                default  : conversionFactor = AjxDateUtil.SECONDS_PER_DAY; break;
            }
            var days = Math.floor((lifetime-1)/conversionFactor) + 1;

            // Convert lifetime to the best fit for unit and amount.  Start with year,
            // proceed to smaller units.  If the amount in days is evenly divisible by the
            // days for a unit, use that unit
            for (var i = ZmFolderRetentionView._CustomUnits.length-1; i >= 0; i--) {
                if ((days >= ZmFolderRetentionView._CustomUnits[i].days) &&
                    ((days % ZmFolderRetentionView._CustomUnits[i].days) == 0)) {
                    components.customUnit.selectedIndex = i;
                    components.customValue.value = days/ZmFolderRetentionView._CustomUnits[i].days;
                    break;
                }
            }
        } else {
            // System policy, find the match in the policy selection pull down
            for (var i = 0; i < components.policySelect.options.length; i++) {
                if (components.policySelect.options[i].value == policy.id) {
                    components.policySelect.selectedIndex = i;
                    break;
                }
            }
            // Reset custom fields to their defaults
            components.customUnit.selectedIndex   = 0;
            components.customValue.value          = "";
        }
    }
    if (!components.policyEnable.checked) {
        // No policy of this type (keep/purge) reset the selects and input fields
        components.policySelect.selectedIndex = 0;
        // Default to the largest unit to reduce the chance of an inadvertent tiny deletion period
        components.customUnit.selectedIndex   =  components.customUnit.options.length-1;
        components.customValue.value          = "";
    }
    this._handleSelectionChange(policyElement);
    this._handleEnableClick(policyElement);
}


/**  doSave will be invoked for each tab view.
 *
 * @param	{BatchCommand}	batchCommand	Accumulates updates from all tabs
 * @param	{Object}	    saveState		Accumulates error messages and indication of any update
 */
ZmFolderRetentionView.prototype.doSave =
function(batchCommand, saveState) {
	if (!this._handleErrorCallback) {
		this._handleErrorCallback = new AjxCallback(this, this._handleError);
	}

    var organizer = this._organizer;

    var initialErrorCount = saveState.errorMessage.length;
    var newRetentionPolicy = { };
    // Create policy objects from the UI fields, attach to the newRetentionPolicy variable
    this._createPolicy(newRetentionPolicy, ZmOrganizer.RETENTION_KEEP,  saveState);
    this._createPolicy(newRetentionPolicy, ZmOrganizer.RETENTION_PURGE, saveState);

    if (initialErrorCount == saveState.errorMessage.length) {
        var keepPolicy  = organizer.getRetentionPolicy(ZmOrganizer.RETENTION_KEEP);
        var purgePolicy = organizer.getRetentionPolicy(ZmOrganizer.RETENTION_PURGE);
        if (organizer.policiesDiffer(keepPolicy,  newRetentionPolicy.keep) ||
            organizer.policiesDiffer(purgePolicy, newRetentionPolicy.purge)) {
            // Retention policy has changed
            batchCommand.add(new AjxCallback(organizer, organizer.setRetentionPolicy,
                             [newRetentionPolicy, null, this._handleErrorCallback]));
            saveState.commandCount++;
        }
    }

};


// Create a retention policy object from UI components for processing by the
// organizer.setRetentionPolicy
ZmFolderRetentionView.prototype._createPolicy =
function(retentionPolicy, policyElement, saveState) {
    var components = this._components[policyElement];

    var policy;
    if (components.policyEnable.checked) {
        // A keep or Purge retention policy is defined
        var policySelection = components.policySelect.options[components.policySelect.selectedIndex].value;
        var policyType;
        if (policySelection == "custom") {
            policyType = "user";
            var unit   = components.customUnit.options[components.customUnit.selectedIndex].value;
            // Parse the custom value field to get the number of units
            var invalidCustomValue = false;
            var amountText = AjxStringUtil.trim(components.customValue.value);
            if (!amountText) {
                invalidCustomValue = true;
            } else {
                var amount = 0;
                var nonNumericIndex = amountText.search(/\D/);
                if (nonNumericIndex == -1) {
                    amount = parseInt(amountText);
                }

                if (amount <= 0) {
                    invalidCustomValue = true;
                } else {
                    var daysPerUnit = ZmFolderRetentionView._CustomUnitsToDays[unit];
                    var lifetime = (amount * daysPerUnit).toString() + "d";
                    policy = {type:"user", lifetime:lifetime};
                }
            }
            if (invalidCustomValue) {
                var  errorMessage = (policyElement == ZmOrganizer.RETENTION_KEEP) ?
                                     ZmMsg.retentionKeepLifetimeAmount : ZmMsg.retentionPurgeLifetimeAmount;
                saveState.errorMessage.push(errorMessage);
            }
        } else {
            policy = {type:"system", id:policySelection};
        }
    }
    retentionPolicy[policyElement] = policy;
}


ZmFolderRetentionView.prototype._populatePolicySelect =
function(policyElement, systemPolicies) {
    var components = this._components[policyElement];
    components.policies = systemPolicies ? systemPolicies : [];
	
	var sorted = {};
	for (var i=0; i< components.policies.length; i++) {
		sorted[components.policies[i].name] =  components.policies[i].id;
	}
	
	var sortedKeys = AjxUtil.getHashKeys(sorted);
	sortedKeys.push(ZmMsg.custom);  //append custom to the end
	sorted[ZmMsg.custom] = "custom";
    components.policySelect.options.length = 0;
    for (var i = 0; i < sortedKeys.length; i++) {
        components.policySelect.options[i] = new Option(sortedKeys[i], sorted[sortedKeys[i]]);
    }
}


ZmFolderRetentionView.prototype._handleEnableClick =
function(policyElement) {
    var components = this._components[policyElement];
    var disabled = !components.policyEnable.checked;
    components.policySelect.disabled = disabled;
    components.customValue.disabled  = disabled;
    components.customUnit.disabled   = disabled;
}

ZmFolderRetentionView.prototype._handleSelectionChange = function(policyElement) {

    var components = this._components[policyElement],
        policySelect   = components.policySelect,
	    selectedOption = policySelect.options[policySelect.selectedIndex],
        policySelection = selectedOption.value,
        visible = (policySelection == "custom");

    // Show hide the custom unit and values fields based on whether the policy
    // selected is a system defined policy, or custom
    components.customValue.style.visibility = visible ? "visible" : "hidden";
    components.customUnit.style.visibility  = visible ? "visible" : "hidden";

	// accessibility
	policySelect.setAttribute('aria-label', AjxMessageFormat.format(ZmMsg.policyTypeLabel, selectedOption.innerHTML));
};

ZmFolderRetentionView.prototype._createView =
function() {
	// Create html elements
    this._id = Dwt.getNextId();
    var params = {
        id: this._id
    }

    var container = this.getHtmlElement();
    container.innerHTML = AjxTemplate.expand("share.Dialogs#ZmFolderRetentionView", params);

    this._components = {};
    this._setupComponents(ZmOrganizer.RETENTION_KEEP,  this._components);
    this._setupComponents(ZmOrganizer.RETENTION_PURGE, this._components);

    this._createBusyOverlay(container);
    this._contentEl = container;
};

ZmFolderRetentionView.prototype._setupComponents =
function(policyElement, allComponents) {

    var components = {};
    allComponents[policyElement] = components;

    components.policyEnable = document.getElementById(this._id + "_" + policyElement + "Checkbox");
    components.policySelect = document.getElementById(this._id + "_" + policyElement);
    components.customValue  = document.getElementById(this._id + "_" + policyElement + "Value");
    components.customUnit   = document.getElementById(this._id + "_" + policyElement + "Unit");

    for (var i = 0; i < ZmFolderRetentionView._CustomUnits.length; i++) {
        var unit = ZmFolderRetentionView._CustomUnits[i];
        components.customUnit.options[i] = new Option(unit.label, unit.id);
    }

	this._tabGroup.addMember(components.policyEnable);
	this._tabGroup.addMember(components.policySelect);
	this._tabGroup.addMember(components.customValue);
	this._tabGroup.addMember(components.customUnit);

    Dwt.setHandler(components.policyEnable, "onclick", this._handleEnableClick.bind(this, policyElement));
    Dwt.setHandler(components.policySelect, "onclick", this._handleSelectionChange.bind(this, policyElement));
}
