/**
 * Priority Group divides a mail list into sections: Important & Unread, Important, Flagged, Everything else
 * This implemenation is experimental and based on Tag which will change in the future.
 * TODO:  Search needs to be batch request based. (implementation outside the scope of this object, but noting here)
 * @param group
 */
ZmMailListPriorityGroup = function(group) {
    this.id = ZmId.GROUPBY_PRIORITY;
    ZmMailListGroup.call(this);
};

ZmMailListPriorityGroup.prototype = new ZmMailListGroup;
ZmMailListPriorityGroup.prototype.constructor =  ZmMailListPriorityGroup;

ZmMailListPriorityGroup.IMPORTANT_UNREAD = "IMPORTANT_UNREAD";
ZmMailListPriorityGroup.IMPORTANT_READ = "IMPORTANT_READ";
ZmMailListPriorityGroup.FLAGGED = "FLAGGED";
ZmMailListPriorityGroup.EVERYTHING_ELSE = "EVERYTHING_ELSE";

ZmMailListPriorityGroup.TAG = "Important";

ZmMailListPriorityGroup.GROUP = [ZmMailListPriorityGroup.IMPORTANT_UNREAD, ZmMailListPriorityGroup.FLAGGED,
                                 ZmMailListPriorityGroup.IMPORTANT_READ, ZmMailListPriorityGroup.EVERYTHING_ELSE];

ZmMailListPriorityGroup.SECTION_TITLE = {};
ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.IMPORTANT_READ] = ZmMsg.mailPriorityImportantRead;
ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.IMPORTANT_UNREAD] = ZmMsg.mailPriorityImportantUnread;
ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.FLAGGED] = ZmMsg.mailPriorityFlagged;
ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.EVERYTHING_ELSE] = ZmMsg.mailPriorityEverythingElse;

ZmMailListPriorityGroup.prototype.getAllSections =
function() {
    var htmlArr = [];
    for (var i = 0; i<ZmMailListPriorityGroup.GROUP.length; i++) {
        if (this._section[ZmMailListPriorityGroup.GROUP[i]].length > 0) {
            htmlArr.push(this.getSectionHeader(ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.GROUP[i]]));
            htmlArr.push(this._section[ZmMailListPriorityGroup.GROUP[i]].join(""));
        }
        else if (this._showEmptySectionHeader) {
            htmlArr.push(this.getSectionHeader(ZmMailListPriorityGroup.SECTION_TITLE[ZmMailListPriorityGroup.GROUP[i]]));
        }
    }
    return htmlArr.join("");
};

ZmMailListPriorityGroup.prototype.addMsgToSection =
function(msg, item){
   for (var i = 0; i<ZmMailListPriorityGroup.GROUP.length; i++) {
       if (this.isMsgInSection(ZmMailListPriorityGroup.GROUP[i], msg)) {
           this._section[ZmMailListPriorityGroup.GROUP[i]].push(item);
           return true;
       }
   }
   return false;
};

ZmMailListPriorityGroup.prototype.isMsgInSection =
function(section, msg) {
    switch(section) {
        case ZmMailListPriorityGroup.IMPORTANT_UNREAD:
            return this._isImportantAndUnread(msg);

        case ZmMailListPriorityGroup.IMPORTANT_READ:
            return this._isImportantAndRead(msg);

        case ZmMailListPriorityGroup.FLAGGED:
            return this._isFlagged(msg);

        case ZmMailListPriorityGroup.EVERYTHING_ELSE:
           return this._noMatchingGroup(msg);

        default:
            return false;
    }
};

ZmMailListPriorityGroup.prototype._init =
function() {
	this._section = {};
    this._section[ZmMailListPriorityGroup.IMPORTANT_UNREAD] = [];
    this._section[ZmMailListPriorityGroup.IMPORTANT_READ] = [];
    this._section[ZmMailListPriorityGroup.FLAGGED] = [];
    this._section[ZmMailListPriorityGroup.EVERYTHING_ELSE] = [];
	if (!this._importantTag) {
		this._importantTag = this._getImportantTag();
	}
};

ZmMailListPriorityGroup.prototype._isImportantAndUnread =
function(msg){
   if (msg && this._importantTag) {
       if (msg.hasTag(this._importantTag.id) && msg.isUnread) {
           return true;
       }
   }
   return false;
};

ZmMailListPriorityGroup.prototype._isImportantAndRead =
function(msg) {
  if (msg && this._importantTag) {
      if (msg.hasTag(this._importantTag.id) && !msg.isUnread) {
          return true;
      }
  }
  return false;
};

ZmMailListPriorityGroup.prototype._isFlagged =
function(msg) {
   if (msg) {
       return msg.isFlagged;
   }
   return false;
};


ZmMailListPriorityGroup.prototype._noMatchingGroup =
function(msg) {
    if (!this._isImportantAndUnread(msg) && !this._isImportantAndRead(msg) &&
        !this._isFlagged(msg)) {
        return true;
    }
    return false;
};

ZmMailListPriorityGroup.prototype._getImportantTag =
function() {
	var tagList = appCtxt.getTagTree();
	if (tagList) {
	   return tagList.getByName("Important");
	}
	return null;
};