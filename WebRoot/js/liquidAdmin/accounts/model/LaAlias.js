function LaAlias() {
	LaItem.call(this, LaEvent.S_ACCOUNT);
	this.attrs = new Object();
	this.id = "";
	this.name="";
}

LaAlias.prototype = new LaItem;
LaAlias.prototype.constructor = LaAlias;