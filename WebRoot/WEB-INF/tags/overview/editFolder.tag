<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<c:choose>
    <c:when test="${folder.isAppointmentView or folder.isContactView}">
        <c:set var="colorStyle" value="${folder.styleColor}${folder.styleColor ne 'Gray' ? 'Bg' :''}"/>
    </c:when>
    <c:otherwise>
        <c:set var="colorStyle" value="GrayBg"/>
    </c:otherwise>
</c:choose>


<table width=100% height=100% cellspacing="0" cellpadding="0">
<tr>
    <td>
        <table width=100% cellspacing=0 cellpadding=1>
            <tr valign="middle" class='${colorStyle}'>
                <td valign="middle" width=20>
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
                <td width=1% nowrap class='ZhFolderType'>
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
                <td colspan=3>
                    <c:choose>
                        <c:when test="${not (folder.isMountPoint or folder.isSearchFolder)}">
                            <span class='ZhFolderType' style='vertical-align:middle;'>
                                &nbsp;
                                <fmt:message key="folderItemCount">
                                <fmt:param value="${folder.messageCount}"/>
                                </fmt:message>
                                <c:if test="${folder.unreadCount gt 0 and not (folder.isDrafts or folder.isContactView or folder.isAppointmentView)}">
                                   &nbsp;
                                    <fmt:message key="folderItemUnreadCount">
                                        <fmt:param value="${folder.unreadCount}"/>
                                    </fmt:message>
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
<td height=100% valign='top'>
<table border="0" cellpadding="0" cellspacing="10" width=100%>

<%---------- name (rename) ----------%>
<tr>
    <td width=20% nowrap align=right>
        <fmt:message key="name"/>
        :
    </td>
    <td>
        <input
        <c:if test="${folder.isSystemFolder}"> disabled </c:if> name='folderName' type='text' autocomplete='off'
                                               size='35' value="${fn:escapeXml(folder.name)}">
        <c:if test="${not folder.isSystemFolder}">
        <input name='folderNameVisible' type='hidden' value="true"/>
        </c:if>
    </td>
</tr>

<%---------- parent folder (move) ----------%>
<c:if test="${folder.isMessageFolderMoveSource}">
    <tr>
        <td nowrap align='right'>
            <fmt:message key="parentFolder"/>
            :
        </td>
        <td>
            <select name="folderParentId">
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
<c:if test="${folder.isAppointmentView or folder.isContactView}">
    <tr>
        <td nowrap align='right'>
            <fmt:message key="color"/>
            :
        </td>
        <td>
            <select name="folderColor">
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
        <td width=20% nowrap align=right>
            <fmt:message key="searchQuery"/>
            :
        </td>
        <td>
            <input name='folderQuery' type='text' autocomplete='off' size='70' value="${fn:escapeXml(folder.query)}">
            <input name='folderQueryVisible' type='hidden' value="true"/>
        </td>
    </tr>
</c:if>

<%---------- url ----------%>
<c:if test="${not empty folder.remoteURL}">
    <tr>
        <td width=20% nowrap align=right>
            <fmt:message key="url"/>
            :
        </td>
        <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=middle>
                    <td>
                        <input name='folderUrl' type='text' autocomplete='off' size='70'
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
                        <fmt:message key="reloadCalendar" var="reload"/>
                        <a href="${syncUrl}">
                            <app:img src="arrows/Refresh.gif" title="${reload}"/>
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

<c:if test="${folder.isAppointmentView}">
    <%---------- exclude from free/busy ----------%>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='folderExcludeFlag' type='checkbox'
                        <c:if test="${folder.isExcludedFromFreeBusy}"> checked</c:if> value="b">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <fmt:message key="excludeFromFreeBusyTimes"/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <%---------- checked in UI ----------%>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='folderCheckedFlag' type='checkbox'
                        <c:if test="${folder.isCheckedInUI}"> checked</c:if> value="#">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <fmt:message key="calendarCheckedInUI"/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</c:if>

<%---------- save ----------%>
<c:if test="${not folder.isSystemFolder or (folder.isAppointmentView or folder.isContactView)}">
    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionSave"
                   value="<fmt:message key="saveChanges"/>">
            <input type="hidden" name="folderId" value="${folder.id}"/>
        </td>
    </tr>
</c:if>

<c:set var="inTrash" value="${folder.isInTrash}"/>
<c:if test="${not folder.isSystemFolder}">
    <c:choose>
        <c:when test="${folder.isAppointmentView}">
            <fmt:message var="deleteButton" key="calendarDelete"/>
            <fmt:message var="deleteConfirm" key="calendarDeleteConfirmation"/>
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
        <td colspan=2>&nbsp;</td>
    </tr>
    <tr>
        <td colspan=2>&nbsp;</td>
    </tr>
    <tr>
        <td colspan=2>&nbsp;</td>
    </tr>
    <tr>
        <td colspan=2>
            <hr>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='folderDeleteConfirm' type='checkbox' value="true">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                            ${fn:escapeXml(deleteConfirm)}
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