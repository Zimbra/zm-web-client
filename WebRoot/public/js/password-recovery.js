// Moved out of PasswordRecovery.jsp (inline scripts are blocked by CSP). Globals are kept as they were inline.
if(!window.DBG) {
    DBG = new AjxDebug(AjxDebug.NONE, null, false);
}
var params = {
    accountInput : document.getElementById("zPasswordRecoveryConfig").getAttribute("data-account-input")
};
new ZmPasswordRecoveryDialog(params).popup();
var changeTag = document.getElementsByClassName("DwtDialogTitle")[0];
changeTag.outerHTML = "";
changeTag = document.getElementsByClassName("horizSep")[0];
changeTag.outerHTML = "";
