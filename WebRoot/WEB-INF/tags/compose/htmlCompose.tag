<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ attribute name="isHtmlCont" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='request' />

<style media="screen" type="text/css">
    .yui-skin-sam .yui-toolbar-container .yui-toolbar-fontsize2 {
        width: 50px;
    }
</style>
<script type="text/javascript" src="../js/ajax/3rdparty/tinymce/tiny_mce.js"></script>
<script type="text/javascript">
<!--             
var myEditor;

    var saveContentToTextarea = function(){
        myEditor.saveHTML();
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        if (_htmlval != "")
            document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    };

    var saveToTextareaToSend = function(){
        myEditor.saveHTML();
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        if (_htmlval != "") {
            document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            document.getElementById("body").value = "<html><head><style> body {height: 100%; color:${mailbox.prefs.htmlEditorDefaultFontColor}; font-size:${mailbox.prefs.htmlEditorDefaultFontSize}; font-family:${mailbox.prefs.htmlEditorDefaultFontFamily};}</style></head><body>"+_htmlval+"</body></html>";
        }
    };

    (function(){
        <%-- Get font definitions from AjxMsg --%>
        var fonts = [];
        <c:forEach var="KEY" items="fontFamilyIntl,fontFamilyBase">
            <c:forEach var="i" begin="1" end="30">
                <fmt:message var="style" bundle='${AjxMsg}' key="${KEY}${i}.css"/>
                <c:choose>
                    <c:when test="${fn:startsWith(style, '#') or fn:startsWith(style, '?')}">
                    <%-- Do nothing --%>
                    </c:when>
                    <c:otherwise>
                        <c:set var="style" value="${fn:replace(style,', ',',')}"/>
                        <fmt:message var="name" bundle='${AjxMsg}' key="${KEY}${i}.display"/>
                        <c:set var="selected" value="${fn:replace(mailbox.prefs.htmlEditorDefaultFontFamily,', ',',') eq style}"/>
                            fonts.push("${name}=${style}");
                    </c:otherwise>
                </c:choose>
            </c:forEach>
        </c:forEach>

        var onTinyMCEEditorInit = function(ed){
            ed.dom.setStyles( ed.getBody(), {
                "font-family" : "${mailbox.prefs.htmlEditorDefaultFontFamily}",
                "font-size"   : "${mailbox.prefs.htmlEditorDefaultFontSize}",
                "color"       : "${mailbox.prefs.htmlEditorDefaultFontColor}"
            });
            window.myEditor = ed;
        };

        var handleContentLoad = function(ed){
            var imageArray = ed.dom.select("img[dfsrc^='doc:']"),
                path = ["/home/", "${mailbox.accountInfo.name}", "/"].join(""),
                image;

            while( image = imageArray.shift() ){
                image.src = [path, image.getAttribute("dfsrc").substring(4)].join('');
            }
        };

        var tinyMCEInitObj = {
            mode : "exact",
            elements: "body",
            height : "300px",
            width : "100%",
            <c:if test="${param.op eq 'reply' or param.op eq 'replyAll'}" >
                auto_focus : "body",
            </c:if>
            plugins : "autolink,advlist,inlinepopups,table,paste,directionality,emotions,media",
            theme : "advanced",
            theme_advanced_buttons1 : "fontselect,fontsizeselect,forecolor,backcolor,|,bold,italic,underline,strikethrough,|,bullist,numlist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,|,link,unlink,image",
            theme_advanced_buttons2 : "formatselect,undo,redo,|,pastetext,pasteword,|,tablecontrols,|,blockquote,hr,emotions,charmap,media,|,removeformat",
            theme_advanced_buttons3 : "",
            theme_advanced_buttons4 : "",
            theme_advanced_toolbar_location : "top",
            theme_advanced_toolbar_align : "left",
            theme_advanced_resizing : true,
            theme_advanced_fonts : fonts.join(";"),
            convert_urls : false,
            verify_html : false,
            gecko_spellcheck : true,
            theme_advanced_runtime_fontsize:true,
            dialog_type : "modal",
            forced_root_block : 'div',
            table_default_cellpadding : 3,
            table_default_border: 1,
            content_css : false,
            setup : function(ed) {
                ed.onInit.add(onTinyMCEEditorInit);
                ed.onLoadContent.add(handleContentLoad);
                ed.onBeforeRenderUI.add(function() {
                    tinymce.ScriptLoader.loadScripts(['../js/ajax/3rdparty/tinymce/themes/advanced/Zmeditor_template.js']);
                });
            }
        };
        window.tinyMCE && window.tinyMCE.init(tinyMCEInitObj);
    }());
// -->
</script>
