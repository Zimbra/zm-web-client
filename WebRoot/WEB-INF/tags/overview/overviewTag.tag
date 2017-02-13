<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
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
 