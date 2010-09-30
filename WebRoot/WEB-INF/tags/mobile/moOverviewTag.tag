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
<%@ attribute name="tag" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZTagBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ attribute name="skiptypes" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<c:set var="types" value="${not empty types ? types : not empty param.st ? param.st : ''}"/>
<div onclick='return zClickLink("TAG${tag.id}")' class='Folders ${param.tid eq tag.id ? 'StatusWarning' : ''} list-row${tag.hasUnread ? '-unread' : ''}'>
    <div class="tbl">
        <div class="tr">
    <c:choose>
        <c:when test="${calendars}">
            <mo:calendarUrl var="url" sq='tag:"${tag.name}"'/>
        </c:when>
        <c:otherwise>
            <c:url value="${context_url}" var="url">
                <c:param name="sti" value="${tag.id}"/>
                <c:if test="${not empty types && !skiptypes}"><c:param name='st' value='${types}'/></c:if>
            </c:url>
        </c:otherwise>
    </c:choose>
    <span class="td left">
        <a id="TAG${tag.id}" href="${fn:escapeXml(url)}">
            <c:if test="${ua.isiPad eq false}"><span class="SmlIcnHldr Tag${tag.color}"></span></c:if>&nbsp;
            ${fn:escapeXml(tag.name)}
            <c:if test="${tag.hasUnread}"> (${tag.unreadCount}) </c:if>
        </a>
    </span>
        <span class="td right editFix" width="5%"> <a class="SmlIcnHldr Edit"
                        href="?st=${param.st}&_ajxnoca=1&showTagCreate=1&tid=${tag.id}">&nbsp;</a></span>            
    </div>
    </div>        
</div>
 
