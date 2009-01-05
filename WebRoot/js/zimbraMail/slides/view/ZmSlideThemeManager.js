/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmSlideThemeManager = 	function() {
};

ZmSlideThemeManager.prototype.getMasterSlideContent =
function(isTitleSlide){

    if(isTitleSlide && this._currentTitleSlideContent!=null) {
        return this._currentTitleSlideContent;
    }

    if( this._currentNotesSlideContent != null) {
        return this._currentNotesSlideContent;
    }
    return '<div style="background-color:purple; position:absolute; left: 0%; top:15%; width:100%; height:1%;"></div>';
};

ZmSlideThemeManager.prototype.parseSlideTheme =
function(div) {

    this._currentNotesSlideContent = "";
    this._currentTitleSlideContent = "";

    var node = div.firstChild;
    while(node) {
        var isTitleSlide = (node.className == "titlemaster");
        if(isTitleSlide) {
            this._currentTitleSlideContent = node.innerHTML;
        }
        var isNotesSlide = (node.className == "slidemaster");
        if(isNotesSlide) {
            this._currentNotesSlideContent = node.innerHTML;
        }
        node = node.nextSibling;
    }

    if(!this._currentTitleSlideContent) {
        this._currentTitleSlideContent = this._currentNotesSlideContent;
    }
};


ZmSlideThemeManager.prototype.getThemeCSSPath =
function(themeName) {
     return  "/public/slides/themes/" + themeName + "/css/slide.css";
};


ZmSlideThemeManager.prototype.getThemeSlidePath =
function(themeName) {
    return "/public/slides/themes/" + themeName + "/slide.html";
};

ZmSlideThemeManager.prototype.loadThemeCSS =
function(themeName) {
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href =  this.getThemeCSSPath(themeName);
    cssNode.media = 'screen';
    cssNode.title = 'dynamicLoadedSheet';
    document.getElementsByTagName("head")[0].appendChild(cssNode);
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



