<%@ tag body-content="empty" %>
<%@ attribute name="tag" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZTagBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<tr><td nowrap colspan='3' class='Folder ${tag.hasUnread ? ' Unread':''}<c:if test="${tag.id eq requestScope.context.selectedId}"> Selected</c:if>'>
    <c:url value="/h/search" var="url">
        <c:param name="sti" value="${tag.id}"/>
        <c:if test="${!empty param.st}"><c:param name='st' value='${param.st}'/></c:if>
    </c:url>

    <a href='${url}'>
        <app:img src="${tag.image}" alt='${fn:escapeXml(tag.name)}'/>
        <span>
            <c:out value="${tag.name}"/>
            <c:if test="${tag.hasUnread}"> (${tag.unreadCount}) </c:if>
        </span>
    </a>
</td></tr>
 