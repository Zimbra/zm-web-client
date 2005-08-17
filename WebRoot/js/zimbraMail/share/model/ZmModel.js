// ZmModel is data with a change listener.
function ZmModel(init) {
 	if (arguments.length == 0) return;

	this._evtMgr = new AjxEventMgr();
}

ZmModel.prototype.toString = 
function() {
	return "ZmModel";
}

ZmModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZmEvent.L_MODIFY, listener);
}

ZmModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZmEvent.L_MODIFY, listener);    	
}



