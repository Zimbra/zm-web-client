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
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setBundle basename='/messages/TzMsg' var='TzMsg' scope='request' />
<fmt:message bundle='${TzMsg}' key='${zm:getCanonicalId(timezone)}' var='timezoneStr' scope='request' />

<%-- TODO: blank for now, could add timezone drop down or more date selection --%>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class=TbBt>
            <input type="hidden" class='tbButton' name="zzz">&nbsp;
        </td>
        <td align='right' class='ZhCalTimeZone'>
            <zm:getMailbox var="mailbox"/>
            ${fn:escapeXml(fn:startsWith(timezoneStr,"???") ? (zm:getCanonicalId(timezone)) : timezoneStr)}
        </td>
    </tr>
</table>
