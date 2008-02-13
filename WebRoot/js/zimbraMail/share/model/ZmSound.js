ZmSound = function(parent,className){
    if(arguments.length == 0) return;
    className = className || "ZmSound";
    DwtComposite.call(this, {parent:parent});
    this.setEnabled(false);
    this._initializePlayer();
};

ZmSound.prototype = new DwtComposite;
ZmSound.prototype.constructor = ZmSound;

ZmSound.prototype._initializePlayer = function(){
    var div = document.createElement("div");
    div.id = this._playerId = Dwt.getNextId();
    this.getHtmlElement().appendChild(div);
    this._player = document.getElementById(this._playerId);
};

ZmSound.prototype.play = function(surl,params){
    //params can be used in future to control the hidden,autostart,loop attributes.
    this._player.innerHTML = "<embed src='"+surl+"' hidden=true autostart=true loop=false>";
};


