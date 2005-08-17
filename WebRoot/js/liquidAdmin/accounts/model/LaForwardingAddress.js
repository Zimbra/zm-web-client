function LaForwardingAddress() {
	LaItem.call(this, LaEvent.S_ACCOUNT);
	this.attrs = new Object();
	this.id = "";
	this.name="";
}

LaForwardingAddress.prototype = new LaItem;
LaForwardingAddress.prototype.constructor = LaForwardingAddress;