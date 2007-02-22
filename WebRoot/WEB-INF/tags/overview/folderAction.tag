<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<c:choose>
    <c:when test="${not empty param.actionSave}">
        <c:set var="folder" value="${zm:getFolder(pageContext, param.folderId)}"/>
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
                <zm:updateFolder
                        parentid="${empty param.folderParentId ? folder.parentId : param.folderParentId}"
                        id="${param.folderId}"
                        name="${param.folderName}"
                        color="${empty param.folderColor ? folder.color : param.folderColor}"
                        flags="${param.folderExcludeFlag}${param.folderCheckedFlag}"/>
                <c:if test="${not empty param.folderUrl and param.folderUrl ne folder.remoteURL}">
                    <zm:modifyFolderUrl id="${param.folderId}" url="${param.folderUrl}"/>
                </c:if>
                <app:status>
                    <fmt:message key="folderUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionNew}">
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
    <c:when test="${not empty param.actionDelete}">
        <c:set var="folderName" value="${zm:getFolderName(pageContext, param.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty param.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:moveFolder id="${param.folderDeleteId}" parentid="3"/>
                <app:status>
                    <fmt:message key="actionFolderMovedToTrash">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionPermDelete}">
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
    </c:when>
    <c:when test="${not empty param.actionMarkRead}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToMarkRead, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderMarkReadSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToMarkRead, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:markFolderRead id="${folderid}"/>
                <app:status>
                    <fmt:message key="actionFolderMarkRead">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>

