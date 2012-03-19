<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="tag" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZTagBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<tr><td nowrap colspan="3" class='Folder ${tag.hasUnread ? ' Unread':''}'>
    <c:choose>
        <c:when test="${calendars}">
            <app:calendarUrl var="url" sq='tag:"${tag.name}"'/>
        </c:when>
        <c:otherwise>
            <c:url value="/h/search" var="url">
                <c:param name="sti" value="${tag.id}"/>
                <c:if test="${!empty param.st}"><c:param name='st' value='${param.st}'/></c:if>
            </c:url>
        </c:otherwise>
    </c:choose>
    <%-- don't change format of ID without updating BindKeyTag.java --%>
    <a id="TAG${tag.id}" href='${fn:escapeXml(url)}'>
        <app:img src="${tag.image}" alt='${fn:escapeXml(tag.name)}'/>
        <span <c:if test="${tag.id eq requestScope.context.selectedId}">class="ZhTISelected"</c:if>>
            <c:out value="${zm:truncate(tag.name,20,true)}"/>
            <c:if test="${tag.hasUnread}"> (${tag.unreadCount}) </c:if>
        </span>
    </a>
</td></tr>
 