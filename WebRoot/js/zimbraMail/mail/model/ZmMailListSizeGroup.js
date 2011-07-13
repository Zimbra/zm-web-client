
/**
 * Size group divides messages into the following sections:
 * Enormous > 5MB
 * Huge 1-5MB
 * Very Large 500KB-1MB
 * Large 100KB-500KB
 * Medium 25KB-100KB
 * Small 10KB-25KB
 * Tiny < 10KB
 *
 */
ZmMailListSizeGroup = function(){
    this.id = ZmId.GROUPBY_SIZE;
	this.field = ZmItem.F_SIZE;
    ZmMailListGroup.call(this);
};

ZmMailListSizeGroup.prototype = new ZmMailListGroup;
ZmMailListSizeGroup.prototype.constructor =  ZmMailListSizeGroup;

ZmMailListSizeGroup.ENORMOUS = "ENORMOUS";
ZmMailListSizeGroup.HUGE = "HUGE";
ZmMailListSizeGroup.VERY_LARGE = "VERY_LARGE";
ZmMailListSizeGroup.LARGE = "LARGE";
ZmMailListSizeGroup.MEDIUM = "MEDIUM";
ZmMailListSizeGroup.SMALL = "SMALL";
ZmMailListSizeGroup.TINY = "TINY";

ZmMailListSizeGroup.KILOBYTE = 1024;
ZmMailListSizeGroup.MEGABYTE = 1024 * 1024;

ZmMailListSizeGroup.GROUP = [ZmMailListSizeGroup.ENORMOUS, ZmMailListSizeGroup.HUGE, ZmMailListSizeGroup.VERY_LARGE,
                             ZmMailListSizeGroup.LARGE, ZmMailListSizeGroup.MEDIUM, ZmMailListSizeGroup.SMALL, ZmMailListSizeGroup.TINY];

ZmMailListSizeGroup.SIZE = {};
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.ENORMOUS] = {min: 5 * ZmMailListSizeGroup.MEGABYTE - ZmMailListSizeGroup.MEGABYTE/2}; // > 4.5MB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.HUGE] = {min: (ZmMailListSizeGroup.MEGABYTE) - 512, max: (5 * ZmMailListSizeGroup.MEGABYTE) - ZmMailListSizeGroup.MEGABYTE/2};    //1023.5KB - 4.5MB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.VERY_LARGE] = {min: (500 * ZmMailListSizeGroup.KILOBYTE) - 512, max: ZmMailListSizeGroup.MEGABYTE - 512}; //499.5KB - 1023.5KB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.LARGE] = {min: 100 * ZmMailListSizeGroup.KILOBYTE - 512, max: (500 * ZmMailListSizeGroup.KILOBYTE) - 512};//99.5KB - 499.5KB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.MEDIUM] = {min: 25 * ZmMailListSizeGroup.KILOBYTE -512, max: (100 * ZmMailListSizeGroup.KILOBYTE)- 512};  //24.5KB - 99.5KB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.SMALL] = {min: 10 * ZmMailListSizeGroup.KILOBYTE - 512, max: (25 * ZmMailListSizeGroup.KILOBYTE) - 512}; //9.5KB - 24.5KB
ZmMailListSizeGroup.SIZE[ZmMailListSizeGroup.TINY] = {max: (10 * ZmMailListSizeGroup.KILOBYTE) - 512}; // < 9.5KB

ZmMailListSizeGroup.SECTION_TITLE = {};
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.ENORMOUS] = ZmMsg.mailSizeEnormousTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.HUGE] = ZmMsg.mailSizeHugeTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.VERY_LARGE] = ZmMsg.mailSizeVeryLargeTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.LARGE] = ZmMsg.mailSizeLargeTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.MEDIUM] = ZmMsg.mailSizeMediumTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.SMALL] = ZmMsg.mailSizeSmallTitle;
ZmMailListSizeGroup.SECTION_TITLE[ZmMailListSizeGroup.TINY] =  ZmMsg.mailSizeTinyTitle;

/**
 *  returns HTML string for all sections.
 *  @param {boolean} sortAsc    true/false if sort ascending
 *  @return {String} HTML for all sections including section header
 * @param sortAsc
 */
ZmMailListSizeGroup.prototype.getAllSections =
function(sortAsc) {
    var keys = ZmMailListSizeGroup.GROUP.slice(0); //copy group into keys
    var htmlArr = [];

    if (sortAsc) {
        keys.reverse(); //sort ascending
    }

    for (var i=0; i<keys.length; i++) {
       if (this._section[keys[i]].length > 0) {
            htmlArr.push(this.getSectionHeader(ZmMailListSizeGroup.SECTION_TITLE[keys[i]]));
            htmlArr.push(this._section[keys[i]].join(""));
       }
       else if (this._showEmptySectionHeader) {
            htmlArr.push(this.getSectionHeader(ZmMailListSizeGroup.SECTION_TITLE[keys[i]]));
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
ZmMailListSizeGroup.prototype.addMsgToSection =
function(msg, item){
   for (var i = 0; i<ZmMailListSizeGroup.GROUP.length; i++) {
       if (this.isMsgInSection(ZmMailListSizeGroup.GROUP[i], msg)) {
           this._section[ZmMailListSizeGroup.GROUP[i]].push(item);
           return ZmMailListSizeGroup.GROUP[i];
       }
   }

   return null;
};

/**
 * Determines if message is in group
 * @param {String} section ID of section
 * @param {ZmMailMsg} msg
 * @return {boolean} true/false
 */
ZmMailListSizeGroup.prototype.isMsgInSection =
function(section, msg) {
    var size = msg.size;
    if (!size && msg.type == ZmId.ITEM_CONV) {
        size = msg.sf;
    }
    switch(section) {
        case ZmMailListSizeGroup.ENORMOUS:
            return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.HUGE:
            return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.VERY_LARGE:
            return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.LARGE:
            return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.MEDIUM:
           return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.SMALL:
           return this._isInSizeRange(size, section);

        case ZmMailListSizeGroup.TINY:
            return this._isInSizeRange(size, section);

        default:
            return false;
    }

};

/**
 * Returns the sort by (ZmSearch.SIZE_ASC or ZmSearch.SIZE_DESC)
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListSizeGroup.prototype.getSortBy =
function(sortAsc) {
    if (sortAsc) {
        return ZmSearch.SIZE_ASC;
    }
    return ZmSearch.SIZE_DESC;
};

//PROTECTED METHODS

ZmMailListSizeGroup.prototype._init =
function() {
    this._section = {};
    this._section[ZmMailListSizeGroup.ENORMOUS] = [];
    this._section[ZmMailListSizeGroup.HUGE] = [];
    this._section[ZmMailListSizeGroup.VERY_LARGE] = [];
    this._section[ZmMailListSizeGroup.LARGE] = [];
    this._section[ZmMailListSizeGroup.MEDIUM] = [];
    this._section[ZmMailListSizeGroup.SMALL] = [];
    this._section[ZmMailListSizeGroup.TINY] = [];
};

ZmMailListSizeGroup.prototype._isInSizeRange =
function(size, section) {
	if (size >= 0 && section) {
		var min = ZmMailListSizeGroup.SIZE[section].min;
		var max = ZmMailListSizeGroup.SIZE[section].max;
		if (min && max) {
			return size >= ZmMailListSizeGroup.SIZE[section].min && size < ZmMailListSizeGroup.SIZE[section].max;
		}
		else if (max) {
			return size < ZmMailListSizeGroup.SIZE[section].max;
		}
		else if (min) {
			return size >= ZmMailListSizeGroup.SIZE[section].min;
		}
	}
	return false;
};

ZmMailListSizeGroup.prototype._getSectionHeaderTitle =
function(section) {
   if (ZmMailListSizeGroup.SECTION_TITLE[section]) {
       return ZmMailListSizeGroup.SECTION_TITLE[section];
   }

   return "";
};