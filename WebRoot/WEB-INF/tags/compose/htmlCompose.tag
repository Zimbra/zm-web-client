<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ attribute name="isHtmlCont" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>


<link rel="stylesheet" type="text/css" href="../yui/2.5.1/assets/skins/sam/skin.css" />
<style type="text/css" media="screen">
    .yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck span.yui-toolbar-icon {
        background-image: url( ../yui/spellcheck/img/ImgSpellCheck.gif );
        background-position: 1px 0px;
        top: 1px;
        left: 4px;
    }
    .yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck-selected span.yui-toolbar-icon {
        background-image: url( ../yui/spellcheck/img/ImgSpellCheck.gif );
        background-position: 1px 0px;
        top: 1px;
        left: 4px;
    }
    .yui-spellcheck-list {
        cursor: pointer;
    }
    .yui-skin-sam .yui-editor-panel .yui-spellcheck-list li {
        padding-left: 5px;
    }
</style>

<script type="text/javascript" src="../yui/2.5.1/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="../yui/2.5.1/element/element-beta-min.js"></script>
<!-- Needed for Menus, Buttons and Overlays used in the Toolbar -->
<script type="text/javascript" src="../yui/2.5.1/container/container_core-min.js"></script>
<script type="text/javascript" src="../yui/2.5.1/menu/menu-min.js"></script>
<script type="text/javascript" src="../yui/2.5.1/button/button-beta-min.js"></script>
<!-- Source file for Rich Text Editor-->
<script type="text/javascript" src="../yui/2.5.1/editor/editor-beta-min.js"></script>
<script type="text/javascript" src="../yui/spellcheck/spellcheck.js"></script>

<script type="text/javascript">
<!--
var myEditor;
var htmlCompose = function(){
    var saveContentToTextarea = function(){
        myEditor.saveHTML();
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }

    var saveToTextareaToSend = function(){
        myEditor.saveHTML();
        var _htmlval = document.getElementById("body").value;
        var stripHTML = /<\S[^><]*>/g;
        var stripNBSP  = /&nbsp;/g
        document.getElementById("bodyText").value = _htmlval.replace(stripNBSP, ' ').replace(/<br>/gi, '\n').replace(stripHTML, '').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

        document.getElementById("body").value = "<html><head><style> body {height: 100%; color:${mailbox.prefs.htmlEditorDefaultFontColor}; font-size:${mailbox.prefs.htmlEditorDefaultFontSize}; font-family:${mailbox.prefs.htmlEditorDefaultFontFamily},helvetica,clean,sans-serif;}</style></head><body>"+_htmlval+"</body></html>";
    }

    myEditor = new YAHOO.widget.Editor('body', {
        height: '300px',
        width: '100%',
        dompath: false, //Turns on the bar at the bottom
        animate: true, //Animates the opening, closing and moving of Editor windows
        <c:choose> <c:when test="${isHtmlCont}">
        plainText: false,
        </c:when><c:otherwise>
        plainText: true,
        </c:otherwise></c:choose>
        <c:if test="${param.op eq 'reply' or param.op eq 'replyAll'}" >
        focusAtStart: true,
        </c:if>
        css: 'html {height: 95%;}body {height: 100%;padding: 7px; background-color: #fff; color:<c:out value="${mailbox.prefs.htmlEditorDefaultFontColor}"/>; font-size:${mailbox.prefs.htmlEditorDefaultFontSize}; font-family: <c:out value="${mailbox.prefs.htmlEditorDefaultFontFamily}"/>,helvetica,clean,sans-serif;}a {color: blue;text-decoration: underline;cursor: pointer;}.warning-localfile {border-bottom: 1px dashed red !important;}.yui-busy {cursor: wait !important;}img.selected { border: 2px dotted #808080;}img {cursor: pointer !important;border: none;}',
        extracss: '.yui-spellcheck { background-color: yellow; }',
        collapse: true,
        draggable: false,
        buttonType: 'advanced'
    });
    enableSpellCheck(myEditor);
    myEditor.on('editorContentLoaded', function() {
        var html = document.getElementById('body').innerHTML;;
        if(html==""){
            myEditor.setEditorHTML("<br/>");
        }
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

        this.toolbar.on('fontsizeClick', function(o) {
            if (!this._hasSelection()) {
                var button = o.button;
                this._createCurrentElement('span', {
                    fontSize: button.get('label') + 'px'
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
    });
    /*enable buttons that are disabled by default */
    myEditor.on('afterNodeChange', function() {
        this.toolbar.enableButton('fontname');
        this.toolbar.enableButton('fontsize');
        this.toolbar.enableButton('subscript');
        this.toolbar.enableButton('superscript');
        this.toolbar.enableButton('forecolor');
        this.toolbar.enableButton('backcolor');
        this.toolbar.enableButton('indent');
        this.toolbar.enableButton('outdent');
        this.toolbar.enableButton('heading');
        this.toolbar.enableButton('createlink');

    });
    myEditor.render();
}();

// -->
</script>
