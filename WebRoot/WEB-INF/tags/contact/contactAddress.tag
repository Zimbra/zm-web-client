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
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="phoneFields" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%-- NOTE: This tag actually displays MORE than just the address fields --%>
<%-- NOTE: because of the output is designed to save space. --%> 
<c:set var="label" value="${empty label ? prefix : label}" />
<%-- NOTE: Not allowed to reference a field like contact[prefix+"Street"]. Oh well. --%>
<c:set var="street" value="${prefix}Street" />
<c:set var="street" value="${zm:anySet(contact,street)?fn:replace(fn:escapeXml(contact[street]),'NEWLINE','<br>'):''}" />
<c:set var="city" value="${prefix}City" />
<c:set var="city" value="${zm:anySet(contact,city)?fn:escapeXml(contact[city]):''}" />
<c:set var="state" value="${prefix}State" />
<c:set var="state" value="${zm:anySet(contact,state)?fn:escapeXml(contact[state]):''}" />
<c:set var="zip" value="${prefix}PostalCode" />
<c:set var="zip" value="${zm:anySet(contact,zip)?fn:escapeXml(contact[zip]):''}" />
<c:set var="country" value="${prefix}Country" />
<c:set var="country" value="${zm:anySet(contact,country)?fn:escapeXml(contact[country]):''}" />
<c:set var="url" value="${prefix}URL" />
<c:set var="url" value="${zm:anySet(contact,url)?fn:escapeXml(contact[url]):''}" />
<c:if test="${not empty url}">
    <c:url var="urlPrefix" value="${fn:contains(url,'//')?'':'http://'}" />
</c:if>
<c:set var="phone" value="${prefix}Phone" />
<c:set var="phone" value="${zm:anySet(contact,phone)?fn:escapeXml(contact[phone]):''}" />
<c:set var="phone2" value="${prefix}Phone2" />
<c:set var="phone2" value="${zm:anySet(contact,phone2)?fn:escapeXml(contact[phone2]):''}" />
<c:set var="fax" value="${prefix}Fax" />
<c:set var="fax" value="${zm:anySet(contact,fax)?fn:escapeXml(contact[fax]):''}" />
<tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="${label}"/></td></tr>
<tr><td width="5">&nbsp;</td>
    <%-- NOTE: Non-standard fmt tag. --%>
    <fmt:getLocale var="locale" />
    <c:choose>
        <c:when test="${locale.language eq 'ja'}">
            <td valign="top" width="100%" class="contactOutput">
                <div>${zip}&#x20;${state}&#x20;${city}</div>
                <div>${street}</div>
                <div>${country}</div>
                <c:if test="${not empty url}">
                    <p><a target=_new href="${urlPrefix}${url}">${url}</a></p>
                </c:if>
            </td>
        </c:when>
        <c:otherwise>
            <td valign="top" width="100%" class="contactOutput">
                <div>${street}</div>
                <div>
                    ${city}<c:if test="${not empty city and not empty state}">,</c:if>&#x20;
                    ${state}&#x20;${zip}
                </div>
                <div>${country}</div>
                <c:if test="${not empty url}">
                    <p><a target=_new href="${urlPrefix}${url}">${url}</a></p>
                </c:if>
            </td>
        </c:otherwise>
    </c:choose>
    <c:if test="${not empty phoneFields}">
        <td valign="top" width="100%">
            <table width="100%" border="0" cellspacing='3'>
                <c:forTokens var="phoneField" varStatus="status" items="${phoneFields}" delims=",; ">
                    <c:set var="phoneLabel" value="AB_FIELD_${phoneField}" />
                    <app:contactPhone label="${phoneLabel}" phone="${phoneField}"/>
                </c:forTokens>
            </table>
        </td>
    </c:if>
</tr>
<tr>
    <td><br></td>
</tr>