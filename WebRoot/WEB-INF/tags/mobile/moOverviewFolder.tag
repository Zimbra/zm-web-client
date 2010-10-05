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
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>                                                
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderPath(pageContext, folder.id)}"/>
<c:choose>
    <c:when test="${ua.isiPad == true}">
        <c:set var="baseUrl" value="zipad"/>
    </c:when>
    <c:otherwise>
        <c:set var="baseUrl" value="zmain"/>
    </c:otherwise>
</c:choose>
<c:url var="url" value="${empty base ? baseUrl  : base}">
    <c:param name="sfi" value="${folder.id}"/>
    <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
    <c:if test="${empty types}"><c:param name="st" value="${folder.isMessageView ? 'message' : folder.isConversationView ? 'conversation' : 'message'}"/></c:if>
</c:url>
<div class='Folders ${param.id eq folder.id ? 'StatusWarning' : ''} list-row${folder.hasUnread ? '-unread' : ''}'
     <c:if test="${types ne 'cal' && !ua.isIE}">onclick='return zClickLink("FLDR${folder.id}")'</c:if>>
    <div class="tbl">
    <div class="tr">
    <c:if test="${types eq 'cal'}">
    <span class="${folder.styleColor}Bg td left" width="1%">
    <input type="checkbox" onchange="fetchIt('?${folder.isCheckedInUI ? 'un' : ''}check=${folder.id}&st=cals&_ajxnoca=1',GC(),'POST');"
           value="${folder.id}" name="calid" ${folder.isCheckedInUI ? 'checked=checked':''}>
    </span>
    </c:if>
    <span class='td left' onclick='return zClickLink("FLDR${folder.id}")' width="94%">
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}">
            <c:if test="${ua.isiPad eq false}"><span class="SmlIcnHldr Fldr${folder.type}">&nbsp;</span></c:if>
            <c:choose>
                <c:when test="${folder.hasUnread}">
                    <c:set var="folderName" value="${label} (${folder.unreadCount})"/>
                </c:when>
                <c:otherwise>
                    <c:set var="folderName" value="${label}"/>
                </c:otherwise>
            </c:choose>
            ${fn:escapeXml(zm:truncateFixed(folderName,24,true))}
        </a>
    </span>
    <c:if test="${!folder.isSystemFolder}">
        <c:choose>
            <c:when test="${folder.isSearchFolder}">
                <c:set var="what" value="Search"/>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${param.st eq 'folders'}">
                        <c:set var="what" value="Folder"/>
                    </c:when>
                    <c:when test="${param.st eq 'ab'}">
                        <c:set var="what" value="AB"/>
                    </c:when>
                    <c:when test="${param.st eq 'cals'}">
                        <c:set var="what" value="Cal"/>
                    </c:when>
                    <c:when test="${param.st eq 'notebooks'}">
                        <c:set var="what" value="NB"/>
                    </c:when>
                    <c:when test="${param.st eq 'briefcases'}">
                        <c:set var="what" value="BC"/>
                    </c:when>
                    <c:when test="${param.st eq 'tasks'}">
                        <c:set var="what" value="Task"/>
                    </c:when>
                </c:choose>
            </c:otherwise>
        </c:choose>
        <span class="td right editFix" width="5%"><a class="SmlIcnHldr Edit" href="?st=${param.st}&_ajxnoca=1&show${what}Create=1&${folder.isSearchFolder ? 's' : ''}id=${folder.id}">&nbsp;</a></span>
    </c:if>
        </div>
    </div>
</div>
