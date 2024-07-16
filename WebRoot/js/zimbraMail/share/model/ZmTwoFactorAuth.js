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

ZmTwoFactorAuth.ACTION_RESET = "reset";
ZmTwoFactorAuth.ACTION_EMAIL = "email";
ZmTwoFactorAuth.ACTION_UNKNOWN = "unknown";
ZmTwoFactorAuth.RESET_FAILED = "reset failed";
ZmTwoFactorAuth.NOT_SENT = "not sent";

/**
 * non-prototype function.
 * Do not use it until ZmAppCtxt instance is created.
 *
 * Return sorted zimbraTwoFactorAuthMethodAllowed
 */
ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed =
function(authResponse) {
    var allowedMethod;
    if (authResponse) {
        allowedMethod = [];
        var zimbraTwoFactorAuthMethodAllowed = authResponse.zimbraTwoFactorAuthMethodAllowed;
        if (zimbraTwoFactorAuthMethodAllowed && zimbraTwoFactorAuthMethodAllowed.method) {
            for (var i = 0; i < zimbraTwoFactorAuthMethodAllowed.method.length; i++) {
                allowedMethod.push(zimbraTwoFactorAuthMethodAllowed.method[i]._content);
            }
        } else {
            // for backward compatibility
            allowedMethod = [ZmTwoFactorAuth.APP];
        }
    } else {
        if (!window.appCtxt || !appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_AVAILABLE)) {
            return [];
        }
        allowedMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_METHOD_ALLOWED);
        if (typeof allowedMethod === "string") {
            allowedMethod = [allowedMethod];
        }
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
function(authResponse) {
    var allowedMethod;
    var enabledMethod;
    if (authResponse) {
        allowedMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed(authResponse);
        enabledMethod = [];
        var zimbraTwoFactorAuthMethodEnabled = authResponse.zimbraTwoFactorAuthMethodEnabled;
        if (zimbraTwoFactorAuthMethodEnabled && zimbraTwoFactorAuthMethodEnabled.method) {
            for (var i = 0; i < zimbraTwoFactorAuthMethodEnabled.method.length; i++) {
                // note: recovery address is set and verified at reset password process
                // it is unncessary to check if masked zimbraPrefPasswordRecoveryAddress is returned or not.
                enabledMethod.push(zimbraTwoFactorAuthMethodEnabled.method[i]._content);
            }
        }
        // for backward compatibility
        if (enabledMethod.length == 0 && authResponse.twoFactorAuthRequired && authResponse.twoFactorAuthRequired._content === "true") {
            enabledMethod = [ZmTwoFactorAuth.APP];
        }
    } else {
        if (!window.appCtxt || !appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_ENABLED)) {
            return [];
        }

        allowedMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed();

        enabledMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_METHOD_ENABLED) || [];
        if (typeof enabledMethod === "string") {
            enabledMethod = [enabledMethod];
        }

        // for backward compatibility
        var tfaEnabled = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_ENABLED);
        if (tfaEnabled && enabledMethod.length === 0 && allowedMethod.indexOf(ZmTwoFactorAuth.APP) !== -1) {
            enabledMethod = [ZmTwoFactorAuth.APP];
        }
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
function(authResponse) {
    var enabledMethod;
    var primaryMethod;
    if (authResponse) {
        enabledMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled(authResponse);
        var zimbraPrefPrimaryTwoFactorAuthMethod = authResponse.zimbraPrefPrimaryTwoFactorAuthMethod;
        primaryMethod = zimbraPrefPrimaryTwoFactorAuthMethod && zimbraPrefPrimaryTwoFactorAuthMethod._content;
    } else {
        if (!window.appCtxt) {
            return null
        }

        enabledMethod = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled();
        primaryMethod = appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_PRIMARY_METHOD);
    }

    if (primaryMethod && enabledMethod.indexOf(primaryMethod) !== -1) {
        return primaryMethod;
    }
    return enabledMethod ? enabledMethod[0] : null;
};
