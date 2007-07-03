<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table border="0" cellpadding="0" cellspacing="10" width=100%>
<tr>
    <td colspan="4" class='ZOptionsHeader'>
        <fmt:message key="optionsSignatures"/>
    </td>
</tr>
<c:set var="numSigs" value="${0}"/>
<zm:forEachSignature var="signature">
    <c:if test="${numSigs gt 0}">
        <tr>
            <td colspan="4">
                <hr>
            </td>
        </tr>
    </c:if>
    <tr>
        <td class='ZOptionsTableLabel'>
            <fmt:message key="optionsSignatureName"/>
            :
        </td>
        <td>
            <input type="hidden" name="signatureId${numSigs}" value="${fn:escapeXml(signature.id)}"/>
            <input type="hidden" name="origSignatureName${numSigs}" value="${fn:escapeXml(signature.name)}"/>
            <input id="signatureName${numSigs}" size="40" type="text" name='signatureName${numSigs}' autocomplete='off'
                   value="${fn:escapeXml(signature.name)}">
        </td>
        <td align=right>
            <input class='tbButton' type="submit" name="actionDeleteSig:${fn:escapeXml(signature.id)}" 
                   value="<fmt:message key="delete"/>">
        </td>
        <td width=20%>&nbsp;</td>
    </tr>
    <tr>
        <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
            <fmt:message key="optionsSignature"/>
            :
        </td>
        <td colspan=2>
            <input type="hidden" name="origSignatureValue${numSigs}" value="${fn:escapeXml(signature.value)}"/>
            <textarea style='width:100%' id="signatureValue${numSigs}" name='signatureValue${numSigs}' cols='80'
                      rows='5'>${fn:escapeXml(signature.value)}</textarea>
        </td>
        <td width=20%>&nbsp;</td>
    </tr>
    <c:set var="numSigs" value="${numSigs+1}"/>
</zm:forEachSignature>
<input type="hidden" name="numSignatures" value="${numSigs}"/>
<tr>
    <td colspan="4">
        <hr>
    </td>
</tr>
<c:choose>
    <c:when test="${not empty param.actionNewSig or requestScope.newSignatureWarning}">
        <tr>
            <td colspan="4" class='ZOptionsHeader'>
                <fmt:message key="optionsNewSignature"/>
            </td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel'>
                <fmt:message key="optionsSignatureName"/>:
            </td>
            <td>
                <input type="hidden" name="newSignature" value="TRUE"/>
                <input id="newSignatureName" size="40" type="text" name='newSignatureName' autocomplete='off'
                       value="${fn:escapeXml(param.newSignatureName)}">
            </td>
            <td align=right>
                <input class='tbButton' type="submit" name="actionCancelNewSig"
                       value="<fmt:message key="cancel"/>">
            </td>
            <td width=20%>&nbsp;</td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                <fmt:message key="optionsSignature"/>:
            </td>
            <td colspan=2>
                <textarea style='width:100%' id="newSignatureValue" name='newSignatureValue' cols='80'rows='5'>${fn:escapeXml(param.newSignatureValue)}</textarea>
            </td>
            <td width=20%>&nbsp;</td>
        </tr>
    </c:when>
    <c:otherwise>
        <tr>
            <td>
                &nbsp;
            </td>
            <td colspan=2>
                <input id="OPNEW" class='tbButton' type="submit" name="actionNewSig"
                       value="<fmt:message key="optionsAddSignature"/>">
            </td>
            <td width=20%>&nbsp;</td>
        </tr>
    </c:otherwise>
</c:choose>

<tr>
    <td colspan="4">
        &nbsp;
    </td>
</tr>

<tr>
    <td colspan="4" class='ZOptionsHeader'>
        <fmt:message key="optionsUsingSignatures"/>
    </td>
</tr>
<tr>
    <td class='ZOptionsTableLabel'>
        <fmt:message key="optionsSignatureAttach"/>
        :
    </td>
    <td colspan=2>
        <app:optCheckbox boxfirst="true" label="optionsSignatureAttachAuto" pref="zimbraPrefMailSignatureEnabled"
                         checked="${mailbox.prefs.mailSignatureEnabled}"/>
    </td>
    <td width=20%>&nbsp;</td>
</tr>
<tr>
    <td colspan="4">
        <hr>
    </td>
</tr>
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
<app:optSeparator/>
<tr>
    <td class='ZOptionsTableLabel' colspan=2 style='text-align:left'>
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
