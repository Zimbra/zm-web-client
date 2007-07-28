
ZmAttachDialog = function(appCtxt, shell, className) {
	
	className = className || "DwtDialog";
	var title = ZmMsg.attachFile;
	DwtDialog.call(this, shell, className, title);

	this._appCtxt = appCtxt;
	
	//Initialize
	this._createBaseHtml();
	
	//Ok and Cancel Actions
	this._defaultCancelCallback = new AjxCallback(this,this._defaultCancelListener);
	this._cancelListeners = {};
	
	this._defaultOkCallback = new AjxCallback(this,this._defaultOkListener);
	this._okListeners = {};
	
	this.setButtonListener(DwtDialog.CANCEL_BUTTON,new AjxListener(this,function(){
		this._cancelButtonListener();
	}));
	
	this.setButtonListener(DwtDialog.OK_BUTTON,new AjxListener(this,function(){
		this._okButtonListener();
	}));	
	
	this._tabKeys = {};
	
	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText("Attach");
	
	//Add Default MyComputer tab
	this._addMyComputerTab();
}



ZmAttachDialog.prototype = new DwtDialog;
ZmAttachDialog.prototype.constructor = ZmAttachDialog;


//Listeners

ZmAttachDialog.prototype.addCancelListener = function(tabKey, cancelCallbackOrListener){	
	if(cancelCallbackOrListener && (cancelCallbackOrListener instanceof AjxListener || cancelCallbackOrListener instanceof AjxCallback) ){
		this._cancelListeners[tabKey] = cancelCallbackOrListener;
	}
};

ZmAttachDialog.prototype._defaultCancelListener = function(){
	this.popdown();
};

ZmAttachDialog.prototype._cancelButtonListener = function(){
	
	var cancelListener = this._cancelListeners[this._tabView.getCurrentTab()];
	if( cancelListener){
		cancelListener.run();
	}else{
		this._defaultCancelCallback.run();
	}
};

ZmAttachDialog.prototype.addOkListener = function(tabKey, okCallbackOrListener){	
	if(okCallbackOrListener && (okCallbackOrListener instanceof AjxListener || okCallbackOrListener instanceof AjxCallback) ){
		this._okListeners[tabKey] = okCallbackOrListener;
	}
};

ZmAttachDialog.prototype._defaultOkListener = function(){
	this.popdown();
};

ZmAttachDialog.prototype._okButtonListener = function(){
	
	var okListener = this._okListeners[this._tabView.getCurrentTab()];
	if( okListener){
		okListener.run();
	}else{
		this._defaultOkCallback.run();
	}
};

//Create HTML Container

ZmAttachDialog.prototype._createBaseHtml = function(){
	var view = this._baseContainerView = new DwtComposite(this);
	view.setScrollStyle(Dwt.CLIP);
	view.setSize("500px","300px");
	this._initializeTabView(view);
	this.setView(view);
};

ZmAttachDialog.prototype._initializeTabView = function(view){
	this._tabView = new DwtTabView(view, null, Dwt.STATIC_STYLE);
	this._tabView.addStateChangeListener(new AjxListener(this,this.tabChangeListener));
	this._setFooterSection(view);
	
};

ZmAttachDialog.prototype.tabChangeListener = function(ev){
	this.setFooter("");
};

ZmAttachDialog.prototype._setFooterSection = function(view){
	
	var div = document.createElement("div");
	div.style.height = "10px";
	div.style.textAlign = "center";
	div.id = Dwt.getNextId();
	view.getHtmlElement().appendChild(div);
	
	this._footer = document.getElementById(div.id);

};

ZmAttachDialog.prototype.setFooter = function(html){
	if(typeof html == "string"){
		this._footer.innerHTML = html;
	}else{
		this._footer.appendChild(html);
	}
};

ZmAttachDialog.prototype.getTabView = function(){
	return this._tabView;
};

ZmAttachDialog.prototype.addTab = function(id, title, tabViewPage) {
	if(!this._tabView || !tabViewPage) return null;
	var tabKey = this._tabView.addTab(title,tabViewPage); 
	this._tabKeys[id] = tabKey;
	return tabKey;
};

ZmAttachDialog.prototype.getTabKey = function(id){
	return this._tabKeys[id];
};

ZmAttachDialog.prototype.getTabViewPage = function(id){
	return this._tabView.getTabView(this._tabKeys[id]);
};

//PopUp Hack to refresh the UI everytime

ZmAttachDialog.prototype.popup = function(){
	var tabKey = this.getTabKey("MY_COMPUTER");
	this._tabView.switchToTab(tabKey);
	DwtDialog.prototype.popup.call(this);
};

//Upload Utitlity Methods
ZmAttachDialog.prototype.uploadFiles = function(){
	var tabKey = this._tabView.getCurrentTab();
	var tabView = this._tabView.getTabView(tabKey);
	if(tabView && tabView.gotAttachments()){
		this.upload(this._uploadCallback,tabView.getUploadForm());
	}else{
		this.setFooter("Add atleast one file to attach");
	}
};

ZmAttachDialog.prototype.cancelUploadFiles = function(){
	//Fix this, as this needs feature request like AjxPost.getRequestId()
	//We need to cancel the actual request, but we are for now just closing the window
	this._defaultCancelListener();
};

ZmAttachDialog.prototype.setUploadCallback = function(callback){
	if(!callback) callback = false;
	this._uploadCallback = callback;
};

ZmAttachDialog.prototype.upload = function(callback, uploadForm){
	
	if(!callback) callback = false;
	this.setButtonEnabled(DwtDialog.OK_BUTTON,false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON,true);
	this.setFooter("Attaching files...");
	this._processUpload(callback,uploadForm);
	
};

ZmAttachDialog.prototype._processUpload = function(callback,uploadForm){
	
	var ajxCallback = new AjxCallback(this, this._uploadDoneCallback,[callback]);
	var um = this._appCtxt.getUploadManager();
	window._uploadManager = um;

	try {
		um.execute(ajxCallback, uploadForm);
	} catch (ex) {
		ajxCallback.run();
	}
};

ZmAttachDialog.prototype._uploadDoneCallback = function(callback,status, attId){
	
	this.setButtonEnabled(DwtDialog.OK_BUTTON,true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON,true);
	
	if(status == AjxPost.SC_OK){
		
		this._tabView.switchToTab(this._tabView.getCurrentTab());
		this.setFooter("Finished attaching files.");
		if(callback){
			callback.run(status,attId);
		}
		
	}else if (status == AjxPost.SC_UNAUTHORIZED) {
		
		// auth failed during att upload - let user relogin, continue with compose action
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		this._appCtxt.getAppController()._handleException(ex, callback);
		
	} else {
		
		// bug fix #2131 - handle errors during attachment upload.
		var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));
		
		switch (status) {
			// add other error codes/message here as necessary
			case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE: 	msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
			default: 									msg += " "; break;
		}
		var dialog = this._appCtxt.getMsgDialog();
		dialog.setMessage(msg,DwtMessageDialog.CRITICAL_STYLE,this._title);
		dialog.popup();
		
		this.setFooter("Error while attaching files.")
	}
};

//MyComputer: Add MyComputer Tab View

ZmAttachDialog.prototype._addMyComputerTab = function(){
	this._myComputerTabView = new ZmMyComputerTabView(this._tabView, this._appCtxt);
	var tabKey = this.addTab("MY_COMPUTER",ZmMsg.myComputer,this._myComputerTabView);
	var okCallback = new AjxCallback(this,this.uploadFiles);
	this.addOkListener(tabKey,okCallback);
	var cancelCallback = new AjxCallback(this,this.cancelUploadFiles);
	this.addCancelListener(tabKey,cancelCallback);
};


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx//

//MyComputer TabViewPage
ZmMyComputerTabView = function(parent,appCtxt,className,posStyle) {	
	
	if (arguments.length == 0) return;
	
	this._appCtxt = appCtxt;
	//className = className || "DwtTabViewPage";
	DwtTabViewPage.call(this,parent,className,Dwt.STATIC_STYLE);
	
	this.setScrollStyle(Dwt.SCROLL);
};

ZmMyComputerTabView.prototype = new DwtTabViewPage;
ZmMyComputerTabView.prototype.constructor = ZmMyComputerTabView;

ZmMyComputerTabView.SHOW_NO_ATTACHMENTS = 5;
ZmMyComputerTabView.MAX_NO_ATTACHMENTS = 10;
ZmMyComputerTabView.UPLOAD_FIELD_NAME = "_attFile_";
ZmMyComputerTabView.ADD_ATTACHMENT_FIELD = "Add More Attachments";

ZmMyComputerTabView.prototype.toString = function(){
	return "ZmMyComputerTabView";
};


ZmMyComputerTabView.prototype.showMe = function(){
	this.resetAttachments();
	DwtTabViewPage.prototype.showMe.call(this);
	this.setSize(Dwt.DEFAULT, "260");
};

ZmMyComputerTabView.prototype.hideMe = function(){
	this._resetInlineOption();
	DwtTabViewPage.prototype.hideMe.call(this);
};

//Create UI for MyComputer
ZmMyComputerTabView.prototype._createHtml = function(){
	
	this._uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	
	var attachmentTableId = this._attachmentTableId = Dwt.getNextId();
	var uploadFormId = this._uploadFormId = Dwt.getNextId();
    var attachmentButtonTableId = this._attachmentButtonTableId = Dwt.getNextId();
    var optionTableId = this._optionTableId = Dwt.getNextId();
    
	var html = [];
	var idx = 0;
	html[idx++] = "<div style='overflow:auto'><form accept-charset='utf-8' method='POST' action='";
	html[idx++] = this._uri;
	html[idx++] = "' id='";
	html[idx++] = uploadFormId;
	html[idx++] = "' enctype='multipart/form-data'><input type='hidden' name='_charset_'/><table id='";
	html[idx++] = attachmentTableId;
	html[idx++] = "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
	html[idx++] = "</form></div>";
	html[idx++] = "<div><table id='";
	html[idx++] = attachmentButtonTableId;
	html[idx++] = "'></table></div>";
	html[idx++] = "<div><table id='";
	html[idx++] = optionTableId;
	html[idx++] = "'></table></div>";
	
	this._contentEl =  this.getContentHtmlElement();
	this._contentEl.innerHTML = html.join("");
	
	//Initialize
	this._attachmentTable = document.getElementById(this._attachmentTableId);
	delete this._attachmentTableId;

	this._uploadForm = document.getElementById(this._uploadFormId);
	delete this._uploadFormId;

	this._uploadForm.setAttribute("action",this._uri);

	this._attachmentButtonTable = document.getElementById(this._attachmentButtonTableId);
	delete this._attachmentButtonTableId;

	this._optionTable = document.getElementById(this._optionTableId);
	delete this._optionTableId;

	this._addAttachmentFieldButton();
		
	this._attachCount = 0;
};

ZmMyComputerTabView.prototype._getAttachmentTable = function(){
	return this._attachmentTable;
};

ZmMyComputerTabView.prototype._getAttachmentButtonTable = function(){
	return this._attachmentButtonTable;
};

ZmMyComputerTabView.prototype._getOptionTable = function(){
	return this._optionTable;
};

ZmMyComputerTabView.prototype.getUploadForm = function(){
	return this._uploadForm;	
};

//Inline Options
ZmMyComputerTabView.INLINE_OPTION_MSG = "Show images in message body";
ZmMyComputerTabView.prototype.showInlineOption = function(){
	
	this._inline = false;
	var optTable = this._getOptionTable();
	this._cleanTable(optTable);
	var html = [];
	var idx = 0;
	//Adding inline option
	html[idx++] = "<input type='checkbox' name='inlineimages' id='inline'>&nbsp;"+ ZmMyComputerTabView.INLINE_OPTION_MSG;
	html = html.join("");
	
	optTable.setAttribute("option","inline");
	var row = optTable.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.innerHTML = html;
	
	var inlineOption = document.getElementById("inline");
	inlineOption.onclick = AjxCallback.simpleClosure(this._handleInline,this,inlineOption);
};

ZmMyComputerTabView.prototype.hideInlineOption = function(){
	var optTable = this._getOptionTable();
	if(optTable.getAttribute("option") != "inline") return;
	optTable.setAttribute("option","");
	this._cleanTable(optTable);
	this._inline = false;
};

ZmMyComputerTabView.prototype._handleInline = function(checkbox){	
	this._inline = (checkbox && checkbox.checked)? true : false;
	this._uploadForm.setAttribute("action",this._uri + ((this._inline)?"?fmt=extended":""));
};

ZmMyComputerTabView.prototype._resetInlineOption = function(){
	
	var inlineOption = document.getElementById("inline");
	if(inlineOption){
		inlineOption.checked = false;
	}
	this._inline = false;
	this._uploadForm.setAttribute("action",this._uri);
};

ZmMyComputerTabView.prototype.isInline = function(){
	return ((this._inline)?this._inline:false);
};



//Attachments
ZmMyComputerTabView.prototype.addAttachmentField = function(noRemoveLink){
	
	if(this._attachCount >= ZmMyComputerTabView.MAX_NO_ATTACHMENTS){
		return;
	}
	
	var attTable = this._getAttachmentTable();
	
	this._attachCount++;
	
	noRemoveLink = (noRemoveLink != null && typeof noRemoveLink == "boolean") ? noRemoveLink : false;
	// add new row
	var row = attTable.insertRow(-1);
	var attId = "_att_" + Dwt.getNextId();
	var attRemoveId = attId + "_r";
	var attInputId = attId + "_i";
	row.id = attId;

	// add new cell and build html for inserting file upload input element
	var	cell = row.insertCell(-1);
	var html = [];
	var idx = 0;
	html[idx++] = "<table cellspacing=2 cellpadding=0 border=0><tr><td><div class='attachText'>";
	html[idx++] = ["Attach File ",this._attachCount,":"].join("");
	html[idx++] = "</div></td><td class='nobreak'><input id='";
	html[idx++] = attInputId;
	html[idx++] = "' type='file' name='";
	html[idx++] = ZmMyComputerTabView.UPLOAD_FIELD_NAME;
	html[idx++] = "' size=40>";
	if(!noRemoveLink){
		html[idx++] = "&nbsp;<span id='";
		html[idx++] = attRemoveId;
		html[idx++] = "' onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;'>";
		html[idx++] = ZmMsg.remove;
		html[idx++] = "</span>";
	}
	html[idx++] ="</td></tr></table>";
	cell.innerHTML = html.join("");
	
	if(!noRemoveLink){
		var attRemoveLink = document.getElementById(attRemoveId);
		attRemoveLink["onclick"] = AjxCallback.simpleClosure(this._removeAttachmentField,this,attId);
	}
	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	if (AjxEnv.isIE){
		var attField = document.getElementById(attInputId);
		attField["onkeydown"] = AjxCallback.simpleClosure(this._handleKeys,this);
	}
};

ZmMyComputerTabView.prototype._removeAttachmentField = function(attId){
	var row = document.getElementById(attId);
	this._attachmentTable.deleteRow(row.rowIndex);
		if (--this._attachCount == 0) {
			return false; // disables following of link
		}
	return true;
};


ZmMyComputerTabView.prototype._addAttachmentFieldButton = function(){
	
	var attTable = this._getAttachmentButtonTable();
	var row = attTable.insertRow(-1);
	var	cell = row.insertCell(-1);
	
	var addAttachmentFieldButton = new DwtButton(this);
	addAttachmentFieldButton.setText(ZmMyComputerTabView.ADD_ATTACHMENT_FIELD);	
	cell.appendChild(addAttachmentFieldButton.getHtmlElement());
	addAttachmentFieldButton.addSelectionListener(new AjxListener(this,this.addAttachmentField));
	
};

ZmMyComputerTabView.prototype.gotAttachments =
function() {
	var atts = document.getElementsByName(ZmMyComputerTabView.UPLOAD_FIELD_NAME);
	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;
	return false;
};

ZmMyComputerTabView.prototype.resetAttachments = function(){
	
	//CleanUp
	var attTable = this._getAttachmentTable();
	this._cleanTable(attTable);
	this._attachCount = 0;
	if(ZmMyComputerTabView.SHOW_NO_ATTACHMENTS > ZmMyComputerTabView.MAX_NO_ATTACHMENTS){
			ZmMyComputerTabView.SHOW_NO_ATTACHMENTS = ZmMyComputerTabView.MAX_NO_ATTACHMENTS;
	}
	
	//Re-initialize UI
	var row = attTable.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.appendChild(document.createElement("br"));
	cell.appendChild(document.createElement("br"));
	
	this.addAttachmentField(true);
	for(var i=1;i<ZmMyComputerTabView.SHOW_NO_ATTACHMENTS;i++){
		this.addAttachmentField();	
	}
	delete i;
};



//Utilities
ZmMyComputerTabView.prototype._cleanTable = function(table){
	if(!table || !table.rows) return;
	while(table.rows.length > 0){
		table.deleteRow(0);
	}
};

ZmMyComputerTabView.prototype._handleKeys = function(ev){
	var key = DwtKeyEvent.getCharCode(ev);
	return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};

