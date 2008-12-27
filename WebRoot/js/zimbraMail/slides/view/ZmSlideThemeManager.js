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



