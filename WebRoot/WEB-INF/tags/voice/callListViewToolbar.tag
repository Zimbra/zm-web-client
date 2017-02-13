<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width=100% cellspacing=0 cellpadding=0 class='Tb'>
    <tr valign="middle">
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <td nowrap>
                    <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                    <a href="${refreshUrl}"><c:if test="${keys}"></c:if><app:img src="startup/ImgRefresh.png" altkey="getCalls"/><span><fmt:message key="getCalls"/></span></a>
                </td>
                <td><div class='vertSep'></div></td>
                <td nowrap>
					<c:choose>
						<c:when test="${context.searchResult.size > 0}">
							<zm:currentResultUrl var="refreshUrl" value="/h/printcalls" context="${context}" refresh="true" />
							<a id="OPPRINT" target="_blank" href="${refreshUrl}"><app:img src="startup/ImgPrint.png" altkey="actionPrint"/></a>
						</c:when>
						<c:otherwise>
							<%-- Empty <a> to pick up styles... --%>
							<a><app:img src="startup/ImgPrint.png" altkey="actionPrint" clazz="ImgDisabled"/></a>
						</c:otherwise>
					</c:choose>
                </td>
                <%--<td><div class='vertSep'></div></td>
                <td nowrap>
                    <c:url var="optionsUrl" value="/h/options">
                        <c:param name="selected" value="voice"/>
                        <c:param name="phone" value="${zm:getPhoneFromVoiceQuery(context.query)}"/>
                    </c:url>
                    <a id="OPCALLMANAGER" href="${optionsUrl}"><app:img src="voicemail/ImgCallManager.png" altkey="callManager"/><span><fmt:message key="actionCallManager"/></span></a>
                </td>--%>
            </table>
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
