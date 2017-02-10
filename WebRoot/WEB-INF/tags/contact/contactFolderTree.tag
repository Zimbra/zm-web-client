<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<zm:getMailbox var="mailbox"/>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.contacts ne 'collapse'}"/>

<div class=Tree>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                <c:param name="st" value="contact"/>
                 <c:param name="${expanded ? 'collapse' : 'expand'}" value="contacts"/>
             </c:url>
             <th style='width:20px'><a href="${fn:escapeXml(toggleUrl)}"><app:img altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ expanded ? 'startup/ImgNodeExpanded.png' : 'startup/ImgNodeCollapsed.png'}"/></a></th>
            <th class='Header'><fmt:message key="addressBooks"/></th>
            <th align='right' class='ZhTreeEdit' nowrap="nowrap">
                <c:url value="/h/maddrbooks" var="mabUrl">
                    <c:if test="${not empty param.sfi}">
                        <c:param name="sfi" value="${param.sfi}"/>
                    </c:if>
                </c:url>
                <a id="MADDRBOOKS" href="${fn:escapeXml(mabUrl)}" ><fmt:message key="TREE_EDIT"/></a>
            </th>
        </tr>

        <c:if test="${expanded}">
			<c:set var="myCard" value="${mailbox.myCard}"/>
			<c:set var="myCardSelected" value="${not empty myCard and myCard.id eq param.id and not empty param.actionEdit}" scope="request"/>

            <app:contactFolder folder="${mailbox.contacts}"/>
			<c:if test="${not empty myCard}">
				<app:myCardFolder myCard="${myCard}"/>
			</c:if>
            <%--
                Display the children of Contact folder, if any. Folders with unknown view also get listed.
            --%>
            <app:doContactFolderTree skiproot="${true}" parentid="${mailbox.contacts.id}" skipsystem="false" skiptopsearch="true"/>

            <%--
                Rest of the address book folders, do not display folders with unknown view here.
            --%>
            <zm:forEachFolder var="folder" skiproot="${true}" skipsystem="${false}" expanded="${sessionScope.expanded}" skiptrash="${true}">
                <c:if test="${not folder.isSearchFolder and folder.isContactView and folder.id ne mailbox.contacts.id}">
                    <app:contactFolder folder="${folder}"/>
                </c:if>
            </zm:forEachFolder>
            
            <app:overviewFolder types="contact" folder="${mailbox.trash}"/>
            <app:doContactFolderTree skiproot="${true}" parentid="${mailbox.trash.id}" skipsystem="false"/>
        </c:if>
    </table>

</div>
