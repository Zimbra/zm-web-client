<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="var" rtexprvalue="false" required="true" type="java.lang.String" %>
<%@ attribute name="value" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="view" rtexprvalue="true" required="false" %>
<%@ attribute name="sq" rtexprvalue="true" required="false" %>
<%@ attribute name="zoom" rtexprvalue="true" required="false" %>
<%@ attribute name="rawdate" rtexprvalue="true" required="false" type="java.util.Calendar"%>
<%@ attribute name="timezone" rtexprvalue="true" required="false" type="java.util.TimeZone"%>
<%@ attribute name="date" rtexprvalue="true" required="false" %>
<%@ attribute name="appt" rtexprvalue="true" required="false" type="com.zimbra.client.ZAppointmentHit" %>
<%@ attribute name="nodate" rtexprvalue="true" required="false" %>
<%@ attribute name="toggleInstance" rtexprvalue="true" required="false" %>
<%@ attribute name="apptFromParam" rtexprvalue="true" required="false" %>
<%@ attribute name="action" rtexprvalue="true" required="false" %>
<%@ variable name-from-attribute="var" alias='urlVar' scope="AT_BEGIN" variable-class="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var='view' value='${not empty view ? view : param.view}'/>
<c:url value="${not empty value ? value : '/h/calendar'}" var="urlVar">
    <c:if test="${not empty view}">
        <c:param name='view' value='${view}'/>
    </c:if>
    <c:if test="${not empty zoom}">
        <c:param name='zoom' value='${true}'/>
    </c:if>
    <c:if test="${not empty param.numdays and view eq 'day'}"><c:param name='numdays' value='${param.numdays}'/></c:if>
    <c:if test="${not empty param.tz}"><c:param name='tz' value='${param.tz}'/></c:if>
    <c:if test="${not empty param.sq or not empty sq}"><c:param name='sq' value='${not empty sq ? sq : param.sq}'/></c:if> 
    <c:choose>
        <c:when test="${not empty rawdate}">
            <c:param name='date'><fmt:formatDate timeZone="${timezone}" value="${rawdate.time}" pattern="yyyyMMdd"/></c:param>
        </c:when>
        <c:otherwise>
            <c:if test="${(not empty date or not empty param.date) and (not nodate)}">
                <c:param name='date' value='${not empty date ? date : param.date}'/>
            </c:if>
        </c:otherwise>
    </c:choose>
    <c:choose>
        <c:when test="${not empty appt}">
            <c:set var="apptFolder" value="${zm:getFolder(pageContext, appt.folderId)}"/>
            <c:choose>
                <c:when test="${apptFolder.isMountPoint}">
                    <c:param name="action" value="${apptFolder.isMountPointWritable ? 'edit' : 'view'}"/>
                </c:when>
                <c:when test="${apptFolder.isFeed or not appt.organizer}">
                    <c:param name="action" value="view"/>
                </c:when>
                <c:otherwise>
                    <c:param name="action" value="edit"/>
                </c:otherwise>
            </c:choose>
            <c:param name="invId" value="${appt.seriesInviteId}"/>
            <c:param name="pstat" value="${appt.participantStatus}"/>
            <c:if test="${appt.exception}">
                <c:param name="exInvId" value="${appt.inviteId}"/>
            </c:if>
            <c:if test="${appt.recurring or appt.exception}">
                <c:param name="useInstance" value="1"/>
                <c:if test="${appt.inviteComponentNumber ne '0'}"><c:param name="instCompNum" value="${appt.inviteComponentNumber}"/></c:if>
            </c:if>
            <c:param name="instStartTime" value="${appt.startTime}"/>
            <c:param name="instDuration" value="${appt.duration}"/>
            <c:if test="${appt.seriesComponentNumber ne '0'}"><c:param name="compNum" value="${appt.seriesComponentNumber}"/></c:if>
        </c:when>
        <c:when test="${toggleInstance or apptFromParam}">
            <c:choose>
                <c:when test="${not empty action}">
                    <c:param name="action" value="${action}"/>
                </c:when>
                <c:otherwise>
                    <c:if test="${not empty param.action}"><c:param name="action" value="${param.action}"/></c:if>
                </c:otherwise>
            </c:choose>

            <c:if test="${not empty param.invId}"><c:param name="invId" value="${param.invId}"/></c:if>
            <c:if test="${not empty param.exInvId}"><c:param name="exInvId" value="${param.exInvId}"/></c:if>
            <c:if test="${not empty param.pstat}"><c:param name="pstat" value="${param.pstat}"/></c:if>
            <c:if test="${not empty param.instStartTime}"><c:param name="instStartTime" value="${param.instStartTime}"/></c:if>
            <c:if test="${not empty param.instDuration}"><c:param name="instDuration" value="${param.instDuration}"/></c:if>
            <c:if test="${not empty param.instCompNum}"><c:param name="instCompNum" value="${param.instCompNum}"/></c:if>
            <c:if test="${not empty param.compNum}"><c:param name="compNum" value="${param.compNum}"/></c:if>
            <c:param name="useInstance" value="${apptFromParam ? param.useInstance : param.useInstance ne '1' ? '1' : '0'}"/>
        </c:when>
        <c:otherwise>
            <c:if test="${not empty action}">
                <c:param name="action" value="${action}"/>
            </c:if>
        </c:otherwise>
    </c:choose>
    <c:forEach items="${dynattrs}" var="a">
        <c:if test="${not empty a.value}">
            <c:param name='${a.key}' value='${a.value}'/>
        </c:if>
    </c:forEach>
</c:url>
