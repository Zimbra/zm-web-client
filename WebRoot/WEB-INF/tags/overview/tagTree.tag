<%@ tag body-content="empty" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.tags ne 'collapse'}"/>

<div class="Tree">
    <table width="150" cellpadding="0" cellspacing="0">
        <c:url value="/h/mtags" var="mtagsUrl">
            <c:if test="${not empty param.sti}">
                <c:param name="sti" value="${param.sti}"/>
            </c:if>
        </c:url>
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                <c:param name="${expanded ? 'collapse' : 'expand'}" value="tags"/>
                <c:if test="${not empty param.st}"><c:param name="st" value="${param.st}"/></c:if>
            </c:url>
            <th style="width:20px"><a href="${fn:escapeXml(toggleUrl)}"><app:img src="${ expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}" altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/></a></th>
            <th class="Header" nowrap="nowrap"> <fmt:message key="tags"/></th>
            
            <th width="1%" align="right" class="ZhTreeEdit">
                <a id="MTAGS" href="${fn:escapeXml(mtagsUrl)}"><fmt:message key="TREE_EDIT"/> </a>
            </th>
        </tr>
        <c:if test="${expanded}">
            <zm:forEachTag var="tag">
                <app:overviewTag calendars="${calendars}" tag="${tag}"/>
            </zm:forEachTag>
        </c:if>
    </table>
</div>
