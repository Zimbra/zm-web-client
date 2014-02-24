/**
 * From Group divides messages into sort by sender.
 */
ZmMailListFromGroup = function() {
    this.id = ZmId.GROUPBY_FROM;
	this.field = ZmItem.F_FROM;
    ZmMailListGroup.call(this);

};

ZmMailListFromGroup.prototype = new ZmMailListGroup;
ZmMailListFromGroup.prototype.constructor =  ZmMailListFromGroup;

/**
 *  returns HTML string for all sections.
 *  @param {boolean} sortAsc    true/false if sort ascending
 *  @return {String} HTML for all sections including section header
 * @param sortAsc
 */
ZmMailListFromGroup.prototype.getAllSections =
function(sortAsc) {
    var htmlArr = [];
    var keys = this._sortKeys(sortAsc);

    for(var i=0; i<keys.length; i++) {
        var key = keys[i].addr;
        if (this._section[key].length > 0) {
            var sectionHeader = keys[i].title;
            htmlArr.push(this.getSectionHeader(sectionHeader));
            htmlArr.push(this._section[key].join(""));
        }
    }

    return htmlArr.join("");
};

/**
 * Adds item to section
 * @param {ZmMailMsg} msg   mail message
 * @param {String} item  HTML to add to section
 * @return {String} section returns section if successfully added, else returns null
 */
ZmMailListFromGroup.prototype.addMsgToSection =
function(msg, item){
   var emails =  msg.getEmails();
   var participants = msg.participants ? msg.participants.getArray() : null;
   if (emails) {
	    emails = emails.getArray();
	    var email = emails[0];
		if (this._section.hasOwnProperty(email)) {
			this._section[email].push(item);
			return email;
		}
		else {
			this._section[email] = [];
			this._section[email].push(item);
			var title = participants ? this._getSectionTitle(participants[0]) : email;
			this._sectionTitle[email] = {addr: email, title:title};
			return email;
		}
   }
   return false;
};

/**
 * Determines if message is in group
 * @param {String} section ID of section
 * @param {ZmMailMsg} msg
 * @return {boolean} true/false
 */
ZmMailListFromGroup.prototype.isMsgInSection =
function(section, msg) {

    var addr;
    var participants = msg.participants;
    if (participants) {
        var arr = participants.getArray();
        for (var i=0; i<arr.length; i++){
            if (arr[i].getType() == "FROM") {
              addr = arr[i].getAddress();
              break;
            }
        }
    }

    if (addr && addr == section) {
       return true;
    }

    return false;
};

/**
 * Returns the sort by (ZmSearch.NAME_ASC or ZmSearch.NAME_DESC)
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListFromGroup.prototype.getSortBy =
function(sortAsc) {
    if (sortAsc) {
        return ZmSearch.NAME_ASC;
    }
    return ZmSearch.NAME_DESC;
};

ZmMailListFromGroup.prototype._init =
function() {
    this._section = {};
    this._sectionTitle = {};
};

ZmMailListFromGroup.prototype._sortKeys =
function(sortAsc) {
  var keys = [];
  var i=0;
  for (var name in this._sectionTitle) {
      keys[i++] = {addr: this._sectionTitle[name].addr, title: this._sectionTitle[name].title};
  }

  var sortAscIgnoreCase = function(a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
  };

  var sortDescIgnoreCase = function(a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    if (a < b)
        return 1;
    if (a > b)
        return -1;
    return 0;
  };

  keys.sort(sortAscIgnoreCase);
  if (!sortAsc) {
      keys.reverse(sortDescIgnoreCase);
  }
  return keys;
};

ZmMailListFromGroup.prototype._getSectionTitle =
function(participant) {
    var sectionHeader = participant.getAddress();
    var name = participant.getName();
    if (name) {
        sectionHeader = name;
    }
    return sectionHeader;
};

ZmMailListFromGroup.prototype._getSectionHeaderTitle =
function(section) {
    return this._sectionTitle[section].title;
};