/**
 * ZmMailListGroup is the base class for creating a mail group to be displayed by the ListView.  A mail group consists of sections and a section header.
 * Each section is an array of HTML strings that divide the group.  For example, ZmMailListSizeGroup has sections to divide
 * the group based on size: Enormous, Huge, Very Large, etc.  Each section consists of an HTML representation of the
 * message and a section header.
 */
ZmMailListGroup = function(){
    this._showEmptySectionHeader = false;
    this._sectionHeaders = [];
    this._init();
};


/**
 *  Overload method; return HTML string for all sections.
 *  @param {boolean} sortAsc    true/false if sort ascending
 *  @return {String} HTML for all sections including section header
 */
ZmMailListGroup.prototype.getAllSections =
function(sortAsc) {

};

/**
 * Adds item to section; Groups should overload
 * @param {ZmMailMsg} msg   mail message
 * @param {String} item  HTML to add to section
 * @return {String} section returns section if successfully added, else returns null
 */
ZmMailListGroup.prototype.addMsgToSection =
function(msg, item) {

};

/**
 * Determines if message is in section/subgroup; Groups should overload
 * @param {String} section ID of section
 * @param {ZmMailMsg} msg
 * @return {boolean} true/false
 */
ZmMailListGroup.prototype.isMsgInSection =
function(section, msg) {

};

/**
 * Clears all sections
 */
ZmMailListGroup.prototype.clearSections =
function() {
    this._init();
};

/**
 * return the section size
 * @param {String} section id
 */
ZmMailListGroup.prototype.getSectionSize =
function(section) {
    if (this._section[section]){
        return this._section[section].length;
    }
    return -1;
};

/**
 * Returns section title
 * @param {String} section
 */
ZmMailListGroup.prototype.getSectionTitle =
function(section) {
    return this._getSectionHeaderTitle(section);
};

ZmMailListGroup.prototype.getSectionHeader =
function(headerTitle) {
    var header = new ZmMailListSectionHeader(this, {headerTitle : headerTitle});
    this._sectionHeaders.push(header);
    return header.getHeaderHtml();
};

ZmMailListGroup.prototype.resetSectionHeaders =
function() {
    this._sectionHeaders = [];
};

/**
 * Returns the sort by for the Group. For example size would be ZmSearch.SIZE_ASC or ZmSearch.SIZE_DESC
 * Groups should overload
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListGroup.prototype.getSortBy =
function(sortAsc) {
    return null;
};

/**
 * Returns the section headers for the group
 * @return {array} array of section headers
 */
ZmMailListGroup.prototype.getAllSectionHeaders =
function() {
   return this._sectionHeaders;
};

//PROTECTED METHODs

/**
 * initialize sections
 */
ZmMailListGroup.prototype._init =
function() {
    this._section = {};
};

/**
 * Groups should overload
 * @param {String} section
 * @return {String} section title
 */
ZmMailListGroup.prototype._getSectionHeaderTitle =
function(section) {
    return "";
};

//STATIC methods

/**
 * Return Group object based on groupId
 * @param {String} groupId
 * @return {ZmMailListGroup} group object
 */
ZmMailListGroup.getGroup =
function(groupId) {

    switch (groupId){
        case ZmId.GROUPBY_DATE:
            return new ZmMailListDateGroup();

        case ZmId.GROUPBY_SIZE:
            return new ZmMailListSizeGroup();

        case ZmId.GROUPBY_PRIORITY:
            return new ZmMailListPriorityGroup();

        case ZmId.GROUPBY_FROM:
            return new ZmMailListFromGroup();

        default:
            return null;
    }

};

/**
 * Return the header field based on groupId
 * @param {String} groupId
 * @param {boolean} isMultiColumn
 */
ZmMailListGroup.getHeaderField =
function(groupId, isMultiColumn) {

    if (isMultiColumn == false) {
        return ZmId.FLD_SORTED_BY;
    }

    switch (groupId) {
      case ZmId.GROUPBY_SIZE:
        return ZmId.FLD_SIZE;

      case ZmId.GROUPBY_FROM:
        return ZmId.FLD_FROM;

      case ZmId.GROUPBY_DATE:
        return ZmId.FLD_DATE;

      default:
        return null;
    }

};

/**
 * Return the group Id based on the sort field
 * @param {String} sortField
 */
ZmMailListGroup.getGroupIdFromSortField =
function(sortField) {
    switch (sortField) {
        case ZmId.FLD_FROM:
            return ZmId.GROUPBY_FROM;

        case ZmId.FLD_SIZE:
            return ZmId.GROUPBY_SIZE;

        case ZmId.FLD_DATE:
            return ZmId.GROUPBY_DATE;

        default:
            return ZmId.GROUPBY_NONE;
    }
};
