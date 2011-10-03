/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 */

// Creates a folder retention view for the folder dialog
ZmFolderRetentionView = function(parent) {
    if (arguments.length == 0) return;
    ZmFolderDialogTabView.call(this, parent);

    this._initialized = false;
};

ZmFolderRetentionView.prototype = new ZmFolderDialogTabView;
ZmFolderRetentionView.prototype.constructor = ZmFolderRetentionView;

// Policy Types - Keep or Purge
ZmFolderRetentionView.KEEP  = "keep";
ZmFolderRetentionView.PURGE = "purge";

ZmFolderRetentionView.MINUTES_PER_DAY = 60 * 24;
ZmFolderRetentionView.SECONDS_PER_DAY = 60 * 60 * 24;
ZmFolderRetentionView.MSEC_PER_DAY    = 60 * 60 * 24 * 1000;

// Data to populate and process the custom units and values
ZmFolderRetentionView._CustomUnitsToDays = { year: 366, month:31, week:7, day:1};
ZmFolderRetentionView._CustomUnits = [
    { id:"day",   label: ZmMsg.day,   days: ZmFolderRetentionView._CustomUnitsToDays.day},
    { id:"week",  label: ZmMsg.week,  days: ZmFolderRetentionView._CustomUnitsToDays.week},
    { id:"month", label: ZmMsg.month, days: ZmFolderRetentionView._CustomUnitsToDays.month},
    { id:"year",  label: ZmMsg.year,  days: ZmFolderRetentionView._CustomUnitsToDays.year}];



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

	this.setSize(Dwt.DEFAULT, "200");

};

ZmFolderRetentionView.prototype._handleFolderChange =
function() {
    // Read the policies from the server, and add 'Custom'
    if (this._initialized) {
        this._dataBindComponents(this._organizer, ZmFolderRetentionView.KEEP);
        this._dataBindComponents(this._organizer, ZmFolderRetentionView.PURGE);
    } else {
        var systemPolicies = new ZmSystemRetentionPolicy();
        systemPolicies.getPolicies(this._processSystemPolicies.bind(this));
        this._setBusy(true);
    }
}

ZmFolderRetentionView.prototype._processSystemPolicies =
function(systemKeepPolicies, systemPurgePolicies) {

    this._populatePolicySelect(ZmFolderRetentionView.KEEP,  systemKeepPolicies);
    this._populatePolicySelect(ZmFolderRetentionView.PURGE, systemPurgePolicies);

    this._dataBindComponents(this._organizer, ZmFolderRetentionView.KEEP);
    this._dataBindComponents(this._organizer, ZmFolderRetentionView.PURGE);

    this._initialized = true;
    this._setBusy(false);
}


ZmFolderRetentionView.prototype._dataBindComponents =
function(organizer, policyElement) {
    var components = this._components[policyElement];
    components.policyEnable.checked = false;

    if (organizer.retentionPolicy && organizer.retentionPolicy[0]) {
       if (organizer.retentionPolicy[0][policyElement] && organizer.retentionPolicy[0][policyElement][0]) {
           // The organizer has a retention policy
           var element = organizer.retentionPolicy[0][policyElement][0];
           if (element.policy && element.policy[0]) {
                components.policyEnable.checked = true;
                var policy = element.policy[0];

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
                        case  "m": conversionFactor = ZmFolderRetentionView.MINUTES_PER_DAY; break;
                        case  "s": conversionFactor = ZmFolderRetentionView.SECONDS_PER_DAY; break;
                        case "ms": conversionFactor = ZmFolderRetentionView.MSEC_PER_DAY;    break;
                        default  : conversionFactor = ZmFolderRetentionView.SECONDS_PER_DAY; break;
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
       }
    }
    if (!components.policyEnable.checked) {
        // No policy of this type (keep/purge) reset the selects and input fields
        components.policySelect.selectedIndex = 0;
        components.customUnit.selectedIndex   = 0;
        components.customValue.value          = "";
    }
    this._handleSelectionChange(policyElement);
    this._handleEnableClick(policyElement);
}


/*  doSave will be invoked for each tab view.
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
    var retentionPolicy = { };
    // Create policy objects from the UI fields, attach to the retentionPolicy variable
    this._createPolicy(retentionPolicy, ZmFolderRetentionView.KEEP,  saveState);
    this._createPolicy(retentionPolicy, ZmFolderRetentionView.PURGE, saveState);

    if (initialErrorCount == saveState.errorMessage.length) {

        if ((!organizer.retentionPolicy && (retentionPolicy.keep || retentionPolicy.purge)) ||
            ( organizer.retentionPolicy &&
             (organizer.policiesDiffer(organizer.retentionPolicy[0].keep[0].policy,  retentionPolicy.keep) ||
              organizer.policiesDiffer(organizer.retentionPolicy[0].purge[0].policy, retentionPolicy.purge)))) {
            // Retention policy has changed
            batchCommand.add(new AjxCallback(organizer, organizer.setRetentionPolicy,
                             [retentionPolicy, null, this._handleErrorCallback]));
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
            var amountText = AjxStringUtil.trim(components.customValue.value);
            var amount = 0;
            var nonNumericIndex = amountText.search(/\D/);
            if (nonNumericIndex == -1) {
                amount = parseInt(amountText);
            }

            if (amount <= 0) {
                var  errorMessage = (policyElement == ZmFolderRetentionView.KEEP) ?
                                     ZmMsg.retentionKeepLifetimeAmount : ZmMsg.retentionPurgeLifetimeAmount;
                saveState.errorMessage.push(errorMessage);
            } else {
                var daysPerUnit = ZmFolderRetentionView._CustomUnitsToDays[unit];
                var lifetime = (amount * daysPerUnit).toString() + "d";
                policy = {type:"user", lifetime:lifetime};
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
    components.policies[components.policies.length] = {name:"Custom", id:"custom"};

    components.policySelect.options.length = 0;
    for (var i = 0; i < components.policies.length; i++) {
        var policy = components.policies[i];
        components.policySelect.options[i] = new Option(policy.name, policy.id);
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

ZmFolderRetentionView.prototype._handleSelectionChange =
function(policyElement) {
    var components = this._components[policyElement];
    var policySelect   = components.policySelect;
    var policySelection = policySelect.options[policySelect.selectedIndex].value;
    var visible = (policySelection == "custom");

    // Show hide the custom unit and values fields based on whether the policy
    // selected is a system defined policy, or custom
    components.customValue.style.visibility = visible ? "visible" : "hidden";
    components.customUnit.style.visibility  = visible ? "visible" : "hidden";
}

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
    this._setupComponents(ZmFolderRetentionView.KEEP,  this._components);
    this._setupComponents(ZmFolderRetentionView.PURGE, this._components);

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

    Dwt.setHandler(components.policyEnable, "onclick", this._handleEnableClick.bind(this, policyElement));
    Dwt.setHandler(components.policySelect, "onclick", this._handleSelectionChange.bind(this, policyElement));
}