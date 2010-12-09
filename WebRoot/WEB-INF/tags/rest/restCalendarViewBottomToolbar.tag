<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='request' />
<fmt:message bundle='${AjxMsg}' key='${zm:getCanonicalId(timezone)}' var='timezoneStr' scope='request' />

<%-- TODO: blank for now, could add timezone drop down or more date selection --%>
<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class="TbBt">
            <c:if test="${not empty requestScope.zimbra_target_item_name}">
                <a href="${requestScope.zimbra_target_item_name}.ics"><app:img src="startup/ImgCalendarApp.png" alt="ics"/><span style='padding-left:5px'>${requestScope.zimbra_target_item_name}.ics</span></a>
            </c:if>
        </td>
        <td align='right' class='ZhCalTimeZone'>
            ${fn:escapeXml(fn:startsWith(timezoneStr,"???") ? (zm:getCanonicalId(timezone)) : timezoneStr)}
        </td>
    </tr>
</table>
