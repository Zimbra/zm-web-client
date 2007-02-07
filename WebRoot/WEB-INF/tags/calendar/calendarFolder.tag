<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="icon" value="${folder.isMountPoint ? 'calendar/SharedCalendarFolder.gif' : 'calendar/CalendarFolder.gif'}"/>
<fmt:message var="label" key="FOLDER_LABEL_${folder.id}"/>
<c:if test="${fn:startsWith(label,'???')}"><c:set var="label" value="${folder.name}"/></c:if>
<tr>
    <td nowrap colspan=3 class='${folder.styleColor}Bg Folder<c:if test="${folder.hasUnread}"> Unread</c:if><c:if test="${folder.id eq requestScope.context.selectedId}"> Selected</c:if>'
        style='padding-left: ${folder.depth*8}px'>
        <c:url var="url" value="/h/calendar">
            <c:if test="${not empty param.date}"><c:param name="date" value="${param.date}"/></c:if>
            <c:if test="${not empty param.view}"><c:param name="view" value="${param.view}"/></c:if>
            <c:if test="${folder.isCheckedInUI}"><c:param name="uncheck" value="${folder.id}"/></c:if> 
            <c:if test="${not folder.isCheckedInUI}"><c:param name="check" value="${folder.id}"/></c:if>
        </c:url>
        <%--<span style='width:20px'><c:if test="${folder.hasChildren}"><app:img src="dwt/NodeExpanded.gif"/></c:if></span>--%>
        <a href='${url}'>
            <c:choose>
            <c:when test="${folder.isCheckedInUI}">
                <app:img altkey="checked" src="tasks/Task.gif"/>
            </c:when>
                <c:otherwise>
                    <app:img altkey="unchecked" src="tasks/TaskCheckbox.gif"/>
                </c:otherwise>
            </c:choose>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
            ${fn:escapeXml(label)}
        </a>

    </td></tr>

