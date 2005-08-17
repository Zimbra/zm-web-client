/**
 * Class encompasing an invite to a calendar appt.
 * uid
 * type
 * name
 * duration
 * startTime
 * transparency
 * location
 * endTime
*/

function LmInvite() {
	LmModel.call(this);
}

LmInvite.prototype = new LmModel;
LmInvite.prototype.constructor = LmInvite;

LmInvite.prototype.toString = 
function() {
	return "LmInvite: name=" + this.name + " id=" + this.id;
};

/**
 * function that will be used to send requests.
 * This should be set via LmInvite.setSendFunction.
 */
LmInvite._sendFun = null;

// Class methods
LmInvite.createFromDom = 
function(node) {
	var invite = new LmInvite();
	invite.components = node[0].comp;
	// not sure why components are null .. but.
	if (invite.components == null) {
		invite.components = [{}];
	}
	return invite;
};

LmInvite.prototype.setMessageId = 
function (id) {
	this.msgId = id;
};

/*
 * mail item id on appt instance
 */
LmInvite.prototype.getMessageId = 
function() {
	return this.msgId;
};

LmInvite.prototype.getComponent = 
function(id) {
	return this.components[id];
};

LmInvite.prototype.getComponents = 
function () {
	return this.components;
};

LmInvite.prototype.getComponentByUid = 
function(uid) {
	for (var i = 0 ; i < components.length ; ++i) {
		if (components.uid == uid) {
			break;
		}
	}
};

LmInvite.prototype.hasMultipleComponents = 
function() {
	return (this.components.length > 1);
};

LmInvite.prototype.getEventName = function (compNum) {
	if (this.components[compNum] != null ){
		return this.components[compNum].name;
	}
	return null;
};

LmInvite.prototype.getOrganizerEmail = 
function (compNum) {
	if (this.components[compNum] != null &&
		this.components[compNum].or != null &&
		this.components[compNum].or.url != null){
		return this.components[compNum].or.url.replace("MAILTO:","");
	}
	return null;
};

LmInvite.prototype.getOrganizerName = 
function (compNum) {
	if (this.components[compNum] != null &&
		this.components[compNum.org] != null) {
		return this.components[compNum].or.d;
	}
	return null;
};

LmInvite.prototype.isOrganizer = function (compNum) {
	if (this.components[compNum] != null) {
		return ((this.components[compNum].isOrg != null)? this.components[compNum].isOrg: false);
	}
	return false;
};

LmInvite.prototype.shouldRsvp =
function (compNum){
	if (this.components[compNum] != null) {
		return this.components[compNum].rsvp;
	}
	return null;
};

LmInvite.prototype.getRecurrenceRules = function (compNum) {
	return this.components[compNum].recur
};

LmInvite.prototype.isException = function (compNum) {
	if (this.components[compNum] != null){
		return (this.components[compNum].exceptionId != null);
	}
	return false;
};

LmInvite.prototype.getServerEndTime = function (compNum) {
	if (this.components[compNum] != null) {
		if (this._serverEndTime == null) {
			if (this.components[compNum].e != null ) {
				this._serverEndTime = this.components[compNum].e[0].d;
			} else {
				// get the duration
				var dd = this.components[compNum].dur[0].d || 0;
				var weeks = this.components[compNum].dur[0].w || 0;
				var hh = this.components[compNum].dur[0].h || 0;
				var mm = this.components[compNum].dur[0].m || 0;
				var ss = this.components[compNum].dur[0].s || 0;
				var t = parseInt(ss) + (parseInt(mm) * 60) + (parseInt(hh) * 3600) + (parseInt(dd) * 24 * 3600) + (parseInt(weeks) * 7 * 24 * 3600);
				// parse the start date
				var start = this.components[compNum].s[0].d;
				var yyyy = parseInt(start.substr(0,4), 10);
				var MM = parseInt(start.substr(4,2), 10);
				var dd = parseInt(start.substr(6,2), 10);
				var d = new Date(yyyy, MM -1, dd);
				if (start.charAt(8) == 'T') {
					var hh = parseInt(start.substr(9,2), 10);
					var mm = parseInt(start.substr(11,2), 10);
					var ss = parseInt(start.substr(13,2), 10);
					d.setHours(hh, mm, ss, 0);
				}
				// calculate the end date -- start + offset;
				var endDate = new Date(d.getTime() + (t * 1000));

				// put the end date into server DURATION format.
				MM = LsDateUtil._pad(d.getMonth() + 1);
				dd = LsDateUtil._pad(d.getDate());
				hh = LsDateUtil._pad(d.getHours());
				mm = LsDateUtil._pad(d.getMinutes());
				ss = LsDateUtil._pad(d.getSeconds());
				yyyy = d.getFullYear();
				this._serverEndTime = StringBuffer.concat(yyyy,MM,dd,"T",hh,mm,ss);
			}
		}
		return this._serverEndTime;
	}
};

LmInvite.prototype.getServerStartTime = function (compNum) {
	if (this.components[compNum] != null) {
		return this.components[compNum].s[0].d;
	}
};

LmInvite.prototype.getServerStartTimeTz = function (compNum) {
	if (this.components[compNum] != null){
		if (this._serverStartTimeZone == null) {
			var startTime = this.getServerStartTime();
			if (startTime && startTime.charAt(startTime.length -1) == 'Z') {
				this._serverStartTimeZone = LmTimezones.GMT;
			} else {
				this._serverStartTimeZone = this.components[compNum].s[0].tz;
			}
		}
		return this._serverStartTimeZone;
	}
};

LmInvite.prototype.getServerEndTimeTz = function (compNum) {
	if (this.components[compNum] != null) {
		if (this._serverEndTimeZone == null) {
			var endTime = this.getServerEndTime();
			if (endTime && startTime.charAt(endTime.length -1) == 'Z') {
				this._serverEndTimeZone =  LmTimezones.GMT;
			} else {
				this._serverEndTimeZone = this.components[compNum].e[0].tz;
			}
		}
		return this._serverEndTimeZone;
	}
};

