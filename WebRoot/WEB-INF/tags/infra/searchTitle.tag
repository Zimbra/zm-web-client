<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="var" rtexprvalue="false" required="true" type="java.lang.String" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ variable name-from-attribute="var" alias='title' scope="AT_BEGIN" variable-class="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:choose>
    <c:when test="${context.isFolderSearch and context.folder.hasUnread}">
        <c:set var="title" value="${context.title} (${context.folder.unreadCount})"/>
    </c:when>
    <c:when test="${context.isTagSearch and context.tag.hasUnread}">
        <c:set var="title" value="${context.title} (${context.tag.unreadCount})"/>
    </c:when>
    <c:otherwise>
        <c:set var="title" value="${context.title}"/>
    </c:otherwise>
</c:choose>
