function ZmDomain(name, parent, headerFlags) {
	
	ZmModel.call(this, true);

	this.name = name.toLowerCase();
	this.parent = parent;
	this._parseHeaderFlags(headerFlags);
	this._subdomains = new Object();
}

ZmDomain.prototype = new ZmModel;
ZmDomain.prototype.constructor = ZmDomain;

ZmDomain.sortCompare = 
function(a,b) {
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}

ZmDomain.prototype.toString = 
function() {
	return "ZmDomain";
}

ZmDomain.prototype.getSubDomain =
function(name) {
	return this._subdomains[name];
}

ZmDomain.prototype.getSubDomains =
function() {
	return this._subdomains;
}

ZmDomain.prototype.getSortedSubDomains = 
function() {
	if (this._sorted)
		return this._sorted;
	this._sorted = new Array();
	for (var d in this._subdomains) {
		this._sorted.push(this._subdomains[d]);
	}
	this._sorted.sort(ZmDomain.sortCompare);
	return this._sorted;
}

ZmDomain.prototype.addSubDomain =
function(name, headerFlags) {
	name = name.toLowerCase();
	var sd = this._subdomains[name];
	if (sd)
		return sd;
		
	sd = new ZmDomain(name, this, headerFlags);
	this._subdomains[name] = sd;

	if (this._sorted)
		delete this._sorted;

	return sd;
}

ZmDomain.prototype._parseHeaderFlags =
function(flags) {
	this.hasFrom = (flags.indexOf("f") != -1);
	this.hasTo = (flags.indexOf("t") != -1);
	this.hasCc = (flags.indexOf("c") != -1);
}
