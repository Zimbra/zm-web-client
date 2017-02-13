<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="endDate" rtexprvalue="true" required="false" type="java.util.Calendar" %>
<%@ attribute name="ft" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="tt" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="wdays" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="checkedCalendars" rtexprvalue="true" required="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="nextMonthDate" value="${zm:addMonth(date,  1)}"/>

    <app:skin mailbox="${mailbox}" />
    <c:set var="multiDay">
        <app:multiDay date="${date}" endDate="${not empty endDate ? endDate : ''}" ft="${ft}" tt="${tt}" print="${true}" numdays="${numdays}" wdays="${not empty wdays ? wdays : ''}" view="${view}" timezone="${timezone}" checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>

</app:handleError>
<c:if test="${param.imc eq 'true'}">
<table cellpadding="0" cellspacing="0" border="0" style="margin-left: 1%;">
    <tr>
        <td width="180">
            <app:miniCal print="${true}" date="${not empty date ? date : zm:getToday(mailbox.prefs.timeZone)}" checkedCalendars="${checkedCalendars}"/>
        </td>
        <td width="10">
             &nbsp;
        </td>
        <td width="180">
            <app:miniCal print="${true}" date="${not empty nextMonthDate ? nextMonthDate : zm:getToday(mailbox.prefs.timeZone)}" rangeDate="${not empty date ? date : zm:getToday(mailbox.prefs.timeZone)}" checkedCalendars="${checkedCalendars}"/>            
        </td>
    </tr>
</table>
</c:if>
<br>
<table width="98%" align="center" cellpadding="0" cellspacing="0" border="0" class="zPrintMsgs" >
    <tr>
        <td colspan="4" class='ZhAppContent'>
            ${multiDay}
        </td>
    </tr>
</table>

<style type="text/css">
    .zPrintMsgs *{
        font-size:${mailbox.prefs.defaultPrintFontSize};
    }
</style>
<SCRIPT TYPE="text/javascript">
<!--
function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
//-->
</SCRIPT>