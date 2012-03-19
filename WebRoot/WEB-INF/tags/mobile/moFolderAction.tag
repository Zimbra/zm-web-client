<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<mo:handleError>
    <c:choose>
        <c:when test="${param.st eq 'briefcase' || param.st eq 'briefcases'}">
            <c:set var="types" value="document"/>
            <c:set var="what" value="Briefcase"/>
        </c:when>
        <c:when test="${param.st eq 'wiki' || param.st eq 'notebooks'}">
            <c:set var="types" value="wiki"/>
            <c:set var="what" value="Wiki"/>
        </c:when>
        <c:when test="${param.st eq 'folders'}">
            <zm:getMailbox var="mailbox"/>
            <c:set var="types" value="${mailbox.prefs.groupMailBy}"/>
            <c:set var="what" value="Folder"/>
        </c:when>
        <c:when test="${param.st eq 'ab'}">
            <c:set var="types" value="contact"/>
            <c:set var="what" value="AddressBook"/>
        </c:when>
        <c:when test="${param.st eq 'cals'}">
            <c:set var="types" value="appointment"/>
            <c:set var="what" value="Calendar"/>
        </c:when>
        <c:when test="${param.st eq 'tasks'}">
            <c:set var="types" value="task"/>
            <c:set var="what" value="TaskList"/>
        </c:when>
        <c:otherwise>
            <c:set var="types" value="${param.st}"/>
            <c:set var="what" value="Folder"/>
        </c:otherwise>
    </c:choose>
    <c:choose>
        <c:when test="${zm:actionSet(param, 'actionSaveFolder')}">
            <zm:createFolder var="folder" view="${fn:escapeXml(types)}" name="${param.folder_name}"
                             parentid="${fn:escapeXml(param.parentid)}"/>
            <c:if test="${param.st eq 'cals'}"><zm:modifyFolderColor id="${folder.id}" color="${zm:cook(param.color)}"/></c:if>
            <mo:status style="Info">
                <fmt:message key="action${what}Created"><fmt:param
                        value="${param.folder_name}"/></fmt:message>
            </mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionSaveSearch')}">
            <zm:createSearchFolder types="${fn:escapeXml(types)}" query="${fn:escapeXml(param.query)}" var="folder"
                                   name="${param.sname}" parentid="${fn:escapeXml(param.parentid)}"/>
            <mo:status style="Info">
                <fmt:message key="actionSearchCreated"><fmt:param value="${folder.name}"/></fmt:message>
            </mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionSaveTag')}">
            <zm:createTag var="tag" name="${param.tag_name}" color="${fn:escapeXml(param.tag_color)}"/>
            <mo:status style="Info">
                <fmt:message key="actionTagCreated"><fmt:param value="${param.tag_name}"/></fmt:message>
            </mo:status>
        </c:when>

        <c:when test="${zm:actionSet(param, 'actionModifyFolder')}">
            <zm:renameFolder newname="${param.folder_name}" id="${fn:escapeXml(param.efolderid)}"/>
            <zm:moveFolder id="${fn:escapeXml(param.efolderid)}" parentid="${fn:escapeXml(param.parentid)}"/>
            <c:if test="${param.st eq 'cals'}"><zm:modifyFolderColor id="${param.efolderid}" color="${zm:cook(param.color)}"/></c:if>
            <mo:status style="Info">
                <fmt:message key="action${what}Modified"><fmt:param
                        value="${param.folder_name}"/></fmt:message>
            </mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionModifySearch')}">
            <zm:deleteFolder id="${fn:escapeXml(param.esearchid)}"/>
            <zm:createSearchFolder types="${fn:escapeXml(types)}" query="${fn:escapeXml(param.query)}" var="folder"
                                   name="${param.sname}" parentid="${fn:escapeXml(param.parentid)}"/>
            <mo:status style="Info">
                <fmt:message key="actionSearchModified"><fmt:param value="${folder.name}"/></fmt:message>
            </mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionModifyTag')}">
            <zm:renameTag id="${fn:escapeXml(param.etagid)}" newname="${param.tag_name}"/>
            <zm:modifyTagColor id="${fn:escapeXml(param.etagid)}" color="${fn:escapeXml(param.tag_color)}"/>
            <mo:status style="Info">
                <fmt:message key="actionTagModified"><fmt:param value="${param.tag_name}"/></fmt:message>
            </mo:status>
        </c:when>

        <c:when test="${zm:actionSet(param, 'actionDeleteFolder')}">
            <zm:trashFolder id="${fn:escapeXml(param.efolderid)}"/>
            <mo:status style="Info">
                <fmt:message key="action${what}Trashed">
                    <c:set var="efolder" value="${zm:getFolder(pageContext, param.efolderid)}"/>
                    <fmt:param value="${efolder.name}"/> 
                </fmt:message>    
            </mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionHardDeleteFolder')}">
            <c:set var="efolder" value="${zm:getFolder(pageContext, param.efolderid)}"/>
            <zm:deleteFolder id="${fn:escapeXml(param.efolderid)}"/>
            <mo:status style="Info">
                <fmt:message key="action${what}Deleted">
                      <fmt:param value="${efolder.name}"/>
                </fmt:message>    
            </mo:status>
        </c:when>

        <c:when test="${zm:actionSet(param, 'actionDeleteSearch')}">
            <zm:trashFolder id="${fn:escapeXml(param.esearchid)}"/>
            <mo:status style="Info">
                <fmt:message key="actionSearchTrashed">
                    <c:set var="esearch" value="${zm:getFolder(pageContext, param.esearchid)}"/>
                    <fmt:param value="${esearch.name}"/>
                </fmt:message>
            </mo:status>
        </c:when>

        <c:when test="${zm:actionSet(param, 'actionHardDeleteSearch')}">
                <c:set var="esearch" value="${zm:getFolder(pageContext, param.esearchid)}"/>
                <zm:deleteFolder id="${fn:escapeXml(param.esearchid)}"/>
                <mo:status style="Info">
                    <fmt:message key="actionSearchDeleted">
                        <fmt:param value="${esearch.name}"/>
                    </fmt:message>
                </mo:status>
        </c:when>

        <c:when test="${zm:actionSet(param, 'actionDeleteTag')}">
            <c:set var="etag" value="${zm:getTag(pageContext, param.etagid)}"/>
            <zm:deleteTag id="${fn:escapeXml(param.etagid)}"/>
            <mo:status style="Info">
                <fmt:message key="actionTagDeleted">
                     <fmt:param value="${etag.name}"/>
                </fmt:message>
            </mo:status>
        </c:when>
    </c:choose>
</mo:handleError>    
