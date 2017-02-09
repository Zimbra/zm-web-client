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
<%@ attribute name="firstAttachment" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="url" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displayName" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="contentType" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displaySize" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="value" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="name" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<fmt:setBundle basename="/messages/ZhMsg" scope='request' />

<tr class="CompOrigAtt" valign="middle">
    <td align='right'>
        <c:if test="${firstAttachment}">
            <app:img altkey="ALT_ATTACHMENT" src="startup/ImgAttachment.png"/>
            <c:set var="firstAttachment" value="${false}"/>
        </c:if>
    </td>
    <c:set var="pname" value="${displayName}"/>
    <c:if test="${empty displayName}">
        <fmt:message key="unknownContentType" var="displayName">
            <fmt:param value="${contentType}"/>
        </fmt:message>
    </c:if>
    <td>
        <table cellpadding="0" cellspacing="0" border="0">
            <tr valign="middle">
                <td>
                    <input <c:if test="${checked}">checked </c:if>type=checkbox name="${name}" value="${value}">
                </td>
                <td>&nbsp;</td>
                <td>
                    <c:if test="${not zm:isProvOrAttr(pageContext, 'zimbraAttachmentsBlocked')}">
                    <a target="_blank" title="${fn:escapeXml(displayName)}" href="${fn:escapeXml(url)}&amp;disp=i">${zm:truncate(fn:escapeXml(displayName),80,true)}</a>&nbsp;<c:if test="${not empty displaySize}">(${fn:trim(displaySize)})</c:if>
                    </c:if>
                    <c:if test="${zm:isProvOrAttr(pageContext, 'zimbraAttachmentsBlocked')}">
                    ${zm:truncate(fn:escapeXml(displayName),80,true)}&nbsp;<c:if test="${not empty displaySize}">(${fn:trim(displaySize)})</c:if>
                    </c:if>
                </td>
            </tr>
        </table>
    </td>
</tr>
