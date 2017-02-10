<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:requirePost/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:choose>
    <c:when test="${empty ids}">
        <app:status style="Warning">No files selected</app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete')}">
               <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="count" value="${0}"/>
                <c:forEach var="notebookId" items="${paramValues.id}">
                    <zm:deleteBriefcase var="delNotebook" id="${notebookId}"/>
                    <c:set var="count" value="${count+1}"/>
                </c:forEach>
                <app:status>
                    <fmt:message key="actionBriefcaseItemsDeleted">
                        <fmt:param value="${count}"/>
                    </fmt:message>
                </app:status>
    </c:when>
</c:choose>
</app:handleError>