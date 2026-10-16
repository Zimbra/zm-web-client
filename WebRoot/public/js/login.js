/*
 * Login page behaviour. This used to be inline in public/login.jsp, which a Content-Security-Policy blocks.
 * Server-side values are read from data-* attributes on #zLoginConfig, and clicks are routed through
 * data-login-action attributes instead of inline onclick handlers.
 */
(function () {
    var configElement = document.getElementById("zLoginConfig");

    function getConfigString(name) {
        return configElement ? (configElement.getAttribute("data-" + name) || "") : "";
    }

    function getConfigNumber(name) {
        return Number(getConfigString(name)) || 0;
    }

    function getConfigBoolean(name) {
        return getConfigString(name) === "true";
    }

    var totpAuthRequired = getConfigBoolean("totp-auth-required");

    function getElement(id) {
        return document.getElementById(id);
    }

    var link = getElement("bannerLink");
    if (link) {
        link.href = skin.hints.banner.url;
    }

    if (getConfigBoolean("ie-resize-hack")) {
        /*HACK FOR IE*/
        var resizeLoginPanel = function () {
            var panelElem = getElement('ZLoginPanel');
            if (panelElem && !panelElem.style.maxWidth) { if (document.body.clientWidth >= 500) { panelElem.style.width = "500px"; } else { panelElem.style.width = "90%"; } }
        };
        resizeLoginPanel();
        if (window.attachEvent) { window.attachEvent("onresize", resizeLoginPanel); }
    }

    function showTFAMethods(showChooseMethod, previousMethod) {
        getElement('chooseMethod').value = showChooseMethod;
        if (showChooseMethod) {
            getElement('totpcode').value = "";
        }
        if (previousMethod) {
            getElement("tfaMethod_" + previousMethod).checked = true;
        }
        getElement('zLoginForm').submit();
        return false;
    }

    function resendEmail() {
        getElement('totpcode').value = "";
        getElement('actionResend').value = "true";
        getElement('zLoginForm').submit();
        return false;
    }

    function doTFALogin(isVerify) {
        var totpCode = getElement('totpcode').value;
        if (!isVerify || !totpCode) {
            // do cancel action
            // remove some parameters for secure
            getElement('tfaMethod').value = "cancel";
            getElement('zrememberme').value = "";
            getElement('maskedEmailAddress').value = "";
            getElement('totpcode').value = "";
        }
        getElement('zLoginForm').submit();
        return false;
    }

    function updateTFAVerifyButtonStatus(input) {
        var button = getElement('verifyButton');
        if (input && input.value) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    }

    function onLoad() {
        var loginForm = document.loginForm;
        if (loginForm.username) {
            if (loginForm.username.value != "") {
                loginForm.password.focus(); //if username set, focus on password
            }
            else {
                loginForm.username.focus();
            }
        }
        clientChange(getConfigString("client"));
        if (totpAuthRequired && loginForm.totpcode) {
            loginForm.totpcode.focus();
            updateTFAVerifyButtonStatus();
        }
    }

    // show a message if they should be using the 'standard' client, but have chosen 'advanced' instead
    function clientChange(selectValue) {
        var div = getElement("ZLoginUnsupported");
        if (div) {
            div.style.display = 'none';
        }
    }

    function forgotPassword() {
        var accountInput = getElement("username").value;
        var queryParams = encodeURI("account=" + accountInput);
        var url = "/public/PasswordRecovery.jsp?" + location.search;

        if (accountInput !== '') {
            url += (location.search !== '' ? '&' : '') + encodeURI("account=" + accountInput);
        }

        window.location.href = url;
    }

    function hideTooltip() {
        getElement('ZLoginWhatsThis').style.display = 'none';
    }
    function showTooltip() {
        getElement('ZLoginWhatsThis').style.display = "block";
    }

    function showHidePasswordFields(passElem, showSpanElem, hideSpanElem) {
        if (passElem.type === "password") {
            passElem.type = "text";
            showSpanElem.style.display = "none";
            hideSpanElem.style.display = "block";
        } else {
            passElem.type = "password";
            showSpanElem.style.display = "block";
            hideSpanElem.style.display = "none";
        }
    }

    function showPassword() {
        showHidePasswordFields(getElement("password"), getElement("showSpan"), getElement("hideSpan"));
    }
    function showNewPassword() {
        showHidePasswordFields(getElement("newPassword"), getElement("newPasswordShowSpan"), getElement("newPasswordHideSpan"));
    }
    function showConfirmPassword() {
        showHidePasswordFields(getElement("confirm"), getElement("confirmShowSpan"), getElement("confirmHideSpan"));
    }

    // Replaces the inline onclick handlers: elements carry data-login-action="<name>".
    var actions = {
        tfaNext: function () { showTFAMethods(false); },
        tfaBack: function (element) { showTFAMethods(false, element.getAttribute("data-tfa-method")); },
        tfaChooseOther: function () { showTFAMethods(true); },
        tfaVerify: function () { doTFALogin(true); },
        tfaCancel: function () { doTFALogin(false); },
        resendEmail: function () { resendEmail(); },
        forgotPassword: function () { forgotPassword(); },
        showPassword: function () { showPassword(); },
        showNewPassword: function () { showNewPassword(); },
        showConfirmPassword: function () { showConfirmPassword(); },
        showTooltip: function () { showTooltip(); },
        hideTooltip: function () { hideTooltip(); }
    };

    document.addEventListener("click", function (event) {
        var element = event.target;
        while (element && element !== document) {
            var name = element.getAttribute && element.getAttribute("data-login-action");
            if (name && actions.hasOwnProperty(name)) {
                actions[name](element);
                return;
            }
            element = element.parentNode;
        }
    });

    var totpInput = getElement("totpcode");
    if (totpInput) {
        totpInput.addEventListener("input", function () { updateTFAVerifyButtonStatus(this); });
    }

    var clientSelect = getElement("client");
    if (clientSelect) {
        clientSelect.addEventListener("change", function () { clientChange(this.options[this.selectedIndex].value); });
    }

    window.addEventListener("load", onLoad);

    if (!totpAuthRequired) {
        var oldPasswordInput = getElement("password");
        var newPasswordInput = getElement("newPassword");
        var confirmPasswordInput = getElement("confirm");
        var loginButton = getElement("loginButton");
        var errorMessageDiv = getElement("errorMessageDiv");
        var allRulesMatched = false;

        var minLength = getConfigNumber("min-length");
        var minUpperCaseChars = getConfigNumber("min-upper-case-chars");
        var minLowerCaseChars = getConfigNumber("min-lower-case-chars");
        var minNumericChars = getConfigNumber("min-numeric-chars");
        var minPunctuationChars = getConfigNumber("min-punctuation-chars");
        var minDigitsOrPuncs = getConfigNumber("min-digits-or-puncs");
        var usernameRuleEnabled = getConfigBoolean("username-rule-enabled");
        var allowedChars = getConfigString("allowed-chars");
        var allowedPunctuationChars = getConfigString("allowed-punctuation-chars");
        var allowedCharsMsg = getConfigString("allowed-chars-msg");
        var bothPasswordsMustMatchMsg = getConfigString("both-passwords-must-match-msg");
        var usernamePrefix = getConfigString("username-prefix");

        if (newPasswordInput) {
            loginButton.disabled = true;
        }

        if (getConfigString("error-code") === "") {
            errorMessageDiv.style.display = "none";
        }

        var enabledRules = [];
        var supportedRules = [
            {
                type: "zimbraPasswordMinLength",
                checkImg: getElement("minLengthCheckImg"),
                closeImg: getElement("minLengthCloseImg")
            },
            {
                type: "zimbraPasswordMinUpperCaseChars",
                checkImg: getElement("minUpperCaseCheckImg"),
                closeImg: getElement("minUpperCaseCloseImg")
            },
            {
                type: "zimbraPasswordMinLowerCaseChars",
                checkImg: getElement("minLowerCaseCheckImg"),
                closeImg: getElement("minLowerCaseCloseImg")
            },
            {
                type: "zimbraPasswordMinNumericChars",
                checkImg: getElement("minNumericCharsCheckImg"),
                closeImg: getElement("minNumericCharsCloseImg")
            },
            {
                type: "zimbraPasswordMinPunctuationChars",
                checkImg: getElement("minPunctuationCharsCheckImg"),
                closeImg: getElement("minPunctuationCharsCloseImg")
            },
            {
                type: "zimbraPasswordMinDigitsOrPuncs",
                checkImg: getElement("minDigitsOrPuncsCheckImg"),
                closeImg: getElement("minDigitsOrPuncsCloseImg")
            },
            {
                type: "zimbraPasswordAllowUsername",
                checkImg: getElement("allowUsernameCheckImg"),
                closeImg: getElement("allowUsernameCloseImg")
            }
        ];

        if (minLength) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinLength"; }));
        }

        if (minUpperCaseChars) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinUpperCaseChars"; }));
        }

        if (minLowerCaseChars) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinLowerCaseChars"; }));
        }

        if (minNumericChars) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinNumericChars"; }));
        }

        if (minPunctuationChars) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinPunctuationChars"; }));
        }

        if (minDigitsOrPuncs) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordMinDigitsOrPuncs"; }));
        }

        if (usernameRuleEnabled) {
            enabledRules.push(supportedRules.find(function (rule) { return rule.type === "zimbraPasswordAllowUsername"; }));
        }

        var compareConfirmPass = function () {
            if (getElement("newPassword").value === getElement("confirm").value) {
                errorMessageDiv.style.display = "none";
                return true;
            } else {
                event.preventDefault();
                errorMessageDiv.style.display = "block";
                errorMessageDiv.innerHTML = bothPasswordsMustMatchMsg;
                return false;
            }
        };

        var check = function (checkImg, closeImg) {
            closeImg.style.display = "none";
            checkImg.style.display = "inline";
        };
        var unCheck = function (checkImg, closeImg) {
            closeImg.style.display = "inline";
            checkImg.style.display = "none";
        };
        var resetImg = function (condition, checkImg, closeImg) {
            condition ? check(checkImg, closeImg) : unCheck(checkImg, closeImg);
        };
        var compareMatchedRules = function (matchedRule) {
            enabledRules.forEach(function (rule) {
                if (matchedRule.findIndex(function (mRule) { return mRule.type === rule.type; }) >= 0) {
                    check(rule.checkImg, rule.closeImg);
                } else {
                    unCheck(rule.checkImg, rule.closeImg);
                }
            });
        };

        var setloginButtonDisabled = function (condition) {
            if (condition) {
                loginButton.disabled = true;
            } else {
                if (oldPasswordInput.value !== "") {
                    loginButton.disabled = false;
                }
            }
        };

        // Function to encode XML characters
        var escapeXml = function (xmlString) {
            return xmlString.replace(/[<>&'"]/g, function (char) {
                switch (char) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case "'": return '&apos;';
                    case '"': return '&quot;';
                }
            });
        };

        // Function to check special character
        var isAsciiPunc = function (ch) {
            return (ch >= 33 && ch <= 47) || // ! " # $ % & ' ( ) * + , - . /
                (ch >= 58 && ch <= 64) || // : ; < = > ? @
                (ch >= 91 && ch <= 96) || // [ \ ] ^ _ `
                (ch >= 123 && ch <= 126); // { | } ~
        };

        var parseCharsFromPassword = function (passwordString) {
            var uppers = [],
                lowers = [],
                numbers = [],
                punctuations = [],
                invalidChars = [],
                invalidPuncs = [];

            var chars = passwordString.split('');

            chars.forEach(function (char) {
                var charCode = char.charCodeAt(0);
                var isInvalid = false;

                if (allowedChars) {
                    try {
                        if (!char.match(new RegExp(allowedChars, 'g'))) {
                            invalidChars.push(char);
                            isInvalid = true;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }

                if (!isInvalid) {
                    if (charCode >= 65 && charCode <= 90) {
                        uppers.push(char);
                    } else if (charCode >= 97 && charCode <= 122) {
                        lowers.push(char);
                    } else if (charCode >= 48 && charCode <= 57) {
                        numbers.push(char);
                    } else if (allowedPunctuationChars) {
                        try {
                            char.match(new RegExp(allowedPunctuationChars, 'g'))
                                ? punctuations.push(char)
                                : invalidPuncs.push(char);
                        } catch (error) {
                            console.error(error);
                        }
                    } else if (isAsciiPunc(charCode)) {
                        punctuations.push(char);
                    }
                }
            });

            return {
                uppers: uppers,
                lowers: lowers,
                numbers: numbers,
                punctuations: punctuations,
                invalidChars: invalidChars,
                invalidPuncs: invalidPuncs
            };
        };

        var handleNewPasswordChange = function () {
            var currentValue = newPasswordInput.value;
            var encodedPwd = escapeXml(currentValue);
            var parsedChars = parseCharsFromPassword(currentValue);
            var matchedRule = [];

            if (minLength) {
                if (currentValue.length >= minLength) {
                    matchedRule.push({ type: "zimbraPasswordMinLength" });
                }
            }

            if (minUpperCaseChars) {
                if (parsedChars.uppers.length >= minUpperCaseChars) {
                    matchedRule.push({ type: "zimbraPasswordMinUpperCaseChars" });
                }
            }

            if (minLowerCaseChars) {
                if (parsedChars.lowers.length >= minLowerCaseChars) {
                    matchedRule.push({ type: "zimbraPasswordMinLowerCaseChars" });
                }
            }

            if (minNumericChars) {
                if (parsedChars.numbers.length >= minNumericChars) {
                    matchedRule.push({ type: "zimbraPasswordMinNumericChars" });
                }
            }

            if (minPunctuationChars) {
                if (parsedChars.punctuations.length >= minPunctuationChars) {
                    matchedRule.push({ type: "zimbraPasswordMinPunctuationChars" });
                }
            }

            if (minDigitsOrPuncs) {
                if (parsedChars.punctuations.length + parsedChars.numbers.length >= minDigitsOrPuncs) {
                    matchedRule.push({ type: "zimbraPasswordMinDigitsOrPuncs" });
                }
            }

            if (usernameRuleEnabled) {
                if (!encodedPwd.includes(usernamePrefix)) {
                    matchedRule.push({ type: "zimbraPasswordAllowUsername" });
                }
            }

            if (matchedRule.length >= enabledRules.length) {
                allRulesMatched = true;
            } else {
                allRulesMatched = false;
            }

            compareMatchedRules(matchedRule);

            if (parsedChars.invalidChars.length > 0) {
                errorMessageDiv.style.display = "block";
                errorMessageDiv.innerHTML = parsedChars.invalidChars.join(", ") + " " + allowedCharsMsg;
            } else {
                errorMessageDiv.style.display = "none";
            }

            if (newPasswordInput.value !== "") {
                resetImg(confirmPasswordInput.value === newPasswordInput.value, getElement("mustMatchCheckImg"), getElement("mustMatchCloseImg"));
                setloginButtonDisabled(!allRulesMatched || confirmPasswordInput.value !== newPasswordInput.value);
            }
        };

        var handleConfirmPasswordChange = function () {
            resetImg(confirmPasswordInput.value === newPasswordInput.value, getElement("mustMatchCheckImg"), getElement("mustMatchCloseImg"));
            setloginButtonDisabled(!allRulesMatched || confirmPasswordInput.value !== newPasswordInput.value);
        };

        var handleOldPasswordChange = function () {
            setloginButtonDisabled(!allRulesMatched || newPasswordInput.value === "" || oldPasswordInput.value === "" || confirmPasswordInput.value !== newPasswordInput.value);
        };

        newPasswordInput && oldPasswordInput && oldPasswordInput.addEventListener("input", handleOldPasswordChange, null);
        newPasswordInput && newPasswordInput.addEventListener("input", handleNewPasswordChange, null);
        confirmPasswordInput && confirmPasswordInput.addEventListener("input", handleConfirmPasswordChange, null);
    }
})();
