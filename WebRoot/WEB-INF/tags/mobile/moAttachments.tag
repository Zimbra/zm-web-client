<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>

<div>
<c:forEach var="part" items="${message.attachments}" varStatus="partStatus">
<c:if test="${part.isMssage}">

    <div>
        <span>
            <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
            <mo:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}" counter="${partStatus.count}"/>
        </span>
    </div>
</c:if>
</c:forEach>
<c:set var="count" value="0"/>    
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="count" value="${count+1}"/>
        <c:set var="pname" value="${part.displayName}"/>
        <c:set var="partId" value="${part.partName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>
        <c:set var="url" value="/service/home/~/?id=${message.id}&part=${partId}&auth=co"/>
        <div>
            <span>
                <div>
                    <div>
                        <span>
                            <c:if test="${mailbox.features.briefcases && ua.isiPad eq false}"><input type="checkbox" name="attachIds" value="${fn:escapeXml(partId)}"/></c:if> <mo:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}"/>
                        </span>
                        <span>
                        <c:choose>
                            <c:when test="${zm:isProvOrAttr(pageContext, 'zimbraAttachmentsBlocked')}">
                                <b>${fn:escapeXml(pname)}</b>(${zm:displaySize(pageContext,part.size)})
                            </c:when>
                            <c:otherwise>
                                <%-- bug: 72600 -- target="_blank" needed for iOS 5.1 to preserve session. Keeping this behavior consistent for all platforms --%>
                                <a href="${fn:escapeXml(url)}&amp;disp=a"><b>${fn:escapeXml(pname)}</b></a> (${zm:displaySize(pageContext,part.size)})
                            </c:otherwise>
                            </c:choose>
                        </span>
                        <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                            <span>
                                <a href="${fn:escapeXml(url)}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
                            </span>
                        </c:if>
                    </div>
                </div>
            </span>
        </div>
    </c:if>
</c:forEach>
<c:if test="${count gt 0 && mailbox.features.briefcases && ua.isiPad eq false}">
    <hr size="1"/>
    <input type="hidden" name="mid" value="${message.id}">
    <div class="tbl" width="100%"><div class="tr">
    <span class="td aleft">Add to
    </span>
    <span class="aright td">
        <select name="briefcase" style="width:65%;">
                <option value="">Select briefcase</option>
                <c:set var="count" value="0"/>
                <zm:forEachFolder var="folder" skiproot="${false}" skipsystem="${false}" skiptrash="${true}">
                        <c:if test="${folder.isDocumentView and count lt sessionScope.F_LIMIT}">
                <option value="${folder.id}">${zm:getFolderPath(pageContext,folder.id)}</option><c:set var="count" value="${count+1}"/>
                        </c:if>
                </zm:forEachFolder>
            </select>
    <input type="submit" class="zo_button" name="actionSaveDocs" value="<fmt:message key="add"/>">
    </span>    
    </div></div>
</c:if>
</div>