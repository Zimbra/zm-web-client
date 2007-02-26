<%@ tag body-content="empty" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.searches ne 'collapse'}"/>

<div class=Tree>
    <table width=100% cellpadding=0 cellspacing=0>
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                  <c:param name="${expanded ? 'collapse' : 'expand'}" value="searches"/>
              </c:url>
            <th style='width:20px'><a href="${toggleUrl}"><app:img src="${ expanded ? 'dwt/NodeExpanded.gif' : 'dwt/NodeCollapsed.gif'}" altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TERE_COLLAPSED'}"/></a></th>
            <th class='Header'><fmt:message key="searches"/></th>
            <th width='1%' align='right' class='ZhTreeEdit'>
                <c:choose>
                    <c:when test="${false and empty editmode}">
                        <c:url value="/h/mfolders" var="mfoldersUrl"/>
                        <a href="${mfoldersUrl}"><fmt:message key="TREE_EDIT"/></a>
                    </c:when>
                    <c:otherwise>
                        &nbsp;
                    </c:otherwise>
                </c:choose>
            </th>
        </tr>
        <jsp:useBean id="done" scope="page" class="java.util.HashMap" />
        <c:if test="${expanded}">
            <zm:forEachFolder var="folder">
                <c:if test="${(folder.isSearchFolder and (folder.depth eq 0)) or (done[folder.parentId]) eq 'true'}">
                    <app:overviewSearchFolder folder="${folder}"/>
                        <c:set var="expanded" value="${sessionScope.expanded[folder.id] ne 'collapse'}"/>
                    <c:if test="${expanded}">
                        <c:set target="${done}" property="${folder.id}" value="true"/>
                    </c:if>
                </c:if>
            </zm:forEachFolder>
        </c:if>
    </table>
</div>
