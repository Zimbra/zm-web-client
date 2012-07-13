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
<app:spellcheck/>
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
            enableSpellCheck(ed);
        };

        var handleContentLoad = function(ed){
            var imageArray = ed.dom.select("img[dfsrc^='doc:']"),
                path = ["/home/", "${mailbox.accountInfo.name}", "/"].join(""),
                image;

            while( image = imageArray.shift() ){
                image.src = [path, image.getAttribute("dfsrc").substring(4)].join('');
            }
        };

        /* Spellcheck button action*/
        var onSpellCheck = function(event){
            this.dom.loadCSS("../css/spellcheck.css");
            var onSpellCheck = function(event){
                var spellCheckerId = this.controlManager.get("spellchecker").id, //Spellchecker button id
                    dom;
                if(spellCheckerId){
                    dom = tinyMCE.DOM;
                    if( dom.hasClass(spellCheckerId, "mceButtonActive") ){
                        dom.removeClass(spellCheckerId, "mceButtonActive");
                        this.endSpellCheck();
                    }
                    else{
                        dom.addClass(spellCheckerId, "mceButtonActive");
                        this.startSpellCheck();
                    }
                }
            };
            return onSpellCheck.call(this, event);
        };

        //Refer http://www.tinymce.com/i18n/index.php?ctrl=lang&act=download&pr_id=1
        var tinyMCELocaleArray = ['sq', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'nb', 'bs', 'br', 'bg', 'my', 'ca', 'km', 'ch', 'zh', 'hr', 'cs', 'da', 'dv', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'he', 'hi', 'hu', 'is', 'id', 'ia', 'it', 'ja', 'kl', 'ko', 'lv', 'lt', 'lb', 'mk', 'ms', 'ml', 'mn', 'se', 'no', 'nn', 'fa', 'pl', 'pt', 'ps', 'ro', 'ru', 'sc', 'sr', 'si', 'sk', 'sl', 'es', 'sv', 'ta', 'tt', 'te', 'th', 'tn', 'tr', 'tw', 'uk', 'ur', 'vi', 'cy', 'zu', 'zh-tw', 'cn', 'zh-cn'],
            locale = "${mailbox.prefs.locale}",
            tinyMCELocale;

        if (locale) {
            tinyMCELocale = locale.toLowerCase().replace("_", "-");
            if (tinyMCELocale === "zh-hk") {//setting chinese language for Hong kong chinese
                locale = "zh";
            }
            else if (tinymce.inArray(tinyMCELocaleArray, tinyMCELocale) !== -1) {
                locale = tinyMCELocale;
            }
            else {
                locale = "en";
            }
        }

        var tinyMCEInitObj = {
            mode : "exact",
            elements: "body",
            height : "300px",
            width : "100%",
            <c:if test="${param.op eq 'reply' or param.op eq 'replyAll'}" >
                auto_focus : "body",
            </c:if>
            plugins : "advlist,inlinepopups,table,paste,directionality,media" + (tinymce.isIE ? "" : ",autolink"),
            theme : "advanced",
            theme_advanced_buttons1 : "fontselect,fontsizeselect,forecolor,backcolor,|,bold,italic,underline,strikethrough,|,bullist,numlist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,|,image,link,unlink,|,spellchecker",
            theme_advanced_buttons2 : "formatselect,undo,redo,|,removeformat,|,pastetext,pasteword,|,tablecontrols,|,blockquote,hr,charmap,media",
            theme_advanced_buttons3 : "",
            theme_advanced_buttons4 : "",
            theme_advanced_toolbar_location : "top",
            theme_advanced_toolbar_align : "left",
            theme_advanced_resizing : true,
            theme_advanced_fonts : fonts.join(";"),
            theme_advanced_statusbar_location : "none",
            convert_urls : false,
            verify_html : false,
            gecko_spellcheck : true,
            dialog_type : "modal",
            forced_root_block : "div",
            table_default_cellpadding : 3,
            table_default_border: 1,
            content_css : false,
            language : locale || "en",
            theme_advanced_show_current_color : true,
            setup : function(ed) {
                ed.onInit.add(onTinyMCEEditorInit);
                ed.onLoadContent.add(handleContentLoad);
                ed.onBeforeRenderUI.add(function() {
                    tinymce.ScriptLoader.loadScripts(['../js/ajax/3rdparty/tinymce/themes/advanced/Zmeditor_template.js']);
                });
                ed.onBeforeSetContent.add(function(ed, o) {
                    // Replaces all double br elements for avoiding enter issue
                    o.content = o.content.replace(/<br><br>/ig, '<br><div><br></div>');
                });
                ed.addButton('spellchecker', {
                    onclick : onSpellCheck,
                    title: "Check spelling"
                });
            }
        };
        window.tinyMCE && window.tinyMCE.init(tinyMCEInitObj);
    }());
// -->
</script>
