// LmModel is data with a change listener.
function LmModel(init) {
 	if (arguments.length == 0) return;

	this._evtMgr = new LsEventMgr();
}

LmModel.prototype.toString = 
function() {
	return "LmModel";
}

LmModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(LmEvent.L_MODIFY, listener);
}

LmModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(LmEvent.L_MODIFY, listener);    	
}



