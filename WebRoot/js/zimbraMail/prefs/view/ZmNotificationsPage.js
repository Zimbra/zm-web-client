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

    this._regionSelectionListener = new AjxListener(this, this._handleRegionSelection);

    // listen to CAL_DEVICE_EMAIL_REMINDERS_ADDRESS changes
    // NOTE: We can't actually listen to changes in this value because
    // NOTE: ZmSetting doesn't notify the listeners when the value is
    // NOTE: set *if* it has an actual LDAP name.
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

ZmNotificationsPage.CUSTOM = "Custom";
ZmNotificationsPage.UNKNOWN = "Unknown";

// code status values; also doubles as element class names 

ZmNotificationsPage.CONFIRMED   = "DeviceCodeConfirmed";
ZmNotificationsPage.PENDING     = "DeviceCodePending";
ZmNotificationsPage.UNCONFIRMED = "DeviceCodeUnconfirmed";

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
            ZmNotificationsPage.CONFIRMED : ZmNotificationsPage.UNCONFIRMED;
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
    // TODO: Even though this returns the correct dirty status for pref
    // TODO: saving, we also need to adjust the pref's origValue so that
    // TODO: the default processing doesn't save the value even though
    // TODO: it hasn't changed. But, in the short term, this isn't a
    // TODO: terrible thing.
    return this._form.isDirty("EMAIL");
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
// Public methods
//

ZmNotificationsPage.prototype.isCustom = function() {
    // user selected "Custom"
    var carrierId = this._form && this._form.getValue("DEVICE_EMAIL_CARRIER");
    if (carrierId == ZmNotificationsPage.CUSTOM) return true;

    // any entry w/o an email pattern is also custom
    var carrier = ZmNotificationsPage.CARRIERS[carrierId];
    var hasPattern = Boolean(carrier && carrier.pattern);
    return !hasPattern;
};

ZmNotificationsPage.prototype.getEmailAddress = function() {
    var form = this._form;
    if (!form) return ""; // NOTE: not initialized, yet

    if (this.isCustom()) {
        var number = form.getValue("DEVICE_EMAIL_CUSTOM_NUMBER");
        var address = form.getValue("DEVICE_EMAIL_CUSTOM_ADDRESS");
        return number && address ? [number,address].join("@") : "";
    }

    var phone = ZmNotificationsPage.normalizePhoneNumber(form.getValue("DEVICE_EMAIL_PHONE"));
    var carrier = ZmNotificationsPage.CARRIERS[form.getValue("DEVICE_EMAIL_CARRIER")];
    return phone ? AjxMessageFormat.format(carrier.pattern, [phone]) : "";
};

//
// Protected methods
//

ZmNotificationsPage.prototype._smsDataLoaded = function() {
    // is there anything to do?
    if (!window.ZmSMS) return;

    // setup regions control
    var regionMap = this.__smsDataLoaded_defineRegions();
    var button = this._form.getControl("DEVICE_EMAIL_REGION");
    var menu = this.__createRegionsMenu(button, regionMap);
    if (menu == null) {
        // always have at least one region
        menu = new DwtMenu({parent:button});
        this.__createRegionMenuItem(menu,ZmNotificationsPage.UNKNOWN,ZmMsg.unknown);
    }
    menu.addSelectionListener(this._regionSelectionListener);
    button.setMenu(menu);

    // set default region
    this._setRegion(ZmSMS.defaultRegionId);
};

ZmNotificationsPage.prototype.__smsDataLoaded_defineRegions = function() {
    // define regions
    var regionMap = {};
    for (var id in ZmSMS) {
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
        region[prop] = ZmSMS[id];
    }

    // define carriers
    this.__smsDataLoaded_defineCarriers();

    return regionMap;
};

ZmNotificationsPage.prototype.__smsDataLoaded_defineCarriers = function() {
    for (var id in ZmSMS) {
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
        carrier[prop] = ZmSMS[id];
    }
    return ZmNotificationsPage.CARRIERS;
};

ZmNotificationsPage.prototype.__createRegionsMenu = function(parent, regionMap, parentRegion) {
    var regions = AjxUtil.values(regionMap, ZmNotificationsPage.__acceptRegion);
    if (regions.length == 0) return null;

    var menu = new DwtMenu({parent:parent});

    regions.sort(ZmNotificationsPage.__byLabel);
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

ZmNotificationsPage.prototype.__createRegionMenuItem = function(parent, id, label, image, index) {
    var menuItem = new DwtMenuItem({parent:parent,index:index});
    menuItem.setText(label);
    menuItem.setImage(image);
    menuItem.setData(Dwt.KEY_ID, id);
    return menuItem;
};

ZmNotificationsPage.__acceptRegion = function(regionId, regionMap) {
    var region = regionMap[regionId];
    var hasRegions = false;
    for (var id in region.regions) {
        if (ZmNotificationsPage.__acceptRegion(id, region.regions)) {
            hasRegions = true;
            break;
        }
    }
    var hasCarriers = ZmNotificationsPage.__getRegionCarriers(region).length > 0;
    return hasRegions || hasCarriers;
};

ZmNotificationsPage.__byLabel = AjxCallback.simpleClosure(AjxUtil.byStringProp, window, "label");

ZmNotificationsPage.__getRegionCarriers = function(region, recurse) {
    if (region.carriers && !(region.carriers instanceof Array)) {
        region.carriers = AjxUtil.values(region.carriers);
        region.carriers.sort(ZmNotificationsPage.__byLabel);
    }
    var carriers = region.carriers || [];
    if (recurse && region.regions) {
        for (var regionId in region.regions) {
            carriers = carriers.concat(ZmNotificationsPage.__getRegionCarriers(region.regions[regionId],true));
        }
    }
    return carriers;
};

ZmNotificationsPage.prototype._setupCustomForm = function() {
    var params = {
        parent: this,
        form: {
            template: this._section.templateId,
            items: [
                // default pref page controls
                { id: "REVERT_PAGE", type: "DwtButton", label: ZmMsg.restorePage,
                    onclick: "this.parent._resetPageListener()"
                },
                // email                                                            
                { id: "EMAIL", type: "DwtInputField", hint: ZmMsg.exampleEmailAddr },
                // device email (aka SMS)
                { id: "DEVICE_EMAIL_REGION", type: "DwtButton",
                    enabled: "window.ZmSMS",
                    onclick: this._handleRegionClick
                },
                { id: "DEVICE_EMAIL_CARRIER", type: "DwtSelect", value: ZmNotificationsPage.CUSTOM,
                    enabled: "this.getControl('DEVICE_EMAIL_CARRIER').getOptionCount() > 0"
                },
                { id: "DEVICE_EMAIL_PHONE", type: "DwtInputField",
                    hint: ZmMsg.deviceEmailNotificationsPhoneHint,
                    visible: "!this.parent.isCustom()",
                    onchange: this._handleCarrierChange
                },
                { id: "DEVICE_EMAIL_PHONE_HINT", type: "DwtText", 
                    getter: this._getPhoneHint,
                    visible: "get('DEVICE_EMAIL_PHONE_HINT')" // NOTE: only show if there's a value 
                },
                { id: "DEVICE_EMAIL_PHONE_SEND_CODE", type: "DwtButton",
                    label: ZmMsg.deviceEmailNotificationsVerificationCodeSend,
                    visible: "!this.parent.isCustom()",
                    enabled: "get('DEVICE_EMAIL_PHONE')",
                    onclick: this._handleSendCode
                },
                { id: "DEVICE_EMAIL_CUSTOM_NUMBER", type: "DwtInputField",
                    visible: "this.parent.isCustom()"
                },
                { id: "DEVICE_EMAIL_CUSTOM_ADDRESS", type: "DwtInputField",
                    visible: "this.parent.isCustom()"
                },
                { id: "DEVICE_EMAIL_CUSTOM_SEND_CODE", type: "DwtButton",
                    label: ZmMsg.deviceEmailNotificationsVerificationCodeSend,
                    visible: "this.parent.isCustom()",
                    enabled: "get('DEVICE_EMAIL_CUSTOM_NUMBER') && get('DEVICE_EMAIL_CUSTOM_ADDRESS')",
                    onclick: this._handleSendCode
                },
                { id: "DEVICE_EMAIL_CODE", type: "DwtInputField",
                    hint: ZmMsg.deviceEmailNotificationsVerificationCodeHint
                },
                { id: "DEVICE_EMAIL_CODE_VALIDATE", type: "DwtButton",
                    label: ZmMsg.deviceEmailNotificationsVerificationCodeValidate,
                    enabled: "get('DEVICE_EMAIL_CODE') && this.parent.getEmailAddress()",
                    onclick: this._handleValidateCode
                },
                { id: "DEVICE_EMAIL_CODE_STATUS", type: "DwtText",
                    className: "DeviceCode", getter: this._getCodeStatus 
                },
                // NOTE: This holds the current code status
                { id: "DEVICE_EMAIL_CODE_STATUS_VALUE", value: ZmNotificationsPage.UNCONFIRMED }
            ]
        }
    };
    return new DwtForm(params);
};

ZmNotificationsPage.prototype._setRegion = function(regionId){
    // decorate the region button
    var region = ZmNotificationsPage.REGIONS[regionId] || { id:ZmNotificationsPage.UNKNOWN, label:ZmMsg.unknown };
    var button = this._form.getControl("DEVICE_EMAIL_REGION");
    button.setText(region.label);
    button.setImage(region.image);
    button.setData(Dwt.KEY_ID, region.id);

    // update the form
    this._setCarriers(regionId);
    this._form.setValue("DEFAULT_EMAIL_REGION", regionId);
    if (regionId == ZmSMS.defaultRegionId && ZmSMS.defaultCarrierId) {
        this._form.set("DEVICE_EMAIL_CARRIER", ZmSMS.defaultCarrierId);
    }
    this._form.update();
};

ZmNotificationsPage.prototype._setCarriers = function(regionId) {
    var select = this._form.getControl("DEVICE_EMAIL_CARRIER");
    select.clearOptions();
    var region = ZmNotificationsPage.REGIONS[regionId] || {};
    var carriers = ZmNotificationsPage.__getRegionCarriers(region, true);
    carriers.sort(ZmNotificationsPage.__byLabel);
    for (var i = 0; i < carriers.length; i++) {
        var carrier = carriers[i];
        var image = carrier.image || carrier.region.image;
        select.addOption({displayValue:carrier.label, value:carrier.id, image:image});
    }
    select.addOption({displayValue:ZmMsg.custom, value:ZmNotificationsPage.CUSTOM, image:null});
};

ZmNotificationsPage.prototype._handleRegionSelection = function(event) {
    var regionId = event.item.getData(Dwt.KEY_ID);
    this._setRegion(regionId);
};

// form functions

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._handleRegionClick = function() {
    var button = this.getControl("DEVICE_EMAIL_REGION");
    var menu = button.getMenu();
    if (menu.isPoppedUp()) {
        menu.popdown();
    }
    else {
        button.popup();
    }
};

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._handleCarrierChange = function() {
    var controlId = this.parent.isCustom() ? "DEVICE_EMAIL_NUMBER" : "DEVICE_EMAIL_PHONE";
    var control = this.getControl(controlId);
    if (control && control.focus) {
        control.focus();
    }
};

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._handleSendCode = function() {
    var params = {
        jsonObj: {
            SendVerificationCodeRequest: {
                _jsns: "urn:zimbraMail",
                a: this.parent.getEmailAddress()
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this.parent, this.parent._handleSendCodeResponse)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmNotificationsPage.prototype._handleSendCodeResponse = function(resp) {
    appCtxt.setStatusMsg(ZmMsg.deviceEmailNotificationsVerificationCodeSendSuccess);

    this._form.setValue("DEVICE_EMAIL_STATUS_CODE_VALUE", ZmNotificationsPage.PENDING);
    this._form.update();
};

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._handleValidateCode = function() {
    var params = {
        jsonObj: {
            VerifyCodeRequest: {
                _jsns: "urn:zimbraMail",
                a: this.parent.getEmailAddress(),
                code: this.getValue("DEVICE_EMAIL_CODE")
            }
        },
        asyncMode: true,
        callback: new AjxCallback(this.parent, this.parent._handleValidateCodeResponse)
    };
    appCtxt.getAppController().sendRequest(params);
};

ZmNotificationsPage.prototype._handleValidateCodeResponse = function(resp) {
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

    var status = success ? ZmNotificationsPage.CONFIRMED : ZmNotificationsPage.UNCONFIRMED;
    this._form.setValue("DEVICE_EMAIL_CODE_STATUS_VALUE", status);
    this._form.update();
};

ZmNotificationsPage.normalizePhoneNumber = function(phone) {
    if (phone) {
        phone = phone.replace(/[a-z]/gi,ZmNotificationsPage.__letters2Numbers);
        phone = phone.replace(/[^+#\*0-9]/g,"");
    }
    return phone;
};
ZmNotificationsPage.__letters2Numbers = function($0) {
    return ZmNotificationsPage.__letters2NumbersMap[$0.toLowerCase()];    
};
ZmNotificationsPage.__letters2NumbersMap = {
                    a:2,b:2,c:2,d:3,e:3,f:3,
    g:4,h:4,i:4,    j:5,k:5,l:5,m:6,n:6,o:6,
    p:7,q:7,r:7,s:7,t:8,u:8,v:8,w:9,x:9,y:9,z:9
}

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._getCodeStatus = function() {
    // remove other status class names
    var controlEl = this.getControl("DEVICE_EMAIL_CODE_STATUS").getHtmlElement();
    Dwt.delClass(controlEl, ZmNotificationsPage.CONFIRMED);
    Dwt.delClass(controlEl, ZmNotificationsPage.PENDING);
    Dwt.delClass(controlEl, ZmNotificationsPage.UNCONFIRMED);

    // add appropriate class name
    var status = this.get("DEVICE_EMAIL_CODE_STATUS_VALUE");
    Dwt.addClass(controlEl, status);

    // format status text
    if (status == ZmNotificationsPage.CONFIRMED) {
        var email = appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS);
        if (email) {
            var pattern = ZmMsg.deviceEmailNotificationsVerificationStatusConfirmed;
            return AjxMessageFormat.format(pattern, [email]);
        }
        // default back to unconfirmed
        Dwt.delClass(controlEl, status, ZmNotificationsPage.UNCONFIRMED);
    }
    return status == ZmNotificationsPage.PENDING ?
        ZmMsg.deviceEmailNotificationsVerificationStatusPending :
        ZmMsg.deviceEmailNotificationsVerificationStatusUnconfirmed
    ;
};

/**
 * <strong>Note:</strong>
 * This executes in the context of the DwtForm control.
 *
 * @private
 */
ZmNotificationsPage.prototype._getPhoneHint = function() {
    var carrierId = this.getValue("DEVICE_EMAIL_CARRIER");
    var carrier = ZmNotificationsPage.CARRIERS[carrierId];
    var carrierHint = carrier && carrier.hint;
    var email = this.parent.getEmailAddress();
    var emailHint = email && AjxMessageFormat.format(ZmMsg.deviceEmailNotificationsPhoneNumber, [email]);
    if (carrierHint || emailHint) {
        if (!carrierHint) return emailHint;
        if (!emailHint) return carrierHint;
        return AjxMessageFormat.format(ZmMsg.deviceEmailNotificationsCarrierEmailHint, [emailHint,carrierHint]);
    }
    return "";
};
