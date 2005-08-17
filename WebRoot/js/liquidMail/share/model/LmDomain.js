function LmDomain(name, parent, headerFlags) {
	
	LmModel.call(this, true);

	this.name = name.toLowerCase();
	this.parent = parent;
	this._parseHeaderFlags(headerFlags);
	this._subdomains = new Object();
}

LmDomain.prototype = new LmModel;
LmDomain.prototype.constructor = LmDomain;

LmDomain.sortCompare = 
function(a,b) {
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}

LmDomain.prototype.toString = 
function() {
	return "LmDomain";
}

LmDomain.prototype.getSubDomain =
function(name) {
	return this._subdomains[name];
}

LmDomain.prototype.getSubDomains =
function() {
	return this._subdomains;
}

LmDomain.prototype.getSortedSubDomains = 
function() {
	if (this._sorted)
		return this._sorted;
	this._sorted = new Array();
	for (var d in this._subdomains) {
		this._sorted.push(this._subdomains[d]);
	}
	this._sorted.sort(LmDomain.sortCompare);
	return this._sorted;
}

LmDomain.prototype.addSubDomain =
function(name, headerFlags) {
	name = name.toLowerCase();
	var sd = this._subdomains[name];
	if (sd)
		return sd;
		
	sd = new LmDomain(name, this, headerFlags);
	this._subdomains[name] = sd;

	if (this._sorted)
		delete this._sorted;

	return sd;
}

LmDomain.prototype._parseHeaderFlags =
function(flags) {
	this.hasFrom = (flags.indexOf("f") != -1);
	this.hasTo = (flags.indexOf("t") != -1);
	this.hasCc = (flags.indexOf("c") != -1);
}
