ZmSlide = 	function(el) {
	this._content = "";
	this._index = 0;
	this._element = el;
};

ZmSlide.prototype.constructor = ZmSlide;

ZmSlide.prototype.setContent = function(content) {
	this._content = content;
}

ZmSlide.prototype.getContent = function() {
	return this._content;
}

ZmSlide.prototype.setIndex = function(index) {
	this._index = index;
}

ZmSlide.prototype.getIndex = function() {
	return this._index;
}

ZmSlide.prototype.getHtmlElement = function() {
	return this._element;
}
