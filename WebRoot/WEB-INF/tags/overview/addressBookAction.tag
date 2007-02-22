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
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:updateFolder
                        id="${param.folderId}"
                        name="${param.folderName}"
                        color="${param.folderColor}"/>
                <app:status>
                    <fmt:message key="addressBookUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionNew}">
         <c:choose>
            <c:when test="${empty param.newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
             <c:when test="${not empty param.newFolderOwnersEmailVisible and empty param.newFolderOwnersEmail}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerEmailSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty param.newFolderOwnersAddressBookVisible and empty param.newFolderOwnersAddressBook}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerAddressBookSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${not empty param.newFolderOwnersEmailVisible}">
                        <zm:createMountpoint var="folder"
                                             parentid="1"
                                             name="${param.newFolderName}"
                                             view="contact"
                                             color="${param.newFolderColor}"
                                             flags="${param.newFolderExcludeFlag}${param.newFolderCheckedFlag}"
                                             owner="${param.newFolderOwnersEmail}" ownerby="BY_NAME"
                                             shareditem="${param.newFolderOwnersAddressBook}" shareditemby="BY_PATH"/>
                    </c:when>
                    <c:otherwise>
                        <zm:createFolder var="folder"
                                         parentid="1"
                                         name="${param.newFolderName}"
                                         view="contact"
                                         color="${param.newFolderColor}"
                                         flags="${param.newFolderExcludeFlag}${param.newFolderCheckedFlag}"/>
                    </c:otherwise>
                </c:choose>
                <app:status>
                    <fmt:message key="actionAddressBookCreated">
                        <fmt:param value="${param.newFolderName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedAddressBookId" value="${folder.id}" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionDelete}">
        <c:set var="folder" value="${zm:getFolder(pageContext, param.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty param.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionAddressBookCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderName" value="${folder.name}"/>
                <zm:deleteFolder id="${param.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionAddressBookMovedToTrash">
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

