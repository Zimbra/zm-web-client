<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011 Zimbra, Inc.
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