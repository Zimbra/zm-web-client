ZmSlideThemeManager = 	function() {
};

ZmSlideThemeManager.prototype.getMasterSlideContent =
function(themeName){
    //return '<img src="' + window.contextPath + '/img/slides/bg-feed.png" width="100%" height="100%" style="opacity: 1;">';
    return '<div style="background-color:purple; position:absolute; left: 0%; top:15%; width:100%; height:1%;"></div>';
};

ZmSlideLayoutManager = function(){

};

ZmSlideLayoutManager.prototype.getSlideLayout =
function(themeName){
    var content = [];
    var idx = 0;
    content[idx++] = '<div class="slide_object_title" style="position: absolute; left: 4%; top: 4%; width: 76.8%; height: 9%;">Click here to edit title</div>'
    content[idx++] = '<div class="slide_object_notes" style="position: absolute; left: 4%; top: 23%; width: 92%; height: 72%;">Click here to edit slide contents <br> </div>';
    return content.join("");
};



