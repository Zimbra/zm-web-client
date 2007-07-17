

ZmUploadViewDialog = function(parent, appCtxt) {
	
	this._appCtxt = appCtxt;
	
	var attachButton = new DwtDialog_ButtonDescriptor(ZmUploadViewDialog.ATTACH_BUTTON, 
													  ZmUploadViewDialog.ATTACH, DwtDialog.ALIGN_RIGHT);

	var cancelButton = new DwtDialog_ButtonDescriptor(ZmUploadViewDialog.CANCEL_BUTTON, 
													  AjxMsg.cancel, DwtDialog.ALIGN_RIGHT);
													  
	ZmQuickAddDialog.call(this, parent, null, [DwtDialog.NO_BUTTONS] , [attachButton,cancelButton]);
	
	this.setButtonListener(ZmUploadViewDialog.CANCEL_BUTTON,new AjxListener(this,function(){
		this.cleanupAttachments();
		this.popdown();	
	}));
		
};

ZmUploadViewDialog.ATTACH_BUTTON = Dwt.getNextId();
ZmUploadViewDialog.CANCEL_BUTTON = Dwt.getNextId();
ZmUploadViewDialog.TITLE = "Attach Files to Message";
ZmUploadViewDialog.ATTACH = "Attach";
ZmUploadViewDialog.ADD_ATTACHMENT_FIELD = "Add Another Attachment";
ZmUploadViewDialog.INLINE_OPTION_MSG = "Show image attachments in message body";

ZmUploadViewDialog.UPLOAD_FIELD_NAME = ZmComposeView.UPLOAD_FIELD_NAME;

ZmUploadViewDialog.MAX_NO_ATTACHMENTS = 10;
ZmUploadViewDialog.SHOW_NO_ATTACHMENTS = 2;

ZmUploadViewDialog.prototype = new ZmQuickAddDialog;
ZmUploadViewDialog.prototype.constructor = ZmUploadViewDialog;


ZmUploadViewDialog.prototype.initialize = function(){
	

	this.setTitle(ZmUploadViewDialog.TITLE);

	if(!this._getAttachmentTable()){

		this.setContent(this._getContainer());	

		this._attachmentTable = document.getElementById(this._attachmentTableId);
		delete this._attachmentTableId;

		this._uploadForm = document.getElementById(this._uploadFormId);
		delete this._uploadFormId;

		this._uploadForm.setAttribute("action",this._uri);

		this._attachmentButtonTable = document.getElementById(this._attachmentButtonTableId);
		delete this._attachmentButtonTableId;

		this._inlineOptionTable = document.getElementById(this._inlineOptionTableId);
		delete this._inlineOptionTableId;

		this._addAttachmentFieldButton();
		
		this._addInlineOptionField();
		
	}else{
		var attTable = this._getAttachmentTable();
		while(attTable.rows.length > 0){
			attTable.deleteRow(0);
		}
		//this._getAttachmentTable().innerHTML = "";
	}
	
	this._attachCount = 0;
	if(ZmUploadViewDialog.SHOW_NO_ATTACHMENTS > ZmUploadViewDialog.MAX_NO_ATTACHMENTS){
		ZmUploadViewDialog.SHOW_NO_ATTACHMENTS = ZmUploadViewDialog.MAX_NO_ATTACHMENTS;
	}
	this.addAttachmentField(true);
	for(var i=1;i<ZmUploadViewDialog.SHOW_NO_ATTACHMENTS;i++){
		this.addAttachmentField();	
	}
	delete i;
	this._inline = false;
	this._addInlineOptionField();
};

ZmUploadViewDialog.prototype._getAttachmentTable = function(){
	return this._attachmentTable;
};

ZmUploadViewDialog.prototype._getAttachmentButtonTable = function(){
	return this._attachmentButtonTable;
};

ZmUploadViewDialog.prototype._getInlineOptionTable = function(){
	return this._inlineOptionTable;
};

ZmUploadViewDialog.prototype._removeAttachmentField = function(attId){
	var row = document.getElementById(attId);
	this._attachmentTable.deleteRow(row.rowIndex);
		if (--this._attachCount == 0) {
			return false; // disables following of link
		}
	return true;
};

ZmUploadViewDialog.prototype._handleKeys = function(ev){
	var key = DwtKeyEvent.getCharCode(ev);
	return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};

//UI getting constructed

ZmUploadViewDialog.prototype._getContainer = function(){	
	return this._createContainer();
};

ZmUploadViewDialog.prototype._createContainer =
function() {
	
	var uri = this._uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

	var attachmentTableId = this._attachmentTableId = Dwt.getNextId();
	var uploadFormId = this._uploadFormId = Dwt.getNextId();
    var attachmentButtonTableId = this._attachmentButtonTableId = Dwt.getNextId();
    var inlineOptionTableId = this._inlineOptionTableId = Dwt.getNextId();
    
	var html = [];
	var idx = 0;
	html[idx++] = "<div style='width:400px;overflow:auto'><form accept-charset='utf-8' method='POST' action='";
	html[idx++] = uri;
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
	html[idx++] = inlineOptionTableId;
	html[idx++] = "'></table></div>";

	return html.join("");

};


ZmUploadViewDialog.prototype._addFormatField = function(){
	
	var formatFieldId = this._formatFieldId = Dwt.getNextId();
	
	var attTable = this._getAttachmentTable();;
	var row = attTable.insertRow(-1);
	var	cell = row.insertCell(-1);
	
	var formatField = document.createElement("input");
	formatField.type = "hidden";
	formatField.name = "fmt";
	formatField.value = "raw";
	formatField.id = formatFieldId;
	cell.appendChild(formatField);
};

ZmUploadViewDialog.prototype._addInlineOptionField = function(){
	
	var attTable = this._getInlineOptionTable();
	if(!attTable) return;
	this._hideInlineOptionField();
	var html = [];
	var idx = 0;
	//Adding inline option
	html[idx++] = "<input type='checkbox' name='inlineimages' id='inline'>&nbsp;"+ ZmUploadViewDialog.INLINE_OPTION_MSG;
	html = html.join("");
	
	var row = attTable.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.innerHTML = html;
	
	var inlineOption = document.getElementById("inline");
	inlineOption.onclick = AjxCallback.simpleClosure(this._handleInline,this);
};



ZmUploadViewDialog.prototype._hideInlineOptionField = function(){
	
	var attTable = this._getInlineOptionTable();
	if(!attTable || !attTable.innerHTML || attTable.innerHTML == "") return;

	//attTable.innerHTML = ""; //IE Bug 
	while(attTable.rows.length > 0){
		attTable.deleteRow(0);
	}

	this._inline = false;
};


ZmUploadViewDialog.prototype.isInline = function(){
	
	return ((this._inline)?this._inline:false);

	var checkbox = document.getElementById("inline");
	if(checkbox && checkbox.checked){
		return true;
	}
	return false;
};

ZmUploadViewDialog.prototype.setInlineCheckBox = function(state){
	this._inline = (state)?state:false;
	var checkbox = document.getElementById("inline");
	if(checkbox){
		checkbox.checked = this._inline;
		this._handleInline();
	}
};

ZmUploadViewDialog.prototype._handleInline = function(){
	
    var inlineOption = document.getElementById("inline");
    if(!inlineOption) { this._inline = false; return; }
    
    var state = inlineOption.checked;
    
    this._uploadForm.setAttribute("action",this._uri + ((state)?"?fmt=extended":""));
    
    this._inline = (state)?state:false;

};



ZmUploadViewDialog.prototype._addAttachmentFieldButton = function(){
	
	var attTable = this._getAttachmentButtonTable();
	var row = attTable.insertRow(-1);
	var	cell = row.insertCell(-1);
	
	var addAttachmentFieldButton = new DwtButton(this);
	addAttachmentFieldButton.setText(ZmUploadViewDialog.ADD_ATTACHMENT_FIELD);	
	cell.appendChild(addAttachmentFieldButton.getHtmlElement());
	addAttachmentFieldButton.addSelectionListener(new AjxListener(this,this.addAttachmentField));
	
};


ZmUploadViewDialog.prototype.addAttachmentField = function(noRemoveLink){
	
	if(this._attachCount == ZmUploadViewDialog.MAX_NO_ATTACHMENTS){
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
	html[idx++] = ZmMsg.attachFile;
	html[idx++] = ":</div></td><td class='nobreak'><input id='";
	html[idx++] = attInputId;
	html[idx++] = "' type='file' name='";
	html[idx++] = ZmUploadViewDialog.UPLOAD_FIELD_NAME;
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

ZmUploadViewDialog.prototype.gotAttachments =
function() {
	var atts = document.getElementsByName(ZmUploadViewDialog.UPLOAD_FIELD_NAME);
	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;
	return false;
};

ZmUploadViewDialog.prototype.disableAttachButton = function(){
	this.setButtonEnabled(ZmUploadViewDialog.ATTACH_BUTTON,false);
};

ZmUploadViewDialog.prototype.enableAttachButton = function(){
	this.setButtonEnabled(ZmUploadViewDialog.ATTACH_BUTTON,true);
};

ZmUploadViewDialog.prototype.cleanupAttachments = function(){
	//this._getAttachmentTable().innerHTML = "";
	var attTable = this._getAttachmentTable();
	while(attTable.rows.length > 0){
		attTable.deleteRow(0);
	}
	this._attachCount = 0;
	this.setInlineCheckBox(false);
};
