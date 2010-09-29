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
<%@ attribute name="isHtml" rtexprvalue="true" required="true" %>

<script type="text/javascript">
<!--
    var checkSubject = function() {
        var elesub = document.getElementById("subjectField");
        if(trim(elesub.value) == '') {
            return (confirm("<fmt:message key="compSubjectMissing"/>"));
        } else {
            return true;
        }
    }

    var cancelOnbeforeUnload = function(){
        window.onbeforeunload = null;
        /* do save to textearea before quitting the page */
    <c:if test="${(isHtml)}" >
        saveContentToTextarea();
    </c:if>
    }

    var prepToSend = function(){
        window.onbeforeunload = null;
        /*process HTML before sending*/
    <c:if test="${(isHtml)}" >
        saveToTextareaToSend();
    </c:if>
        return checkSubject();
    };

    /* List of IDs for which onbeforeunload has to be cancelled */
    var expElemts = new Array("SOPADDRECIP","Stobutton","Sccbutton","Sbccbutton","SOPDRAFT","IOPDRAFT","SOPATTACH","SDOPCANCEL","SDOPADDRECIP","SDOPDRAFT","SDOPATTACH","a_shbcc","a_hdbcc");
    var x;
    for (x in expElemts){
        var _elem = document.getElementById(expElemts[x]);
        _elem.onclick = function () {
            cancelOnbeforeUnload();
        }
    }

    /* List of elements that has to be handled for send */
    var sendElemts = new Array("SOPSEND", "SDOPSEND", "IOPSEND", "IDOPSEND");
    var y;
    for (y in sendElemts){
        var _elemA = document.getElementById(sendElemts[y]);
        _elemA.onclick = function () {
            return prepToSend();
        }
    }

    var _form = document.forms["composeForm"];

    var _fields = {} ;

    var grabFieldValues = function(){
        var _el = _form.elements;
        for ( var _i=0;_i < _el.length; _i++){
            if(_el[_i].type == "text" || _el[_i].type == "textarea" ){
                _fields[_el[_i].name] = _el[_i].value;
            }
        }
    <c:if test="${(isHtml)}" >
        setTimeout(function() {
            try{
                myEditor.saveHTML();
                _fields["body"] = trim(document.getElementById("body").value);
            }catch(ex){// we may come here if editor is not yet loaded
                setTimeout(function() {
                    try{
                        myEditor.saveHTML();
                        _fields["body"] = trim(document.getElementById("body").value);
                    }catch(ex1){}
                },4000);//wait for 4 more seconds
            }
        }, 4000);  // Saves to content text area
    </c:if>
    }

    grabFieldValues(); 

    var checkForChanges;
    checkForChanges = function(){
        var _checkFail = false;
        var _el = _form.elements;
        for ( var _i=0;_i < _el.length; _i++){
            if(_el[_i].type == "text" || _el[_i].type == "textarea"){
                if(_fields[_el[_i].name] != undefined && _fields[_el[_i].name] != _el[_i].value) { _checkFail = true;}
            }
        }
    <c:if test="${(isHtml)}">
        myEditor.saveHTML();
        _bodyVal = trim(document.getElementById("body").value);
        if(trim(_fields["body"]) != _bodyVal) {
            _checkFail = true;
            if(_fields["body"] == "<html><body>"+_bodyVal+"</body></html>"){  // Allow after save draft
                _checkFail = false;
            }

        }
    </c:if>
        <c:if test="${not empty sessionScope.temp_draftid}">
            if(_checkFail) {
                _checkFail = true;
            }
        </c:if>
        if(_checkFail){
            return "<fmt:message key="composeExitConfirmation"/>"; //disabling this for new way of save/cancel handling
        }
    };

    /*
      Clears the autoSave timeout before unloading the page, resets the timeout if the
      user opts to cancel the confirmation dialog.
    */
    window.onbeforeunload = function(e) {
        clearTimeout(timer);
        var activeElement = e.target.activeElement;
        // If user opts to cancel the confirmation dialog, focus shifts to the last activeElement which triggered this activity.
        // Register a onFocus handler which will trigger the timer for autosave, then remove the onfocus listener.
        // Note that this handler will be invoked only if the confirmation dialog is cancelled.
        activeElement.addEventListener('focus',function() {
            timer = setTimeout(autoSaveTimer, AUTO_SAVE_DRAFT_INTERVAL*1000);
            this.removeEventListener('focus');
        },true);

        return checkForChanges();
    };

    /* Move the body caret to the top of the textarea */
    var bodyEl = document.getElementById('body');
    if (bodyEl.setSelectionRange) { /* FF */
        bodyEl.setSelectionRange(0, 0);
    } else if (bodyEl.createTextRange && /\S/.test(bodyEl.value)) { // IE
        var range = bodyEl.createTextRange();
        range.collapse(true);
        range.moveStart("character", -60000);
        range.collapse(true);
        range.select();
        window._composerBookmark = document.selection.createRange().getBookmark();
        setTimeout(function(){
            bodyEl.onfocus = _on_composerFocus_IE;
            bodyEl.onmouseup = bodyEl.onkeyup = _on_composerEvent_IE;
        }, 10);
    }

    function _on_composerFocus_IE() {
        if (window._composerBookmark) {
            setTimeout(function() {
                var range = document.selection.createRange();
                range.moveToBookmark(window._composerBookmark);
                range.select();
            }, 10);
        }
    }

    function _on_composerEvent_IE(ev) {
        var range = document.selection.createRange();
        if (range.parentElement() === this) /*this* is the textarea*/ {
            window._composerBookmark = range.getBookmark();
        }
    }

//-->
</script>
