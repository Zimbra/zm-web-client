ZmAttachmentsView = function(parent, controller) {


	DwtComposite.call(this, {parent:parent, className:"ZmAttachmentsView", posStyle:Dwt.ABSOLUTE_STYLE,
							 id:ZmId.getViewId(ZmId.VIEW_ATTACHMENTS)});

	this._controller = controller;

    this._initialize();

    // make sure no unnecessary scrollbars show up
	this.getHtmlElement().style.overflow = "hidden";

    this.addListener(DwtEvent.CONTROL, new AjxListener(this, this._controlEventListener));
};

ZmAttachmentsView.prototype = new DwtComposite;
ZmAttachmentsView.prototype.constructor = ZmAttachmentsView;

ZmAttachmentsView.prototype.toString = function() {
	return "ZmAttachmentsView";
};

ZmAttachmentsView.prototype.set = function(mailMsgList){

    this._attListView.set(mailMsgList);

    this.resize();

};

ZmAttachmentsView.prototype.resize = function(){

    var size = Dwt.getSize(this.getHtmlElement());
    var height = size.y - 10; //Correction for better look and feel

    var filterTreeSize = Dwt.getSize(this._viewContainer);
    var width  = filterTreeSize.x;

    this._attListView.setSize(width, height);
};

ZmAttachmentsView.prototype._controlEventListener = function(ev){

    this.resize();

};

ZmAttachmentsView.prototype.getFilterByTypes = function(){
    var type = this.getSelectedItem(ZmAttachmentsController.CATEGORY_BYTYPE);
    return type ? type.ct : ["any"];
};


ZmAttachmentsView.prototype.getSelectedItem = function(treeType){
    var selection = this.getSelection(treeType);
    return ( selection ) ? selection.getData(ZmAttachmentsView.ATT_KEY) : null;
};

ZmAttachmentsView.prototype.getSelection= function(treeType){
    var selection = this._tree[treeType].getSelection();
    return (selection && selection.length > 0) ? selection[0] : null;
};

ZmAttachmentsView.prototype.setQueryString = function(str){
    this._queryStringDiv.innerHTML = str;  
};

//Building UI

ZmAttachmentsView.prototype._initialize = function(){

    this._createHtml();
    this._createWidgets();

};

ZmAttachmentsView.prototype._createHtml = function(){

    var attachId = Dwt.getNextId();

    //var html = AjxTemplate.expand("mail.Message#AttachmentsView", {id:attachId});
    var html = "<table border='0' width='100%' height='100%'><tr><td width='15%' style='vertical-align:top;'><div id='"+attachId+"_filters'></div></td><td style='vertical-align:top;'><div id='"+attachId+"_results'></div></td></tr></table>";
    this.setContent(html);

    this._filtersContainer = Dwt.byId(attachId+"_filters");
    this._viewContainer = Dwt.byId(attachId+"_results");
};

ZmAttachmentsView.prototype._createWidgets = function(){

    this._createFilterTrees();

    this._createQueryStringDiv();

    this._attListView = new ZmAttachmentsListView(this, this._controller);

    this._viewContainer.appendChild(this._attListView.getHtmlElement());

};

ZmAttachmentsView.prototype._createQueryStringDiv = function(){

    var queryStringDivId = Dwt.getNextId();

    var html = "<div id='"+queryStringDivId+"' class='DwtTree ZmFilterTree' style='border-width:1px;padding:5px;'></div>";

    var div = document.createElement("div");
    div.style.paddingTop = '10px';
    div.innerHTML = html;

    this._filtersContainer.appendChild(div);

    this._queryStringDiv = document.getElementById(queryStringDivId);
    
};


ZmAttachmentsView.prototype._createFilterTrees = function(){

    this._tree = {};

    var treeListener = new AjxListener(this._controller, this._controller._filterTreeListener);

    this._createTree(ZmAttachmentsController.CATEGORY_BYTYPE, treeListener);
    this._createTree(ZmAttachmentsController.CATEGORY_BYTIME, treeListener);
    this._createOverviewTree(ZmAttachmentsController.CATEGORY_BYFOLDER, ZmOrganizer.FOLDER, treeListener);
    this._createOverviewTree(ZmAttachmentsController.CATEGORY_BYTAG, ZmOrganizer.TAG, treeListener);

};

ZmAttachmentsView.prototype._createOverviewTree = function(type, treeType, selectionListener){

    var treeIds = [];
    treeIds.push(treeType);

    var omit = {};
    if(treeType == ZmOrganizer.FOLDER){
        omit[ZmFolder.ID_ATTACHMENTS] = true;
    }

    var params = {
		overviewId: Dwt.getNextId(),
		parent: this,
		treeIds: treeIds,
        overviewClass: "DwtTree ZmFilterTree"
    };
    var overview = appCtxt.getOverviewController().createOverview(params);
	overview.set(treeIds, omit, null, true);

    var treeView = this._tree[type] = overview.getTreeView(treeType);

    var rootItem = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
    rootItem.setExpanded(true);
    rootItem.enableSelection(false);
    rootItem.setText(ZmMsg[ZmAttachmentsController.CATEGORY_MSGKEY[type]]);

    //this._newHeaderItem(treeView, {msgKey:ZmAttachmentsController.CATEGORY_MSGKEY[type]});

    this._filtersContainer.appendChild(overview.getHtmlElement());

    treeView.addSelectionListener(selectionListener);

    return treeView;
};

ZmAttachmentsView.prototype._createTree = function(type, selectionListener){

    var tree = this._tree[type]  =  new DwtTree({parent:this, className:"DwtTree ZmFilterTree"});

    var root = this._newHeaderItem(tree, {msgKey:ZmAttachmentsController.CATEGORY_MSGKEY[type]});
    tree.addSeparator();

    var categoryItems = ZmAttachmentsController.CATEGORY_ITEMS[type];
    for(var i=0; i<categoryItems.length; i++){
        this._newItem(root, categoryItems[i]);
    }
    tree.addSeparator();
    tree.addSeparator();

    this._filtersContainer.appendChild(tree.getHtmlElement());

    tree.addSelectionListener(selectionListener);

    root.setExpanded(true);

    return tree;
};

ZmAttachmentsView.ATT_KEY = "__att_key__";
ZmAttachmentsView.prototype._newItem = function(tree, attrs){
    var ti = new DwtTreeItem({parent:tree});
	ti.setImage(attrs.image);
	ti.setData(ZmAttachmentsView.ATT_KEY, attrs);
	ti.setText(attrs.msgKey ? ZmMsg[attrs.msgKey] : attrs.name);
	return ti;
};

ZmAttachmentsView.prototype._newHeaderItem = function(tree, attrs){
    var hti = new DwtHeaderTreeItem({parent:tree, className:"overviewHeader", index:0});
    hti.setData(ZmAttachmentsView.ATT_KEY, attrs);
	hti.setText(ZmMsg[attrs.msgKey]);
    hti.enableSelection(false);
    return hti;
};

ZmAttachmentsView.prototype._resetFilterTrees = function(){
   for(var treeType in this._tree){
       this._tree[treeType].deselectAll();
   }
};

//ZmAttachmentsListView

ZmAttachmentsListView = function(parent, controller) {

	ZmListView.call(this, {parent:parent, className:"ZmAttachmentsListView", posStyle:DwtControl.ABSOLUTE_STYLE,
					type:ZmItem.MSG, controller:controller});

    this._controller = controller;
    this._attachmentsView = parent;

    this._setAllowSelection();
    this.setScrollStyle(DwtControl.SCROLL);
};

ZmAttachmentsListView.prototype = new DwtListView;
ZmAttachmentsListView.prototype.constructor = ZmAttachmentsListView;

ZmAttachmentsListView.prototype.set =
function(list) {
 
    if(list instanceof ZmMailList){
       this._types = this._attachmentsView.getFilterByTypes();
       DwtListView.prototype.set.call(this, list.getVector());
    }
};

ZmAttachmentsListView.prototype.isValidType = function(attach){

    if(this._types[0] == "any") return true;

    if(this._types[0] == "image"){
        if(attach.ct.indexOf("image") == 0){
            return true;
        }
    }else{
        for(var i=0; i<this._types.length; i++){
            if(attach.ct == this._types[i]) return true;
        }
    }

    return false;
};

ZmAttachmentsListView.prototype._createItemHtml =
function(msg) {

    var hrefRoot = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&loc=" + AjxEnv.DEFAULT_LOCALE + "&id=" + msg.id + "&part="

    var htmlEl = [];

    var atts = msg.attachments;
    for (var i = 0; i < atts.length; i++) {

        var attach = atts[i];

        if(!this.isValidType(attach)) continue;

        var name = attach.name || attach.filename || (ZmMsg.unknown + " <" + attach.ct + ">");
        if(name.length>14){
		    name = name.substring(0,14)+"...";
	    }

        var mimeInfo = ZmMimeTable.getInfo(attach.ct);
        var icon = icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");

        var div = document.createElement("div");
        div.className = "ZmBriefcaseItem";

        var div1 = document.createElement("div");
        div1.className = "ZmThumbnailItem";

        var div2 = document.createElement("div");
        div2.className = icon+" ZmThumbnailIcon";

        div1.appendChild(div2);
        div.appendChild(div1);

        var div2 = document.createElement("div");
        div2.className = "ZmThumbnailName";

        var span = document.createElement("span");
        span.innerHTML = ["<a href='",(hrefRoot + attach.part),"' target='_blank'>",name,"</a>"].join("");

        div2.appendChild(span);
        div.appendChild(div2);

        this.associateItemWithElement(msg, div, DwtListView.TYPE_LIST_ITEM);

        htmlEl.push(div);

    }

    return htmlEl;

};

ZmAttachmentsListView.prototype._addRow =
function(row, index) {
	if (!row) { return; }

	// bug fix #1894 - check for childNodes length otherwise IE barfs
	var len = this._parentEl.childNodes.length;

    if (index != null && len > 0 && index != len) {
        var childNodes = this._parentEl.childNodes;
        this._parentEl.insertBefore(row, childNodes[index]);
    } else {
		this._parentEl.appendChild(row);
	}
};

ZmAttachmentsListView.prototype._itemClicked =
function(clickedEl, ev) {

	this._selectedClass = "ZmBriefcaseItemSelected";
	this._kbFocusClass = "ZmBriefcaseItemFocused";
	this._normalClass = "ZmBriefcaseItem";
	this._disabledSelectedClass = "ZmBriefcaseItemDisabledSelect";
	this._rightClickClass = "ZmBriefcaseItemSelected";
	this._styleRe = new RegExp(
        "\\b(" +
        [   this._disabledSelectedClass,
            this._selectedClass,
            this._kbFocusClass,
            this._dndClass,
            this._rightClickClass//,
//          this._normalClass
        ].join("|") +
        ")\\b", "g"
    );

	DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
};








