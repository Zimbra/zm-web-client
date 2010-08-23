ZmActionController = function() {
	this._actionStack = new ZmActionStack(1);
	this._statusTransitions = ZmActionController.substituteTransitions(appCtxt.getSkinHint("toast", "transitions"));
	//this._completeListener = new AjxListener(this, this._actionCompleteListener);
};

ZmActionController.prototype.actionPerformed = function(action) {
	this.dismiss();
	var logElement = this._actionStack.logAction(action);
	if (logElement) {
		this._active = true;
		//logElement.addChangeListener(this._completeListener);
	}
	return logElement;
}

/*ZmActionController.prototype._actionCompleteListener = function(ev) {
	if (ev.type != ZmEvent.S_ACTION) { return; }
	if (ev.event != ZmEvent.E_COMPLETE) { return; }
};*/

ZmActionController.prototype.getUndoLink = function(actionElement, text) {
	var undoId = ZmActionController._registerCallback(new AjxCallback(this, this.undo, actionElement));
	if (actionElement instanceof ZmAction) {
		return ["<a onclick='ZmActionController.callRegisteredCallback(",undoId,")' href='javascript:;'>", text || ZmMsg.undo, "</a>"].join("");
	} else return "";
};

ZmActionController.prototype.getStatusTransitions = function() {
	return this._statusTransitions;
}

ZmActionController.prototype.undo = function(action) {
	if (this._active) {
		this.dismiss();
		action.undo();
	}
};

ZmActionController.prototype.dismiss = function() {
	appCtxt.getAppController().statusView.unHold(true);
	this._active = false;
};

ZmActionController.substituteTransitions = function(transitions) { // Substitute "pause" for "hold" and make sure there's only one of them
	var newTransitions = [];
	var seenOne = false;
	for (var i=0; i<transitions.length; i++) {
		var transition = transitions[i];
		if (transition) {
			if (transition.type == ZmToast.PAUSE.type) {
				if (!seenOne) {
					seenOne = true;
					newTransitions.push(ZmToast.HOLD);
				}
			} else {
				newTransitions.push(transition);
			}
		}
	}
	return newTransitions;
};

ZmActionController._registeredCallbacks = [];

ZmActionController._registerCallback = function(callback) {
	var id = ZmActionController._registeredCallbacks.length;
	ZmActionController._registeredCallbacks[id] = callback;
	return id;
};

ZmActionController.callRegisteredCallback = function(id) {
	var callback = ZmActionController._registeredCallbacks[id];
	if (callback instanceof AjxCallback)
		callback.run();
	else if (AjxUtil.isFunction(callback))
		callback();
};
