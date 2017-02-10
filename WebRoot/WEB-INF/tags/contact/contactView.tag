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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${empty param.id ? context.currentItem.id : param.id}" var="contact"/>
    <zm:currentResultUrl var="closeUrl" value="/h/search" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
</app:handleError>

<app:view mailbox="${mailbox}" title="${contact.displayFileAs}" selected="contacts" contacts="true" tags="true" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="search" action="view" context="${context}"/>
    <form action="${currentUrl}" method="post">
        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:contactToolbar context="${context}" cursor="${cursor}" keys="true" closeurl="${closeUrl}"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppViewContent'>
                        <app:displayContact contact="${contact}"/>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:contactToolbar context="${context}" cursor="${cursor}" keys="false" closeurl="${closeUrl}"/>
                </td>
            </tr>
            </table>
        <input type="hidden" name="doContactListViewAction" value="1"/>
        <input type="hidden" name="id" value="${contact.id}"/>
    </form>
</app:view>

