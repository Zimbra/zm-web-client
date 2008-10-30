<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>
<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<c:choose>
    <c:when test="${folder.isAppointmentView or folder.isContactView or folder.isTaskView}">
        <c:set var="colorStyle" value="${folder.styleColor}${folder.styleColor ne 'Gray' ? 'Bg' :''}"/>
    </c:when>
    <c:otherwise>
        <c:set var="colorStyle" value="Gray"/>
    </c:otherwise>
</c:choose>


<table width="100%" cellspacing="0" cellpadding="0">
<tr>
    <td class='ZhBottomSep'>
        <table width="100%" cellspacing="0" cellpadding="1">
            <tr valign="middle" class='${colorStyle}'>
                <td valign="middle" width=20 style='padding-left:5px'>
                    <app:img src="${folder.image}" alt='${fn:escapeXml(label)}'/>
                </td>
                <td>
                    <span class='ZhFolderHeader' style='vertical-align:middle;'>
                        ${fn:escapeXml(label)}
                    </span>
                    <c:if test="${folder.depth gt 0}">
                        <span class='ZhFolderType' style='vertical-align:middle;'>
                            &nbsp;(${fn:escapeXml(folder.rootRelativePath)})
                        </span>
                    </c:if>
                </td>
                <td width="1%" nowrap class='ZhFolderType'>
                    <c:choose>
                        <c:when test="${folder.isAppointmentView}">
                            <c:choose>
                                <c:when test="${folder.isSystemFolder}">
                                    <fmt:message key="calendarSystem"/>
                                </c:when>
                                <c:when test="${not empty folder.remoteURL}">
                                    <fmt:message key="calendarSubscribed"/>
                                </c:when>
                                <c:when test="${folder.isMountPoint}">
                                    <fmt:message key="calendarShared"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:message key="calendarUser"/>
                                </c:otherwise>
                            </c:choose>
                        </c:when>
                        <c:when test="${folder.isContactView}">
                            <c:choose>
                                <c:when test="${folder.isSystemFolder}">
                                    <fmt:message key="addressBookSystem"/>
                                </c:when>
                                <c:when test="${folder.isMountPoint}">
                                    <fmt:message key="addressBookShared"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:message key="addressBookUser"/>
                                </c:otherwise>
                            </c:choose>
                        </c:when>
                        <c:when test="${folder.isTaskView}">
                            <c:choose>
                                <c:when test="${folder.isSystemFolder}">
                                    <fmt:message key="taskListSystem"/>
                                </c:when>
                                <c:when test="${folder.isMountPoint}">
                                    <fmt:message key="taskListShared"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:message key="taskListUser"/>
                                </c:otherwise>
                            </c:choose>
                        </c:when>
                        <c:otherwise>
                            <c:choose>
                                <c:when test="${folder.isSystemFolder}">
                                    <fmt:message key="folderSystem"/>
                                </c:when>
                                <c:when test="${folder.isMountPoint}">
                                    <fmt:message key="folderShared"/>
                                </c:when>
                                <c:when test="${folder.isSearchFolder}">
                                    <fmt:message key="folderSearch"/>
                                </c:when>
                                <c:when test="${folder.isFeed}">
                                    <fmt:message key="folderSubscribed"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:message key="folderUser"/>
                                </c:otherwise>
                            </c:choose>
                        </c:otherwise>
                    </c:choose>
                    &nbsp;
                </td>
            </tr>
            <tr class='${colorStyle}'>
                <td colspan="3">
                    <c:choose>
                        <c:when test="${not (folder.isMountPoint or folder.isSearchFolder)}">
                            <span class='ZZZhFolderType' style='vertical-align:middle;'>
                                &nbsp;
                                <fmt:message key="folderItemCount">
                                <fmt:param value="${folder.messageCount}"/>
                                </fmt:message>
                                <c:if test="${folder.unreadCount gt 0 and not (folder.isDrafts or folder.isContactView or folder.isAppointmentView or folder.isTaskView)}">
                                   &nbsp;
                                    <fmt:message key="folderItemUnreadCount">
                                        <fmt:param value="${folder.unreadCount}"/>
                                    </fmt:message>
                                </c:if>
                                <c:if test="${folder.subFolderCount gt 0}">
                                    &nbsp;
                                    <fmt:message key="folderFolderCount">
                                        <fmt:param value="${folder.subFolderCount}"/>
                                    </fmt:message>
                                </c:if>
                                <c:if test="${folder.size gt 0 and not folder.isContactView}">
                                &nbsp;
                                ${fn:escapeXml(zm:displaySizeFractions(folder.size, 2))}
                                </c:if>
                            </span>
                        </c:when>
                        <c:otherwise>
                            &nbsp;
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
<td height="100%" valign='top'>
<table border="0" cellpadding="0" cellspacing="10" width="100%">

<%---------- name (rename) ----------%>
<tr>
    <td width="20%" nowrap align="right">
        <label for="name"><fmt:message key="name"/>
        :</label>
    </td>
    <td>
        <input type="hidden" name="folderId" value="${folder.id}"/>
        <fmt:message key="${fn:toLowerCase(fn:escapeXml(folder.name))}" var="folderName" />
        <input id="name"
        <c:if test="${folder.isSystemFolder}"> disabled </c:if> name='folderName' type='text'
                                               size='35' value="${fn:escapeXml(fn:startsWith(folderName,'???') ? folder.name : folderName)}">
        <c:if test="${not folder.isSystemFolder}">
        <input name='folderNameVisible' type='hidden' value="true"/>
        </c:if>
    </td>
</tr>

<%---------- parent folder (move) ----------%>
<c:if test="${folder.isMessageFolderMoveSource}">
    <tr>
        <td nowrap align='right'>
            <label for="parentFolder"><fmt:message key="parentFolder"/>
            :</label>
        </td>
        <td>
            <select name="folderParentId" id="parentFolder">
                <option
                        <c:if test="${folder.parentId eq 1}">selected</c:if> value="1"/>
                <fmt:message key="rootFolder"/>
                <zm:forEachFolder var="parent">
                    <c:if test="${parent.isMessageMoveTarget and !parent.isTrash and !parent.isSpam}">
                        <c:if test="${parent.id ne folder.id}">
                            <option
                                    <c:if test="${parent.id eq folder.parentId}">selected</c:if> value="${parent.id}"/>
                            ${fn:escapeXml(parent.rootRelativePath)}
                        </c:if>
                    </c:if>
                </zm:forEachFolder>
            </select>
        </td>
    </tr>
</c:if>

<%---------- color----------%>
<c:if test="${folder.isAppointmentView or folder.isContactView or folder.isTaskView}">
    <tr>
        <td nowrap align='right'>
            <label for="folderColor"><fmt:message key="color"/>
            :</label>
        </td>
        <td>
            <select name="folderColor" id="folderColor">
                <option
                        <c:if test="${folder.color eq 'blue'}">selected</c:if> value="blue"/>
                <fmt:message key="blue"/>
                <option
                        <c:if test="${folder.color eq 'cyan'}">selected</c:if> value="cyan"/>
                <fmt:message key="cyan"/>
                <option
                        <c:if test="${folder.color eq 'green'}">selected</c:if> value="green"/>
                <fmt:message key="green"/>
                <option
                        <c:if test="${folder.color eq 'purple'}">selected</c:if> value="purple"/>
                <fmt:message key="purple"/>
                <option
                        <c:if test="${folder.color eq 'red'}">selected</c:if> value="red"/>
                <fmt:message key="red"/>
                <option
                        <c:if test="${folder.color eq 'yellow'}">selected</c:if> value="yellow"/>
                <fmt:message key="yellow"/>
                <option
                        <c:if test="${folder.color eq 'pink'}">selected</c:if> value="pink"/>
                <fmt:message key="pink"/>
                <option
                        <c:if test="${folder.color eq 'gray'}">selected</c:if> value="gray"/>
                <fmt:message key="gray"/>
                <option
                        <c:if test="${folder.color eq 'orange'}">selected</c:if> value="orange"/>
                <fmt:message key="orange"/>
            </select>
        </td>
    </tr>
</c:if>

<%---------- search query ----------%>
<c:if test="${folder.isSearchFolder}">
    <tr>
        <td width="20%" nowrap align="right">
            <label for="folderQuery"><fmt:message key="searchQuery"/>
            :
                </label>
        </td>
        <td>
            <input id="folderQuery" name='folderQuery' type='text' size='70' value="${fn:escapeXml(folder.query)}">
            <input name='folderQueryVisible' type='hidden' value="true"/>
        </td>
    </tr>
</c:if>

<%---------- url ----------%>
<c:if test="${not empty folder.remoteURL}">
    <tr>
        <td width="20%" nowrap align="right">
            <label for="folderUrl"><fmt:message key="url"/>
            :
                </label>
        </td>
        <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=middle>
                    <td>
                        <input id="folderUrl" name='folderUrl' type='text' size='70'
                               value="${fn:escapeXml(folder.remoteURL)}">
                        <input name='folderUrlVisible' type='hidden' value="true"/>
                    </td>
                    <td>
                        &nbsp;
                    </td>
                    <td valign="middle">
                        <c:url var="syncUrl" value="">
                            <c:param name="id" value="${folder.id}"/>
                            <c:param name="sync" value="${folder.id}"/>
                        </c:url>                        
                        <a href="${fn:escapeXml(syncUrl)}">
                            <app:img src="arrows/ImgRefresh.gif" title="refresh"/>
                        </a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</c:if>

<%---------- shared folder ----------%>

<c:if test="${folder.isMountPoint}">
    <tr>
        <td nowrap align=right>
            <fmt:message key="owner"/>
            :
        </td>
        <td>
                ${fn:escapeXml(folder.ownerDisplayName)}
        </td>
    </tr>
    <%--
    <tr>
        <td nowrap align=right>
            <fmt:message key="permissions"/>
            :
        </td>
        <td>
            ${fn:escapeXml(folder.effectivePerm)}
        </td>
    </tr>
    --%>
</c:if>

<c:if test="${folder.isAppointmentView and not folder.isMountPoint}">
    <%---------- exclude from free/busy ----------%>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input id="exclude" name='folderExcludeFlag' type='checkbox'
                        <c:if test="${folder.isExcludedFromFreeBusy}"> checked</c:if> value="b">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <label for="exclude"><fmt:message key="excludeFromFreeBusyTimes"/></label>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</c:if>
<c:if test="${folder.isAppointmentView}">
    <%---------- checked in UI ----------%>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input id="checked" name='folderCheckedFlag' type='checkbox'
                        <c:if test="${folder.isCheckedInUI}"> checked</c:if> value="#">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <label for="checked"><fmt:message key="calendarCheckedInUI"/></label>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</c:if>

<%---------- save ----------%>
<c:if test="${not folder.isSystemFolder or (folder.isAppointmentView or folder.isContactView or folder.isTaskView)}">
    <tr>
        <td>&nbsp;</td>
        <td>
            <input id="OPSAVE" class='tbButton' type="submit" name="actionSave"
                   value="<fmt:message key="saveChanges"/>">
        </td>
    </tr>
</c:if>

<c:if test="${folder.isAppointmentView}">
    <tr>
        <td colspan="2">
            <hr>
        </td>
    </tr>
    <tr>
        <td align=right><fmt:message key="calendarExport"/>:</td>
        <td>
            <a href="${fn:escapeXml(zm:getFolderRestURL(mailbox,folder))}.ics">${fn:escapeXml(zm:getFolderRestURL(mailbox,folder))}.ics</a>
        </td>
    </tr>

    <c:if test="${not (folder.isMountPoint or folder.isFeed)}">
        <tr>
            <td align="right"><label for="import"><fmt:message key="calendarImport"/>:</label></td>
            <td>
                <input id="import" type="file" size="40" name="fileUpload">
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>
                <input class='tbButton' type="submit" name="actionImport"
                       value="<fmt:message key="import"/>">
            </td>
        </tr>
    </c:if>

</c:if>


<c:if test="${folder.isContactView}">
    <tr>
        <td colspan="2">
            <hr>
        </td>
    </tr>
    <tr>
        <td align="right"><fmt:message key="contactExport"/>:</td>
        <td>
            <a href="${fn:escapeXml(zm:getFolderRestURL(mailbox,folder))}.csv">${fn:escapeXml(zm:getFolderRestURL(mailbox,folder))}.csv</a>
        </td>
    </tr>

    <c:if test="${not (folder.isMountPoint or folder.isFeed)}">
        <tr>
            <td align="right"><label for="export"><fmt:message key="contactImport"/>:</label></td>
            <td>
                <input id="export" type=file size="40" name="fileUpload">
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>
                <input class='tbButton' type="submit" name="actionImport"
                       value="<fmt:message key="import"/>">
            </td>
        </tr>
    </c:if>
</c:if>

<c:if test="${folder.unreadCount gt 0 and not (folder.isDrafts or folder.isSearchFolder or folder.isMountPoint or folder.isContactView or folder.isAppointmentView or folder.isTaskView)}">
    <tr>
        <td colspan="2">
            <hr>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>
            <input id="OPMARKALLREAD" class='tbButton' type="submit" name="actionMarkRead"
                   value="<fmt:message key="actionMarkAllRead"/>">
        </td>
    </tr>
</c:if>



<c:choose>
    <c:when test="${folder.isTrash or folder.isSpam}">
        <tr>
            <td colspan="2">
                <hr>
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>
                <input id="OPEMPTY" class='tbButton' type="submit" name="actionEmptyFolder"
                       value="<fmt:message key="folderEmptyFolder"/>">
                <input type="hidden" name="folderEmptyId" value="${folder.id}"/>
            </td>
        </tr>
    </c:when>
    <c:when test="${not folder.isSearchFolder or folder.isMountPoint}">
        <c:choose>
            <c:when test="${folder.isAppointmentView}">
                <fmt:message var="emptyButton" key="folderEmptyCalendar"/>
                <fmt:message var="emptyConfirm" key="calendarEmptyConfirmation"/>
            </c:when>
            <c:when test="${folder.isTaskView}">
                <fmt:message var="emptyButton" key="folderEmptyTaskList"/>
                <fmt:message var="emptyConfirm" key="taskListEmptyConfirmation"/>
            </c:when>
            <c:when test="${folder.isContactView}">
                <fmt:message var="emptyButton" key="folderEmptyAddressBook"/>
                <fmt:message var="emptyConfirm" key="addressBookEmptyConfirmation"/>
            </c:when>
            <c:otherwise>
                <fmt:message var="emptyButton" key="folderEmptyNonTrashFolder"/>
                <fmt:message var="emptyConfirm" key="folderEmptyNonTrashFolderConfirmation"/>
            </c:otherwise>
        </c:choose>
        <tr>
            <td colspan="2">
                <hr>
            </td>
        </tr>
        <tr>
            <td colspan=2>&nbsp;</td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td nowrap>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <input id="emptyConfirm" name='folderEmptyConfirm' type='checkbox' value="true">
                        </td>
                        <td>&nbsp;</td>
                        <td>
                            <b><label for="emptyConfirm">${emptyConfirm}</label></b>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
         <tr>
            <td>&nbsp;</td>
            <td>
                <input class='tbButton' type="submit" name="actionEmptyFolderConfirm"
                       value="${fn:escapeXml(emptyButton)}">
                <input type="hidden" name="folderEmptyId" value="${folder.id}"/>
            </td>
        </tr>
    </c:when>
</c:choose>



<c:set var="inTrash" value="${folder.isInTrash}"/>
<c:if test="${not folder.isSystemFolder}">
    <c:choose>
        <c:when test="${folder.isAppointmentView}">
            <fmt:message var="deleteButton" key="calendarDelete"/>
            <fmt:message var="deleteConfirm" key="calendarDeleteConfirmation"/>
        </c:when>
        <c:when test="${folder.isTaskView}">
            <fmt:message var="deleteButton" key="taskListDelete"/>
            <fmt:message var="deleteConfirm" key="taskListDeleteConfirmation"/>
        </c:when>
        <c:when test="${folder.isContactView}">
            <fmt:message var="deleteButton" key="addressBookDelete"/>
            <fmt:message var="deleteConfirm" key="addressBook${inTrash ? 'Perm':''}DeleteConfirmation"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="deleteButton" key="folderDelete"/>
            <fmt:message var="deleteConfirm" key="folder${inTrash ? 'Perm':''}DeleteConfirmation"/>
        </c:otherwise>
    </c:choose>
    <tr>
        <td colspan="2">
            <hr>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input id="deleteConfirm" name='folderDeleteConfirm' type='checkbox' value="true">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                            <b><label for="deleteConfirm">${fn:escapeXml(deleteConfirm)}</label></b>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="action${inTrash ? 'Perm' : ''}Delete"
                   value="${deleteButton}">
            <input type="hidden" name="folderDeleteId" value="${folder.id}"/>
        </td>
    </tr>
</c:if>
</table>
</td>
</tr>
</table>