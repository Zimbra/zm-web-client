<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
    <c:choose>
        <c:when test="${empty sessionScope.expanded.folders}">
            <c:set var="expanded" value="${mailbox.prefs.folderTreeOpen}"/>
        </c:when>
        <c:otherwise>
            <c:set var="expanded" value="${sessionScope.expanded.folders ne 'collapse'}"/>
        </c:otherwise>
    </c:choose>
    <c:if test="${expanded}">
         <zm:modifyPrefs var="updated">
            <zm:pref name="zimbraPrefFolderTreeOpen" value="TRUE"/>
         </zm:modifyPrefs>
    </c:if>
    <c:if test="${not expanded}">
         <zm:modifyPrefs var="updated">
            <zm:pref name="zimbraPrefFolderTreeOpen" value="FALSE"/>
         </zm:modifyPrefs>
    </c:if>
    <c:if test="${updated}">
        <zm:getMailbox var="mailbox" refreshaccount="${true}"/>
    </c:if>
</app:handleError>


<div class="Tree">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr class="TreeHeaderRow">
            <c:url var="toggleUrl" value="/h/search">
                   <c:param name="${expanded ? 'collapse' : 'expand'}" value="folders"/>
               </c:url>
               <th style="width:20px"><a href="${toggleUrl}"><app:img altkey="${ mailbox.prefs.folderTreeOpen ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ mailbox.prefs.folderTreeOpen ? 'startup/ImgNodeExpanded.png' : 'startup/ImgNodeCollapsed.png'}"/></a></th>
            <th class="Header" nowrap="nowrap" width="99%"><fmt:message key="folders"/></th>
            <th nowrap="nowrap" align="right"  class="ZhTreeEdit">
                <c:url value="/h/mfolders" var="mfoldersUrl">
                        <c:if test="${not empty param.sfi}">
                            <c:param name="sfi" value="${param.sfi}"/>
                        </c:if>
                </c:url>
                <a id="MFOLDERS" href="${mfoldersUrl}"><fmt:message key="TREE_EDIT"/> </a>
            </th>
        </tr>
 
        <c:if test="${mailbox.prefs.folderTreeOpen}">
            <app:overviewFolder folder="${mailbox.inbox}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.inbox.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.sent}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.sent.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.drafts}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.drafts.id}" skipsystem="false"/>

            <c:if test="${mailbox.features.spam}">
                <app:overviewFolder folder="${mailbox.spam}" keys="${keys}"/>
                <app:doFolderTree skiproot="${true}" parentid="${mailbox.spam.id}" skipsystem="false"/>
            </c:if>

            <app:overviewFolder folder="${mailbox.trash}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.trash.id}" skipsystem="false"/>
        </c:if>
    </table>
    <c:if test="${mailbox.prefs.folderTreeOpen}">
        <app:doFolderTree skiproot="${true}" skipsystem="${true}" skiptopsearch="${true}" table="true"/>
    </c:if>
</div>
