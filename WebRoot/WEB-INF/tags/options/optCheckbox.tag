<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="bundle" rtexprvalue="true" required="false" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" %>
<%@ attribute name="boxfirst" rtexprvalue="true" required="false" %>
<%@ attribute name="trailingcolon" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:if test="${bundle}">
    <fmt:setBundle basename="/messages/I18nMsg" var="i18n"/>
</c:if>

<c:choose>
    <c:when test="${boxfirst}">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
                <td style='padding-left:5px' nowrap align=right><label for="${pref}"><fmt:message key="${label}" bundle="${not empty bundle ? i18n : ''}" /><c:if test="${trailingcolon}">:</c:if> </label></td>
            </tr>
        </table>
    </c:when>
    <c:otherwise>
        <tr>
            <td class="ZOptionsTableLabel" style="width:30%;" nowrap align=right><label for="${pref}"><fmt:message key="${label}" bundle="${not empty bundle ? i18n : ''}"/> :</label></td>
            <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
        </tr>
    </c:otherwise>
</c:choose>
