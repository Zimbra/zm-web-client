<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag import="com.zimbra.client.ZDomain" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="defaultSkin" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:catch>
	<%-- NOTE: We have to check the session scope this way because it
	           will throw an exception if page is not participating in
	           a session. --%>
	<c:set var="sessionScope_skin" value="${sessionScope.skin}" />
</c:catch>

<%-- set default values, respect the defaultSkin param if sent --%>
<c:set var="skin" value="${(not empty param.skin) ? param.skin : defaultSkin}" />
<c:set var="availableSkins" value="" />
<c:set var="defaultSkin" value="${initParam.zimbraDefaultSkin}" />
<%-- use current session skin value --%>
<c:if test="${empty skin}">
	<c:set var="skin" value="${sessionScope_skin}" />
</c:if>
<%-- use user's pref from mailbox --%> <%-- refresh the account to get new skin value if refreshskin is true --%>
<c:if test="${empty skin and not empty mailbox}">
	<c:catch>
		<zm:getMailbox var="mailbox" refreshaccount="${requestScope.refreshSkin ? true : false}"/>
		<c:set var="skin" value="${mailbox.prefs.skin}" />
		<c:set var="availableSkins" value="${mailbox.availableSkins}" />
	</c:catch>
</c:if>
<%-- use domain skin --%>
<c:if test="${empty skin}">
	<c:catch>
		<zm:getDomainInfo var="domain" by="virtualHostname" value="${pageContext.request.serverName}" />
		<c:set var="skin" value="${domain.prefSkin}" />
	</c:catch>
</c:if>

<%-- use default skin --%>
<c:if test="${empty skin}">
	<c:set var="skin" value="${defaultSkin}" />
</c:if>

<%-- make sure skin is in allowed list --%>
<c:if test="${not empty availableSkins and not zm:contains(availableSkins, skin)}">
	<c:set var="skin" value="${defaultSkin}" />
</c:if>

<%-- expose skin value --%>
<c:set var="skin" value="${skin}" scope="request" />
<c:catch>
	<c:set var="skin" value="${skin}" scope="session" />
</c:catch>

<%-- HACK: set icon path --%>
<c:choose>
    <c:when test="${skin eq 'yahoo'}">
        <c:set var="iconPath" value="/skins/yahoo/img" scope="request" />
    </c:when>
    <c:otherwise>
        <c:set var="iconPath" value="/img" scope="request" />
    </c:otherwise>
</c:choose>