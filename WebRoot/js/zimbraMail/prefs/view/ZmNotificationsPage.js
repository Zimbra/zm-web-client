/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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
 * Creates a preferences page for displaying notifications.
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 *
 * @extends		ZmPreferencesPage
 */
ZmNotificationsPage = function(parent, section, controller) {
    if (arguments.length == 0) return;
    ZmPreferencesPage.apply(this, arguments);
};
ZmNotificationsPage.prototype = new ZmPreferencesPage;
ZmNotificationsPage.prototype.constructor = ZmNotificationsPage;

ZmNotificationsPage.prototype.toString = function() {
    return "ZmNotificationsPage";
};

//
// Constants
//

// device email data

ZmNotificationsPage.REGIONS = {};
ZmNotificationsPage.CARRIERS = {};

//
// DwtControl methods
//

ZmNotificationsPage.prototype.getTabGroupMember = function() {
    return this._form.getTabGroupMember();
};

//
// ZmPreferencesPage methods
//

ZmNotificationsPage.prototype.showMe = function() {
    // default processing
    var initialize = !this.hasRendered;
    ZmPreferencesPage.prototype.showMe.apply(this, arguments);

    // setup controls
    var status = appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS) ?
            ZmNotificationsPageForm.CONFIRMED : ZmNotificationsPageForm.UNCONFIRMED;
    this._form.setValue("DEVICE_EMAIL_CODE_STATUS_VALUE", status);
    this._form.setValue("EMAIL", appCtxt.get(ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS));
    this._form.update();

    // load SMS data, if needed
    if (initialize) {
        var includes = [
            [   appContextPath,
                "/res/ZmSMS.js",
                "?v=",cacheKillerVersion,
                appDevMode ? "&debug=1" : ""
            ].join("")
        ];
        var baseurl = null;
        var callback = new AjxCallback(this, this._smsDataLoaded);
        var proxy = null;
        AjxInclude(includes, baseurl, callback, proxy);
    }
};

/**
 * <strong>Note:</strong>
 * Only the email field is a preference that the user can set directly.
 *
 * @private
 */
ZmNotificationsPage.prototype.isDirty = function() {
    return this._form.getValue("EMAIL") != appCtxt.get(ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS);
};

/**
 * <strong>Note:</strong>
 * Only the email field is a preference that the user can set directly.
 *
 * @private
 */
ZmNotificationsPage.prototype.validate = function() {
    return this._form.isValid("EMAIL");
};

ZmNotificationsPage.prototype.setFormValue = function(id, value, setup, control) {
    value = ZmPreferencesPage.prototype.setFormValue.apply(this, arguments);
    if (id == ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS) {
        this._form.setValue("EMAIL", value);
        this._form.update();
    }
    return value;
};

ZmNotificationsPage.prototype.getFormValue = function(id, setup, control) {
    if (id == ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS) {
        var value = this._form.getValue("EMAIL");
        return setup && setup.valueFunction ? setup.valueFunction(value) : value;
    }
    return ZmPreferencesPage.prototype.getFormValue.apply(this, arguments);
};

/**
 * This class compleletely overrides the ZmPreferencePage's page
 * creation in order to use DwtForm for easier page creation. By
 * using DwtForm, we can get automatic control creation, tab group
 * ordering, and interactivity dependencies.
 *
 * @private
 */
ZmNotificationsPage.prototype._createPageTemplate = function() {
    DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._section.id);
    this.setVisible(false); // hide until ready
};

ZmNotificationsPage.prototype._createControls = function() {
    // create form controls
    this._form = this._setupCustomForm();
    this._form.reparentHtmlElement(this.getContentHtmlElement());

    // make it look like email notification pref control is present
    // NOTE: This is needed so that the default pref saving works.
    // NOTE: This is used in conjunction with set/getFormValue.
    if (this._form.getControl("EMAIL")) {
        this._prefPresent = {};
        this._prefPresent[ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS] = true;
    }

    // finish setup
    this.setVisible(true);
    this.hasRendered = true;
};

ZmNotificationsPage.prototype._resetPageListener = function() {
    ZmPreferencesPage.prototype._resetPageListener.apply(this, arguments);
    this._form.reset();
};

//
// Protected methods
//

ZmNotificationsPage.prototype._setupCustomForm = function() {
    return new ZmNotificationsPageForm({parent:this,sectionTemplate:this._section.templateId});
};

ZmNotificationsPage.prototype._smsDataLoaded = function() {
    if (!window.ZmSMS) return;
    this._form.setSMSData(window.ZmSMS);
};

//
// Classes
//

ZmNotificationsPageForm = function(params) {
    if (arguments.length == 0) return;
    params.form = this._getFormParams(params.sectionTemplate);
    DwtForm.apply(this, arguments);

    this._regionSelectionListener = new AjxListener(this, this._handleRegionSelection);

    // listen to CAL_DEVICE_EMAIL_REMINDERS_ADDRESS changes
    // NOTE: We can't actually listen to changes in this value because
    // NOTE: ZmSetting doesn't notify the listeners when the value is
    // NOTE: set *if* it has an actual LDAP name.
};
ZmNotificationsPageForm.prototype = new DwtForm;
ZmNotificationsPageForm.prototype.constructor = ZmNotificationsPageForm;

ZmNotificationsPageForm.prototype.toString = function() {
    return "ZmNotificationsPageForm";
};

// Constants: special region/carrier ids

ZmNotificationsPageForm.CUSTOM  = "Custom";
ZmNotificationsPageForm.UNKNOWN = "Unknown";

// Constants: code status values; also doubles as element class names

ZmNotificationsPageForm.CONFIRMED   = "DeviceCodeConfirmed";
ZmNotificationsPageForm.PENDING     = "DeviceCodePending";
ZmNotificationsPageForm.UNCONFIRMED = "DeviceCodeUnconfirmed";

// Constants: private

ZmNotificationsPageForm.__letters2NumbersMap = {
                    a:2,b:2,c:2,d:3,e:3,f:3,
    g:4,h:4,i:4,    j:5,k:5,l:5,m:6,n:6,o:6,
    p:7,q:7,r:7,s:7,t:8,u:8,v:8,w:9,x:9,y:9,z:9
};

// Public

ZmNotificationsPageForm.prototype.setSMSData = function(data) {
    this._smsData = data;

    // setup regions control
    var regionMap = this._defineRegions(data);
    var button = this.getControl("DEVICE_EMAIL_REGION");
    var menu = this.__createRegionsMenu(button, regionMap);
    if (menu == null) {
        // always have at least one region
        menu = new DwtMenu({parent:button});
        this.__createRegionMenuItem(menu,ZmNotificationsPageForm.UNKNOWN,ZmMsg.unknown);
    }
    menu.addSelectionListener(this._regionSelectionListener);
    button.setMenu(menu);

    // set default region
    this.setRegion(data.defaultRegionId);
};

ZmNotificationsPageForm.prototype.setRegion = function(regionId){
    // decorate the region button
    var region = ZmNotificationsPage.REGIONS[regionId] || { id:ZmNotificationsPageForm.UNKNOWN, label:ZmMsg.unknown };
    var button = this.getControl("DEVICE_EMAIL_REGION");
    button.setText(region.label);
    button.setImage(region.image);
    button.setData(Dwt.KEY_ID, region.id);

    // update the form
    this.setCarriers(regionId);
    this.setValue("DEFAULT_EMAIL_REGION", regionId);
    if (regionId == this._smsData.defaultRegionId && this._smsData.defaultCarrierId) {
        this.setValue("DEVICE_EMAIL_CARRIER", this._smsData.defaultCarrierId);
    }
    this.update();
};

ZmNotificationsPageForm.prototype.setCarriers = function(regionId) {
    var select = this.getControl("DEVICE_EMAIL_CARRIER");
    select.clearOptions();
    var region = ZmNotificationsPage.REGIONS[regionId] || {};
    var carriers = ZmNotificationsPageForm.__getRegionCarriers(region, true);
    carriers.sort(ZmNotificationsPageForm.__byLabel);
    for (var i = 0; i < carriers.length; i++) {
        var carrier = carriers[i];
        var image = carrier.image || carrier.region.image;
        select.addOption({displayValue:carrier.label, value:carrier.id, image:image});
    }
    select.addOption({displayValue:ZmMsg.custom, value:ZmNotificationsPageForm.CUSTOM, image:null});
};

ZmNotificationsPageForm.prototype.isCustom = function() {
    // user selected "Custom"
    var carrierId = this.getValue("DEVICE_EMAIL_CARRIER");
    if (carrierId == ZmNotificationsPageForm.CUSTOM) return true;

    // any entry w/o an email pattern is also custom
    var carrier = ZmNotificationsPage.CARRIERS[carrierId];
    var hasPattern = Boolean(carrier && carrier.pattern);
    return !hasPattern;
};

ZmNotificationsPageForm.prototype.getEmailAddress = function() {
    if (this.isCustom()) {
        var number = this.getValue("DEVICE_EMAIL_CUSTOM_NUMBER");
        var address = this.getValue("DEVICE_EMAIL_CUSTOM_ADDRESS");
        return number && address ? [number,address].join("@") : "";
    }

    var phone = ZmNotificationsPageForm.normalizePhoneNumber(this.getValue("DEVICE_EMAIL_PHONE"));
    var carrier = ZmNotificationsPage.CARRIERS[this.getValue("DEVICE_EMAIL_CARRIER")];
    return phone ? AjxMessageFormat.format(carrier.pattern, [phone]) : "";
};

ZmNotificationsPageForm.prototype.getCodeStatus = function() {
    // is there anything to do?
    var control = this.getControl("DEVICE_EMAIL_CODE_STATUS");
    if (!control) return "";

    // remove other status class names
    var controlEl = control.getHtmlElement();
    Dwt.delClass(controlEl, ZmNotificationsPageForm.CONFIRMED);
    Dwt.delClass(controlEl, ZmNotificationsPageForm.PENDING);
    Dwt.delClass(controlEl, ZmNotificationsPageForm.UNCONFIRMED);

    // add appropriate class name
    var status = this.get("DEVICE_EMAIL_CODE_STATUS_VALUE");
    Dwt.addClass(controlEl, status);

    // format status text
    if (status == ZmNotificationsPageForm.CONFIRMED) {
        var email = appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS);
        if (email) {
            var pattern = ZmMsg.deviceEmailNotificationsVerificationStatusConfirmed;
            return AjxMessageFormat.format(pattern, [email]);
        }
        // default back to unconfirmed
        Dwt.delClass(controlEl, status, ZmNotificationsPageForm.UNCONFIRMED);
    }
    return status == ZmNotificationsPageForm.PENDING ?
        ZmMsg.deviceEmailNotificationsVerificationStatusPending :
        ZmMsg.deviceEmailNotificationsVerificationStatusUnconfirmed
    ;
};

ZmNotificationsPageForm.prototype.getPhoneHint = function() {
    var carrierId = this.getValue("DEVICE_EMAIL_CARRIER");
    var carrier = ZmNotificationsPage.CARRIERS[carrierId];
    var carrierHint = carrier && carrier.hint;
    var email = this.getEmailAddress();
    var emailHint = email && AjxMessageFormat.format(ZmMsg.deviceEmailNotificationsPhoneNumber, [email]);
    if (carrierHint || emailHint) {
        if (!carrierHint) return emailHint;
        if (!emailHint) return carrierHint;
        return AjxMessageFormat.format(ZmMsg.deviceEmailNotificationsCarrierEmailHint, [emailHint,carrierHint]);
    }
    return "";
};

ZmNotificationsPageForm.normalizePhoneNumber = function(phone) {
    if (phone) {
        phone = phone.replace(/[a-z]/gi,ZmNotificationsPageForm.__letters2Numbers);
        phone = phone.replace(/[^+#\*0-9]/g,"");
    }
    return phone;
};

// Protected

ZmNotificationsPageForm.prototype._getFormParams = function(templateId) {
    return {
        template: templateId,
        items: [
            // default pref page controls
            { id: "REVERT_PAGE", type: "DwtButton", label: ZmMsg.restorePage,
                onclick: "this.parent._resetPageListener()"
            },
            // email
            { id: "EMAIL", type: "DwtInputField", hint: ZmMsg.exampleEmailAddr },
            // device email (aka SMS)
            { id: "DEVICE_EMAIL_REGION", type: "DwtButton",
                enabled: "this._smsData",
                onclick: this._handleRegionClick
            },
            { id: "DEVICE_EMAIL_CARRIER", type: "DwtSelect", value: ZmNotificationsPageForm.CUSTOM,
                enabled: this._isCarrierEnabled
            },
            { id: "DEVICE_EMAIL_PHONE", type: "DwtInputField",
                hint: ZmMsg.deviceEmailNotificationsPhoneHint,
                visible: "!this.isCustom()",
                onchange: this._handleCarrierChange
            },
            { id: "DEVICE_EMAIL_PHONE_HINT", type: "DwtText",
                getter: this.getPhoneHint,
                visible: "get('DEVICE_EMAIL_PHONE_HINT')" // NOTE: only show if there's a value
            },
            { id: "DEVICE_EMAIL_PHONE_SEND_CODE", type: "DwtButton",
                label: ZmMsg.deviceEmailNotificationsVerificationCodeSend,
                visible: "!this.isCustom()",
                enabled: "get('DEVICE_EMAIL_PHONE')",
                onclick: this._handleSendCode
            },
            { id: "DEVICE_EMAIL_CUSTOM_NUMBER", type: "DwtInputField",
                visible: "this.isCustom()"
            },
            { id: "DEVICE_EMAIL_CUSTOM_ADDRESS", type: "DwtInputField",
                visible: "this.isCustom()"
            },
            { id: "DEVICE_EMAIL_CUSTOM_SEND_CODE", type: "DwtButton",
                label: ZmMsg.deviceEmailNotificationsVerificationCodeSend,
                visible: "this.isCustom()",
                enabled: "get('DEVICE_EMAIL_CUSTOM_NUMBER') && get('DEVICE_EMAIL_CUSTOM_ADDRESS')",
                onclick: this._handleSendCode
            },
            { id: "DEVICE_EMAIL_CODE", type: "DwtInputField",
                hint: ZmMsg.deviceEmailNotificationsVerificationCodeHint
            },
            { id: "DEVICE_EMAIL_CODE_VALIDATE", type: "DwtButton",
                label: ZmMsg.deviceEmailNotificationsVerificationCodeValidate,
                enabled: "get('DEVICE_EMAIL_CODE') && this.getEmailAddress()",
                onclick: this._handleValidateCode
            },
            { id: "DEVICE_EMAIL_CODE_STATUS", type: "DwtText",
                className: "DeviceCode", getter: this.getCodeStatus
            },
            // NOTE: This holds the current code status
            { id: "DEVICE_EMAIL_CODE_STATUS_VALUE", value: ZmNotificationsPageForm.UNCONFIRMED }
        ]
    };
};

ZmNotificationsPageForm.prototype._isCarrierEnabled = function() {
    var control = this.getControl('DEVICE_EMAIL_CARRIER');
    return control && control.getOptionCount() > 0;
};

ZmNotificationsPageForm.prototype._defineRegions = function(data) {
    // define regions
    var regionMap = {};
    for (var id in data) {
        // do we care about this entry?
        if (!id.match(/^region_/)) continue;

        // take apart message key
        var parts = id.split(/[_\.]/);
        var prop = parts[parts.length-1];

        // set region info
        var regions = regionMap;
        var regionIds = parts[1].split("/"), region;
        for (var i = 0; i < regionIds.length; i++) {
            var regionId = regionIds[i];
            if (!regions[regionId]) {
                regions[regionId] = ZmNotificationsPage.REGIONS[regionId] = { id: regionId };
            }
            region = regions[regionId];
            if (i < regionIds.length - 1 && !region.regions) {
                region.regions = {};
            }
            regions = region.regions;
        }

        // store property
        region[prop] = data[id];
    }

    // define carriers
    this._defineCarriers(data);

    return regionMap;
};

ZmNotificationsPageForm.prototype._defineCarriers = function(data) {
    for (var id in data) {
        // do we care about this entry?
        if (!id.match(/^carrier_/)) continue;

        // take apart message key
        var s = id.split(/[_\.]/);
        var prop = s[s.length-1];

        // set carrier info
        var carrierId = s.slice(1,3).join("_");
        var carrier = ZmNotificationsPage.CARRIERS[carrierId];
        if (!carrier) {
            var regionId = s[1];
            var region = ZmNotificationsPage.REGIONS[regionId];
            if (!region.carriers) {
                region.carriers = {};
            }
            carrier = region.carriers[carrierId] = ZmNotificationsPage.CARRIERS[carrierId] = {
                id: carrierId, region: region
            };
        }

        // store property
        carrier[prop] = data[id];
    }
    return ZmNotificationsPage.CARRIERS;
};

ZmNotificationsPageForm.prototype._handleRegionClick = function() {
    var button = this.getControl("DEVICE_EMAIL_REGION");
    var menu = button.getMenu();
    if (menu.isPoppedUp()) {
        menu.popdown();
    }
    else {
        button.popup();
    }
};

ZmNotificationsPageForm.prototype._handleCarrierChange = function() {
    var controlId = this.isCustom() ? "DEVICE_EMAIL_NUMBER" : "DEVICE_EMAIL_PHONE";
    var control = this.getControl(controlId);
    if (control && control.focus) {
        control.focus();
    }
};

ZmNotificationsPageForm.prototype._handleSendCode = function() {
    var params = {
        jsonObj: {
            SendVerificationCodeRequest: {
                _jsns: "urn:zimbraMail",
                a: this.getEmailAddress()
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this, this._handleSendCodeResponse)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmNotificationsPageForm.prototype._handleSendCodeResponse = function(resp) {
    appCtxt.setStatusMsg(ZmMsg.deviceEmailNotificationsVerificationCodeSendSuccess);

    this.setValue("DEVICE_EMAIL_CODE_STATUS_VALUE", ZmNotificationsPageForm.PENDING);
    this.update();
};

ZmNotificationsPageForm.prototype._handleRegionSelection = function(event) {
    var regionId = event.item.getData(Dwt.KEY_ID);
    this.setRegion(regionId);
};

ZmNotificationsPageForm.prototype._handleValidateCode = function() {
    var params = {
        jsonObj: {
            VerifyCodeRequest: {
                _jsns: "urn:zimbraMail",
                a: this.getEmailAddress(),
                code: this.getValue("DEVICE_EMAIL_CODE")
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this, this._handleValidateCodeResponse)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmNotificationsPageForm.prototype._handleValidateCodeResponse = function(resp) {
    var success = AjxUtil.get(resp.getResponse(), "VerifyCodeResponse", "success") == "1";
    var params = {
        msg: success ?
                ZmMsg.deviceEmailNotificationsVerificationCodeValidateSuccess :
                ZmMsg.deviceEmailNotificationsVerificationCodeValidateFailure,
        level: success ? ZmStatusView.LEVEL_INFO : ZmStatusView.LEVEL_CRITICAL
    };
    appCtxt.setStatusMsg(params);

    // NOTE: Since the preference values only come in at launch time,
    // NOTE: manually set the confirmed email address so that we can
    // NOTE: display the correct confirmed code status text
    if (success) {
        appCtxt.set(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS, this.getEmailAddress());
    }

    var status = success ? ZmNotificationsPageForm.CONFIRMED : ZmNotificationsPageForm.UNCONFIRMED;
    this.setValue("DEVICE_EMAIL_CODE_STATUS_VALUE", status);
    this.update();
};

// Private

ZmNotificationsPageForm.prototype.__createRegionsMenu = function(parent, regionMap, parentRegion) {
    var regions = AjxUtil.values(regionMap, ZmNotificationsPageForm.__acceptRegion);
    if (regions.length == 0) return null;

    var menu = new DwtMenu({parent:parent});

    regions.sort(ZmNotificationsPageForm.__byLabel);
    for (var i = 0; i < regions.length; i++) {
        var region = regions[i];
        // add entry for this region
        var image = parent instanceof DwtMenuItem ? region.image : null;
        var menuItem = this.__createRegionMenuItem(menu,region.id,region.label,image);
        // add sub-regions
        var subMenu = region.regions && this.__createRegionsMenu(menuItem, region.regions, region);
        if (subMenu && subMenu.getItemCount() > 0) {
            subMenu.addSelectionListener(this._regionSelectionListener);
            menuItem.setMenu(subMenu);
        }
    }

    // NOTE: Since only the call to this method *within* this method
    // NOTE: passes in a parentRegion, we'll only add a general entry for
    // NOTE: the parent region at a sub-level and never at the top level.
    if (parentRegion) {
        var hasCarriers = parentRegion.carriers && parentRegion.carriers.length > 0;
        var menuItemCount = menu.getItemCount();
        if (hasCarriers || menuItemCount > 1) {
            this.__createRegionMenuItem(menu,parentRegion.id,parentRegion.label,parentRegion.image,0);
            if (menuItemCount > 1) {
                new DwtMenuItem({parent:menu,style:DwtMenuItem.SEPARATOR_STYLE,index:1});
            }
        }
    }

    return menu;
};

ZmNotificationsPageForm.prototype.__createRegionMenuItem = function(parent, id, label, image, index) {
    var menuItem = new DwtMenuItem({parent:parent,index:index});
    menuItem.setText(label);
    menuItem.setImage(image);
    menuItem.setData(Dwt.KEY_ID, id);
    return menuItem;
};

ZmNotificationsPageForm.__acceptRegion = function(regionId, regionMap) {
    var region = regionMap[regionId];
    var hasRegions = false;
    for (var id in region.regions) {
        if (ZmNotificationsPageForm.__acceptRegion(id, region.regions)) {
            hasRegions = true;
            break;
        }
    }
    var hasCarriers = ZmNotificationsPageForm.__getRegionCarriers(region).length > 0;
    return hasRegions || hasCarriers;
};

ZmNotificationsPageForm.__getRegionCarriers = function(region, recurse) {
    if (region.carriers && !(region.carriers instanceof Array)) {
        region.carriers = AjxUtil.values(region.carriers);
        region.carriers.sort(ZmNotificationsPageForm.__byLabel);
    }
    var carriers = region.carriers || [];
    if (recurse && region.regions) {
        for (var regionId in region.regions) {
            carriers = carriers.concat(ZmNotificationsPageForm.__getRegionCarriers(region.regions[regionId],true));
        }
    }
    return carriers;
};

ZmNotificationsPageForm.__byLabel = AjxCallback.simpleClosure(AjxUtil.byStringProp, window, "label");

ZmNotificationsPageForm.__letters2Numbers = function($0) {
    return ZmNotificationsPageForm.__letters2NumbersMap[$0.toLowerCase()];
};
