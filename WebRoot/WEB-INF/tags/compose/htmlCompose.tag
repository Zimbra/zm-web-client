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

<!-- yui js-->
<app:yuiInclude/>
<style media="screen" type="text/css">
    .yui-skin-sam .yui-toolbar-container .yui-toolbar-fontsize2 {
        width: 50px;
    }
</style>
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
    }

    var saveToTextareaToSend = function(){
        myEditor.saveHTML();
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        if (_htmlval != "") {
            document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            document.getElementById("body").value = "<html><head><style> body {height: 100%; color:${mailbox.prefs.htmlEditorDefaultFontColor}; font-size:${mailbox.prefs.htmlEditorDefaultFontSize}; font-family:${mailbox.prefs.htmlEditorDefaultFontFamily};}</style></head><body>"+_htmlval+"</body></html>";
        }
    }

    //The sizes to map to the names
    var sizes = {
        ' 8pt' : 11,
        '10pt': 13,
        '12pt': 16,
        '14pt': 19,
        '18pt': 24,
        '24pt': 32,
        '36pt': 46
    };

    <%-- Get font definitions from AjxMsg --%>
    var fonts = [];
    var defaultFont;
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
                fonts.push({text:"${name}",value:"${style}"<c:if test="${selected}">,checked:true</c:if>});
                <c:if test="${selected}">
                defaultFont="${name}";
                </c:if>
            </c:otherwise>
        </c:choose>
    </c:forEach>
    </c:forEach>

    var Dom = YAHOO.util.Dom;

    myEditor = new YAHOO.widget.Editor('body', {
        height: '300px',
        width: '100%',
        dompath: false, //Turns on the bar at the bottom
        animate: true, //Animates the opening, closing and moving of Editor windows
        plainText: true, // Treats the contents of the textarea as plaintext
        <c:if test="${param.op eq 'reply' or param.op eq 'replyAll'}" >
        focusAtStart: true,
        </c:if>
        css: 'html {height: 95%;}body {height: 100%;padding: 7px; background-color: #fff; color:${mailbox.prefs.htmlEditorDefaultFontColor}; font-size: ${mailbox.prefs.htmlEditorDefaultFontSize}; font-family: ${mailbox.prefs.htmlEditorDefaultFontFamily};} a {color: blue;text-decoration: underline;cursor: pointer;}.warning-localfile {border-bottom: 1px dashed red !important;}.yui-busy {cursor: wait !important;}img.selected { border: 2px dotted #808080;}img {cursor: pointer !important;border: none;}',
        extracss: '.yui-spellcheck { background-color: yellow; }',
        collapse: true,
        draggable: false,
        buttonType: 'advanced',
        fonts: fonts,
        defaultFont: defaultFont
    });

    //Change the default toolbar button for fontsize to a new one.
    myEditor._defaultToolbar.buttons[0].buttons[1] = {
        type: 'select', label: '<c:out value="${mailbox.prefs.htmlEditorDefaultFontSize}"/>', value: 'fontsize2', disabled: true,
            menu: [
                { text: ' 8pt' },
                { text: '10pt' },
                { text: '12pt' },
                { text: '14pt' },
                { text: '18pt' },
                { text: '24pt' },
                { text: '36pt' }
            ]
    };

    //Override the _handleFontSize method with our own
    myEditor._handleFontSize = function(o) {
        var button = this.toolbar.getButtonById(o.button.id);
        var value = o.button.value; //The selected value
        var out = sizes[value]; //The pixel size
        button.set('label', value);
        this._updateMenuChecked('fontsize2', value);

        if (!this._hasSelection()) {
            el = this._createInsertElement({ fontSize: value });
            this.currentElement[0] = el;
            this._selectNode(this.currentElement[0]);
            return false;
        } else {
            this.execCommand('fontsize', out + 'px');
        }
        this.STOP_EXEC_COMMAND = true;
    };
    
    myEditor.on('editorContentLoaded', function() {
        var html = document.getElementById('body').innerHTML;;
        if(html==""){
            myEditor.setEditorHTML("<br/>");
        }
        var _edit = arguments[1];
        var idoc = _edit._getDoc();
        if (idoc) {
            var images = idoc.getElementsByTagName("img");
            var path = ["/home/", "${mailbox.accountInfo.name}", "/"].join("");
            var img;
            for (var i = 0; i < images.length; i++) {
                img = images[i];
                var dfsrc = img.getAttribute("dfsrc");
                if (dfsrc && dfsrc.indexOf("doc:") == 0) {
                    img.src = [path, dfsrc.substring(4)].join('');
                }
            }
        }
        this.toolbar.on('fontsize2Click', function(o) {
            this._handleFontSize(o);
        }, this, true);
    }, myEditor, true);

    /*hide titlebar*/
    myEditor._defaultToolbar.titlebar = false;

    /* insert span when no selection*/
    myEditor.on('toolbarLoaded', function() {
       this.toolbar.on('fontnameClick', function(o) {
            if (!this._hasSelection()) {
                var button = o.button;
                this._createCurrentElement('span', {
                    fontFamily: button.value
                });
                var el = this.currentElement[0];
                if (this.browser.webkit) {
                    //Little Safari Hackery here..
                    el.innerHTML = '<span class="yui-non"> </span>';
                    el = el.firstChild;
                    this._getSelection().setBaseAndExtent(el, 1, el, el.innerText.length);
                } else if (this.browser.ie || this.browser.opera) {
                    el.innerHTML = ' ';
                }
                this._focusWindow();
                this._selectNode(el);
                return false;
            }
        }, this, true);

        //to set fontsize from preferrence
        var fsObj = this.toolbar.getButtonByValue('fontsize2');
        fsObj.checkValue('<c:out value="${mailbox.prefs.htmlEditorDefaultFontSize}"/>');

    });

    /*enable buttons that are disabled by default */
    myEditor.on('afterNodeChange', function() {

        var elm = this._getSelectedElement(),
            button = this.toolbar.getButtonByValue('fontsize2'),
            label = '<c:out value="${mailbox.prefs.htmlEditorDefaultFontSize}"/>';

        if (!this._isElement(elm, 'body') && !this._isElement(elm, 'img')) {
            this.toolbar.enableButton('fontsize2');
            var fs = parseInt(Dom.getStyle(elm, 'fontSize'),10);
            for (var i in sizes) {
                if (fs == sizes[i]) {
                    label = i;
                    break;
                }
            }
            button.set('label', label);
            button.checkValue(label);
        } else {
            button.set('label', label);
            button.checkValue(label);
        }

        this.toolbar.enableButton('fontname');
        this.toolbar.enableButton('fontsize2');
        this.toolbar.enableButton('subscript');
        this.toolbar.enableButton('superscript');
        this.toolbar.enableButton('forecolor');
        this.toolbar.enableButton('backcolor');
        this.toolbar.enableButton('indent');
        this.toolbar.enableButton('outdent');
        this.toolbar.enableButton('heading');
        this.toolbar.enableButton('createlink');

        //to set fontname from preferrence
        var fnObj = this.toolbar.getButtonByValue('fontname');
        fnObj.checkValue('<c:out value="${mailbox.prefs.htmlEditorDefaultFontFamily}"/>');
    });
    enableSpellCheck(myEditor);
    myEditor.render();

// -->
</script>
