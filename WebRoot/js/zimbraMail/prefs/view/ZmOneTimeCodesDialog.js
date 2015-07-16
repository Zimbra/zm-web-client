
/**
 * Creates a dialog for
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmOneTimeCodesDialog = function(params) {
	this.twoStepAuthCodesSpan = params.twoStepAuthCodesSpan;
	this.twoStepAuthCodesViewLink = params.twoStepAuthCodesViewLink;
	this.twoStepAuthCodesGenerateLink = params.twoStepAuthCodesGenerateLink;
	var generateNewCodesButton = new DwtDialog_ButtonDescriptor(ZmOneTimeCodesDialog.GENERATE_NEW_CODES_BUTTON, ZmMsg.twoStepAuthGenerateNewCodes, DwtDialog.ALIGN_LEFT, this._getScratchCodes.bind(this, true));
	var printButton = new DwtDialog_ButtonDescriptor(ZmOneTimeCodesDialog.PRINT_BUTTON, ZmMsg.print, DwtDialog.ALIGN_RIGHT, this._printListener.bind(this));
	var closeButton = new DwtDialog_ButtonDescriptor(DwtDialog.DISMISS_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT, this.popdown.bind(this));
	var newParams = {
		parent : appCtxt.getShell(),
		title : ZmMsg.twoStepAuthOneTimeCodesTitle,
		standardButtons: [DwtDialog.NO_BUTTONS],
		extraButtons : [generateNewCodesButton, printButton, closeButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml());
	this._setAllowSelection();
};

ZmOneTimeCodesDialog.prototype = new DwtDialog;
ZmOneTimeCodesDialog.prototype.constructor = ZmOneTimeCodesDialog;

ZmOneTimeCodesDialog.GENERATE_NEW_CODES_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmOneTimeCodesDialog.PRINT_BUTTON = ++DwtDialog.LAST_BUTTON;

/**
 * Pops-up the dialog.
 */
ZmOneTimeCodesDialog.prototype.popup =
function() {
	this._getScratchCodes();
	DwtDialog.prototype.popup.call(this);
};

ZmOneTimeCodesDialog.prototype._getScratchCodes =
function(isNew) {
	var params = {
		twoStepAuthCodesSpan : this.twoStepAuthCodesSpan,
		twoStepAuthCodesViewLink : this.twoStepAuthCodesViewLink,
		twoStepAuthCodesGenerateLink : this.twoStepAuthCodesGenerateLink
	};
	var callback = this._getScratchCodesCallback.bind(this);
	ZmAccountsPage.getScratchCodes(isNew, params, callback);
};

ZmOneTimeCodesDialog.prototype._getScratchCodesCallback =
function(scratchCode) {
	this.setContent(this._contentHtml(scratchCode));
};

ZmOneTimeCodesDialog.prototype._printListener =
function() {
	var content = AjxTemplate.expand("prefs.Pages#OneTimeCodesPrint", {content : this._getContentDiv().innerHTML});
	var win = window.open('', '_blank');
	appCtxt.handlePopupBlocker(win);
	win.document.write(content);
	win.document.close();
	win.focus();
	win.print();
};

ZmOneTimeCodesDialog.prototype._contentHtml =
function(oneTimeCodes) {
	var data = {
		id : this._htmlElId,
		oneTimeCodes : oneTimeCodes
	};
	return AjxTemplate.expand("prefs.Pages#OneTimeCodes", data);
};