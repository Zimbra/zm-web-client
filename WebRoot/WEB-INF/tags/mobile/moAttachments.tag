<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>

<table cellspacing="5" cellpadding="5">
<c:forEach var="part" items="${message.attachments}" varStatus="partStatus">
<c:if test="${part.isMssage}">

    <tr>
        <td colspan="2">
            <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
            <mo:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}" counter="${partStatus.count}"/>
        </td>
    </tr>
</c:if>
</c:forEach>
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="pname" value="${part.displayName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>
        <c:set var="url" value="/service/home/~/?id=${message.id}&part=${part.partName}&auth=co"/>
        <tr>
            <td colspan="2">
                <table cellspacing="4">
                    <tr>
                        <td>
                            <mo:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}"/>
                        </td>
                        <td>
                            <a href="${fn:escapeXml(url)}&amp;disp=a"><b>${fn:escapeXml(pname)}</b></a> (${part.displaySize})
                        </td>
                        <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                            <td>
                                <a target="_blank" href="${fn:escapeXml(url)}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
                            </td>
                        </c:if>
                    </tr>
                </table>
            </td>
        </tr>
    </c:if>
</c:forEach>
</table>