<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="firstAttachment" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="url" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displayName" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="contentType" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displaySize" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="value" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="name" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="index" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<fmt:setBundle basename="/messages/ZhMsg" scope='request' />
<div class="CompOrigAtt tbl">
    <div class="tr ${! empty index and index gt 0 ? 'nr' : ''}">
        <c:set var="pname" value="${displayName}"/>
        <c:if test="${empty displayName}">
            <fmt:message key="unknownContentType" var="displayName">
                <fmt:param value="${contentType}"/>
            </fmt:message>
        </c:if>
        <span class="td">
            <%--<mo:img altkey="ALT_ATTACHMENT" src="startup/ImgAttachment.png"/>--%>
            <span class="Img ImgAttachment">&nbsp;</span>
            <input <c:if test="${checked}">checked </c:if>type=checkbox name="${name}" value="${value}">
            <c:choose>
            <c:when test="${zm:isProvOrAttr(pageContext, 'zimbraAttachmentsBlocked')}">
	            ${fn:escapeXml(displayName)}&nbsp;<c:if test="${displaySize}">(${displaySize})</c:if>
			</c:when>
			<c:otherwise>
                <a target="_blank" href="${fn:escapeXml(url)}&amp;disp=i">${fn:escapeXml(displayName)}</a>&nbsp;<c:if test="${displaySize}">(${displaySize})</c:if>
            </c:otherwise>
            </c:choose>
        </span>
        </div>
</div>
