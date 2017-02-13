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
