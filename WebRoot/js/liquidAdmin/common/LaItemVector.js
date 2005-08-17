/**
* @constructor
* @class LaItemVector
* This is a Vector that contains LaItems. Unlike in LsVector @link LsVector.contains and
@link LsVector.remove methods compare object ids (@link LaItem.id) instead of comparing the whole objects.
@link LsVector.add method is overwriten to accept only instances of LaItem class.
**/

function LaItemVector() {
	LsVector.call(this, null);
}

LaItemVector.prototype = new LsVector;
LaItemVector.prototype.constructor = LaItemVector;

LaItemVector.prototype.contains = 
function(obj) {
	if(! (obj instanceof LaItem) ) {
		throw new DwtException("Invalid parameter", DwtException.INTERNAL_ERROR, "LaItemVector.prototype.add", "LaItemVector can contain only objects of LaItem class and classes that extend LaItem.");
	}
	for (var i = 0; i < this._array.length; i++) {
		if (this._array[i].id == obj.id)
			return true;
	}
	return false;
}

LaItemVector.prototype.remove = 
function(obj) {
	if(! (obj instanceof LaItem) ) {
		throw new DwtException("Invalid parameter", DwtException.INTERNAL_ERROR, "LaItemVector.prototype.add", "LaItemVector can contain only objects of LaItem class and classes that extend LaItem.");
	}
	for (var i = 0; i < this._array.length; i++) {
		if (this._array[i].id == obj.id) {
			this._array.splice(i,1);
			return true;
		}
	}
	return false;
}


LaItemVector.prototype.add =
function(obj, index) {
	// if index is out of bounds, 
	if(! (obj instanceof LaItem) ) {
		throw new DwtException("Invalid parameter", DwtException.INTERNAL_ERROR, "LaItemVector.prototype.add", "LaItemVector can contain only objects of LaItem class and classes that extend LaItem.");
	}
	if (index == null || index < 0 || index >= this._array.length) {
		// append object to the end
		this._array.push(obj);
	} else {
		// otherwise, insert object
		this._array.splice(index, 0, obj);
	}
}