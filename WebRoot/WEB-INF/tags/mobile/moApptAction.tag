<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:requirePost/>
<mo:handleError>
<c:if test="${zm:actionSet(param,'actionApptDelete')}">
    <zm:checkCrumb crumb="${param.crumb}"/>
    <c:set var="id" value="${param.invId}"/>
    <c:set var="instance" value="${0}"/>
    <zm:getMessage var="message" id="${id}" markread="true" neuterimages="${empty param.xim}"/>
    <zm:cancelAppointment message="${message}" instance="${instance}"/>
    <c:set var="needViewAppt" value="${false}"/>
</c:if>
</mo:handleError>