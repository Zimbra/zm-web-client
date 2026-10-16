// Moved out of TwoFactorSetup.jsp (inline scripts are blocked by CSP). Globals are kept as they were inline.
var twoFactorSetupConfig = document.getElementById("zTwoFactorSetupConfig");
if(!window.DBG) {
    DBG = new AjxDebug(AjxDebug.NONE, null, false);
}
var params = {
    userName : twoFactorSetupConfig.getAttribute("data-user-name"),
    isFromLoginPage : true,
    tfaMethodAllowed : twoFactorSetupConfig.getAttribute("data-tfa-method-allowed"),
    isResetPasswordEnabled : twoFactorSetupConfig.getAttribute("data-reset-password-enabled") === "true",
    client : twoFactorSetupConfig.getAttribute("data-client")
};
new ZmTwoFactorSetupDialog(params).popup();
var changeTag = document.getElementsByClassName("DwtDialogTitle")[0];
changeTag.outerHTML = "";
changeTag = document.getElementsByClassName("horizSep")[0];
changeTag.outerHTML = "";
changeTag = document.querySelectorAll('[align=right]');
changeTag[0].align="left";
