<%--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'actionViewList'}">
        <c:set var="l_view" value="list" scope="session"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'actionViewExplorer'}">
        <c:set var="l_view" value="explorer" scope="session"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectAll'}">
        <c:set var="select" value="all" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectNone'}">
        <c:set var="select" value="none" scope="request"/>
    </c:when>
    <c:when test="${(zm:actionSet(param,'moreActions') && empty anAction && empty param.actionDelete) }">
        <mo:status style="Warning"><fmt:message key="actionNoActionSelected"/></mo:status>
    </c:when>
    <c:when test="${empty ids}">
        <mo:status style="Warning"><fmt:message key="actionNoItemSelected"/></mo:status>
    </c:when>
    <c:when test="${(param.isInTrash eq 'true' && zm:actionSet(param, 'actionDelete')) || zm:actionSet(param, 'actionHardDelete' || (zm:actionSet(param,'moreActions') && anAction == 'actionHardDelete'))}">
        <zm:deleteBriefcase var="result" id="${ids}"/>
        <zm:clearSearchCache/>
        <c:set var="op" value="x" scope="request"/>
        <mo:status>
            <fmt:message key="actionBriefcaseItemsDeleted">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete') || (zm:actionSet(param,'moreActions') && anAction == 'actionDelete')}">
            <zm:moveItem folderid="${mailbox.trash.id}" var="result" id="${ids}"/>
            <zm:clearSearchCache/>
            <c:set var="op" value="x" scope="request"/>
            <mo:status>
                <fmt:message key="actionBriefcaseItemsMoved">
                    <fmt:param value="${result.idCount}"/>
                    <fmt:param value="${zm:getFolderName(pageContext, mailbox.trash.id)}"/>
                </fmt:message>
            </mo:status>
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
    <c:when test="${zm:actionSet(param, 'actionAttachToCompose') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'actionAttachToCompose'))}">
        <c:forEach var="id" items="${ids}">
            <zm:getDocument var="doc" id="${id}"/>
            <c:set var="documentAttachments" value="${doc.id}:${fn:escapeXml(fn:replace(doc.name,':','_$'))},${documentAttachments}"/>
        </c:forEach>
        <c:redirect url="/m/zmain?st=newmail&documentAttachments=${documentAttachments}&ajax=${param.ajax}"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMove') || zm:actionSet(param,'moreActions')}">
        <c:choose>
            <c:when test="${fn:startsWith(anAction,'moveTo_')}">
                <c:set var="folderId" value="${fn:replace(anAction,'moveTo_','')}"/>
                <zm:moveItem folderid="${folderId}" var="result" id="${ids}"/>
                <zm:clearSearchCache/>
                <mo:status>
                    <fmt:message key="actionBriefcaseItemsMoved">
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
