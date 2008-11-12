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
<mo:calendarUrl var="dayViewUrl" view="day"/>
<mo:calendarUrl var="listViewUrl" view="list"/>
<mo:calendarUrl var="monthViewUrl" view="month"/>
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

<c:if test="${isTop && '1' eq top_stb}">
    <div class="SubToolbar">
        <fmt:message key="calendarCheckedInUI" var="checkedInUI"/>
        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=cals"><fmt:message key="calendars"/></a> &#171;
        <c:if test="${top_fldr_select ne '1'}">
            ${not empty sessionScope.calendar ? sessionScope.calendar.name : checkedInUI}
        </c:if>
        <c:if test="${top_fldr_select eq '1'}">
        <select name="sfi" onchange="document.location.href='?sfi='+this.value+'&${pageContext.request.queryString}';">
        <option value="null">${checkedInUI}</option>
        <zm:forEachFolder var="fldr" skiproot="true">
            <c:if test="${fldr.isCalendar || fldr.isAppointmentView}">
                <option ${param.sfi eq fldr.id || sessionScope.calendar.id eq fldr.id ? 'selected=selected' : ''} value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...</option>
            </c:if>
        </zm:forEachFolder>
        </select>
        </c:if>    
    </div>
</c:if>
<c:if test="${(isTop && '1' eq  top_tb ) || (!isTop && '1' eq btm_tb) }">
<div class="Toolbar table">
	<div class="table-row">
	<div class="table-cell">
        <span class=" zo_button_group"><c:if test="${view ne 'appt'}"><a ${list} class='prev_button ${view!=null && view=='list'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewListShort"/></a><a ${day} class='next_button ${view!=null && view=='day'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewDayShort"/></a><a ${month} class='next_button ${view!=null && view=='month'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewMonthShort"/></a></c:if>
	<c:if test="${view eq 'appt'}"><mo:calendarUrl var="backurl" action="${null}"/><a href="${backurl}" class="zo_button prev_button"><fmt:message key="back"/></a></c:if></span>
        <span><a accesskey="${requestScope.mainaction_accesskey}" href="?st=newappt&date=${dateDf}<c:if test="${'' ne invId}">&useInstance=0&invId=${invId}</c:if>" class='zo_button'><fmt:message key="${empty invId ? 'add' : 'edit'}"/></a></span>
	</div>
	</div>
</div>
</c:if>    
<c:if test="${!isTop && '1' eq btm_stb}">
    <div class="SubToolbar">
        <fmt:message key="calendarCheckedInUI" var="checkecInUI"/>
        <a href="${urlTarget}?st=cals"><fmt:message key="calendars"/></a> :
        <c:if test="${btm_fldr_select ne '1'}">
            ${not empty sessionScope.calendar ? sessionScope.calendar.name : checkecInUI}
        </c:if>
        <c:if test="${btm_fldr_select eq '1'}">
        <select name="sfi" onchange="document.location.href='?sfi='+this.value+'&${pageContext.request.queryString}';">
        <option value="null"><fmt:message key="calendarCheckedInUI"/></option>
        <zm:forEachFolder var="fldr" skiproot="true">
            <c:if test="${fldr.isCalendar || fldr.isAppointmentView}">
                <option ${param.sfi eq fldr.id || sessionScope.calendar.id eq fldr.id ? 'selected=selected' : ''} value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...</option>
            </c:if>
        </zm:forEachFolder>
        </select>
        </c:if>    
    </div>
</c:if>
