<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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

