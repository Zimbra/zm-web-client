<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <c:set var="share" value="${message.share}"/>
    <c:set var="calendar" value="${share.link.view.appointment}"/>
    <c:set var="addressbook" value="${share.link.view.contact}"/>
</app:handleError>

<fmt:message var="createLabel" key="acceptShare"/>
<c:choose>
    <c:when test="${zm:boolean(calendar)}">
        <fmt:message var="label" key="calendarNew"/>
        <c:set var="icon" value="calendar/ImgSharedCalendarFolder.png"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'appointment')}"/>
        <c:set var="newFolderExcludeFlag" value="${empty param.newFolderExcludeFlag ? '' : param.newFolderExcludeFlag}"/>
        <c:set var="newFolderCheckedFlag" value="${empty param.newFolderCheckedFlag ? '#' : param.newFolderCheckedFlag}"/>
        <fmt:message var="folderType" key="calendarShared"/>
    </c:when>
    <c:when test="${zm:boolean(addressbook)}">
        <fmt:message var="label" key="addressBookNew"/>
        <c:set var="icon" value="contacts/ImgSharedContactsFolder.png"/>
        <fmt:message var="folderType" key="addressBookShared"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'appointment')}"/>
    </c:when>
    <c:otherwise>
        <c:set var="icon" value="startup/ImgSharedMailFolder.png"/>
        <fmt:message var="label" key="folderNew"/>
        <fmt:message var="folderType" key="folderUser"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'message')}"/>
    </c:otherwise>
</c:choose>

<table width=100% cellspacing=0 cellpadding=0>
    <tr class="${newFolderStyleColor}${newFolderStyleColor ne 'Gray' ? 'Bg' :''}">
        <td width=20 style='padding-left:5px'>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
        </td>
        <td class='ZhFolderHeader' colspan=2>
            ${fn:escapeXml(label)}
        </td>
        <td width=1% nowrap class='ZhFolderType'>
            ${fn:escapeXml(folderType)}
            &nbsp;
        </td>
    </tr>
</table>

<table border="0" cellpadding="0" cellspacing="10" width=100%>

    <tr>
        <td nowrap align=right>
            <fmt:message key="name"/>
            :
        </td>
        <td>
            <fmt:message var="newName" key="shareNewName">
                <fmt:param value="${share.grantor.name}"/>
                <fmt:param value="${share.link.name}"/>
            </fmt:message>
            <input name='newFolderName' type='text' autocomplete='off' size='35' value="${fn:escapeXml(newName)}">
        </td>
    </tr>

<c:choose>
    <c:when test="${not calendar and not addressbook}">
    <tr>
        <td nowrap align='right'>
            <fmt:message key="parentFolder"/>
            :
        </td>
        <td>
            <select name="newFolderParentId">
                <option selected value="1"/>
                <fmt:message key="rootFolder"/>
                <zm:forEachFolder var="parent">
                    <c:if test="${parent.isMessageMoveTarget and !parent.isTrash and !parent.isSpam}">
                        <option value="${parent.id}"/>
                        ${fn:escapeXml(parent.rootRelativePath)}
                    </c:if>
                </zm:forEachFolder>
            </select>
        </td>
    </tr>
    </c:when>
    <c:otherwise>
        <input name="newFolderParentId" type="hidden" value="1">
    </c:otherwise>
</c:choose>

    <tr>
        <td nowrap align=right>
            <fmt:message key="ownersEmail"/>
            :
        </td>
        <td>
            <input name='newFolderOwnersEmail' disabled readonly type='text' autocomplete='off' size='35' value="${fn:escapeXml(share.grantor.email)}">
        </td>
    </tr>
    <tr>
<c:choose>
    <c:when test="${zm:boolean(addressbook)}">
        <td nowrap align=right><fmt:message key="ownersAddressBookName"/>:</td>
        <td>
            <input name='newFolderOwnersAddressBook' disabled readonly type='text' autocomplete='off' size='35' value="${fn:escapeXml(share.link.name)}">
        </td>
        </c:when>
    <c:when test="${zm:boolean(calendar)}">
        <td nowrap align=right><fmt:message key="ownersCalendarName"/>:</td>
        <td>
            <input disabled readonly name='newFolderOwnersCalendar' type='text' autocomplete='off' size='35' value="${fn:escapeXml(share.link.name)}">
        </td>
    </c:when>
    <c:otherwise>
        <td nowrap align=right><fmt:message key="ownersFolderName"/>:</td>
        <td>
            <input disabled readonly name='newFolderOwnersFolder' type='text' autocomplete='off' size='35' value="${fn:escapeXml(share.link.name)}">
        </td>
    </c:otherwise>
</c:choose>
    </tr>
<tr>
    <td nowrap align='right'>
        <fmt:message key="color"/>
        :
    </td>
    <td>
        <select name="newFolderColor">
            <option <c:if test="${newFolderColor eq 'blue'}">selected</c:if> value="blue"/><fmt:message key="blue"/>
            <option <c:if test="${newFolderColor eq 'cyan'}">selected</c:if> value="cyan"/><fmt:message key="cyan"/>
            <option <c:if test="${newFolderColor eq 'green'}">selected</c:if> value="green"/><fmt:message key="green"/>
            <option <c:if test="${newFolderColor eq 'purple'}">selected</c:if> value="purple"/><fmt:message key="purple"/>
            <option <c:if test="${newFolderColor eq 'red'}">selected</c:if> value="red"/><fmt:message key="red"/>
            <option <c:if test="${newFolderColor eq 'yellow'}">selected</c:if> value="yellow"/><fmt:message key="yellow"/>
            <option <c:if test="${newFolderColor eq 'pink'}">selected</c:if> value="pink"/><fmt:message key="pink"/>
            <option <c:if test="${newFolderColor eq 'gray'}">selected</c:if> value="gray"/><fmt:message key="gray"/>
            <option <c:if test="${newFolderColor eq 'orange'}">selected</c:if> value="orange"/><fmt:message key="orange"/>
        </select>
    </td>
</tr>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionNewShare"
                   value="${createLabel}">
            <input type="hidden" name="newFolderView" value="${share.link.view}"/>
            <input type="hidden" name="newFolderLinkId" value="${share.link.id}"/>
            <input type="hidden" name="newFolderGrantorId" value="${share.grantor.id}"/>
        </td>

    </tr>
</table>
