<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="prefix" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%-- NOTE: Not allowed to reference a field like contact[prefix+"Street"]. Oh well. --%>
<c:set var="street" value="${prefix}Street" />
<c:set var="street" value="${zm:anySet(contact,street)?zm:htmlNewlineEncode(fn:escapeXml(contact[street])):''}" />
<c:set var="city" value="${prefix}City" />
<c:set var="city" value="${zm:anySet(contact,city)?fn:escapeXml(contact[city]):''}" />
<c:set var="state" value="${prefix}State" />
<c:set var="state" value="${zm:anySet(contact,state)?fn:escapeXml(contact[state]):''}" />
<c:set var="zip" value="${prefix}PostalCode" />
<c:set var="zip" value="${zm:anySet(contact,zip)?fn:escapeXml(contact[zip]):''}" />
<c:set var="country" value="${prefix}Country" />
<c:set var="country" value="${zm:anySet(contact,country)?fn:escapeXml(contact[country]):''}" />
 <%-- NOTE: Non-standard fmt tag. --%>
 <fmt:getLocale var="locale" />
 <c:choose>
     <c:when test="${locale.language eq 'ja'}">
         <div>${zip}&#x20;${state}&#x20;${city}</div>
         <div>${street}</div>
         <div>${country}</div>
     </c:when>
     <c:otherwise>
         <div>${street}</div>
         <div>
             ${city}<c:if test="${not empty city and not empty state}">,</c:if>&#x20;
             ${state}&#x20;${zip}
         </div>
         <div>${country}</div>
     </c:otherwise>
 </c:choose>
