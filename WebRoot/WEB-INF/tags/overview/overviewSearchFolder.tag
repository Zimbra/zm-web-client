<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<c:set var="padFudge" value="${folder.hasChildren ? 0 : 20}"/>
<tr><td nowrap colspan="3" class="Folder" style="padding-left: ${padFudge+folder.depth*8}px">
    <c:if test="${folder.hasChildren}">
        <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
        <c:url var="toggleUrl" value="/h/search">
            <c:param name="${expanded ? 'collapse' : 'expand'}" value="${folder.id}"/>
        </c:url>
        <a href="${toggleUrl}">
            <app:img src="${expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}" altkey="${expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/>
        </a>
    </c:if>
    <a id="SRCH${folder.id}" href='search?sfi=${folder.id}'>
        <app:img alt='${fn:escapeXml(label)}' src="${folder.image}"/>
        <span <c:if test="${folder.id eq requestScope.context.selectedId}"> class='ZhTISelected'</c:if>>${zm:truncate(fn:escapeXml(label),20,true)}</span>
    </a>
</td></tr>
