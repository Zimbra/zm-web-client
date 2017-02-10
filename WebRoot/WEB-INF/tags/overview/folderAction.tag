<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<zm:getMailbox var="mailbox"/>
<c:set var="types" value="${mailbox.prefs.groupMailBy}"/>

<c:choose>
    <c:when test="${zm:actionSet(param, 'actionSave')}">
        <c:set var="folder" value="${zm:getFolder(pageContext, param.folderId)}"/>
        <c:set var="currentFolderId" value="${param.folderId}" scope="request"/>        
        <c:choose>
            <c:when test="${not empty param.folderNameVisible and empty param.folderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty param.folderUrlVisible and empty param.folderUrl}">
                <app:status style="Warning">
                    <fmt:message key="actionNoUrlSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="otherFlags" value="${fn:replace(fn:replace(folder.flags,'#',''), 'b', '')}"/>
                <c:if test="${not empty param.folderColor}"><c:set var="folderRgb" value="${zm:getFolderRgbColor(param.folderColor, folder.defaultView)}"/></c:if>
                <fmt:message var="colorMsg" key="${folder.rgbColorMsg}"/>
                <zm:updateFolder
                        parentid="${empty param.folderParentId ? folder.parentId : param.folderParentId}"
                        id="${param.folderId}"
                        name="${param.folderName}"
                        color="${empty param.folderColor ? folder.color : param.folderColor}"
                        rgb="${empty param.folderColor ? colorMsg : folderRgb}"
                        flags="${otherFlags}${param.folderExcludeFlag}${param.folderCheckedFlag}"/>
                <c:if test="${not empty param.folderUrl and param.folderUrl ne folder.remoteURL}">
                    <zm:modifyFolderUrl id="${param.folderId}" url="${param.folderUrl}"/>
                </c:if>
                <app:status>
                    <fmt:message key="folderUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionNew')}">
         <c:choose>
            <c:when test="${empty param.newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty param.newFolderUrlVisible and empty param.newFolderUrl}">
                <app:status style="Warning">
                    <fmt:message key="actionNoUrlSpecified"/>
                </app:status>
            </c:when>
             <c:when test="${not empty param.newFolderQueryVisible and empty param.newFolderQuery}">
                <app:status style="Warning">
                    <fmt:message key="actionNoSearchQuerySpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${not empty param.newFolderQuery}">
                        <zm:createSearchFolder var="folder"
                                               parentid="${param.newFolderParentId}"
                                               name="${param.newFolderName}"
                                               query="${param.newFolderQuery}"/>
                    </c:when>
                    <c:otherwise>
                        <zm:createFolder var="folder"
                                         parentid="${param.newFolderParentId}"
                                         name="${param.newFolderName}"
                                         view="${fn:escapeXml(types)}"
                                         url="${param.newFolderUrl}"/>
                    </c:otherwise>
                </c:choose>
                <app:status>
                    <fmt:message key="actionFolderCreated">
                        <fmt:param value="${param.newFolderName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedFolderId" value="${folder.id}" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete')}">
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty param.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:trashFolder id="${param.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionFolderMovedToTrash">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
        <c:set var="currentFolderId" value="${param.folderDeleteId}" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionPermDelete')}">
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty param.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:deleteFolder id="${param.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionFolderDeleted">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
        <c:set var="currentFolderId" value="${param.folderDeleteId}" scope="request"/>                
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEmptyFolder')}">
        <zm:emptyFolder id="${param.folderEmptyId}"/>
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderEmptyId)}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${folderName}"/>
            </fmt:message>
        </app:status>
        <c:set var="currentFolderId" value="${param.folderEmptyId}" scope="request"/>        
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEmptyFolderConfirm')}">
        <c:set var="folder" value="${zm:getFolder(pageContext, param.folderEmptyId)}"/>
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderEmptyId)}"/>
        <c:choose>
            <c:when test="${empty param.folderEmptyConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:emptyFolder id="${param.folderEmptyId}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderEmptyId)}"/>
                <app:status>
                    <fmt:message key="folderEmptied">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
        <c:set var="currentFolderId" value="${param.folderEmptyId}" scope="request"/>        
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkRead')}">
        <zm:markFolderRead id="${param.folderId}"/>
        <c:set var="currentFolderId" value="${param.folderId}" scope="request"/>        
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderId)}"/>
        <app:status>
            <fmt:message key="actionFolderMarkRead">
                <fmt:param value="${folderName}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:otherwise>
         <c:redirect url="/h/mfolders" />
    </c:otherwise>
</c:choose>
</app:handleError>

