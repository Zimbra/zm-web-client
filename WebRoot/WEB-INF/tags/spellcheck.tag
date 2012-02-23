<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<zm:getMailbox var="mailbox"/>
    <c:choose>
    <c:when test="${not empty mailbox.prefs.locale}">
        <fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
    </c:when>

    <c:otherwise>
        <fmt:setLocale value='${pageContext.request.locale}' scope='request' />
    </c:otherwise>
    </c:choose>
    <fmt:setBundle basename="/messages/ZhMsg" scope='request' />
<script type="text/javascript">
function enableSpellCheck(myEditor) {

    //Editor onclick handler
    var onClick = function(editor, ev){
        var menu = editor._spellCheckMenu,
            target = ev.target;

        if( target.className === "ZM-SPELLCHECK-MISSPELLED" ){
            var spellData = editor._spellData,
                dom = tinyMCE.DOM;
            target.className = "ZM-SPELLCHECK-MISSPELLED2";
            menu.removeAll();
            var text = target.textContent || target.innerText;
            for (var i = 0, spellDataLength = spellData.length; i < spellDataLength; i++){
                var data = spellData[i];
                if( data.word === text ){
                    var suggestions = data.suggestions,
                        suggestionsLength = suggestions.length;
                    for (var j = 0; j < suggestionsLength; j++) {
                        menu.add({
                            title: suggestions[j]
                        });
                    }
                }
            }
            var position = dom.getPos(editor.getContentAreaContainer());
            menu.showMenu(position.x+(ev.clientX || ev.pageX), position.y+( ev.clientY || ev.pageY)+target.offsetHeight );
            editor.spellCheckTarget = target;
            dom.bind(menu.element.id, "click", function(ev){
                var dom = tinyMCE.DOM,
                    span = dom.select("span.mceText", dom.getParent(ev.target, "tr"));
                if(span = span.shift()){
                    var element = myEditor.spellCheckTarget;
                    element.className = "ZM-SPELLCHECK-FIXED";
                    element.innerHTML = span.innerHTML;
                }
            });
        }
        else{
            menu.hideMenu();
        }
    };

    myEditor.startSpellCheck = function() {
        if (!this.checking) {
            this.checking = true;
            document.getElementById("SpellCheckData").value = this.getContent({format : 'text'});
            var connect = YAHOO.util.Connect;
            connect.setForm('SpellCheckForm', false, null);
            connect.asyncRequest('POST', '<c:url value="/h/checkspelling" />', {
                success: this._checkSpelling,
                failure: function() {},
                scope: this
            }, null);
        }
    };

    myEditor.endSpellCheck = function() {
        if(this.checking){
            var spellCheckSpans = this.dom.select("span.ZM-SPELLCHECK-MISSPELLED,span.ZM-SPELLCHECK-MISSPELLED2,span.ZM-SPELLCHECK-FIXED"),
                span,
                doc = this.getDoc();
            while(span = spellCheckSpans.shift()){
                span.parentNode.replaceChild(doc.createTextNode(span.textContent || span.innerText), span);
            }
            doc.body.normalize();
            this.onClick.remove(onClick);
            delete this._spellData;
            delete this.checking;
            delete this.spellCheckTarget;
            var menu = this._spellCheckMenu;
            if(menu){
                menu.removeAll();
                menu.destroy();
                delete this._spellCheckMenu;
            }
        }
    };

    myEditor._checkSpelling = function(o) {
        o.responseText = '{"available":true,"data":[{"word":"onee","suggestions":["one","nee","knee","once","ones"]}]}';
        //Change this code to suit your backend checker
        var data = eval('(' + o.responseText + ')');
        if (!data || !data.available) {
            alert("<fmt:message key="spellcheckServiceUnavailableMessage"/>");
            this.endSpellCheck();
        } else if (!data.data.length) {
            alert("<fmt:message key="spellcheckNoMistakesFound"/>");
            this.endSpellCheck();
        } else {
            this._spellData = data.data;
            this._processSpellCheck(this.getDoc(), this.dom, this.getBody(), data.data);
            this.onClick.add(onClick);
            this._spellCheckMenu = this.controlManager.createDropMenu("spellcheckmenu");
        }
    };

    myEditor._processSpellCheck = function(doc, dom, node, data) {
        if(!node)return;
        if(node.nodeType === 3){ // Text node
            var text = node.nodeValue;
            for (var i = 0, dataLength = data.length ; i < dataLength; i++ ){
                var word = data[i].word;
                var index = text.indexOf(word);
                if(index !== -1){
                    var text1 = node.splitText(index);
                    text1.splitText(word.length);
                    var span = doc.createElement("span");
                    span.className = "ZM-SPELLCHECK-MISSPELLED";
                    span.appendChild(text1.cloneNode(true));
                    text1.parentNode.replaceChild(span, text1);
                }
            }
        }
        else{//element node
            if( !dom.hasClass(node, "ZM-SPELLCHECK-MISSPELLED") ){
                var child = node.childNodes;
                for( var i = 0 ; i < child.length ; i++ ){
                    this._processSpellCheck(doc, dom, child[i], data);
                }
            }
        }
    };
};
</script>
