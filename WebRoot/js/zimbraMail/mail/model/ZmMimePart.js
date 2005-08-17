function LmMimePart() {
	
	LmModel.call(this, true);
	
	this.children = new LsVector();
	this.node = new Object();
}

LmMimePart.prototype = new LmModel;
LmMimePart.prototype.constructor = LmMimePart;

LmMimePart.prototype.toString = 
function() {
	return "LmMimePart";
}

LmMimePart.createFromDom =
function(node, args) {
	var mimePart = new LmMimePart();
	mimePart._loadFromDom(node, args.attachments, args.bodyParts);
	return mimePart;
}

LmMimePart.prototype.getContent = 
function() {
	return this.node.content;
}

LmMimePart.prototype.setContent = 
function(content) {
	this.node.content = content;
}

LmMimePart.prototype.getContentDisposition =
function() {
	return this.node.cd;
}

LmMimePart.prototype.getContentType =
function() {
	return this.node.ct;
}

LmMimePart.prototype.setContentType =
function(ct) {
	this.node.ct = ct;
}

LmMimePart.prototype.setIsBody = 
function(isBody) {
	this.node.body = isBody;
}

LmMimePart.prototype.getFilename =
function() {
	return this.node.filename;
}

LmMimePart.prototype._loadFromDom =
function(partNode, attachments, bodyParts) {
	for (var i = 0; i < partNode.length; i++) {
		this.node = partNode[i];
		
		if (this.node.content)
			this._loaded = true;
		
		if (this.node.cd == "attachment" || 
			this.node.ct == LmMimeTable.MSG_RFC822 ||
			this.node.filename != null)
		{
			attachments.push(this.node);
		}
		
		if (this.node.body)
			bodyParts.push(this.node);
		
		if (this.node.mp) {
			var params = {attachments: attachments, bodyParts: bodyParts};
			this.children.add(LmMimePart.createFromDom(this.node.mp, params));
		}
	}
}
