<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:forEach var="part" items="${message.attachments}">
<c:if test="${part.isMssage}">
    <div class='ZhAppContent'>
    <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
    <mo:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}"/>
    </div>
</c:if>
</c:forEach>
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="pname" value="${part.displayName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>
    
        <c:set var="url" value="/service/home/~/?id=${message.id}&part=${part.partName}&auth=co"/>
        <table cellspacing=4>
            <tr>
                <td>
                    <app:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}" title="${fn:escapeXml(part.contentType)}"/>
                </td>
                <td>
                    <b>${fn:escapeXml(pname)}</b> (${part.displaySize})
                </td>
            </tr>
            <tr>
                <td>
                    <a target="_blank" href="${url}&disp=i"><fmt:message key="view"/></a>
                </td>
                    <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                        <td>
                            <a target="_blank" href="${url}&view=html"><fmt:message key="viewAsHtml"/></a>
                        </td>
                    </c:if>
                <td>
                    <a href="${url}&disp=a"><fmt:message key="download"/></a>
                </td>
            </tr>
        </table>
    </c:if>
</c:forEach>

<c:if test="${message.numberOfAttachments gt 1}">
    <c:set var="url" value="/service/home/~/?id=${message.id}&part=${message.attachmentIds}&auth=co&disp=a&fmt=zip"/>
    <table cellspacing=8>
        <tr>
            <td>
                <app:img src="doctypes/ZipDoc.gif" alt="zip" title="zip"/>
            </td>
            <td>
                <a href="${url}"><fmt:message key="downloadAllAttachments"/></a>
            </td>
        </tr>
    </table>
</c:if>