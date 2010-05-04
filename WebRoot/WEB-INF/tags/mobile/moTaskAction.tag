<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/>
<c:set var="anAction"
       value="${not empty paramValues.anAction[0] ? paramValues.anAction[0] :  paramValues.anAction[1]}"/>
<c:choose>
    <%--<c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'actionViewList'}">
        <c:set var="l_view" value="list" scope="session"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'actionViewExplorer'}">
        <c:set var="l_view" value="explorer" scope="session"/>
    </c:when>--%>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectAll'}">
        <c:set var="select" value="all" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectNone'}">
        <c:set var="select" value="none" scope="request"/>
    </c:when>
    <c:when test="${(zm:actionSet(param,'moreActions') && empty anAction) }">
        <mo:status style="Warning"><fmt:message key="actionNoActionSelected"/></mo:status>
    </c:when>
    <c:when test="${empty ids}">
        <mo:status style="Warning"><fmt:message key="actionNoItemSelected"/></mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete') || (zm:actionSet(param,'moreActions') && anAction == 'actionDelete')}">
        <zm:moveItem folderid="${mailbox.trash.id}" var="result" id="${ids}"/>
        <c:set var="op" value="x" scope="request"/>
        <mo:status>
            <fmt:message key="actionTaskDeleted">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getFolderName(pageContext, mailbox.trash.id)}"/>
            </fmt:message>
        </mo:status>
    </c:when>

    <c:when test="${zm:actionSet(param, 'actionHardDelete' || (zm:actionSet(param,'moreActions') && anAction == 'actionHardDelete'))}">
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
        <zm:clearSearchCache/>
        <c:set var="op" value="x" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionAddTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'addTag_'))}">
        <c:set var="tag" value="${param.tagId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'addTag_','')}"/>
        </c:if>
        <zm:tagItem tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
        <zm:clearSearchCache/>
        <mo:status>
            <fmt:message key="actionBriefcaseTag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionRemoveTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'remTag_'))}">
        <c:set var="tag" value="${param.tagRemoveId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'remTag_','')}"/>
        </c:if>
        <zm:tagItem tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
        <zm:clearSearchCache/>
        <mo:status>
            <fmt:message key="actionBriefcaseUntag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMove') || zm:actionSet(param,'moreActions')}">
        <c:choose>
            <c:when test="${fn:startsWith(anAction,'moveTo_')}">
                <c:set var="folderId" value="${fn:replace(anAction,'moveTo_','')}"/>
                <zm:moveItem folderid="${folderId}" var="result" id="${ids}"/>
                <zm:clearSearchCache/>
                <mo:status>
                    <fmt:message key="actionTaskMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:when>
            <c:when test="${empty param.folderId}">
                <mo:status style="Warning"><fmt:message key="actionNoFolderSelected"/></mo:status>
            </c:when>
            <%--<c:otherwise>
                <zm:moveContact folderid="${param.folderId}" var="result" id="${ids}"/>
                <mo:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, param.folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:otherwise>--%>
        </c:choose>
    </c:when>
</c:choose>
