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
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="body" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMimePartBean" %>
<%@ attribute name="theBody" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="isPrintView" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:choose>
    <c:when test="${zm:boolean(body.isTextHtml)}">
        <c:url var="iframeUrl" value="/h/imessage">
            <c:param name="id" value="${message.id}"/>
            <c:param name="part" value="${message.partName}"/>
            <c:param name="bodypart" value="${body.partName}"/>
            <c:param name="xim" value="${param.xim}"/>
        </c:url>

        <c:forEach var="part" items="${message.attachments}">
           <c:set var="cid" value="${fn:replace(part.contentId,'<' ,'')}"/>
           <c:set var="cid" value="cid:${fn:replace(cid,'>' ,'')}"/>
           <c:set var="imageUrl" value="/service/home/~/?id=${message.id}&amp;part=${part.partName}&amp;auth=co"/>
           <c:set var="theBody" value="${fn:replace(theBody,cid,imageUrl)}"/>
        </c:forEach>
        <c:choose>
            <c:when test="${zm:boolean(isPrintView)}">
                <%-- Render inline for printview bug #34780 --%>
                <div id="iframeBody${counter}" class="MsgBody-html">
                ${theBody}
                </div>
            </c:when>
            <c:otherwise>
                <app:messageIframe theBody="${theBody}" parentId="iframeBody${counter}" iframeUrl="${iframeUrl}"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>
        ${theBody}
    </c:otherwise>
</c:choose>
