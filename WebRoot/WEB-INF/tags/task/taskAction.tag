<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:choose>
    <c:when test="${empty ids}">
        <app:status style="Warning"><fmt:message key="actionNoTaskSelected"/></app:status>
    </c:when>
    <c:otherwise>
        <c:choose>
            <c:when test="${zm:actionSet(param, 'actionDelete')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="count" value="${0}"/>
                <c:forEach var="taskId" items="${paramValues.id}">
                    <zm:getMessage var="message" id="${taskId}" markread="true" neuterimages="${empty param.xim}"/>
                    <zm:cancelTask message="${message}"/>
                    <c:set var="count" value="${count+1}"/>
                </c:forEach>
                <app:status>
                    <fmt:message key="actionTaskDeleted">
                        <fmt:param value="${count}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
                <c:choose>
                    <c:when test="${untagall}" >
                        <zm:forEachTag var="eachtag">
                            <zm:tagItem tagid="${eachtag.id}" var="result" id="${ids}" tag="false"/>
                        </zm:forEachTag>
                        <app:status>
                            <fmt:message key="${'actionTaskUntagAll'}" >
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                        <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                        <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                        <zm:tagItem tagid="${tagid}" var="result" id="${ids}" tag="${tag}"/>
                        <app:status>
                            <fmt:message key="${tag ? 'actionTaskTag' : 'actionTaskUntag'}">
                                <fmt:param value="${result.idCount}"/>
                                <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                            </fmt:message>
                        </app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${fn:startsWith(folderId, 'm:')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="folderid" value="${fn:substring(folderId, 2, -1)}"/>
                <zm:moveItem folderid="${folderid}" var="result" id="${ids}"/>
                <app:status>
                    <fmt:message key="actionTaskMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderid)}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionMove')}">
                <app:status style="Warning"><fmt:message key="actionNoFolderSelected"/></app:status>
            </c:when>
            <c:otherwise>
                <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>
</app:handleError>