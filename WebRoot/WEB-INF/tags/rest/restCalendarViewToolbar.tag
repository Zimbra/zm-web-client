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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="today" rtexprvalue="true" required="true" type="java.util.Calendar"%>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="nextDate" rtexprvalue="true" required="true" type="java.util.Calendar"%>
<%@ attribute name="prevDate" rtexprvalue="true" required="true" type="java.util.Calendar"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:formatDate var="dateDf" value="${date.time}" pattern="yyyyMMdd" timeZone="${timezone}"/>
<rest:calendarUrl var="newApptUrl" date="${dateDf}" action="edit"/>
<rest:calendarUrl var="dayViewUrl" date="${dateDf}" view="day"/>
<rest:calendarUrl var="weekViewUrl" date="${dateDf}" view="week"/>
<rest:calendarUrl var="workWeekViewUrl" date="${dateDf}" view="workWeek"/>
<rest:calendarUrl var="monthViewUrl" date="${dateDf}" view="month"/>
<rest:calendarUrl var="scheduleViewUrl" date="${dateDf}" view="schedule"/>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class=TbBt id="caltb">
            <table cellpadding="0" cellspacing="0">
                <tr valign="middle">
                    <td height="100%">
                        <a id="CAL_DAY" href="${fn:escapeXml(dayViewUrl)}"><app:img altkey="ALT_CAL_DAY_VIEW" src="calendar/ImgDayView.png"/><span style='padding-left:5px'><fmt:message key="day"/></span></a>
                    </td>
                    <td height="100%">
                        <a id="CAL_WORK" href="${fn:escapeXml(workWeekViewUrl)}"><app:img altkey="ALT_CAL_WORKWEEK_VIEW" src="calendar/ImgWorkWeekView.png"/><span style='padding-left:5px'><fmt:message key="workWeek"/></span></a>
                    </td>
                    <td height="100%">
                        <a id="CAL_WEEK" href="${fn:escapeXml(weekViewUrl)}"><app:img altkey="ALT_CAL_WEEK_VIEW" src="calendar/ImgWeekView.png"/><span style='padding-left:5px'><fmt:message key="week"/></span></a>
                    </td>
                    <td height="100%">
                        <a id="CAL_MONTH" href="${fn:escapeXml(monthViewUrl)}"><app:img altkey="ALT_CAL_MONTH_VIEW" src="calendar/ImgMonthView.png"/><span  style='padding-left:5px'><fmt:message key="month"/></span></a>
                    </td>
                    <td height="100%"><div class='vertSep'></div></td>
                    <rest:calendarUrl var="todayUrl" nodate="true"/>
                    <td height="100%">
                        <a id="CAL_TODAY" href="${fn:escapeXml(todayUrl)}"><app:img altkey="ALT_CAL_TODAY" src="calendar/ImgDate.png"/><span  style='padding-left:5px'><fmt:message key="today"/></span></a>
                    </td>
                </tr>
            </table>
        </td>
        <td align="right">
            <rest:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
            <rest:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
            <table cellspacing="5" cellpadding="0">
                <tr>
                    <td>
                        <a <c:if test="${keys}">id="PREV_PAGE"</c:if> href="${fn:escapeXml(prevUrl)}"><app:img altkey="ALT_PAGE_PREVIOUS" src="startup/ImgLeftArrow.png" border="0"/></a>
                    </td>
                    <td class='ZhCalPager'>
                        ${fn:escapeXml(title)}
                    </td>
                    <td>
                        <a <c:if test="${keys}">id="NEXT_PAGE"</c:if> href="${fn:escapeXml(nextUrl)}"><app:img altkey="ALT_PAGE_NEXT" src="startup/ImgRightArrow.png" border="0"/></a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
