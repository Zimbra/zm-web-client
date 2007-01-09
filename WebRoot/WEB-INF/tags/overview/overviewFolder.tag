<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="false" %>
<%@ attribute name="key" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${!empty label}"><fmt:message key="${label}" var="label"/></c:if>
<c:set var="padFudge" value="${folder.hasChildren ? 0 : 20}"/>
<tr>
    <td nowrap colspan=3 class='Folder<c:if test="${folder.hasUnread}"> Unread</c:if><c:if test="${folder.id eq requestScope.context.selectedId}"> Selected</c:if>'
        style='padding-left: ${padFudge+folder.depth*8}px'>
        <c:url var="url" value="/h/${empty base ? 'search' : base}">
            <c:param name="sfi" value="${folder.id}"/>
            <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
        </c:url>
        <c:if test="${folder.hasChildren}">
                <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
                <c:url var="toggleUrl" value="/h/search">
                   <c:param name="${expanded ? 'collapse' : 'expand'}" value="${folder.id}"/>
               </c:url>
                <a href="${toggleUrl}">
                    <app:img src="${expanded ? 'dwt/NodeExpanded.gif' : 'dwt/NodeCollapsed.gif'}" altkey="${expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/>
                </a>
        </c:if>

        <%--<span style='width:20px'><c:if test="${folder.hasChildren}"><app:img src="dwt/NodeExpanded.gif"/></c:if></span>--%>
        <a href='${url}' <c:if test="${(not empty key) and keys}">accesskey="${key}" </c:if> >
            <app:img src="${not empty icon ? icon : (folder.isFeed ? 'mail/RSS.gif' : 'common/Folder.gif')}" alt='${fn:escapeXml(empty label ? folder.name : label)}'/>
            <span>${fn:escapeXml(empty label ? folder.name : label)} <c:if test="${folder.hasUnread}">
                (${folder.unreadCount}) </c:if></span>
        </a>

    </td></tr>

