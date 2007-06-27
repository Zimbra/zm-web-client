<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
<c:set var="weekDays" value="${dateSymbols.weekdays}"/>

<table border="0" cellpadding="0" cellspacing="10" width=100%>
     <tr>
        <td colspan="4" class='ZOptionsHeader' >
            <fmt:message key="optionsSignatures"/>
        </td>
     </tr>
    <c:set var="numSigs" value="${0}"/>
    <zm:forEachSignature var="signature">
        <c:if test="${numSigs gt 0}">
            <tr> <td colspan="4"><hr></td></tr>
        </c:if>
        <tr>
            <td class='ZOptionsTableLabel'>
                <fmt:message key="optionsSignatureName"/>:
            </td>
            <td>
                <input id="signatureName${numSigs}" size="40" type="text" name='signatureName${numSigs}' autocomplete='off' value="${fn:escapeXml(signature.name)}">
            </td>
            <td align=right>
                <input class='tbButton' type="submit" name="actionDeleteSig"
                       value="<fmt:message key="delete"/>">
            </td>
            <td width=20%>&nbsp;</td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                <fmt:message key="optionsSignature"/>:
            </td>
            <td colspan=2>
                <textarea style='width:100%' id="signatureValue${numSigs}" name='signatureValue${numSigs}' cols='80' rows='5'>${fn:escapeXml(signature.signature)}</textarea>
            </td>
            <td width=20%>&nbsp;</td>
        </tr>
        <c:set var="numSigs" value="${numSigs+1}"/>        
    </zm:forEachSignature>
    <tr> <td colspan="4"><hr></td></tr>
    <tr>
        <td>
            &nbsp;
        </td>
        <td colspan=2>
            <input id="OPNEW" class='tbButton' type="submit" name="actionNewSig"
                   value="<fmt:message key="optionsNewSignature"/>">         
        </td>
        <td width=20%>&nbsp;</td>
    </tr>
    <tr>
        <td colspan="4">
            &nbsp;
        </td>
    </tr>

    <tr>
        <td colspan="4" class='ZOptionsHeader' >
            <fmt:message key="optionsUsingSignatures"/>
        </td>
     </tr>
    <tr>
        <td class='ZOptionsTableLabel'>
            <fmt:message key="optionsSignatureAttach"/>:
        </td>
        <td colspan=2>
            <app:optCheckbox boxfirst="true" label="optionsSignatureAttachAuto" pref="zimbraPrefMailSignatureEnabled" checked="${mailbox.prefs.mailSignatureEnabled}"/>
        </td>
        <td width=20%>&nbsp;</td>
     </tr>
    <tr> <td colspan="4"><hr></td></tr>
     <tr>
         <td class='ZOptionsTableLabel'>
             <fmt:message key="optionsSignaturePlacement"/> :
         </td>
         <td>
             <fmt:message key="optionsSignaturePlaceTheSignature"/>:
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
                         <input id="placeAbove" type="radio" name="zimbraPrefMailSignatureStyle" value="outlook" <c:if test="${mailbox.prefs.signatureStyleTop}">checked</c:if>/>
                     </td>
                     <td>
                         <label for="placeAbove"><fmt:message key="aboveQuotedText"/></label>
                     </td>
                     <td>
                         <input id="placeBelow" type="radio" name="zimbraPrefMailSignatureStyle" value="internet" <c:if test="${mailbox.prefs.signatureStyleBottom}">checked</c:if>/>
                     </td>
                     <td>
                         <label for="placeBelow"><fmt:message key="atBottomOfMessage"/></label>
                     </td>
                 </tr>
             </table>
         </td>
     </tr>
    <tr>
        <td colspan="4">
            &nbsp;
        </td>
    </tr>
</table>
