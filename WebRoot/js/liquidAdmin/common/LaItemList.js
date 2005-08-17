function LaItemList(type, constructor, app) {

	if (arguments.length == 0) return;
	LaModel.call(this, true);

	this.type = type;
	this._constructor = constructor;
	this._app = app;
	
	this._vector = new LaItemVector();
	this._idHash = new Object();
}

LaItemList.prototype = new LaModel;
LaItemList.prototype.constructor = LaItemList;

LaItemList.prototype.toString = 
function() {
	return "LaItemList "+this.type;
}

/**
* Adds an item to the list.
*
* @param item	the item to add
* @param index	the index at which to add the item (defaults to end of list)
*/
LaItemList.prototype.add = 
function(item, index) {
	this._vector.add(item, index);
	if (item.id) {
		this._idHash[item.id] = item;
		var items = new Object();
		items[0] = item;
	}
}

/**
* Removes an item from the list.
*
* @param item	the item to remove
*/
LaItemList.prototype.remove = 
function(item) {
	this._vector.remove(item);
	if (item.id)
		delete this._idHash[item.id];
}

/**
* Returns the number of items in the list.
*/
LaItemList.prototype.size = 
function() {
	this._vector.size();
}

/**
* Returns the list as an array.
*/
LaItemList.prototype.getArray =
function() {
	return this._vector.getArray();
}

/**
* Returns the list as a LaItemVector.
*/
LaItemList.prototype.getVector =
function() {
	return this._vector;
}

/**
* Returns the hash matching IDs to items.
*/
LaItemList.prototype.getIdHash =
function() {
	return this._idHash;
}

/**
* Returns the item with the given ID.
*
* @param id		an item ID
*/
LaItemList.prototype.getItemById =
function(id) {
	return this._idHash[id];
}

/**
* Clears the list, including its ID hash.
*/
LaItemList.prototype.clear =
function() {
	this._vector.removeAll();
	for (var id in this._idHash)
		this._idHash[id] = null;
	this._idHash = new Object();
}
/*
Sorting is done on the server
LaItemList.prototype.sortByName =
function(descending) {
	if (descending)
		this._vector.getArray().sort(LaItem.compareNamesDesc);
	else 
		this._vector.getArray().sort(LaItem.compareNamesAsc);	
}*/

/**
* Populates the list with elements created from the response to a SOAP command. Each
* node in the response should represent an item of the list's type.
*
* @param respNode	an XML node whose children are item nodes
*/
LaItemList.prototype.loadFromDom = 
function(respNode) {
	this.clear();
	var nodes = respNode.childNodes;
	for (var i = 0; i < nodes.length; i++) {
		var item = new this._constructor(this._app);
		
		item.initFromDom(nodes[i]);
		//add the list as change listener to the item
		this.add(item);
	}
}

// Grab the IDs out of a list of items, and return them as both a string and a hash.
LaItemList.prototype._getIds =
function(list) {
	var idHash = new Object();
	if (!(list && list.length))
		return idHash;
	var ids = new Array();
	for (var i = 0; i < list.length; i++) {
		var id = list[i].id;
		if (id) {
			ids.push(id);
			idHash[id] = list[i];
		}
	}
	idHash.string = ids.join(",");
	return idHash;
}
