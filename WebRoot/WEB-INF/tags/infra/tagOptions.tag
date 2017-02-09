<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionAddTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPTAG${tag.id}"</c:if> value="t:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionRemoveTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPUNTAG${tag.id}"</c:if> value="u:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option value="u:all" /><fmt:message key ="all"/>
</c:if>
