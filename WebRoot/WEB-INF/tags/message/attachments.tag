<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:forEach var="part" items="${message.attachments}" varStatus="partStatus">
<c:if test="${part.isMssage}">
    <div class='ZhAppContent'>
    <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
    <app:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}" counter="${partStatus.count}"/>
    </div>
</c:if>
</c:forEach>
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="pname" value="${part.displayName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>
    
        <c:set var="url" value="/service/home/~/?id=${message.id}&amp;part=${part.partName}&amp;auth=co"/>
        <table cellspacing="8">
            <tr>
                <td>
                    <c:choose>
                        <c:when test="${part.isImage}">
                            <a target="_blank" href="${url}&amp;disp=i">
                                <img class='AttachmentImage' src="${url}" alt="${fn:escapeXml(part.displayName)}"/>
                            </a>
                        </c:when>
                        <c:otherwise>
                            <app:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}" title="${fn:escapeXml(part.contentType)}"/>
                        </c:otherwise>
                    </c:choose>
                </td>
                <td><b>${fn:escapeXml(pname)}</b><br />
                        ${part.displaySize}&nbsp;
                    <a target="_blank" href="${url}&amp;disp=i"><fmt:message key="view"/></a>&nbsp;
                    <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                        <a target="_blank" href="${url}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
                        &nbsp;
                    </c:if>
                    <a href="${url}&amp;disp=a"><fmt:message key="download"/></a>
                </td>
            </tr>
        </table>
    </c:if>
</c:forEach>

<c:if test="${message.numberOfAttachments gt 1}">
    <c:set var="url" value="/service/home/~/?id=${message.id}&part=${message.attachmentIds}&amp;auth=co&amp;disp=a&amp;fmt=zip"/>
    <table cellspacing="8">
        <tr>
            <td>
                <app:img src="doctypes/ImgZipDoc.gif" alt="zip" title="zip"/>
            </td>
            <td>
                <a href="${url}"><fmt:message key="downloadAllAttachments"/></a>
            </td>
        </tr>
    </table>
</c:if>