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
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="openurl" rtexprvalue="true" required="false" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="false" %>
<%@ attribute name="invId" rtexprvalue="true" required="false" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<fmt:formatDate var="dateDf" value="${date.time}" pattern="yyyyMMdd" timeZone="${timezone}"/>
<mo:calendarUrl var="dayViewUrl" view="day" date="${dateDf}" _replaceDate="1"/>
<mo:calendarUrl var="listViewUrl" view="list" date="${dateDf}" _replaceDate="1"/>
<mo:calendarUrl var="monthViewUrl" view="month" date="${dateDf}" _replaceDate="1"/>
<c:choose>
    <c:when test="${openurl}">
        <c:set var="list">onclick='openURL("${fn:escapeXml(zm:jsEncode(listViewUrl))}")'</c:set>
        <c:set var="day">onclick='openURL("${fn:escapeXml(zm:jsEncode(dayViewUrl))}")'</c:set>
        <c:set var="month">onclick='openURL("${fn:escapeXml(zm:jsEncode(monthViewUrl))}")'</c:set>
    </c:when>
    <c:otherwise>
        <c:set var="list">href="${fn:escapeXml(listViewUrl)}"</c:set>
        <c:set var="day">href="${fn:escapeXml(dayViewUrl)}"</c:set>
        <c:set var="month">href="${fn:escapeXml(monthViewUrl)}"</c:set>
    </c:otherwise>
</c:choose>

<c:set var="top_stb" value="${param.top_stb eq '0' ? '0' : (empty sessionScope.top_stb ? '1' : sessionScope.top_stb)}"/>
<c:set var="btm_stb" value="${param.btm_stb eq '0' ? '0' : (empty sessionScope.btm_stb ? '1' : sessionScope.btm_stb)}"/>

<c:set var="top_tb" value="${param.top_tb eq '0' ? '0' : (empty sessionScope.top_tb ? '1' : sessionScope.top_tb)}"/>
<c:set var="btm_tb" value="${param.btm_tb eq '0' ? '0' : (empty sessionScope.btm_tb ? '1' : sessionScope.btm_tb)}"/>

<c:set var="top_fldr_select" value="${param.top_fldr_select eq '1' ? '1' : (empty sessionScope.top_fldr_select ? '0' : sessionScope.top_fldr_select)}"/> <%-- Default disabled--%>
<c:set var="btm_fldr_select" value="${param.btm_fldr_select eq '0' ? '0' : (empty sessionScope.btm_fldr_select ? '1' : sessionScope.btm_fldr_select)}"/> <%-- Default enabled--%>
<fmt:message key="checkedCalendars" var="checkedInUI"/>
<c:if test="${isTop && '1' eq top_stb}">
    <div class="stb tbl"><div class="tr"><div class="td">
        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=cals"><fmt:message key="calendars"/></a> &laquo;
        <c:if test="${top_fldr_select ne '1'}">
            ${not empty sessionScope.calendar ? zm:truncateFixed(sessionScope.calendar.name,12,true) : checkedInUI}
        </c:if>
        <c:if test="${top_fldr_select eq '1'}">
        <select name="sfi" onchange="fetchIt('?sfi='+this.value+'&st=cal');">
        <option value="null">${checkedInUI}</option><c:set var="count" value="${0}"/>
        <zm:forEachFolder var="fldr" skiproot="true">
            <c:if test="${count lt sessionScope.F_LIMIT and fldr.isCalendar || fldr.isAppointmentView}">
                <option ${param.sfi eq fldr.id || sessionScope.calendar.id eq fldr.id ? 'selected=selected' : ''} value="${fldr.id}">${zm:cook(zm:truncateFixed(zm:getUncookedFolderName(pageContext,fldr.id),12,true))}</option><c:set var="count" value="${count+1}"/>
            </c:if>
        </zm:forEachFolder>
        </select>
        </c:if>
    </div></div></div>
</c:if>
<c:url var='eaction' value="?st=newappt&date=${dateDf}">
<c:if test="${empty invId}">
    <c:param name="_replaceDate" value="1"/>    
</c:if>
<c:if test="${not empty invId}">
	<c:param name="useInstance" value="0"/>
	<c:param name="invId" value="${invId}"/>
    <c:param name="_ajxnoca" value="1"/>
</c:if>
<c:if test="${not empty param.bt}">
	<c:param name="bt" value="${param.bt}"/>
</c:if>
</c:url>
<c:if test="${(isTop && '1' eq  top_tb ) || (!isTop && '1' eq btm_tb) }">
<div class="tb tbl"><span class="tr"><span class="td">
    <span class="zo_button_group">
    <c:if test="${view ne 'appt'}"><a ${list} class='prev_button ${view!=null && view=='list'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewListShort"/></a><a ${day} class='next_button ${view!=null && view=='day'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewDayShort"/></a><a ${month} class='next_button ${view!=null && view=='month'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewMonthShort"/></a></c:if>
    <c:if test="${view eq 'appt'}"><mo:calendarUrl var="backurl" action="${null}"/><a href="${backurl}" class="zo_button prev_button"><fmt:message key="back"/></a></c:if>
    </span>
	<span>
         <a accesskey="${requestScope.mainaction_accesskey}" href="${eaction}" class='zo_button'><fmt:message key="${empty invId ? 'add' : 'edit'}"/></a>
    </span>
</span></span></div>
</c:if>    
<c:if test="${!isTop && '1' eq btm_stb}">
    <div class="stb tbl"><div class="tr"><div class="td">
        <a href="${urlTarget}?st=cals"><fmt:message key="calendarsLabel"/></a>
        <c:if test="${btm_fldr_select ne '1'}">
            ${not empty sessionScope.calendar ? zm:truncateFixed(sessionScope.calendar.name,12,true) : checkedInUI}
        </c:if>
        <c:if test="${btm_fldr_select eq '1'}">
        <select name="sfi" onchange="fetchIt('?sfi='+this.value+'&st=cal', GC());">
        <option value="null">${checkedInUI}</option><c:set var="count" value="${0}"/>
        <zm:forEachFolder var="fldr" skiproot="true">
            <c:if test="${count lt sessionScope.F_LIMIT and fldr.isCalendar || fldr.isAppointmentView}">
                <option ${param.sfi eq fldr.id || sessionScope.calendar.id eq fldr.id ? 'selected=selected' : ''} value="${fldr.id}">${zm:cook(zm:truncateFixed(zm:getFolderName(pageContext,fldr.id),12,true))}</option><c:set var="count" value="${count+1}"/>
            </c:if>
        </zm:forEachFolder>
        </select>
        </c:if>    
    </div></div></div>
</c:if>
