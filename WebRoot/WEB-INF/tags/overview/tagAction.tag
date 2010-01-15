<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<c:choose>
    <c:when test="${zm:actionSet(param, 'actionNew')}">
        <c:set var="newTagName" value="${fn:trim(param.newTagName)}"/>
        <c:choose>
            <c:when test="${empty newTagName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${fn:length(newTagName) gt 128}">
                <app:status style="Warning">
                    <fmt:message key="nameTooLong">
                        <fmt:param value="128"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:createTag var="newid" name="${newTagName}" color="${param.newTagColor}"/>
                <app:status>
                    <fmt:message key="actionTagCreated">
                        <fmt:param value="${newTagName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedTagName" value="${param.newTagName}" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionSave')}">
        <c:set var="newName" value="${fn:trim(param.tagName)}"/>
        <c:choose>
            <c:when test="${empty newName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${fn:length(newName) gt 128}">
                <app:status style="Warning">
                    <fmt:message key="nameTooLong">
                        <fmt:param value="128"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:updateTag id="${param.tagId}" name="${newName}" color="${param.tagColor}"/>
                <app:status>
                    <fmt:message key="tagUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param,'actionDelete')}">
        <c:choose>
            <c:when test="${empty param.tagDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionTagCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagName" value="${zm:getTagName(pageContext, param.tagDeleteId)}"/>
                <zm:deleteTag id="${param.tagDeleteId}"/>                
                <app:status>
                    <fmt:message key="actionTagDeleted">
                        <fmt:param value="${tagName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkRead')}">
        <c:choose>
            <c:when test="${empty param.tagId}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagMarkReadSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagName" value="${zm:getTagName(pageContext, param.tagId)}"/>
                <zm:markTagRead id="${param.tagId}"/>
                <app:status>
                    <fmt:message key="actionTagMarkRead">
                        <fmt:param value="${tagName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>
