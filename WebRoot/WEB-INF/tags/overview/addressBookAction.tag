<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<zm:fileUploader var="uploader"/>

<c:choose>
    <c:when test="${not empty uploader.params.actionImport}">
        <c:choose>
            <c:when test="${empty uploader.params.fileUpload}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookFileImportSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:importContacts var="result" uploader="${uploader}" folderid="${uploader.params.folderId}"/>
                <app:status>
                    <fmt:message key="actionAddressBookContactsImported">
                        <fmt:param value="${result.count}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionSave}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderId)}"/>
        <c:choose>
            <c:when test="${not empty uploader.params.folderNameVisible and empty uploader.params.folderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:updateFolder
                        id="${uploader.params.folderId}"
                        name="${uploader.params.folderName}"
                        color="${uploader.params.folderColor}"/>
                <app:status>
                    <fmt:message key="addressBookUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionNew}">
         <c:choose>
            <c:when test="${empty uploader.params.newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
             <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible and empty uploader.params.newFolderOwnersEmail}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerEmailSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty uploader.params.newFolderOwnersAddressBookVisible and empty uploader.params.newFolderOwnersAddressBook}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerAddressBookSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible}">
                        <zm:createMountpoint var="folder"
                                             parentid="1"
                                             name="${uploader.params.newFolderName}"
                                             view="contact"
                                             color="${uploader.params.newFolderColor}"
                                             flags="${uploader.params.newFolderExcludeFlag}${uploader.params.newFolderCheckedFlag}"
                                             owner="${uploader.params.newFolderOwnersEmail}" ownerby="BY_NAME"
                                             shareditem="${uploader.params.newFolderOwnersAddressBook}" shareditemby="BY_PATH"/>
                    </c:when>
                    <c:otherwise>
                        <zm:createFolder var="folder"
                                         parentid="1"
                                         name="${uploader.params.newFolderName}"
                                         view="contact"
                                         color="${uploader.params.newFolderColor}"
                                         flags="${uploader.params.newFolderExcludeFlag}${uploader.params.newFolderCheckedFlag}"/>
                    </c:otherwise>
                </c:choose>
                <app:status>
                    <fmt:message key="actionAddressBookCreated">
                        <fmt:param value="${uploader.params.newFolderName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedAddressBookId" value="${folder.id}" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionDelete}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty uploader.params.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionAddressBookCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderName" value="${folder.name}"/>
                <zm:moveFolder parentid="3" id="${uploader.params.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionAddressBookMovedToTrash">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionPermDelete}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty uploader.params.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionAddressBookCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderName" value="${folder.name}"/>
                <zm:deleteFolder id="${uploader.params.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionAddressBookDeleted">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionEmptyFolderConfirm}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderEmptyId)}"/>
        <c:set var="folderName" value="${zm:getFolderName(pageContext, uploader.params.folderEmptyId)}"/>
        <c:choose>
            <c:when test="${empty uploader.params.folderEmptyConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:emptyFolder id="${uploader.params.folderEmptyId}"/>
                <app:status>
                    <fmt:message key="addressBookEmptied">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionEmptyFolder}">
        <zm:emptyFolder id="${uploader.params.folderEmptyId}"/>
        <c:set var="folderName" value="${zm:getFolderName(pageContext, uploader.params.folderEmptyId)}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${folderName}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>

