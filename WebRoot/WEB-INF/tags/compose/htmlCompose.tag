<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
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
<app:loadTinyMCE />

<script type="text/javascript">
<!--             
var myEditor;

    var saveContentToTextarea = function(){
        myEditor.save({format:"raw"});
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        if (_htmlval != "")
            document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    };

    var saveToTextareaToSend = function(){
        myEditor.save({format:"raw"});
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

        var onTinyMCEEditorInit = function(ev){
            var ed = ev.target;

            ed.dom.setStyles( ed.getBody(), {
                "font-family" : "${mailbox.prefs.htmlEditorDefaultFontFamily}",
                "font-size"   : "${mailbox.prefs.htmlEditorDefaultFontSize}",
                "color"       : "${mailbox.prefs.htmlEditorDefaultFontColor}"
            });
            window.myEditor = ed;
            enableSpellCheck(ed);
        };

        var handleContentLoad = function(ev){
            var ed = ev.target;

            var imageArray = ed.dom.select("img[dfsrc^='doc:']"),
                path = ["/home/", "${mailbox.accountInfo.name}", "/"].join(""),
                image;

            while( image = imageArray.shift() ){
                image.src = [path, image.getAttribute("dfsrc").substring(4)].join('');
            }
        };

        if (window.tinymce) {
            tinymce.PluginManager.add('zspellchecker', function(ed) {
                tinyMCE.DOM.loadCSS("../css/spellcheck.css");

                /* Spellcheck button action*/
                function onSpellCheck(event) {
                    var spellChecker = event.target; //Spellchecker button id

                    if (!spellChecker)
                        return;

                    if (ed.dom.hasClass(spellChecker, "mce-active") ){
                        ed.dom.removeClass(spellChecker, "mce-active");
                        ed.endSpellCheck();
                    } else {
                        ed.dom.addClass(spellChecker, "mce-active");
                        ed.startSpellCheck();
                    }
                };

                ed.addButton('zspellchecker', {
                    onclick: onSpellCheck,
                    icon: "spellchecker",
                    title: "Check spelling"
                });
            });
        }

        var toolbarbuttons = [
            'fontselect fontsizeselect formatselect |',
            'bold italic underline strikethrough |',
            'forecolor backcolor |',
            'removeformat |',
            'outdent indent bullist numlist blockquote |',
            'alignleft aligncenter alignright alignjustify |',
            'image link zemoticons charmap hr table |',
            'undo redo |',
            'pastetext code'
        ];

    	var plugins = [
    		"zemoticons",
    		"table", "paste", "directionality", "textcolor", "lists", "advlist",
    		"link", "hr", "charmap", "code"
    	];

        var tinyMCEInitObj = {
            mode : "exact",
            elements: "body",
            height : "300px",
            width : "100%",
            <c:if test="${param.op eq 'reply' or param.op eq 'replyAll'}" >
                auto_focus : "body",
            </c:if>
            plugins : plugins.join(' '),
            theme : "modern",
            toolbar_items_size: 'small',
            toolbar : toolbarbuttons.join(' '),
            font_formats : fonts.join(";"),
            fontsize_formats : "<fmt:message bundle='${AjxMsg}' key="fontSizes"/>" || '',
            statusbar : false,
            menubar : false,
            convert_urls : false,
            verify_html : false,
            browser_spellcheck : true,
            dialog_type : "modal",
            forced_root_block : "div",
            table_default_attributes: { cellpadding: '3px', border: '1px' },
            table_default_styles: { width: '90%', tableLayout: 'fixed' },
            content_css : false,
            language : tinyMCE.getlanguage("${mailbox.prefs.locale}"),
            paste_data_images: true,
            paste_retain_style_properties : "all",
            paste_remove_styles_if_webkit : false,
            submit_patch : false,
            add_form_submit_trigger: false,
            setup : function(ed) {
                ed.on('init', onTinyMCEEditorInit);
                ed.on('LoadContent', handleContentLoad);
                ed.on('SaveContent', function(ev) {
                    var ed = ev.target;

                    if (!ed.isDirty() && ed.getContent() == "<div></div>") {
                        ev.content = "";
                    }
                });
                ed.on('BeforeSetContent', function(ed) {
                    // Replaces all double br elements for avoiding enter issue
                    ed.content = ed.content.replace(/<br><br>/ig, '<br><div><br></div>');
                });
            }
        };
        window.tinyMCE && window.tinyMCE.init(tinyMCEInitObj);
    }());
// -->
</script>
