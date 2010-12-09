<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
