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
                            <a href="${fn:escapeXml(url)}&amp;disp=a"><b>${fn:escapeXml(pname)}</b></a> (${zm:displaySize(pageContext,part.size)})
                        </span>
                        <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                            <span>
                                <a target="_blank" href="${fn:escapeXml(url)}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
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
                <option value="${folder.id}">${fn:escapeXml(zm:getFolderPath(pageContext,folder.id))}</option><c:set var="count" value="${count+1}"/>
                        </c:if>
                </zm:forEachFolder>
            </select>
    <input type="submit" class="zo_button" name="actionSaveDocs" value="<fmt:message key="add"/>">
    </span>    
    </div></div>
</c:if>
</div>