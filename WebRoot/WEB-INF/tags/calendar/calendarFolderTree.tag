<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<zm:getMailbox var="mailbox"/>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.calendars ne 'collapse'}"/>

<div class=Tree>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <c:url var="toggleUrl" value="/h/calendar">
                <%--TODO: add context (date, view, etc) --%>
                 <c:param name="${expanded ? 'collapse' : 'expand'}" value="calendars"/>
             </c:url>
             <th style='width:20px'><a href="${fn:escapeXml(toggleUrl)}"><app:img altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ expanded ? 'startup/ImgNodeExpanded.png' : 'startup/ImgNodeCollapsed.png'}"/></a></th>
            <th class='Header'><fmt:message key="calendars"/></th>
            <th nowrap="nowrap" align='right' class='ZhTreeEdit'>
                <c:url value="/h/mcalendars" var="mabUrl"/>
                <a href="${mabUrl}" ><fmt:message key="TREE_EDIT"/></a>
            </th>
        </tr>

        <c:if test="${expanded}">

            <app:calendarFolder folder="${mailbox.calendar}"/>

            <%--
                Display the children of Calendar folder, if any. Folders with unknown view also get listed.
            --%>
            <zm:forEachFolder var="folder" skiproot="true" skipsystem="false" skiptopsearch="true" parentid="${mailbox.calendar.id}" >
                <c:if test="${(!folder.isSystemFolder and !folder.isSearchFolder and !folder.isMountPoint and (folder.isNullView or folder.isUnknownView or folder.isAppointmentView))}">
                    <app:calendarFolder folder="${folder}"/>
                </c:if>
            </zm:forEachFolder>

            <%--
                Rest of the calendar folders, do not display folders with unknown view here.
            --%>
            <zm:forEachFolder var="folder" skiproot="true" skipsystem="true" skiptopsearch="true">
                <c:if test="${!folder.isSearchFolder and !folder.isMountPoint and folder.isAppointmentView}">
                    <app:calendarFolder folder="${folder}"/>
                </c:if>
            </zm:forEachFolder>

            <zm:forEachFolder var="folder">
                <c:if test="${(!folder.isSystemFolder and !folder.isSearchFolder and folder.isMountPoint and folder.isAppointmentView)}">
                    <app:calendarFolder folder="${folder}"/>
                </c:if>
            </zm:forEachFolder>
        </c:if>
    </table>
</div>
