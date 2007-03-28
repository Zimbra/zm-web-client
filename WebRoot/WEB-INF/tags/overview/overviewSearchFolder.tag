<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${!empty label}"><fmt:message key="${label}" var="label"/></c:if>
<c:set var="padFudge" value="${folder.hasChildren ? 0 : 20}"/>
<tr><td nowrap colspan=3 class='Folder<c:if test="${folder.id eq requestScope.context.selectedId}"> Selected</c:if>'
        style='padding-left: ${padFudge+folder.depth*8}px'>
    <c:if test="${folder.hasChildren}">
        <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
        <c:url var="toggleUrl" value="/h/search">
            <c:param name="${expanded ? 'collapse' : 'expand'}" value="${folder.id}"/>
        </c:url>
        <a href="${toggleUrl}">
            <app:img src="${expanded ? 'dwt/NodeExpanded.gif' : 'dwt/NodeCollapsed.gif'}" altkey="${expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/>
        </a>
    </c:if>
    <a href='search?sfi=${folder.id}'>
        <app:img alt='${fn:escapeXml(empty label ? folder.name : label)}' src="${empty icon ? 'common/SearchFolder.gif' : icon}"/>
        <span>${fn:escapeXml(empty label ? folder.name : label)}</span>
    </a>
</td></tr>
