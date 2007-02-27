function ZmSkin(hints) {
    this.hints = ZmSkin.merge(hints, {
        // info
        name:       "@SkinName@",
        version:    "@SkinVersion@",
        logo:       { url: "@LogoURL@" }
    });
}

//
// Public methods
//

ZmSkin.prototype.show = function(name, state) {
    var containers = this.hints[name] && this.hints[name].containers;
    if (containers) {
        if (typeof containers == "function") {
            containers(this, state);
            return;
        }
        if (typeof containers == "string") {
            containers = [ containers ];
        }
        for (var i = 0; i < containers.length; i++) {
            var ocontainer = containers[i];
            var ncontainer = ocontainer.replace(/^!/,"");
            var inverse = ocontainer != ncontainer;
            this._showEl(ncontainer, inverse ? !state : state);
        }
    }
};

ZmSkin.prototype.hide = function(name) {
    this.show(name, false);
};

//
// Static functions
//

ZmSkin.merge = function(dest, src1 /*, ..., srcN */) {
    if (dest == null) dest = {};

    // merge all source properties into destination object
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        for (var pname in src) {
            // recurse through properties
            if (typeof dest[pname] == "object") {
                ZmSkin.merge(dest[pname], src[pname]);
                continue;
            }

            // insert missing property
            if (!dest[pname]) {
                dest[pname] = src[pname];
            }
        }
    }

    return dest;
};

//
// Protected methods
//

ZmSkin.prototype._getEl = function(id) {
	return document.getElementById(id);
};

ZmSkin.prototype._showEl = function(id, state) {
	var el = this._getEl(id);
	if (!el) return;

    var value;
	if (state == false) {
		value = "none";
	}
    else {
		var tagName = el.tagName;
		if (tagName == "TD" && document.all == null)		value = "table-cell";
		else if (tagName == "TR" && document.all == null) 	value = "table-row";
		else value = "block";
	}
	el.style.display = value;
};

ZmSkin.prototype._hideEl = function(id) {
    this._showEl(id, false);
};

ZmSkin.prototype._setSize = function(id, width, height) {
    var el = this._getEl(id);
    if (!el) return;

    if (width != null) el.style.width = width;
    if (height != null) el.style.height = height;
};

ZmSkin.prototype._reflowApp = function () {
    if (window._zimbraMail) {
        window._zimbraMail.getAppViewMgr().fitAll();
    }
};
