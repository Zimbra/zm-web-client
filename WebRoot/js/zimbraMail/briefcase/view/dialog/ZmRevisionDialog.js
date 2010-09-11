ZmRevisionDialog = function(parent, controller, className) {
	if (arguments.length == 0) return;
	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.versionHistory, standardButtons:[DwtDialog.CANCEL_BUTTON]});
    this.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.close);
    this._controller = controller;
};

ZmRevisionDialog.prototype = new ZmDialog;
ZmRevisionDialog.prototype.constructor = ZmRevisionDialog;

ZmRevisionDialog.prototype.toString =
function() {
	return "ZmRevisionDialog";
};

ZmRevisionDialog.prototype.popup =
function(item, revisions){

    this._item = item;
    this._initialize();

    this._reset();

    this._listView.set(revisions);
    this._listView.setSize(600, 150);
    this.setTitle(AjxMessageFormat.format(ZmMsg.versionHistoryFileLabel, item.name || item.filename));

    ZmDialog.prototype.popup.call(this);
};



ZmRevisionDialog.prototype._reset =
function(){
    this._toolbar.enableAll(false);
};


ZmRevisionDialog.prototype._contentHtml =
function(){
    this._templateId = Dwt.getNextId();
    return AjxTemplate.expand("briefcase.Briefcase#VersionHistory", {id: this._templateId});
};

ZmRevisionDialog.prototype._initialize =
function(){

    if(this._initialized) return;

    // create toolbar
    var toolbarEl = document.getElementById(this._templateId  + "_toolbar");
    if (toolbarEl) {
        var buttons = [ZmOperation.OPEN_FILE, ZmOperation.SEP, ZmOperation.RESTORE_VERSION, ZmOperation.SEP, ZmOperation.DELETE];
        this._toolbar = new ZmButtonToolBar({parent:appCtxt.getShell(), buttons:buttons, posStyle:Dwt.RELATIVE_STYLE});
        this._toolbar.reparentHtmlElement(toolbarEl);
        this._tabGroup.addMember(this._toolbar);

        //Populate Listeners
        this._toolbar.addSelectionListener(ZmOperation.OPEN_FILE, new AjxListener(this, this._openVersionListener));
        this._toolbar.addSelectionListener(ZmOperation.DELETE, new AjxListener(this, this._delVersionListener));
        this._toolbar.addSelectionListener(ZmOperation.RESTORE_VERSION, new AjxListener(this, this._restoreVersionListener));

    }

    // create list view
    var listViewEl = document.getElementById(this._templateId  + "_list");
    if (listViewEl) {
        this._listView = new ZmRevisionListView(appCtxt.getShell());
        this._listView.reparentHtmlElement(listViewEl);
        this._tabGroup.addMember(this._listView);
        this._listView.addSelectionListener(new AjxListener(this, this._listSelListener));
    }

    this._initialized = true;
};

ZmRevisionDialog.prototype._openVersionListener =
function(){
    var items = this._listView.getSelection();
    if(!items || items.length == 0) return;
    var verItem = items[0];
    var restUrl = this._item.getRestUrl();
	if (restUrl) {
        if(this._item.isWebDoc()){
            restUrl = appCtxt.getApp(ZmApp.BRIEFCASE).fixCrossDomainReference(restUrl);
            restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
            restUrl = restUrl + "&preview=1" + "&localeId=" + AjxEnv.DEFAULT_LOCALE;
        }else{
            restUrl = restUrl+ "?disp=a";
        }

        if(verItem.ver){
            restUrl = restUrl + "&ver="+verItem.ver;
        }
    }

    window.open(restUrl);
};

ZmRevisionDialog.prototype._listSelListener =
function(ev){
    var sel = this._listView.getSelection() || [];
    this._toolbar.enableAll((sel.length > 0));
    //Disable it when the latest version is selected.
    this._toolbar.enable(ZmOperation.RESTORE_VERSION, ( sel.length ==1 && this._listView._list.indexOf(sel[0]) != 0 ));
};

//ZmRevisionListView


ZmRevisionListView = function(parent) {

	var headerList = this._getHeaderList();
	DwtListView.call(this, {parent:parent, headerList:headerList});
};

ZmRevisionListView.FIELD_VERSION	= "ver";
ZmRevisionListView.FIELD_DATE	= "md";
ZmRevisionListView.FIELD_USER	= "leb";
ZmRevisionListView.FIELD_NOTES	= "desc";

ZmRevisionListView.prototype = new DwtListView;
ZmRevisionListView.prototype.constructor = ZmRevisionListView;

ZmRevisionListView.prototype.toString =
function() {
	return "ZmRevisionListView";
};

ZmRevisionListView.prototype.set =
function(revisions) {
    revisions = AjxVector.fromArray(revisions);
	DwtListView.prototype.set.call(this, revisions);
};

ZmRevisionListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmRevisionListView.FIELD_VERSION, text:ZmMsg.versionLabel, width: 50})),
		(new DwtListHeaderItem({field:ZmRevisionListView.FIELD_DATE, text:ZmMsg.date, width:150})),
        (new DwtListHeaderItem({field:ZmRevisionListView.FIELD_USER, text:ZmMsg.user, width:180})),
        (new DwtListHeaderItem({field:ZmRevisionListView.FIELD_NOTES, text:ZmMsg.notes}))    
	];
};

ZmRevisionListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmRevisionListView.FIELD_VERSION) {
		html[idx++] = item.ver;
	} else if (field == ZmRevisionListView.FIELD_DATE) {
		html[idx++] = AjxDateUtil.computeWordyDateStr(new Date(), item.md);
	}else if (field == ZmRevisionListView.FIELD_USER) {
		html[idx++] = AjxStringUtil.htmlEncode(item.cr);
	}else if (field == ZmRevisionListView.FIELD_NOTES) {
		html[idx++] = AjxStringUtil.htmlEncode(item.desc || ZmMsg.emptyNotes) ;
	}

	return idx;
};

ZmRevisionListView.prototype._getItemId =
function(item) {
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this._view, (item && item.id & item.ver) ? (item.id+'_'+item.ver) : Dwt.getNextId());
};