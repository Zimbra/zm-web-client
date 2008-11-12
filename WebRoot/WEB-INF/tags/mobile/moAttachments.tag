<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>

<div>
<c:forEach var="part" items="${message.attachments}" varStatus="partStatus">
<c:if test="${part.isMssage}">

    <div>
        <span>
            <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
            <mo:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}" counter="${partStatus.count}"/>
        </span>
    </div>
</c:if>
</c:forEach>
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="pname" value="${part.displayName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>
        <c:set var="url" value="/service/home/~/?id=${message.id}&part=${part.partName}&auth=co"/>
        <div>
            <span>
                <div>
                    <div>
                        <span>
                            <mo:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}"/>
                        </span>
                        <span>
                            <a href="${fn:escapeXml(url)}&amp;disp=a"><b>${fn:escapeXml(pname)}</b></a> (${part.displaySize})
                        </span>
                        <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                            <span>
                                <a target="_blank" href="${fn:escapeXml(url)}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
                            </span>
                        </c:if>
                    </div>
                </div>
            </span>
        </div>
    </c:if>
</c:forEach>
</div>