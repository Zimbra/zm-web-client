<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="top" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td nowrap align=right>
            <c:if test="${convSearchResult.hasPrevPage}">
                <zm:currentResultUrl var="prevPageUrl" value=""  action="view2" context="${context}"
                                     cso="${convSearchResult.prevOffset}" css="${param.css}"/>
                <a <c:if test="${keys}"></c:if> href="${prevPageUrl}"><app:img altkey="left" src="startup/ImgLeftArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasPrevPage}">
                <app:img disabled='true' src="startup/ImgLeftArrow.png" border="0"/>
            </c:if>
            <app:searchPageOffset searchResult="${convSearchResult}" max="${convSearchResult.conversationSummary.messageCount}"/>
            <c:if test="${convSearchResult.hasNextPage}">
                <zm:currentResultUrl var="nextPageUrl" value="" action="view2" context="${context}"
                                     cso="${convSearchResult.nextOffset}" css="${param.css}"/>
                <a <c:if test="${keys}"></c:if> href="${nextPageUrl}"><app:img altkey="right" src="startup/ImgRightArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasNextPage}">
                <app:img disabled='true' src="startup/ImgRightArrow.png" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
