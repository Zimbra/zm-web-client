<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ attribute name="field" rtexprvalue="true" required="true" %>
<%@ attribute name="tabindex" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:if test="${empty label}">
    <c:set var="label" value="AB_FIELD_${field}" />
</c:if>
<fmt:message var="label" key="${label}" />
<c:set var="value" value="${not empty contact ? contact.attrs[field] : ''}"/>
<td valign="${address ? 'top' : 'middle'}" class="editContactLabel">
    <%-- TODO: The colon should be part of the message text!!! --%>
    <label for="${field}">${fn:escapeXml(label)}:</label>
</td>
<td>
    <c:set var="splitURI" value="${fn:split(value, '/')}"/>
    <c:set var="imDisplayValue" value="${splitURI[fn:length(splitURI)-1]}"/>
    <input name='${field}' id='${field}' type='text' autocomplete='off' size='35' value="${imDisplayValue}" tabindex="${tabindex}">
    <c:set var="selectedIM" value="${empty contact? 'xmpp' : fn:substring(value,0,fn:indexOf(value,':'))}"/>
    <span>
    <select name="${field}_type">
        <option <c:if test="${selectedIM eq 'xmpp'}">selected</c:if> value="xmpp"><fmt:message key="AB_FIELD_IM_xmpp"/></option>
        <option <c:if test="${selectedIM eq 'yahoo'}">selected</c:if> value="yahoo"><fmt:message key="AB_FIELD_IM_yahoo"/></option>
        <option <c:if test="${selectedIM eq 'aol'}">selected</c:if> value="aol"><fmt:message key="AB_FIELD_IM_aol"/></option>
        <option <c:if test="${selectedIM eq 'msn'}">selected</c:if> value="msn"><fmt:message key="AB_FIELD_IM_msn"/></option>
        <option <c:if test="${selectedIM eq 'im'}">selected</c:if> value="im"><fmt:message key="AB_FIELD_IM_other"/></option>
    </select>
    </span>
</td>
