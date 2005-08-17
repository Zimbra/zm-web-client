// data constants

var _SUNDAY_ = "SUNDAY";
var _MONDAY_ = "MONDAY";
var _TUESDAY_ = "TUESDAY";
var _WEDNESDAY_ = "WEDNESDAY";
var _THURSDAY_ = "THURSDAY";
var _FRIDAY_ = "FRIDAY";
var _SATURDAY_ = "SATURDAY";

var _DAY_ = "DAY";
var _WEEKDAY_ = "WEEKKDAY";
var _WEEKEND_DAY_ = "WEEKEND_DAY";



// appointment fields
var _SUBJECT_ = "name";
var _LOCATION_ = "location";
var _ALL_DAY_ = "allDayEvent";
var _START_DATE_ = "startDate";
var _END_DATE_ = "endDate";
var _REPEAT_TYPE_ = "repeatType";
var _REPEAT_DISPLAY_ = "repeatDisplay";
var _REPEAT_CUSTOM_ = "repeatCustom";
var _REPEAT_CUSTOM_COUNT_ = "repeatCustomCount";
var _REPEAT_CUSTOM_TYPE_ = "repeatCustomType";
var _REPEAT_CUSTOM_ORDINAL_ = "repeatCustomOrdinal";
var _REPEAT_CUSTOM_DAY_OF_WEEK_ = "repeatCustomDayOfWeek";
var _REPEAT_WEEKLY_DAYS_ = "repeatWeeklyDays";
var _REPEAT_MONTHLY_DAY_LIST_ = "repeatMonthlyDayList";
var _REPEAT_CUSTOM_MONTH_DAY_ = "repeatCustomMonthDay";
var _REPEAT_YEARLY_MONTHS_LIST_ = "repeatYearlyMonthsList";
var _REPEAT_END_DATE_ = "repeatEndDate";
var _REPEAT_END_COUNT_ = "repeatEndCount";
var _REPEAT_END_TYPE_ = "repeatEndType";
var _ATTENDEES_ = "attendees";
var _NOTES_ = "notes";
var _MESSAGE_ = "_message";
var _ATTACHMENTS_ = "_message/_validAttachments";
var _ATTACHMENTS_ = "_validAttachments";
var _VIEW_MODE_ = "viewMode";
var _TIMEZONE_ = "timezone";
var _START_END_DATE_RANGE_ = "startEndDateRange";
var _ORGANIZER_ = "organizer";

// labels
// TODO: il18n
var _Subject_ = "Subject:";
var _Location_ = "Location:";
var _All_Day_ = "All day appointment";
var _Starts_ = "Starts:";
var _Ends_ = "Ends:";
var _Repeat_ = "Repeat:";
var _Frequency_ = "Frequency:";
var _Repeat_Custom_ = "Customize";
var _Attendees_ = "Attendees:";
var _Notes_ = "Notes:";
var _Repeat_End_Type_ = "Repeat Ends:"

var _Sunday_ = "Sunday";
var _Monday_ = "Monday";
var _Tuesday_ = "Tuesday";
var _Wednesday_ = "Wednesday";
var _Thursday_ = "Thursday";
var _Friday_ = "Friday";
var _Saturday_ = "Saturday";


var _Sunday_abbr_ = "Sun";
var _Monday_abbr_ = "Mon";
var _Tuesday_abbr_ = "Tue";
var _Wednesday_abbr_ = "Wed";
var _Thursday_abbr_ = "Thu";
var _Friday_abbr_ = "Fri";
var _Saturday_abbr_ = "Sat";

var _Sunday_caps_abbr_ = "SU";
var _Monday_caps_abbr_ = "MO";
var _Tuesday_caps_abbr_ = "TU";
var _Wednesday_caps_abbr_ = "WE";
var _Thursday_caps_abbr_ = "TH";
var _Friday_caps_abbr_ = "FR";
var _Saturday_caps_abbr_ = "SA";

var _Sunday_initial_ = "S";
var _Monday_initial_ = "M";
var _Tuesday_initial_ = "T";
var _Wednesday_initial_ = "W";
var _Thursday_initial_ = "T";
var _Friday_initial_ = "F";
var _Saturday_initial_ = "S";

var _Day_ = "day";
var _Weekday_ = "weekday";
var _Weekend_Day_ = "weekend day";


var _January_abbr_ = "Jan";
var _February_abbr_ = "Feb";
var _March_abbr_ = "Mar";
var _April_abbr_ = "Apr";
var _May_abbr_ = "May";
var _June_abbr_ = "Jun";
var _July_abbr_ = "Jul";
var _August_abbr_ = "Aug";
var _September_abbr_ = "Sep";
var _October_abbr_ = "Oct";
var _November_abbr_ = "Nov";
var _December_abbr_ = "Dec";

var _January_ = "January";
var _February_ = "February";
var _March_ = "March";
var _April_ = "April";
var _May_ = "May";
var _June_ = "June";
var _July_ = "July";
var _August_ = "August";
var _September_ = "September";
var _October_ = "October";
var _November_ = "November";
var _December_ = "December";


var _None_ = "None";
var _Daily_ = "Daily";
var _Weekly_ = "Weekly";
var _Monthly_ = "Monthly";
var _Yearly_ = "Yearly";
var _Custom_ = "Custom";

var _Never_ = "Never";
var _On_Date_ = "On Date:";
var _After_ = "After:";

var _First_ = "first";
var _Second_ = "second";
var _Third_ = "third";
var _Fourth_ = "fourth";
var _Last_ = "last";

var _Every_ = "Every";

// lists of day of week and month
var _DAY_OF_WEEK_NAME_LIST_ = [
	_Sunday_,	_Monday_,	_Tuesday_, _Wednesday_,
	_Thursday_, _Friday_, _Saturday_
]

var _DAY_OF_MONTH_NAME_LIST_ = [
	"0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", 
	"11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
	"21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"
]

var _MONTH_NAME_LIST_ = [
	_January_, _February_, _March_, _April_, _May_, _June_,
	_July_, _August_, _September_, _October_, _November_, _December_
]


// choices
var _DAY_OF_WEEK_ABBR_CHOICES_ = [
	{value:_Sunday_abbr_, label:_Sunday_abbr_},		{value:_Monday_abbr_, label:_Monday_abbr_},	
	{value:_Tuesday_abbr_, label:_Tuesday_abbr_},	{value:_Wednesday_abbr_, label:_Wednesday_abbr_},
	{value:_Thursday_abbr_, label:_Thursday_abbr_},	{value:_Friday_abbr_, label:_Friday_abbr_},	
	{value:_Saturday_abbr_, label:_Saturday_abbr_}
];
	
var _DAY_OF_WEEK_INITIAL_CHOICES_ = [
	{value:_Sunday_caps_abbr_, label:_Sunday_initial_},		{value:_Monday_caps_abbr_, label:_Monday_initial_},	
	{value:_Tuesday_caps_abbr_, label:_Tuesday_initial_},	{value:_Wednesday_caps_abbr_, label:_Wednesday_initial_},
	{value:_Thursday_caps_abbr_, label:_Thursday_initial_},	{value:_Friday_caps_abbr_, label:_Friday_initial_},	
	{value:_Saturday_caps_abbr_, label:_Saturday_initial_}
];

var _EXTENDED_DAY_OF_WEEK_CHOICES_ = [
	{value:_Sunday_caps_abbr_, label:_Sunday_},			{value:_Monday_caps_abbr_, label:_Monday_},	
	{value:_Tuesday_caps_abbr_, label:_Tuesday_},       {value:_Wednesday_caps_abbr_, label:_Wednesday_},
	{value:_Thursday_caps_abbr_, label:_Thursday_},		{value:_Friday_caps_abbr_, label:_Friday_},
	{value:_Saturday_caps_abbr_, label:_Saturday_}
];

var _MONTH_ABBR_CHOICES_  = [
	{value:0, label:_January_abbr_},	{value:1, label:_February_abbr_},
	{value:2, label:_March_abbr_},		{value:3, label:_April_abbr_},
	{value:4, label:_May_abbr_},		{value:5, label:_June_abbr_},		
	{value:6, label:_July_abbr_},		{value:7, label:_August_abbr_},		
	{value:8, label:_September_abbr_},	{value:9, label:_October_abbr_},
	{value:10, label:_November_abbr_},	{value:11, label:_December_abbr_}
];

var _MONTH_DAY_CHOICES_ = [
	"1","2","3","4","5","6","7","8","9","10",
	"11","12","13","14","15","16","17","18","19","20",
	"21","22","23","24","25","26","27","28","29","30","31"
];


var _REPEAT_TYPE_CHOICES_ = [
	{value:"NON", label:_None_},
	{value:"DAI", label:_Daily_},	
	{value:"WEE", label:_Weekly_},	
	{value:"MON", label:_Monthly_},	
	{value:"YEA", label:_Yearly_}
];

var _REPEAT_END_TYPE_CHOICES_ = [
	{value:"N", label:_Never_},
	{value:"D", label:_On_Date_},
	{value:"A", label:_After_}
];

var _REPEAT_CUSTOM_ORDINAL_CHOICES_ = [
	{value:"1", label:_First_},	{value:"2", label:_Second_},	
	{value:"3", label:_Third_},	{value:"4", label:_Fourth_},
	{value:"-1", label:_Last_}
];

var _REPEAT_CUSTOM_TYPE_CHOICES_ = [
	{value:"S", label:"Specific"},
	{value:"O", label:"Ordinal"}
];

var _TIME_OF_DAY_CHOICES = [ 
	{ label:'12:00 AM', value:'0:00' }, { label:'12:30 AM', value: '0:30' },
	{ label:'1:00 AM', value: '1:00' }, { label:'1:30 AM', value: '1:30' },
	{ label:'2:00 AM', value: '2:00' },	{ label:'2:30 AM', value: '2:30' },
	{ label:'3:00 AM', value: '3:00' },	{ label:'3:30 AM', value: '3:30' },
	{ label:'4:00 AM', value: '4:00' },	{ label:'4:30 AM', value: '4:30' },
	{ label:'5:00 AM', value: '5:00' },	{ label:'5:30 AM', value: '5:30' },
	{ label:'6:00 AM', value: '6:00' },	{ label:'6:30 AM', value: '6:30' },
	{ label:'7:00 AM', value: '7:00' },	{ label:'7:30 AM', value: '7:30' },
	{ label:'8:00 AM', value: '8:00' },	{ label:'8:30 AM', value: '8:30' },
	{ label:'9:00 AM', value: '9:00' },	{ label:'9:30 AM', value: '9:30' },
	{ label:'10:00 AM', value: '10:00' }, { label:'10:30 AM', value: '10:30' },
	{ label:'11:00 AM', value: '11:00' }, { label:'11:30 AM', value: '11:30' },
	{ label:'12:00 PM', value:'12:00' }, { label:'12:30 PM', value: '12:30' },
	{ label:'1:00 PM', value: '13:00' }, { label:'1:30 PM', value: '13:30' },
	{ label:'2:00 PM', value: '14:00' }, { label:'2:30 PM', value: '14:30' },
	{ label:'3:00 PM', value: '15:00' }, { label:'3:30 PM', value: '15:30' },
	{ label:'4:00 PM', value: '16:00' }, { label:'4:30 PM', value: '16:30' },
	{ label:'5:00 PM', value: '17:00' }, { label:'5:30 PM', value: '17:30' },
	{ label:'6:00 PM', value: '18:00' }, { label:'6:30 PM', value: '18:30' },
	{ label:'7:00 PM', value: '19:00' }, { label:'7:30 PM', value: '19:30' },
	{ label:'8:00 PM', value: '20:00' }, { label:'8:30 PM', value: '20:30' },
	{ label:'9:00 PM', value: '21:00' }, { label:'9:30 PM', value: '21:30' },
	{ label:'10:00 PM', value: '22:00' }, { label:'10:30 PM', value: '22:30' },
	{ label:'11:00 PM', value: '23:00' }, { label:'11:30 PM', value: '23:30' }
 ];

LmAppointmentView.UPLOAD_FIELD_NAME = "LmAppointmentView_upload_field";
LmAppointmentView.IFRAME_HEIGHT = 30;
LmAppointmentView.MODE_NEW = 1;
LmAppointmentView.MODE_EDIT_SERIES = 2;
LmAppointmentView.MODE_EDIT_INSTANCE = 3;

LmAppointmentView.DEFAULT_APPOINTMENT_DURATION = 3600000;

LmAppointmentView.MAX_HEIGHT = 470;

function LmAppointmentView(dwtContainer, modelObj, delayInitialization) {
	this._dwtContainer = dwtContainer;
	DwtComposite.call(this, dwtContainer, "LmAppointmentView");
	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	if (!delayInitialization) {
		this._initializeView(modelObj);
	}

}

LmAppointmentView.prototype = new DwtComposite();
LmAppointmentView.prototype.constructor = LmAppointmentView;

LmAppointmentView.prototype._initializeView = function (modelObj, mode, optionalStartDate) {
	if (!this.__initialized) {
		this._initForm(modelObj, mode, optionalStartDate);
		this._fbDirty = true;
		this._addKeyHandlers();
		this.__initialized = true;
	}
};

LmAppointmentView.prototype._replaceDwtContainer = function () {
	var el = this.getHtmlElement();
	el.parentNode.replaceChild(this._apptForm.getHtmlElement(), el);
	this._htmlElId = this._apptForm._htmlElId;
	this._apptForm.setClassName("LmAppointmentView");
};

LmAppointmentView.prototype._initForm = function (modelObj, mode, optionalStartDate) {
	this._apptXModel = new XModel(LmAppointmentView.appointmentModel);
	XModel.registerErrorMessage("invalidEmail", "All attendees must have valid email addresses.");
	XModel.registerErrorMessage("endDateBeforeStart", "The end date you've selected is before the start date.");
	this._apptForm = new XForm(this.getAppointmentForm(), this._apptXModel, modelObj, this);
	this._apptForm.setController(this);
	this._apptForm.__username = this._appCtxt.get(LmSetting.USERNAME);
	var ls = new LsListener(this, this._formUpdatedListener);
	this._apptForm.addListener(DwtEvent.XFORMS_DISPLAY_UPDATED, ls);
	ls = new LsListener(this, this._itemUpdatedListener);
	this._apptForm.addListener(DwtEvent.XFORMS_VALUE_CHANGED, ls);
	ls = new LsListener(this, this._itemErrorListener);
	this._apptForm.addListener(DwtEvent.XFORMS_VALUE_ERROR, ls);
	this.setModel(modelObj, mode, optionalStartDate);
	this._populateForm();
	this._replaceDwtContainer();
};

LmAppointmentView.prototype._populateForm = function () {
	if (!this._formDrawn) {
		this._apptForm.draw();
		this._formDrawn = true;
	}
	if (!this._attachmentsDrawn){
		var htmlArr = new Array();
		var idx = 0;
		if (this._appt != null && this._appt.hasDetails()){
			
			var attLinks = this._appt.getMessage().buildAttachLinks(true, document.domain);
			if (attLinks.length > 0) {
				htmlArr[idx++] = "<div><table><tr><td class='LabelColName'>";
				htmlArr[idx++] = LmMsg.attachments;
				htmlArr[idx++] = ": </td><td class='LabelColValue'>";
				for (var i = 0; i<attLinks.length; i++){
					htmlArr[idx++] = attLinks[i].htl;
				}
				htmlArr[idx++] = "</td></tr></table>";
				var t = Dwt.parseHtmlFragment(htmlArr.join(""));
				this.getHtmlElement().appendChild(t);
			}
			this._attachmentsDrawn = true;
		}
	}
};

LmAppointmentView.prototype.getAppt = function () {
	return this._appt;
};

LmAppointmentView.prototype.setModel = function (modelObj, mode, optionalStartDate) {
	// if we don't have a model Object, assume this is a call for the
	// edit view, for a createAppointment call.
	if (modelObj == null) {
		this._appt = new LmAppt(this._appCtxt);
		this._appt.name = "New Appointment";
		if (optionalStartDate == null){
			optionalStartDate = new Date();
		}
		optionalStartDate = LsDateUtil.roundTimeMins(optionalStartDate,30);
		this._appt.setStartDate(optionalStartDate);
		this._appt.setEndDate(optionalStartDate.getTime() + LmAppointmentView.DEFAULT_APPOINTMENT_DURATION);
		this._appt.resetRepeatWeeklyDays();
		this._appt.resetRepeatMonthlyDayList();
		this._appt.repeatYearlyMonthsList = optionalStartDate.getMonth();
	} else {
		modelObj.getDetails(mode);
		this._appt = modelObj.clone();
	}
	this._appt.setViewMode(mode);
	this._formHasErrors = void 0;
	this._apptForm.setInstance(this._appt);
	this._resetAttachments();
	this._fbDirty = true;
};

LmAppointmentView.prototype.showDetail = function (modelObj, optionalStartDate, mode) {
	if (!this.__initialized) {
		this._initializeView(modelObj, mode, optionalStartDate);
		this._appt.setViewMode(mode);
	} else {
		this.setModel(modelObj, mode, optionalStartDate);
	}
};

LmAppointmentView.prototype.focus = function () {
	if (this._appt.isOrganizer()) {
		this._apptForm.getItemsById(_SUBJECT_)[0].focus();
	}
};

LmAppointmentView.prototype.reset = function (modelObj) {
	// nothing for now
}

LmAppointmentView.prototype.addControlListener = function (listener) {
	this.addListener(DwtEvent.CONTROL, listener);
};

LmAppointmentView.prototype._formUpdatedListener = function (event) {
	var s = this._apptForm.getSize();
	event.size = s;
	// Hack to make IE play the max-height game.
	if (LsEnv.isIE) {
		var el = this.getHtmlElement();
		var child = el.firstChild;
		s = Dwt.getSize(child);
		if (s.y > LmAppointmentView.MAX_HEIGHT ){
			el.style.height = LmAppointmentView.MAX_HEIGHT;
		} else {
			el.style.height = "";
		}
	}
	this.notifyListeners(DwtEvent.CONTROL, event);
};

LmAppointmentView.prototype._itemErrorListener = function (event) {
	this._handleStateChange(event.form);
};

LmAppointmentView.prototype._handleStateChange = function () {
	var hadErrors = this._formHasErrors;
	var event = new DwtEvent();
	event.item = this;
	if (this._apptForm.hasErrors()){
		event.details = this._formHasErrors = true;
	} else {
		event.details = this._formHasErrors = false;
	} 
	if (hadErrors != this._formHasErrors) {
		this.notifyListeners(DwtEvent.STATE_CHANGE, event);
	}
	
};

LmAppointmentView.prototype._itemUpdatedListener = function (event) {
	var model = event.formItem.getModelItem();
	if (model) {
		var field = model.id;
		if (this._appt.isRecurring()) {
			
		}
		if (field == _START_END_DATE_RANGE_ || field == _START_DATE_ || field == _END_DATE_ || field == _ATTENDEES_) {
			this._fbDirty = true;
		}
	}
	this._handleStateChange();

	//DBG.println("FBDirty? = " + this._fbDirty);
};


// -----------------------------------------------------------------------------
// Attachment handling methods
// -----------------------------------------------------------------------------
LmAppointmentView.prototype._resetAttachments = function () {
	if (this._iframeId != null) {
		var iframe = document.getElementById(this._iframeId);
		var iframeDoc = Dwt.getIframeDoc(iframe);
		var attTable = iframeDoc.getElementById(this._attachmentTableId);
		if (attTable != null) {
			var numAtts = attTable.rows.length - 1;
			for (var i = numAtts ; i >= 0; --i ){
				this._removeAttachment(attTable.rows[i], null, false);
			}
		}
		iframe.style.height = "0px";
	}
};

LmAppointmentView.prototype._addKeyHandlers = function () {
 	var el = this.getHtmlElement();
	if (el.addEventListener) {
		el.addEventListener('keypress', this.handleKeys, false);
	} else if (el.attachEvent) {
		el.attachEvent('onkeydown', this.handleKeys);
	}
};

LmAppointmentView.prototype._removeKeyHandlers = function () {
 	var el = this.getHtmlElement();
	if (el.addEventListener) {
		el.removeEventListener('keypress', this.handleKeys, false);
	} else if (el.attachEvent) {
		el.detachEvent('onkeydown', this.handleKeys);
	}
};


LmAppointmentView.prototype.hasAttachments = function () {
	var hasAtt = false;
	if (this._iframeId != null) {
		var iframe = document.getElementById(this._iframeId);
		var iframeDoc = Dwt.getIframeDoc(iframe);
		var attTable = iframeDoc.getElementById(this._attachmentTableId);
		if (attTable != null) {
			var rowNum = attTable.rows.length;
			for (var i = 0 ; i < rowNum; ++i) {
				if (attTable.rows[i].cells[0].firstChild.value.length > 0){
					hasAtt = true;
					break;
				}
			}
		}
	}
	return hasAtt;
};

LmAppointmentView.prototype.submitAttachments = function (successCb, failedCb){
	var iframe = document.getElementById(this._iframeId);
	var callback = new LsCallback(this, this._uploadDone);
	var uploadManager = this._appCtxt.getUploadManager();
	this._uploadFailedCallback = failedCb;
	this._uploadSuccessCallback = successCb;
	window._uploadManager = uploadManager;
	this._attNeedRefresh = true;
	uploadManager.execute(iframe, callback, this._uploadFormId);
};

LmAppointmentView.prototype._uploadDone = function (args) {
	//DBG.println(LsDebug.DBG1, "Attachments: status = " + args[0] + ", attId = " + args[1]);
	var status = args[0];
	if (status != 200) {
		//DBG.println(LsDebug.DBG1, "attachment error: " + status);
		if (this._uploadFailedCallback != null) {
			this._uploadFailCallback.run(status, null);
		}
	} else {
		//DBG.println(LsDebug.DBG1, "attachment success: " + status + " succ cb = " + this._uploadSuccessCallback);
		if (this._uploadSuccessCallback != null) {
			this._uploadSuccessCallback.run(args);
		}
	}
}
LmAppointmentView.prototype.addAttachments = function () {
	var iframe = null;
	var iframeDoc = null;
	if (this._iframeId == null) {
		var iframe = document.createElement('iframe');
		iframe.id = this._iframeId = Dwt.getNextId();
		iframe.scrolling = iframe.frameBorder = "no";
		if (LsEnv.isIE && (location.protocol == "https:")){
			iframe.src = "/liquid/public/blank.html";
		}
		this.getHtmlElement().appendChild(iframe);
		this._attNeedRefresh = true;
	}
	if (this._attNeedRefresh) {
		var uri = location.protocol + "//" + document.domain + this._appCtxt.get(LmSetting.CSFE_UPLOAD_URI);
		html = new Array();
		var idx = 0;
		html[idx++] = "<html><head><style type='text/css'><!-- @import url(/liquid/js/liquidMail/config/style/lm.css); --></style></head><body scroll=no style='padding:none; border:none'>"
		html[idx++] = "<form style='padding:none; border:none' method='POST' action='";
		html[idx++] = uri;
		html[idx++] = "' id='";
		html[idx++] = this._uploadFormId = Dwt.getNextId();
		html[idx++] = "' enctype='multipart/form-data'>";
		html[idx++] = "<table class='LmAppointmentView_attachTable' id='";
		html[idx++] = this._attachmentTableId = Dwt.getNextId();
		html[idx++] = "'><colgroup><col style='width:230px'><col></colgroup>";
		html[idx++] = "<tr><td><input size=30 type='file' name='";
		html[idx++] = LmAppointmentView.UPLOAD_FIELD_NAME;
		html[idx++] = "'></input></td><td><a onclick='top.LsCore.objectWithId(" + this.__internalId + ")._removeAttachment(this.parentNode.parentNode, event, true)' href='javascript:;'>Remove</a></td></tr>";
		html[idx++] = "</table></form></body></html>";
		if (iframe == null) {
			iframe = document.getElementById(this._iframeId);
		}
		iframeDoc = Dwt.getIframeDoc(iframe);
		iframeDoc.open();
		iframeDoc.write(html.join(""));
		iframeDoc.close();
		this._attNeedRefresh = false;
		this._setAttachmentsContainerHeight(true, iframe);
	} else {
		iframe = document.getElementById(this._iframeId);
		iframeDoc = Dwt.getIframeDoc(iframe);
		var attTable = iframeDoc.getElementById(this._attachmentTableId);
		if (LsEnv.isIE){
			var rowStr = LsBuffer.concat("<tr><td><input size=30 type='file' name='",
										 LmAppointmentView.UPLOAD_FIELD_NAME,
										 "'></input></td><td><a onclick='top.LsCore.objectWithId(",
										 this.__internalId,
										 ")._removeAttachment(this.parentNode.parentNode, event, true)' href='javascript:;'",
										 ">Remove</a></td></tr>");
			var row = attTable.insertRow(-1);
			var cell1 = row.insertCell(-1);
			var cell2 = row.insertCell(-1);
			cell1.innerHTML = LsBuffer.concat("<input type='file' name='",LmAppointmentView.UPLOAD_FIELD_NAME,"'></input>");
			cell2.innerHTML = LsBuffer.concat("<a onclick='top.LsCore.objectWithId(",this.__internalId,
												  ")._removeAttachment(this.parentNode.parentNode, event, true)' href='javascript:;'",
												  ">Remove</a>");
			
		} else {
			var row = attTable.insertRow(-1);
			row.innerHTML = LsBuffer.concat("<td><input size=30 type='file' name='",
											LmAppointmentView.UPLOAD_FIELD_NAME,
											"'></input></td><td><a onclick='top.LsCore.objectWithId(",
											this.__internalId,
											")._removeAttachment(this.parentNode.parentNode, event, true)' href='javascript:;'",
											">Remove</a></td>");
		}

		this._setAttachmentsContainerHeight(true, iframe);
	}
	this._handleStateChange();
};

LmAppointmentView.prototype._removeAttachment = function ( row, event, setHeight ) {
	row.parentNode.removeChild(row);
	if (setHeight) {
		this._setAttachmentsContainerHeight(false);
	}
};

LmAppointmentView.prototype._setAttachmentsContainerHeight =
function (add, optionalIframe) {
	var iframe = optionalIframe? optionalIframe: document.getElementById(this._iframeId);
	var height = parseInt(iframe.style.height);
	height = isNaN(height)? 0 : height;
	if (add){
		height = height + LmAppointmentView.IFRAME_HEIGHT;
	} else {
		height = height - LmAppointmentView.IFRAME_HEIGHT;
	}
	iframe.style.height = height;
};

// in this function, this refers to the item
LmAppointmentView.prototype.itemRFCAttachmentClicked = function ( event, item) {
	var appt = this._appt;
	var index = item.getParentItem().getParentItem().getParentItem().instanceNum;

	var part = appt._validAttachments[attIndex].part;
	LmMailMsg.rfc822Callback(a, appt.msgId, part);
};

// this is the XFormItem
LmAppointmentView.prototype.itemAttachmentClicked = function (event, item) {
	var csfeMsgFetchSvc = location.protocol+"//" + document.domain + this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI);
	var index = item.getParentItem().getParentItem().instanceNum;
	var attach = this._appt._validAttachments[index];
	// id and partx
	var url = csfeMsgFetchSvc + "id=" + this._appt.getMessage().getId()+ "&part=" + attach.part;
	window.open(url);
};

// -----------------------------------------------------------------------------
// form callback methods
// -----------------------------------------------------------------------------

LmAppointmentView.prototype.shouldShowTimezone = function () {
	return this._appCtxt.get(LmSetting.CAL_SHOW_TIMEZONE);
};

// -----------------------------------------------------------------------------
// key handling methods
// -----------------------------------------------------------------------------

LmAppointmentView.prototype.handleKeys = function (event) {
	var target = DwtUiEvent.getTarget(event);
	var keyCode = DwtKeyEvent.getCharCode(event);
	switch (keyCode) {
	case DwtKeyEvent.KEY_TAB:
		// stop bubbling, but allow the default action.
		DwtUiEvent.setBehaviour(event, true, true);
		break;
	case DwtKeyEvent.KEY_ENTER:
		// let this guy bubble up, but prevent any default action.
		DwtUiEvent.setBehaviour(event, false, true);
		break;
	}
	return true;
};

// -----------------------------------------------------------------------------
// free/busy controller methods
// -----------------------------------------------------------------------------
	
LmAppointmentView.prototype.openSchedule = function () {
	// TODO -- adjust range based on preferences
	var start = new Date(this._appt.getStartDate().getTime());
	start.setSeconds(0);
	start.setHours(0);
	start.setMinutes(0);
	var end = new Date(start.getTime() + (24*60*60*1000));
	end.setHours(0);
	end.setMinutes(0);
	end.setSeconds(0);
	var schedules = null;
	if (this._fbDirty) {
		var organizer = this._appt.getOrganizer();
		organizer = (organizer != "")? organizer : this._appCtxt.get(LmSetting.USERNAME);
		var uids = [organizer];
		uids = uids.concat(this._appt.getAttendees().split(LmAppt.ATTENDEES_SEPARATOR_REGEX));
		if (uids != null && uids.length != 0 && uids != "") {
			schedules = LmUserSchedule.getSchedules(start, end, uids);
		}
	}
	if (this._bDialog == null) {
		this._fbView = new LmFreeBusyView(this.shell, schedules, start, end, this.getAppt());
		this._bDialog = new LmDialog(this.shell, null, null, "Meeting", null, this._fbView);
		var ls = new LsListener(this, this._saveFreeBusyTimes);
		this._bDialog.setButtonListener(DwtDialog.OK_BUTTON, ls);
		ls = new LsListener(this, this._cancelFreeBusy);
		this._bDialog.setButtonListener(DwtDialog.CANCEL_BUTTON, ls);
		this._fbDirty = false;
	}
	this._fbView.enable();
	this._bDialog.popup();	
	if (this._fbDirty){
		this._fbView.setData(schedules, this.getAppt());
	}
	this._fbDirty = false;
};

LmAppointmentView.prototype._saveFreeBusyTimes = function () {
	this._fbView.disable();
	this._fbView.saveAppointmentInfo();
	this._apptForm.refresh();
	this._handleStateChange(this._apptForm);
	this._bDialog.popdown();
	// Doing this pretty much means that marking the view dirty is useless
	// We are goign to always want to refresh the data.
	this._fbDirty = true;
};

LmAppointmentView.prototype._cancelFreeBusy = function () {
	this._fbDirty = true;
	this._bDialog.popdown();
};


LmAppointmentView.prototype.validateEmail = function (attendees) {
	if (attendees == null || attendees == "") return true;

	var addrArr = attendees.split(LmAppt.ATTENDEES_SEPARATOR_REGEX);
	for (var z = 0 ; z < addrArr.length; ++z) {
		if (addrArr[z].length == 0) continue;

		var e = LmEmailAddress.parse(addrArr[z]);
		if (e == null) {
			return false;
		}
	}
	return true;
};

LmAppointmentView.allDayChanged = function(value,instanceValue,event) {
	var instance = this.getForm().getInstance();
	var range = instance.getDateRange();
	if (value == "1") {
		if (this._inDayStartDate == null) {
			this._inDayStartDate = new Date(range.startDate);
		} else {
			this._inDayStartDate.setTime(range.startDate.getTime());
		}
		if (this._inDayEndDate == null) {
			this._inDayEndDate = new Date(range.endDate);
		} else {
			this._inDayEndDate.setTime(range.endDate.getTime());
		}
		if ( this._allDayStartDate == null) {
			this._allDayStartDate = new Date();
		}
		this._allDayStartDate.setTime(this._inDayStartDate.getTime());
		this._allDayStartDate.setHours(0,0,0);
		
		if ( this._allDayEndDate == null) {
			this._allDayEndDate = new Date();
		}
		this._allDayEndDate.setTime(this._inDayEndDate.getTime());
		this._allDayEndDate.setHours(23,59,59);

		range.startDate.setTime(this._allDayStartDate.getTime());
		range.endDate.setTime(this._allDayEndDate.getTime());
		instance.setDateRange(range);
	} else {
		if (this._inDayStartDate) {
			range.startDate.setTime(this._inDayStartDate.getTime());
		} 
		if (this._inDayEndDate) {
			range.endDate.setTime(this._inDayEndDate.getTime());
		}
		if (this._inDayStartDate || this._inDayEndDate) {
			instance.setDateRange(range);
		}
	}
	this.getForm().itemChanged(this.getId(), value, event);
};


// -----------------------------------------------------------------------------
// form/model creation methods
// -----------------------------------------------------------------------------

LmAppointmentView.prototype.getAppointmentForm = function () {
	if (this._appointmentForm != null) return this._appointmentForm;

	this._appointmentForm = {
	    cssStyle:"width:400px",
			//tableCssStyle:"position:absolute; width:390px;width:100%;height:450px;",			// NECESSARY
			//cssStyle:"", 									// NECESSARY
			colSizes:["65px","315px"],
	    numCols:2, 
	    items:[
						 {ref:_SUBJECT_, type:_INPUT_, width: "100%", required: true, relevant:"instance.isOrganizer()", relevantBehavior:_DISABLE_},
						 // MAKE A SELECT WITH A PREDETERMINED ITEMSET?
						 {ref:_LOCATION_, type:_INPUT_,  width: "100%",relevant:"instance.isOrganizer()", relevantBehavior:_DISABLE_},		
						 
						 {type:_SEPARATOR_, height:10},
						 {type:_SPACER_, height:5, cssStyle:"font-size:1px"},

						 // NOTE: show a DATE field if ALL_DAY is true, otherwise show a dateTime
						 {type:_SWITCH_, useParentTable:true, colSpan:"*",
								 items:[
												{type:_CASE_, relevant:"instance.isReadOnly()", colSpan:"*", useParentTable:true,
														items:[
																	 {type: _OUTPUT_, value: "All day appointment", relevant:"get(_ALL_DAY_) == '1'", label: " "},
																	 {ref: _START_END_DATE_RANGE_, type:_OUTPUT_, label:_Starts_,
																			 getDisplayValue: 
																			 function (rangeObj) {
																					 if (rangeObj != null) {
																							 if (this.getForm().get(_ALL_DAY_) != "1"){
																									 return LsBuffer.concat(LsDateUtil.simpleComputeDateStr(rangeObj.startDate),
																																					"&nbsp;",
																																					LsDateUtil.getTimeStr(rangeObj.startDate,"%h:%m %P"));
																							 } else {
																									 return LsDateUtil.simpleComputeDateStr(rangeObj.startDate);
																							 }
																					 }
																			 }
																	 },
																	 {ref: _START_END_DATE_RANGE_, type:_OUTPUT_, label:_Ends_,
																			 getDisplayValue: function (rangeObj){
																					 if (rangeObj != null) {
																							 if (this.getForm().get(_ALL_DAY_) != "1"){
																									 return LsBuffer.concat(LsDateUtil.simpleComputeDateStr(rangeObj.endDate),
																																					"&nbsp;",
																																					LsDateUtil.getTimeStr(rangeObj.endDate, "%h:%m %P"));
																							 } else {
																									 return LsDateUtil.simpleComputeDateStr(rangeObj.endDate);
																							 }
																					 }
																			 }
																	 },
																	 {type:_GROUP_, useParentTable:false,label:"Recurrence:", colSpan:"*", numCols:2,
																			 relevant:"instance.editTimeRepeat() == LmAppt.EDIT_NO_REPEAT",
																			 items:[
																							{ref: _REPEAT_DISPLAY_, type:_OUTPUT_, nowrap:true},
																							{type:_OUTPUT_,width:80, value:"&nbsp;"}
																						 ]
																	 }
																	]
												}, // END READ ONLY 
												
												{type:_CASE_, relevant:"!instance.isReadOnly()",colSpan:"*", useParentTable:true,
														items:[
																	 {type:_GROUP_, useParentTable:true,
																			 relevant:"(this.getController().shouldShowTimezone() == true && !instance.isReadOnly())", 
																			 items:[
																							{type:_GROUP_, useParentTable:false, colSpan:"*", numCols:4,
																									items: [
																													{ref:_ALL_DAY_, type:_CHECKBOX_, value:'0', trueValue:'1', falseValue:'0',
																															labelCssClass:"xform_label", elementChanged:LmAppointmentView.allDayChanged},
																													{ref:_TIMEZONE_, type:_DWT_SELECT_, choices:LmTimezones.getAbbreviatedZoneChoices(),
																															width:"115px", relevant:"get(_ALL_DAY_) != '1'"},
																												 ]
																							}
																						 ]
																	 },
																	 {type:_GROUP_, useParentTable:true,
																			 relevant:"(this.getController().shouldShowTimezone() != true && !instance.isReadOnly())", 
																			 items:[
																							{ref:_ALL_DAY_, type:_CHECKBOX_, value:'0', trueValue:'1', falseValue:'0',labelCssClass:"xform_label",
																									labelCssStyle:"text-align:left",elementChanged:LmAppointmentView.allDayChanged }
																						 ]
																	 },
																	 {type:_GROUP_, useParentTable:true, relevant:"get(_ALL_DAY_) != '1'",
																			 items:[
																							{ref: _START_END_DATE_RANGE_, type:_APPT_DATE_TIME_RANGE_}
																						 ]
																	 },
																	 {type:_GROUP_, useParentTable:true, relevant:"get(_ALL_DAY_) == '1'",
																			 items:[
																							{type:_CELL_SPACER_, height:"1px", width:"auto"},
																							{ref: _START_END_DATE_RANGE_, type:_APPT_DATE_RANGE_}
																						 ]
																	 }
																	]
												}, // END !READ ONLY
											 ]
						 }, // END READ ONLY SWITCH

						 {type:_GROUP_, useParentTable:false, colSpang:"*", label:_Repeat_, numCols:3,
								 relevant:"instance.editTimeRepeat() == LmAppt.EDIT_TIME_REPEAT", 
								 items:[
												{ref:_REPEAT_TYPE_, type:_DWT_SELECT_, selection:_CLOSED_, choices:_REPEAT_TYPE_CHOICES_,
														label:null},
												{ref:_REPEAT_CUSTOM_, type:_CHECKBOX_, trueValue:"1", falseValue:"0", cellCssClass:"xform_cell",
														relevant:"get(_REPEAT_TYPE_) != 'NON'"},
											 ]
						 },
						 {type:_SWITCH_, id:"repeat_custom", label:"", labelLocation:_LEFT_, numCols:1, 
								 relevant:"get(_REPEAT_TYPE_) != 'NON' && get(_REPEAT_CUSTOM_) == '1' && instance.editTimeRepeat() == LmAppt.EDIT_TIME_REPEAT", 
								 items:[
												{type:_CASE_, id:"repeat_custom_day", useParentTable:false, numCols:5,
														relevant:"get(_REPEAT_TYPE_) == 'DAI'", width:"auto",
														items:[
																	 {type:_CELL_SPACER_, width:10},
																	 {type:_OUTPUT_, value:_Every_, valign:_MIDDLE_},
																	 {ref:_REPEAT_CUSTOM_COUNT_, type:_INPUT_, cssStyle:"width:30px"},
																	 {type:_OUTPUT_, value:"day",  relevant:"get(_REPEAT_CUSTOM_COUNT_) == 1", valign:_MIDDLE_},
																	 {type:_OUTPUT_, value:"days",  relevant:"get(_REPEAT_CUSTOM_COUNT_) > 1", valign:_MIDDLE_}
																	]
												},
												
												{type:_CASE_, id:"repeat_custom_week", numCols:2, useParentTable:false, width:"auto",
														relevant:"get(_REPEAT_TYPE_) == 'WEE'",
														items:[
																	 {type:_CELL_SPACER_, rowSpan:2, width:10},
																	 {type:_GROUP_, useParentTable:false, numCols:4, 
																			 items:[
																							{type:_OUTPUT_, value:_Every_, valign:_MIDDLE_},
																							{ref:_REPEAT_CUSTOM_COUNT_, type:_INPUT_, cssStyle:"width:30px"},
																							{type:_OUTPUT_, value:"week on:", relevant:"get(_REPEAT_CUSTOM_COUNT_) == 1", valign:_MIDDLE_},
																							{type:_OUTPUT_, value:"weeks on:", relevant:"get(_REPEAT_CUSTOM_COUNT_) > 1", valign:_MIDDLE_}
																						 ]
																	 },
																	 {type:_GROUP_, useParentTable:false, numCols:4, 
																			 items:[
																							{type:_CELL_SPACER_, width:10},
																							{ref:_REPEAT_WEEKLY_DAYS_, colSpan:"*", type:_DWT_SELECT_, selection:_CLOSED_, 
																									type:_BUTTON_GRID_, numCols:7, cssClass:"xform_button_grid_small",
																									choices:_DAY_OF_WEEK_INITIAL_CHOICES_
																									//  									getDisplayValue:function(value) {
																											//  										if (value != null) return value;
																											// 										var date = this.getForm().get(_START_DATE_);
																											// 										var dow = date.getDay();
																											// 										var choices = this.getChoices();
																											// 										return choices[dow].value;
																											// 									}
																							}
																						 ]
																	 }
																	]
												},
												
												{type:_CASE_, id:"repeat_custom_month", numCols:2, useParentTable:false, width:"auto",
														relevant:"get(_REPEAT_TYPE_) == 'MON'",
														items:[
																	 {type:_CELL_SPACER_, rowSpan:3, width:10},
																	 {type:_GROUP_, useParentTable:false, numCols:4, colSpan:"*", 
																			 items:[
																							{type:_OUTPUT_, value:_Every_, valign:_MIDDLE_},
																							{ref:_REPEAT_CUSTOM_COUNT_, type:_INPUT_, cssStyle:"width:30px"},
																							{type:_OUTPUT_, value:"month:", relevant:"get(_REPEAT_CUSTOM_COUNT_) == 1", valign:_MIDDLE_},
																							{type:_OUTPUT_, value:"months:", relevant:"get(_REPEAT_CUSTOM_COUNT_) > 1", valign:_MIDDLE_}
																						 ]
																	 },
																	 
																	 {type:_GROUP_, useParentTable:false, numCols:3, colSpan:"*", 
																			 items:[
																							{ref:_REPEAT_CUSTOM_TYPE_, type:_DWT_SELECT_, selection:_CLOSED_, value:"S",
																									choices:[
																													 {value:"O", label:"On the:"},
																													 {value:"S", label:"On day(s):"}
																													]
																							},
																							{ref:_REPEAT_CUSTOM_ORDINAL_, type:_DWT_SELECT_, selection:_CLOSED_, 
																									relevant:"get(_REPEAT_CUSTOM_TYPE_) == 'O'",
																									choices:_REPEAT_CUSTOM_ORDINAL_CHOICES_, value:1
																							},
																							{ref:_REPEAT_CUSTOM_DAY_OF_WEEK_, type:_DWT_SELECT_, selection:_CLOSED_,
																									relevant:"get(_REPEAT_CUSTOM_TYPE_) == 'O'",
																									choices:_EXTENDED_DAY_OF_WEEK_CHOICES_ , value:_DAY_
																							}
																						 ]
																	 },
																	 {type:_GROUP_, numCols:2, useParentTable:false, colSpan:"*",
																			 relevant:"get(_REPEAT_CUSTOM_TYPE_) == 'S'",
																			 items:[
																							{type:_CELL_SPACER_, width:10},
																							{ref:_REPEAT_MONTHLY_DAY_LIST_, colSpan:"*", type:_BUTTON_GRID_, numCols:7, 
																									cssClass:"xform_button_grid_small", choices:_MONTH_DAY_CHOICES_
																							}
																						 ]
																	 }
																	]
												},
												
												{type:_CASE_, id:"repeat_custom_year", numCols:2, useParentTable:false, width:"auto",
														relevant:"get(_REPEAT_TYPE_) == 'YEA'",
														items:[
																	 {type:_CELL_SPACER_, rowSpan:2, width:2},
																	 {type:_GROUP_, useParentTable:false, numCols:5, 
																			 items:[
																							{ref:_REPEAT_CUSTOM_TYPE_, type:_CHECKBOX_, value:"O", trueValue:"S", falseValue:"O", 
																									label:"Every", labelCssClass:"xform_output", labelWrap:false, cellCssClass:"xform_cell"},
																							{type:_CELL_SPACER_, width:8},
																							{ref:_REPEAT_YEARLY_MONTHS_LIST_, type:_DWT_SELECT_, selection:_CLOSED_, 
																									relevant:"get(_REPEAT_CUSTOM_TYPE_) != 'O'", 
																									relevantBehavior:_DISABLE_, choices:_MONTH_ABBR_CHOICES_
																							},
																							{ref:_REPEAT_CUSTOM_MONTH_DAY_, type:_INPUT_, width:30, relevant:"get(_REPEAT_CUSTOM_TYPE_) != 'O'",
																									relevantBehavior:_DISABLE_, errorLocation:_PARENT_ }
																							//{ref:_REPEAT_CUSTOM_COUNT_, type:_INPUT_, cssStyle:"width:30px"},
																							//{type:_OUTPUT_, value:"year in:", relevant:"get(_REPEAT_CUSTOM_COUNT_) == 1", valign:_MIDDLE_},
																							//{type:_OUTPUT_, value:"years in:", relevant:"get(_REPEAT_CUSTOM_COUNT_) > 1", valign:_MIDDLE_},
																							
																						 ]
																	 },
																	 //{type:_GROUP_, numCols:2, useParentTable:false,
																			 //items:[
																								//	{type:_CELL_SPACER_, width:10},
																								//	{ref:_REPEAT_YEARLY_MONTHS_LIST_, type:_DWT_SELECT_, selection:_CLOSED_, 
																										//	 type:_BUTTON_GRID_, numCols:4, cssClass:"xform_button_grid_medium",
																										//		choices:_MONTH_ABBR_CHOICES_
																										//	}
																								//]
																			 //},
																	 {type:_GROUP_, numCols:5, useParentTable:false,
																			 items:[
																							{ref:_REPEAT_CUSTOM_TYPE_, type:_INPUT_, value:"O", trueValue:"O", falseValue:"S", 
																									label:"On the:", labelCssClass:"xform_output", labelWrap:false, cellCssClass:"xform_cell"},
																							{ref:_REPEAT_CUSTOM_ORDINAL_, type:_DWT_SELECT_, selection:_CLOSED_, 
																									relevant:"get(_REPEAT_CUSTOM_TYPE_) != 'S'", relevantBehavior:_DISABLE_,
																									choices:_REPEAT_CUSTOM_ORDINAL_CHOICES_, value:1},
																							{ref:_REPEAT_CUSTOM_DAY_OF_WEEK_, type:_DWT_SELECT_, selection:_CLOSED_,
																									relevant:"get(_REPEAT_CUSTOM_TYPE_) != 'S'", relevantBehavior:_DISABLE_,
																									choices:_EXTENDED_DAY_OF_WEEK_CHOICES_, value:_DAY_},
																							{ref:_REPEAT_YEARLY_MONTHS_LIST_, type:_DWT_SELECT_, selection:_CLOSED_, relevant:"get(_REPEAT_CUSTOM_TYPE_) != 'S'",
																									relevantBehavior:_DISABLE_, choices:_MONTH_ABBR_CHOICES_}
																						 ]
																	 }
																	]
												}
											 ]
						 },	//end repeat custom
						 
						 {type:_GROUP_, numCols:3, relevant:"get(_REPEAT_TYPE_) != 'NON'  && instance.editTimeRepeat() == LmAppt.EDIT_TIME_REPEAT", 
								 label:_Repeat_End_Type_, useParentTable:false,
								 items:[
												{ref:_REPEAT_END_TYPE_, rowSpang:2, type:_DWT_SELECT_, selection:_CLOSED_, choices:_REPEAT_END_TYPE_CHOICES_,
														value:"N", label:null },
												{ref:_REPEAT_END_DATE_, type:_DWT_DATE_, relevant:"get(_REPEAT_END_TYPE_) == 'D'", valign:_MIDDLE_},
												
												{type:_GROUP_, numCols:3, relevant:"get(_REPEAT_END_TYPE_) == 'A'", useParentTable:false, errorLocation:_PARENT_,
														items:[
																	 {ref:_REPEAT_END_COUNT_, type:_INPUT_, cssStyle:"width:30px;", errorLocation:_PARENT_}, 
																	 {type:_OUTPUT_, value:"time", relevant:"get(_REPEAT_END_COUNT_) == 1", valign:_MIDDLE_},
																	 {type:_OUTPUT_, value:"times", relevant:"get(_REPEAT_END_COUNT_) > 1", valign:_MIDDLE_}
																	]
												}
											 ]
						 },

						 {type:_SEPARATOR_, height:10},
						 {type:_SPACER_, height:5},
						 
						 {ref: _ORGANIZER_,  type:_OUTPUT_ , label:LmMsg.organizer,
								 relevant:"instance.getViewMode() != LmAppt.MODE_NEW", labelCssStyle:"text-align:left"},
						 {type:_OUTPUT_, value:LmMsg.attendees, cssClass:"xform_label", cssStyle:"text-align:left"},
						 {type:_DWT_BUTTON_, onActivate:"this.getFormController().openSchedule()", label:LmMsg.scheduleAttendees,
								 width:"105px",  cssStyle:"float:right", relevant:"(instance.isOrganizer() == true)", relevantBehavior:_DISABLE_},
						 {ref:_ATTENDEES_, 	type:_TEXTAREA_, 	colSpan:"*", label:null, height:"50px", cssStyle:"width:100%",
								 relevant:"(instance.isOrganizer() == true)", relevantBehavior:_DISABLE_},
						 {type:_SEPARATOR_, height:5},
						 {type:_OUTPUT_, value:LmMsg.notes, colSpan:"*", cssClass:"xform_label",  cssStyle:"text-align:left"},
						 {ref:_NOTES_, 		type:_TEXTAREA_, 	colSpan:"*", label:null, height:"50px", cssStyle:"width:100%",
								 relevant: "instance.isOrganizer()", relevantBehavior:_DISABLE_},
						 {type:_SEPARATOR_, height:10},
						 {type:_SPACER_, height:5},
						 
						 {type:_OUTPUT_, value:"Attachments:", cssClass:"xform_label",  cssStyle:"text-align:left"},
						 {type:_DWT_BUTTON_, onActivate:"this.getFormController().addAttachments(event)", label:"Add Attachment",
								 width:"100px", cssStyle:"float:right", relevant:"instance.isOrganizer()", relevantBehavior:_DISABLE_},
						 {type:_GROUP_, relevant:"instance.hasAttachments() == true", colSpan:"*", width:"100%", useParentTable:false, numCols:2,
								 items: [
												 {ref: _ATTACHMENTS_, type:_REPEAT_, label:null,colSpan:"*",width:"100%",showAddButton:false, showRemoveButton:true,
														 useParentTable:false, 
														 removeButton:{type:_DWT_BUTTON_, label:"-", width:20, cssStyle:"float:right", 	
																 onActivate: function (event) {
																		 var repeatItem = this.getParentItem().getParentItem();
																		 repeatItem.removeRowButtonClicked(this.getParentItem().instanceNum);
																 },
																 relevantBehavior:_HIDE_,
																 relevant:"instance.isOrganizer() && item.getParentItem().getParentItem().instanceNum != 0",
																 forceUpdate:true},
														 items:[
																		{ref:".", type:_SWITCH_, id:"attachmentType", colSpan:"*", numCols:"2", label:null,
																				items:[
																							 {ref:".",type:_CASE_, id:"attRFC", relevant:"get('ct') == LmMimeTable.MSG_RFC822", 
																									 numCols:3, colSizes:["20px", "auto", "100px"],
																									 items:[
																													{ref:"ct", type:_IMAGE_, 
																															getDisplayValue:function(value){
																																	var mimeInfo = LmMimeTable.getInfo(value);
																																	return (mimeInfo)? mimeInfo.image: LmImg.I_DOCUMENT;
																															}
																													},
																													{ref:"filename", type:_DATA_ANCHOR_, href:"javascript:;", 
																															onActivate:"this.getFormController().itemRFCAttachmentClicked(event, this)",
																															getDisplayValue:function(value) {
																																	if (value != null) return value + "   (" + 
																																	(this.getForm().get(this.getParentItem().refPath + "/s") )+  " B)";
																															}
																													}
																												 ]},
																							 {ref:".",type:_CASE_, id:"attRFC", relevant:"get('ct') != LmMimeTable.MSG_RFC822",
																									 numCols:3, colSizes:["20px","auto", "100px"],
																									 items:[
																													{ref:"ct", type:_LS_IMAGE_, 
																															getDisplayValue:function(value){
																																	if (value != null) {
																																			var mimeInfo = LmMimeTable.getInfo(value);
																																			return (mimeInfo)? mimeInfo.image: LmImg.I_DOCUMENT;
																																	}
																																	return null;
																															}
																													},
																													
																													{ref:"filename", type:_DATA_ANCHOR_, href:"javascript:;", 
																															onActivate:"this.getFormController().itemAttachmentClicked(event, this)", showInNewWindow:false,
																															getDisplayValue:function(value) {
																																	if (value != null) return value + "  (" +
																																	(this.getForm().get(this.getParentItem().refPath + "/s") )+  " B)";
																															}
																													}
																												 ]
																							 },
																							]
																		}
																	 ]
												 }
												]
						 } // End attachments group,
						 
						]
	}
    return this._appointmentForm;
};

function Appt_Date_Time_Range_XFormItem() {}
XFormItemFactory.createItemType("_APPT_DATE_TIME_RANGE_", "appt_date_time_range", Appt_Date_Time_Range_XFormItem, Composite_XFormItem);
Appt_Date_Time_Range_XFormItem.prototype.colSpan = "*";
Appt_Date_Time_Range_XFormItem.prototype.useParentTable = false;
Appt_Date_Time_Range_XFormItem.prototype.colSizes =["65px","295px"]
Appt_Date_Time_Range_XFormItem.prototype.items = 
	[
	{ref:'startDate', type:_DWT_DATETIME_, choices: _TIME_OF_DAY_CHOICES, label:_Starts_, errorLocation:_PARENT_,
	 elementChanged: 
	 function (newDate, instanceValue, event) {
		 var instance = this.getForm().getInstance();
		 var s = newDate.getTime();
		 var parent = this.getParentItem();
		 var rangeObj  = parent.getInstanceValue();
		 var endDate = rangeObj.endDate;
		 var e = endDate.getTime();
		 // calling parent.hasError() means that we are expecting the parent to
		 // have only one type of error. For now that works, but I'm not sure we 
		 // want that going forward. What I want, is to know if we're already showing a bad end date.
		 if (!parent.hasError()) {
			 var currentDur = instance.getDuration();
			 // The dwt date time is a composite, so we have to be 
			 // consistent. If the date changes, and is invalid, we 
			 // want the user to see the invalid value, because the 
			 // selects will have the invalid value as well ( due to
			 // their having an elementChanged handler.
			 endDate.setTime(s + currentDur);
		 }
		 rangeObj.startDate.setTime(s);
		 //DBG.println("elementChanged for startDate: start = ", rangeObj.startDate, " end = " ,endDate);
		 this.getForm().itemChanged(this.getParentItem().getId(), rangeObj , null);
	 }
	},
	{ref:'endDate', type:_DWT_DATETIME_, choices: _TIME_OF_DAY_CHOICES, label:_Ends_, errorLocation:_PARENT_,
	 elementChanged:
	 function (newDate, instanceValue, event) {
		 var rangeObj  = this.getParentItem().getInstanceValue();
		 rangeObj.endDate.setTime(newDate.getTime());
		 var startHrs = rangeObj.startDate.getHours();
		 var endHrs = rangeObj.endDate.getHours();
		 // This should only happend when the changes come from a select
		 if (event._args != null) {
			 var newValue = event._args.newValue;
			 if (endHrs < startHrs && (startHrs < 12) && !(newValue == LsMsg.am || newValue == LsMsg.pm)) {
				 rangeObj.endDate.setHours(endHrs + 12);
			 }
		 }
		 this.getForm().itemChanged(this.getParentItem().getId(), rangeObj , null);
	 }
}
];

function Appt_Date_Range_XFormItem() {}
XFormItemFactory.createItemType("_APPT_DATE_RANGE_", "appt_date_range", Appt_Date_Range_XFormItem, Composite_XFormItem);
Appt_Date_Range_XFormItem.prototype.colSpan = "*";
Appt_Date_Range_XFormItem.prototype.useParentTable = false;
Appt_Date_Range_XFormItem.prototype.colSizes =["65px","295px"]
;
Appt_Date_Range_XFormItem.prototype.items = 
	[
	{ref:'startDate', type:_DWT_DATE_, label:_Starts_, errorLocation:_SELF_,
	 elementChanged: 
	 function (newDate, instanceValue, event) {
		 var instance = this.getForm().getInstance();
		 var s = newDate.getTime();
		 var parent = this.getParentItem();
		 var rangeObj  = parent.getInstanceValue();
		 var endDate = rangeObj.endDate;
		 var e = endDate.getTime();
		 // calling parent.hasError() means that we are expecting the parent to
		 // have only one type of error. For now that works, but I'm not sure we 
		 // want that going forward. What I want, is to know if we're already showing a bad end date.
		 if (!parent.hasError()) {
			 var currentDur = instance.getDuration();
			 // The dwt date time is a composite, so we have to be 
			 // consistent. If the date changes, and is invalid, we 
			 // want the user to see the invalid value, because the 
			 // selects will have the invalid value as well ( due to
			 // their having an elementChanged handler.
			 endDate.setTime(s + currentDur);
		 }
		 rangeObj.startDate.setTime(newDate.getTime());
		 this.getForm().itemChanged(this.getParentItem().getId(), rangeObj , null);
	 }
	},
	{ref:'endDate', type:_DWT_DATE_,label:_Ends_, errorLocation:_SELF_,
	 elementChanged:
	 function (newDate, instanceValue, event) {
		 var rangeObj  = this.getParentItem().getInstanceValue();
		 rangeObj.endDate.setTime(newDate.getTime());
		 var startHrs = rangeObj.startDate.getHours();
		 var endHrs = rangeObj.endDate.getHours();
		 if (event._args != null) {
			 var newValue = event._args.newValue;
			 if (endHrs < startHrs && (startHrs < 12) && !(newValue == LsMsg.am || newValue == LsMsg.pm)) {
				 rangeObj.endDate.setHours(endHrs + 12);
			 }
		 }
		 this.getForm().itemChanged(this.getParentItem().getId(), rangeObj , null);
	 }
	}
];


LmAppointmentView.validateWholeNumber = function (value, form, formItem, instance) {
	if (value != null) {
		var valStr = "" + value;
		if (valStr.indexOf(".") != -1){
			throw LmMsg.onlyWholeNumbersError;
		}
		if (value <= 0) {
			throw LmMsg.positiveNumberError;
		} else {
			return value;
		}
	}
}


LmAppointmentView.appointmentModel = {
	items: [
			{id:_SUBJECT_, label:_Subject_, required: true},

			{id:_LOCATION_, label:_Location_},
	
		{id:_ALL_DAY_, label:_All_Day_, length:1},

	    {id:_TIMEZONE_, label:"Timezone"},

		{ id: _START_END_DATE_RANGE_, type:_UNTYPED_,  setterScope: _INSTANCE_, setter:"setDateRange",  
		  getterScope: _INSTANCE_, getter:"getDateRange",
		  constraints:[ 
			{errorMessageId: 'endDateBeforeStart', type:"method", value: 
			 function (range, form, formItem, instance) {
				 var s = range.startDate.getTime();
				 var e = range.endDate.getTime();
				 if (e <= s) {
					 // The dwt date time is a composite, so we have to be 
					 // consistent. If the date changes, and is invalid, we 
					 // want the user to see the invalid value, because the 
					 // selects will have the invalid value as well ( due to
					 // their having an elementChanged handler.
					 instance.getEndDate().setTime(range.endDate.getTime());
					 instance.setEndDate(instance.endDate);
					 form.refresh();
					 throw this.getModel().getErrorMessage('endDateBeforeStart', range);
				 } else {
					 return range;
				 }
			 }
			}
			]
		},

		{id:_START_DATE_, type:_DATETIME_, label:_Starts_},

		{id:_END_DATE_, type:_DATETIME_, label:_Ends_},

		{id:_REPEAT_TYPE_, type:_STRING_, label:_Repeat_},

	    {id:_VIEW_MODE_, type:_UNTYPED_ , getter:"getViewMode"},
		
	    {id:_REPEAT_DISPLAY_, type:_STRING_, getterScope: _INSTANCE_, 
		 getter:"getRecurrenceDisplayString"
		},
		
		{id:_REPEAT_CUSTOM_, type:_STRING_, length:1, label:_Repeat_Custom_,
			relevant:"get(_REPEAT_TYPE_) != 'NON'"
		},
		{id:_REPEAT_CUSTOM_COUNT_, type:_NUMBER_, cssClass:"xform_width_30",
		 relevant:"get(_REPEAT_CUSTOM_) == '1'",
		 constraints:[ {type:"method", value: LmAppointmentView.validateWholeNumber } ]
		},
	
		{id:_REPEAT_CUSTOM_TYPE_, type:_STRING_, 
			relevant:"get(_REPEAT_CUSTOM_) == '1' " +
					 "&& (get(_REPEAT_TYPE_) == 'MON' || get(_REPEAT_TYPE_) == 'YEA')"
		},
		{id:_REPEAT_CUSTOM_ORDINAL_, type:_STRING_, 
			relevant:" get(_REPEAT_CUSTOM_) == '1'" +
					 "&& (get(_REPEAT_TYPE_) == 'MON' || get(_REPEAT_TYPE_) == 'YEA')"
		},
		{id:_REPEAT_CUSTOM_DAY_OF_WEEK_, type:_STRING_, selection:"closed",
			relevant:" get(_REPEAT_CUSTOM_) == '1'" +
					 "&& (get(_REPEAT_TYPE_) == 'MON' || get(_REPEAT_TYPE_) == 'YEA')"
		},
	
		{id:_REPEAT_CUSTOM_MONTH_DAY_, type:_NUMBER_,
		 constraints:[ {type:"method", value: 
						function (day, form, formItem, instance) {
							if (day != null) {
								LmAppointmentView.validateWholeNumber(day, form, formItem, instance);
								var month = parseInt(form.get(_REPEAT_YEARLY_MONTHS_LIST_));
								var maxDay = LsDateUtil._daysPerMonth[month];
								if ( day > maxDay ) {
									throw "There are only " + maxDay + " days in " + LsDateUtil._months[month];
								} else {
									return day;
								}
							}
						}
			}
					   ]
		},

		{id:_REPEAT_WEEKLY_DAYS_, type:_LIST_, dataType:_STRING_, 		// "Su,Mo,We"
			relevant:" get(_REPEAT_CUSTOM_) == '1' " +
		 "&& get(_REPEAT_TYPE_) == 'WEE'"
		},


		{id:_REPEAT_MONTHLY_DAY_LIST_, type:_LIST_, dataType:_STRING_, 		// "0,11,14,15,31"
			relevant:" get(_REPEAT_CUSTOM_) == '1' " +
					 " && get(_REPEAT_TYPE_) == 'MON' " +
					 " && get(_REPEAT_CUSTOM_TYPE_) == 'S'"
		},
		
		{id:_REPEAT_YEARLY_MONTHS_LIST_, type:_LIST_, dataType:_NUMBER_, unique:true,
			relevant:" get(_REPEAT_CUSTOM_) == '1' " +
		 " && get(_REPEAT_TYPE_) == 'YEA'"
		},
		
		{id:_REPEAT_END_TYPE_, type:_STRING_, label:_Repeat_End_Type_,
			relevant:"get(_REPEAT_TYPE_) != 'NON'"
		},
		{id:_REPEAT_END_DATE_, type:_DATE_, 
			relevant:"get(_REPEAT_TYPE_) != 'NON' " +
					 "&& get(_REPEAT_END_TYPE_) == 'D'"
		},
		{id:_REPEAT_END_COUNT_, type:_NUMBER_, 
			relevant:"get(_REPEAT_TYPE_) != 'NON' " +
		 "&& get(_REPEAT_END_TYPE_) == 'A'",
		 constraints:[ {type:"method", value: LmAppointmentView.validateWholeNumber } ]
		},

	    {id:_REPEAT_CUSTOM_ORDINAL_CHOICES_, type:_STRING_},

		{id:_ORGANIZER_, type: _STRING_, getter:"getOrganizer", getterScope:_INSTANCE_},

		{id:_ATTENDEES_, type:_STRING_, label:_Attendees_,
		 constraints:[ {errorMessageId: 'invalidEmail', type:"method", value: 
						function (value, form, formItem, instance) {
							//instance.attendees = value;
							if (!form.getController().validateEmail(value)) {
								throw this.getModel().getErrorMessage('invalidEmail', value);
							} else {
								return value;
							}
						}}
					   ]},
	    {id:_NOTES_, type:_STRING_, label:_Notes_},
	    {id:_ATTACHMENTS_, type:_LIST_, setterg:"setAttachments",
		 items: [
	            {id: "filename" ,type: _STRING_},
	            {id: "s" ,type: _NUMBER_},
	            {id: "part" ,type: _STRING_},
	            {id: "ct" ,type: _STRING_},
	            {id: "cd" ,type: _STRING_}
				]
		}
	]
}	
