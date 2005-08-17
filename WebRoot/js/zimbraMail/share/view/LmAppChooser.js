function LmAppChooser(parent, className, buttons) {

	className = className ? className : "LmAppChooser";
	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE, null, null, DwtToolBar.VERT_STYLE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttons = new Object();
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == LmAppChooser.SEP) {
			this.addSpacer(LmAppChooser.SEP_HEIGHT);
		} else {
			this._createButton(id);
		}
	}

}

var i = 1;
LmAppChooser.OUTER		= i++;
LmAppChooser.OUTER_ACT	= i++;
LmAppChooser.OUTER_TRIG	= i++;

LmAppChooser.SEP		= i++;

LmAppChooser.B_EMAIL	= i++;
LmAppChooser.B_CONTACTS	= i++;
LmAppChooser.B_CALENDAR	= i++;
LmAppChooser.B_HELP		= i++;
LmAppChooser.B_OPTIONS	= i++;
LmAppChooser.B_LOGOUT	= i++;

LmAppChooser.IMAGE = new Object();
LmAppChooser.IMAGE[LmAppChooser.OUTER]		= "app_chiclet";
LmAppChooser.IMAGE[LmAppChooser.OUTER_ACT]	= "app_chiclet_selected";
LmAppChooser.IMAGE[LmAppChooser.OUTER_TRIG]	= "app_chiclet_selected";

LmAppChooser.IMAGE[LmAppChooser.B_EMAIL]	= "sm_icon_email";
LmAppChooser.IMAGE[LmAppChooser.B_CONTACTS]	= "sm_icon_contact";
LmAppChooser.IMAGE[LmAppChooser.B_CALENDAR]	= "sm_icon_calendar";
LmAppChooser.IMAGE[LmAppChooser.B_HELP]		= "sm_icon_help";
LmAppChooser.IMAGE[LmAppChooser.B_OPTIONS]	= "sm_icon_options";
LmAppChooser.IMAGE[LmAppChooser.B_LOGOUT]	= "sm_icon_logout";

LmAppChooser.TOOLTIP = new Object();
LmAppChooser.TOOLTIP[LmAppChooser.B_EMAIL]		= LmMsg.goToMail;
LmAppChooser.TOOLTIP[LmAppChooser.B_CONTACTS]	= LmMsg.goToContacts;
LmAppChooser.TOOLTIP[LmAppChooser.B_CALENDAR]	= LmMsg.goToCalendar;
LmAppChooser.TOOLTIP[LmAppChooser.B_HELP]		= LmMsg.goToHelp;
LmAppChooser.TOOLTIP[LmAppChooser.B_OPTIONS]	= LmMsg.goToOptions;
LmAppChooser.TOOLTIP[LmAppChooser.B_LOGOUT]		= LmMsg.logOff;

LmAppChooser.SEP_HEIGHT = 10;

LmAppChooser.prototype = new DwtToolBar;
LmAppChooser.prototype.constructor = LmAppChooser;

LmAppChooser.prototype.toString = 
function() {
	return "LmAppChooser";
}

LmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
}

LmAppChooser.prototype._createButton =
function(id) {
	var b = new LmChicletButton(this, LmAppChooser.IMAGE[LmAppChooser.OUTER], LmAppChooser.IMAGE[id]);
	b.setActivatedImage(LmAppChooser.IMAGE[LmAppChooser.OUTER_ACT]);
	b.setTriggeredImage(LmAppChooser.IMAGE[LmAppChooser.OUTER_TRIG]);
	b.setToolTipContent(LmAppChooser.TOOLTIP[id]);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
}
