<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="body" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMimePartBean" %>
<%@ attribute name="theBody" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:choose>
    <c:when test="${body.isTextHtml}">
        <c:url var="iframeUrl" value="/h/imessage">
            <c:param name="id" value="${message.id}"/>
            <c:param name="part" value="${message.partName}"/>
            <c:param name="bodypart" value="${body.partName}"/>
            <c:param name="xim" value="${param.xim}"/>
        </c:url>
		<app:messageIframe theBody="${theBody}" parentId="iframeBody${counter}" iframeUrl="${iframeUrl}"/>
    </c:when>
    <c:otherwise>
        ${theBody}
    </c:otherwise>
</c:choose>
