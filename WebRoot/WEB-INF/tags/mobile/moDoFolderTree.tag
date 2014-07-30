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
<%@ tag body-content="empty" %>
<%@ attribute name="parentid" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="skiproot" rtexprvalue="true" required="true" %>
<%@ attribute name="skipsystem" rtexprvalue="true" required="true" %>
<%@ attribute name="skiptopsearch" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="context_url" value="${requestScope.baseURL!=null ? requestScope.baseURL : 'zmain'}"/><c:set var="count" value="${0}"/>
<zm:forEachFolder var="folder" skiproot="${zm:boolean(skiproot)}" parentid="${parentid}"
                  skipsystem="${zm:boolean(skipsystem)}"
                  skiptopsearch="${zm:boolean(skiptopsearch)}">
    <c:if test="${count lt sessionScope.F_LIMIT and !folder.isSystemFolder and (folder.isNullView or folder.isUnknownView or folder.isMessageView or folder.isConversationView)}">
        <c:if test="${!folder.isSearchFolder}">
            <mo:overviewFolder base="${context_url}" folder="${folder}" types="${folder.types}"/>
        </c:if>
        <c:if test="${folder.isSearchFolder and folder.depth gt 0}">
            <mo:overviewSearchFolder folder="${folder}"/>
        </c:if>
        <c:set var="count" value="${count+1}"/>
    </c:if>
</zm:forEachFolder>
