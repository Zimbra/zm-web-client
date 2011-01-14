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
<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="print" rtexprvalue="true" required="false" type="java.lang.Boolean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:forEach var="part" items="${message.attachments}" varStatus="partStatus">
<c:if test="${part.isMssage}">
    <div class='ZhAppContent'>
    <zm:getMessage var="partMessage" id="${message.id}" part="${part.partName}"/>
    <app:displayMessage mailbox="${mailbox}" message="${partMessage}" composeUrl="${composeUrl}&part=${part.partName}" hideops="true" counter="${part.partName}"/>
    </div>
</c:if>
</c:forEach>
<c:forEach var="part" items="${message.attachments}">
    <c:if test="${!part.isMssage}">
        <c:set var="pname" value="${part.displayName}"/>
        <c:if test="${empty pname}"><fmt:message key="unknownContentType" var="pname"><fmt:param value="${part.contentType}"/></fmt:message></c:if>

        <c:set var="url" value="/service/home/~/?id=${message.id}&amp;part=${part.partName}&amp;auth=co"/>
        <table cellspacing="8">
            <tr>
                <td>
                    <c:choose>
                    	<c:when test="${part.isImage and print}">
                            <a target="_blank" href="${url}&amp;disp=i">
                                <img class='AttachmentImage' src="${url}" alt="${fn:escapeXml(part.displayName)}" width="120" height="80" border="0"/>
                            </a>
                        </c:when>
                        <c:when test="${part.isImage and not print}">
                            <a target="_blank" href="${url}&amp;disp=i">
                                <img class='AttachmentImage' src="${url}" alt="${fn:escapeXml(part.displayName)}"/>
                            </a>
                        </c:when>
                        <c:otherwise>
                            <app:img src="${part.image}" alt="${fn:escapeXml(part.displayName)}" title="${fn:escapeXml(part.contentType)}"/>
                        </c:otherwise>
                    </c:choose>
                </td>
                <td><b>${fn:escapeXml(pname)}</b><br />
                        ${zm:displaySize(pageContext,part.size)}&nbsp;
                    <c:if test="${not print}">
                    <a target="_blank" href="${url}&amp;disp=i"><fmt:message key="view"/></a>&nbsp;
                    <c:if test="${mailbox.features.viewInHtml and part.isViewAsHtmlTarget}">
                        <a target="_blank" href="${url}&amp;view=html"><fmt:message key="viewAsHtml"/></a>
                        &nbsp;
                    </c:if>
                    <a href="${url}&amp;disp=a"><fmt:message key="download"/></a>
                    </c:if>    
                </td>
            </tr>
        </table>
    </c:if>
</c:forEach>

<c:if test="${message.numberOfAttachments gt 1 and not print}">
    <c:set var="url" value="/service/home/~/?id=${message.id}&part=${message.attachmentIds}&amp;auth=co&amp;disp=a&amp;fmt=zip"/>
    <table cellspacing="8">
        <tr>
            <td>
                <app:img src="zimbra/ImgZipDoc.png" alt="zip" title="zip"/>
            </td>
            <td>
                <a href="${url}"><fmt:message key="downloadAllAttachments"/></a>
            </td>
        </tr>
    </table>
</c:if>