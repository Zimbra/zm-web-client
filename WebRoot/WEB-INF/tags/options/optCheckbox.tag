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
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="bundle" rtexprvalue="true" required="false" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" %>
<%@ attribute name="boxfirst" rtexprvalue="true" required="false" %>
<%@ attribute name="trailingcolon" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${zm:boolean(bundle)}">
    <fmt:setBundle basename="/messages/I18nMsg" var="i18n"/>
</c:if>

<c:choose>
    <c:when test="${zm:boolean(boxfirst)}">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
                <td style='padding-left:5px' nowrap align=right><label for="${pref}"><fmt:message key="${label}" bundle="${not empty bundle ? i18n : ''}" /><c:if test="${zm:boolean(trailingcolon)}">:</c:if> </label></td>
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
