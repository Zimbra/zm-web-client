<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="prefix" rtexprvalue="true" required="true" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="phoneFields" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:set var="label" value="${empty label ? prefix : label}" />
<%-- NOTE: Not allowed to reference a field like contact[prefix+"URL"]. Oh well. --%>
<c:set var="url" value="${prefix}URL" />
<c:set var="url" value="${zm:anySet(contact,url)?fn:escapeXml(contact[url]):''}" />
<c:if test="${not empty url}">
    <c:url var="urlPrefix" value="${fn:contains(url,'//')?'':'http://'}" />
</c:if>
<tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="${label}"/></td></tr>
<tr><td width="5">&nbsp;</td>
    <td valign="top" width="100%" class="contactOutput">
        <app:contactAddress contact="${contact}" prefix="${prefix}" />
        <c:if test="${not empty url}">
            <p><a target=_new href="${urlPrefix}${url}">${url}</a></p>
        </c:if>
    </td>
    <c:if test="${not empty phoneFields}">
        <td valign="top" width="100%">
            <table width="100%" border="0" cellspacing='3'>
                <c:set var="contactAttrs" value="${contact.attrs}"/>
                <c:forTokens var="phoneField" varStatus="status" items="${phoneFields}" delims=",; ">
                    <c:set var="phoneLabel" value="AB_FIELD_${phoneField}"/>
                    <app:contactPhone label="${phoneLabel}" phone="${contactAttrs[phoneField]}"/>
                </c:forTokens>
            </table>
        </td>
    </c:if>
</tr>
<tr>
    <td><br></td>
</tr>