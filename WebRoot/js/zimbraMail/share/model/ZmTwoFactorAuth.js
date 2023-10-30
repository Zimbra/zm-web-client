/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2023 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2023 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates ZmTwoFactorAuth.
 * @class
 * This class is used for two-step authentication settings.
 * 
 */
ZmTwoFactorAuth = function() {
    // do nothing
};

// Consts
ZmTwoFactorAuth.DEFAULT_ORDER = ["app", "email"];
ZmTwoFactorAuth.APP = "app";
ZmTwoFactorAuth.EMAIL = "email";

/**
 * non-prototype function.
 * Do not use it until ZmAppCtxt instance is created.
 *
 * Return sorted zimbraTwoFactorAuthMethodAllowed
 */
ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed =
function() {
    if (!window.appCtxt) {
        return [];
    }

    var allowedMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_METHOD_ALLOWED);
    if (typeof allowedMethod === "string") {
        allowedMethod = [allowedMethod];
    }

    // do not update allowedMethod directly
    var allowedMethodSorted = [];
    for (var i = 0; i < ZmTwoFactorAuth.DEFAULT_ORDER.length; i++) {
        if (allowedMethod.indexOf(ZmTwoFactorAuth.DEFAULT_ORDER[i]) !== -1) {
            allowedMethodSorted.push(ZmTwoFactorAuth.DEFAULT_ORDER[i]);
        }
    }
    return allowedMethodSorted;
};

/**
 * non-prototype function.
 * Do not use it until ZmAppCtxt instance is created.
 *
 * Return two-factor authentication methods which are allowed and enabled
 */
ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled =
function() {
    if (!window.appCtxt) {
        return [];
    }

    // TODO: return empty array when zimbraTwoFactorAuthEnabled is FALSE

    var allowedMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed();

    var enabledMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_METHOD_ENABLED) || [];
    if (typeof enabledMethod === "string") {
        enabledMethod = [enabledMethod];
    }

    // for backward compatibility
    var tfaEnabled = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_ENABLED);
    if (tfaEnabled && enabledMethod.length === 0 && allowedMethod.indexOf(ZmTwoFactorAuth.APP) !== -1) {
        enabledMethod = [ZmTwoFactorAuth.APP];
    }

    var allowedAndEnabledMethod = [];
    for (var i = 0; i < allowedMethod.length; i++) {
        if (enabledMethod.indexOf(allowedMethod[i]) !== -1) {
            allowedAndEnabledMethod.push(allowedMethod[i]);
        }
    }

    return allowedAndEnabledMethod;
};

/**
 * non-prototype function.
 * Do not use it until ZmAppCtxt instance is created.
 *
 * Return zimbraPrefPrimaryTwoFactorAuthMethod considering allowed and enabled Methods
 */
ZmTwoFactorAuth.getPrefPrimaryTwoFactorAuthMethod =
function() {
    if (!window.appCtxt) {
        return null
    }

    var enabledMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled();
    var primaryMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_PRIMARY_METHOD);

    if (primaryMethod && enabledMethod.indexOf(primaryMethod) !== -1) {
        return primaryMethod;
    }
    return enabledMethod ? enabledMethod[0] : null;
};