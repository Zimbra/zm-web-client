<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table border="0" cellpadding="0" cellspacing="4" width=100%>
<tbody>

<c:set var="identity" value="${mailbox.defaultIdentity}"/>

<tr>
    <td nowrap align=right>
        <label for="mailFrom"><fmt:message key="sendMailFrom"/>
        :</label>
    </td>
    <td>
        <table border="0" cellpadding="0" cellspacing="2">
            <tr>
                <td>
                    <input id="mailFrom" size="30" type="text" name='zimbraPrefFromDisplay' autocomplete='off' value="${fn:escapeXml(identity.fromDisplay)}">
                </td>
                <td>
                    <select name="zimbraPrefFromAddress">
                        <c:set var="fromAddr" value="${fn:toLowerCase(identity.fromAddress)}"/>
                        <c:forEach var="address" items="${mailbox.accountInfo.emailAddresses}">
                            <option
                                    <c:if test="${fn:toLowerCase(address) eq fromAddr}"> selected</c:if> value="${fn:escapeXml(address)}">
                                    ${fn:escapeXml(address)}
                            </option>
                        </c:forEach>
                    </select>
                </td>
            </tr>
        </table>
    </td>
</tr>


<tr>
    <td nowrap align=right>

        <table border="0" cellpadding="0" cellspacing="2">
            <tr>
                <td>
                    <input type="checkbox" name='zimbraPrefReplyToEnabled' value="TRUE" <c:if test="${identity.replyToEnabled}">checked</c:if>>
                </td>
                <td>
                    <label for="replyTo"><fmt:message key="replyToIdentity"/>
                    :</label>
                </td>
            </tr>
        </table>

    </td>
    <td>
        <table border="0" cellpadding="0" cellspacing="2">
            <tr>
                <td>
                    <input id="replyTo" size="30" type="text" name='zimbraPrefReplyToDisplay' autocomplete='off' value="${fn:escapeXml(identity.replyToDisplay)}">
                </td>
                <td>
                    <input size="30" type="text" name='zimbraPrefReplyToAddress' autocomplete='off' value="${fn:escapeXml(identity.replyToAddress)}">
                </td>
            </tr>
        </table>
    </td>
</tr>

<app:optSeparator/>
<tr>
    <td nowrap align=right>
        <label for="placeSig"><fmt:message key="placeSignature"/>
        :</label>
    </td>
    <td>
        <select name="zimbraPrefMailSignatureStyle" id="placeSig">
            <option
                    <c:if test="${identity.signatureStyleTop}"> selected</c:if> value="outlook">
                <fmt:message key="aboveQuotedText"/>
            </option>
            <option
                    <c:if test="${identity.signatureStyleBottom}"> selected</c:if> value="internet">
                <fmt:message key="atBottomOfMessage"/>
            </option>
        </select>
    </td>
</tr>


<tr>
    <td width=30% nowrap align=right><label for="autoSig"><fmt:message key="automaticallyAddSignature"/> :</label></td>
    <td><input id="autoSig" type="checkbox" name='zimbraPrefMailSignatureEnabled' value="TRUE" <c:if test="${identity.signatureEnabled}">checked</c:if>></td>
</tr>

<tr>
    <td width=30% nowrap align=right valign='top'><label for="signature"><fmt:message key="signature"/> :</label></td>
    <td>
        <textarea id="signature" name='zimbraPrefMailSignature' cols='80' rows='6'>${fn:escapeXml(identity.signature)}</textarea>
    </td>
</tr>

<app:optSeparator/>

<tr>
    <td nowrap align=right>
        <label for="whenReply"><fmt:message key="whenReplying"/>
        :</label>
    </td>
    <td>
        <select name="zimbraPrefReplyIncludeOriginalText" id="whenReply">
            <option
                    <c:if test="${identity.replyIncludeNone}"> selected</c:if> value="includeNone">
                <fmt:message key="includeMenuNone"/>
            </option>
            <option
                    <c:if test="${identity.replyIncludeBody}"> selected</c:if> value="includeBody">
                <fmt:message key="includeInBody"/>
            </option>
            <option
                    <c:if test="${identity.replyIncludeBodyWithPrefx}"> selected</c:if> value="includeBodyWithPrefix">
                <fmt:message key="includePrefix"/>
            </option>
            <option
                    <c:if test="${identity.replyIncludeAsAttachment}"> selected</c:if> value="includeAsAttachment">
                <fmt:message key="includeOriginalAsAttach"/>
            </option>
        </select>
    </td>
</tr>

<tr>
    <td nowrap align=right>
        <label for="whenForward"><fmt:message key="whenForwarding"/>
        :</label>
    </td>
    <td>
        <select name="zimbraPrefForwardIncludeOriginalText" id="whenForward">
            <option
                    <c:if test="${identity.forwardIncludeBody}"> selected</c:if> value="includeBody">
                <fmt:message key="includeInBody"/>
            </option>
            <option
                    <c:if test="${identity.forwardIncludeBodyWithPrefx}"> selected</c:if> value="includeBodyWithPrefix">
                <fmt:message key="includePrefix"/>
            </option>
            <option
                    <c:if test="${identity.forwardIncludeAsAttachment}"> selected</c:if> value="includeAsAttachment">
                <fmt:message key="includeOriginalAsAttach"/>
            </option>
        </select>
    </td>
</tr>

<tr>
    <td nowrap align=right>
        <label for="prefixText"><fmt:message key="prefixTextWith"/>
        :</label>
    </td>
    <td>
        <select name="zimbraPrefForwardReplyPrefixChar" id="prefixText">
            <option
                    <c:if test="${identity.forwardReplyPrefixChar eq '>'}"> selected</c:if> value="&gt;">
                &gt;
            </option>
            <option
                    <c:if test="${identity.forwardReplyPrefixChar eq '|'}"> selected</c:if> value="|">
                |
            </option>
        </select>
    </td>
</tr>
<app:optSeparator/>
</tbody>
</table>
