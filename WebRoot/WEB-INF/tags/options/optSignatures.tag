<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<body class="yui-skin-sam">
<table width="100%" cellpadding="10" cellspacing="10">
<tr>
<td>
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr class="ZOptionsHeaderRow">
    <td class="ImgPrefsHeader_L">
        &nbsp;
    </td>
    <td class='ZOptionsHeader ImgPrefsHeader' >
        <fmt:message key="optionsSignatures"/>
    </td>
    <td class="ImgPrefsHeader_R">
        &nbsp;
    </td>
</tr>
</table>
<table cellpadding="3" width="100%"  class="ZOptionsSectionMain">
    <c:set var="numSigs" value="${0}"/>
    <zm:forEachSignature var="signature">
        <c:if test="${numSigs gt 0}">
            <tr>
                <td colspan="4">
                    <hr>
                </td>
            </tr>
        </c:if>
        <c:set var="isHtml" value="${fn:escapeXml(signature.type) eq 'text/html' ? true : false }"/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <fmt:message key="optionsSignatureName"/>
                :
            </td>
            <td>
                <input type="hidden" name="signatureId${numSigs}" value="${fn:escapeXml(signature.id)}"/>
                <input type="hidden" name="origSignatureName${numSigs}" value="${fn:escapeXml(signature.name)}"/>
                <input id="signatureName${numSigs}" size="40" type="text" name='signatureName${numSigs}'
                       value="${fn:escapeXml(signature.name)}">
            </td>
            <td align=right>
                <input class='tbButton' type="submit" name="actionDeleteSig:${fn:escapeXml(signature.id)}"
                       value="<fmt:message key="delete"/>">
            </td>
            <td width="20%">&nbsp;</td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                <fmt:message key="optionsSignature"/>
                :
            </td>
            <td colspan=2>
                <input type="hidden" id="signatureType${numSigs}" name="signatureType${numSigs}" value="${fn:escapeXml(signature.type)}"/>
                <input type="hidden" name="origSignatureValue${numSigs}" value="${fn:escapeXml(signature.value)}"/>
                <textarea style='width:100%' id="signatureValue${numSigs}" name='signatureValue${numSigs}' cols='80' rows='5' style='<c:if test="${isHtml}">visibility:hidden;</c:if>width:100%'>${fn:escapeXml(signature.value)}</textarea>
            </td>
            <td width="20%">&nbsp;</td>
        </tr>
        <c:set var="numSigs" value="${numSigs+1}"/>
    </zm:forEachSignature>

    <tr>
        <td colspan="4">
            <input type="hidden" name="numSignatures" value="${numSigs}"/>
            <hr>
        </td>
    </tr>
    <c:set var="maxSigs" value="${mailbox.accountInfo.attrs.zimbraSignatureMaxNumEntries[0]}"/>    
    <c:choose>
        <c:when test="${not empty param.actionNewSig or requestScope.newSignatureWarning}">
            <tr>
                <td colspan="4" class='ZHeader'>
                    <fmt:message key="optionsNewSignature"/>
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    <fmt:message key="optionsSignatureName"/>:
                </td>
                <td>
                    <input type="hidden" name="newSignature" value="TRUE"/>
                    <input id="newSignatureName" size="40" type="text" name='newSignatureName'
                           value="${fn:escapeXml(param.newSignatureName)}">
                </td>
                <td align=right>
                    <input class='tbButton' type="submit" name="actionCancelNewSig"
                           value="<fmt:message key="cancel"/>">
                </td>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                    <fmt:message key="optionsSignature"/>:
                </td>
                <td colspan=2>
                    <input type="hidden" id="newSignatureType" name="newSignatureType" value="text/html"/>
                    <textarea style='width:100%' id="newSignatureValue" name='newSignatureValue' cols='80'rows='5' style='visibility:hidden;width:100%'>${fn:escapeXml(param.newSignatureValue)}</textarea>
                </td>
                <td width="20%">&nbsp;</td>
            </tr>
        </c:when>
        <c:otherwise>
            <tr>
                <td>
                    &nbsp;
                </td>
                <td colspan=2>
                    <c:if test="${numSigs lt maxSigs}">
                    <input id="OPNEW" class='tbButton' type="submit" name="actionNewSig"
                           value="<fmt:message key="optionsAddSignature"/>">
                    </c:if>
                </td>
                <td width="20%">&nbsp;</td>
            </tr>
        </c:otherwise>
    </c:choose>
    <tr>
        <td class='ZOptionsTableLabel'>&nbsp;</td>
        <td colspan="3"><fmt:message key="optionsSignatureMaxNumber"><fmt:param value="${maxSigs}"></fmt:param></fmt:message></td>
    </tr>
    <tr>
        <td colspan="4">
            &nbsp;
        </td>
    </tr>
</table>
<br/>
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">
            &nbsp;
        </td>
        <td class='ZOptionsHeader ImgPrefsHeader' >
            <fmt:message key="optionsUsingSignatures"/>
        </td>
        <td class="ImgPrefsHeader_R">
            &nbsp;
        </td>
    </tr>
</table>
<table cellpadding="3" width="100%" class="ZOptionsSectionMain">
    <tr>
        <td class='ZOptionsTableLabel'>
            <fmt:message key="optionsSignaturePlacement"/>
            :
        </td>
        <td>
            <fmt:message key="optionsSignaturePlaceTheSignature"/>
            :
        </td>
    </tr>
    <tr>
        <td class='ZOptionsTableLabel'>
            &nbsp;
        </td>
        <td>
            <table border="0" cellpadding="0" cellspacing="3">
                <tr>
                    <td>
                        <input id="placeAbove" type="radio" name="zimbraPrefMailSignatureStyle" value="outlook"
                                <c:if test="${mailbox.prefs.signatureStyleTop}">checked</c:if>
                                />
                    </td>
                    <td>
                        <label for="placeAbove">
                            <fmt:message key="aboveQuotedText"/>
                        </label>
                    </td>
                    <td>
                        <input id="placeBelow" type="radio" name="zimbraPrefMailSignatureStyle" value="internet"
                                <c:if test="${mailbox.prefs.signatureStyleBottom}">checked</c:if>
                                />
                    </td>
                    <td>
                        <label for="placeBelow">
                            <fmt:message key="atBottomOfMessage"/>
                        </label>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
     <tr>
        <td colspan="4">
            <hr>
        </td>
    </tr>
    <tr>
        <td colspan=2 style='text-align:left;font-weight:bold;'>
            <fmt:message key="optionsManageAccounts">
                <fmt:param><fmt:message key="optionsSigManageAccountsPre"/></fmt:param>
                <fmt:param><a href="options?selected=accounts"><fmt:message key="optionsManageAccountsLink"/></a></fmt:param>
                <fmt:param><fmt:message key="optionsManageAccountsPost"/></fmt:param>
            </fmt:message>
        </td>
    </tr>
    <tr>
        <td colspan="4">
            &nbsp;
        </td>
    </tr>
</table>
</td>
</tr>
</table>

<script type="text/javascript">
    var sigcount = ${numSigs};

    var myEdit = new Array();
    for(var i = 0 ;i < sigcount ; i++) {
        var sigTextAreaId = "signatureValue"+i;
        var sigType = document.getElementById("signatureType"+i).value;
        if(sigType == 'text/html') {
            myEdit[i] = new YAHOO.widget.SimpleEditor(sigTextAreaId, {
                height: '100px',
                width: '100%',
                dompath: false, //Turns on the bar at the bottom
                animate: true, //Animates the opening, closing and moving of Editor windows
                plainText: false,
                focusAtStart: true,
                collapse: true,
                draggable: false
            });
            /*enable buttons that are disabled by default */
            myEdit[i].on('afterNodeChange', function() {
                    this.toolbar.enableAllButtons();
            });
            myEdit[i]._defaultToolbar.titlebar = false;
            myEdit[i].render();
        } else if(sigType == 'text/plain') {
            myEdit[i] == null;
        }
    }

    var myEditor = new YAHOO.widget.SimpleEditor("newSignatureValue", {
        height: '100px',
        width: '100%',
        dompath: false, //Turns on the bar at the bottom
        animate: true, //Animates the opening, closing and moving of Editor windows
        plainText: false,
        focusAtStart: true,
        collapse: true,
        draggable: false
    });

	/*enable buttons that are disabled by default */
    myEditor.on('afterNodeChange', function() {
         this.toolbar.enableAllButtons();
    });
            
    /*hide titlebar*/
    myEditor._defaultToolbar.titlebar = false;
    myEditor.render();

    /* List of elements that has to be handled for send */
    var sendElemts = new Array("SOPSEND","IOPSEND");
    var y;
    for (y in sendElemts){
        var _elemA = document.getElementById(sendElemts[y]);
        _elemA.onclick = function () {
            return prepToSend();
        }
    }

    function prepToSend (){
       for(var j = 0 ;j < sigcount ; j++) {
          if(myEdit[j] != null) {
            myEdit[j].saveHTML();
          }
       }
       myEditor.saveHTML();
       return true;
    }

</script>
</body>


