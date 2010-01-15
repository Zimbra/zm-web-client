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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="section" rtexprvalue="true" required="true" %>
<%@ attribute name="suffix" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<fmt:bundle basename="/keys/ZhKeys">
<tr>
    <td>
        <table class='shortcutList' cellspacing=0 cellpadding=0>
            <tr>
                <td class='shortcutListHeader' colspan=2>
                    <div class='PanelHead'>
                        <fmt:message var="desc" key="${section}.description"/>
                        <c:out value="${desc}"/>
                    </div>
                </td>
            </tr>
            <fmt:message var="keys" key="${section}.keys"/>
            <c:forEach var="msgkey" items="${fn:split(keys,',')}">
                    <c:choose>
                        <c:when test="${(fn:trim(msgkey) eq 'overview.tags') and (!mailbox.features.tagging)}">
                        </c:when>
                        <c:when test="${(fn:trim(msgkey) eq 'mail.Flag') and (!mailbox.features.flagging)}">
                        </c:when>
                        <c:when test="${(fn:trim(msgkey) eq 'mail.UnFlag') and (!mailbox.features.flagging)}">
                        </c:when>
                        <c:otherwise>
                            <app:optShortcutKey msgkey="${msgkey}" suffix="${suffix}"/>
                        </c:otherwise>
                    </c:choose>
            </c:forEach>
        </table>
    </td>
</tr>
</fmt:bundle>
