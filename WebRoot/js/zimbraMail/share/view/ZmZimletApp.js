ZmZimletApp = function(name, zimlet, container) {
	ZmApp.call(this, name, container);
	this._zimlet = zimlet;
};
ZmZimletApp.prototype = new ZmApp;
ZmZimletApp.prototype.constructor = ZmZimletApp;

ZmZimletApp.prototype.toString = function() {
	return "ZmZimletApp";
};

//
// Public methods
//

ZmZimletApp.prototype.getController = function() {
	if (!this._controller) {
		this._controller = new ZmZimletAppController(this.getName(), this._container, this);
	}
	return this._controller;
};

// convenience methods

ZmZimletApp.prototype.setContent = function(html) {
	this.getController().getView().setContent(html);
};

ZmZimletApp.prototype.setView = function(view) {
	this.getController().getView().setView(view);
};

// ZmApp methods

ZmZimletApp.prototype.launch = function(params, callback) {
	this.getController().show();
	ZmApp.prototype.launch.apply(this, arguments);
	if (this._zimlet.appLaunch) {
		this._zimlet.appLaunch(this.getName(), params);
	}
};

ZmZimletApp.prototype.activate = function(active) {
	ZmApp.prototype.activate.apply(this, arguments);
	if (this._zimlet.appActive) {
		this._zimlet.appActive(this.getName(), active);
	}
};
