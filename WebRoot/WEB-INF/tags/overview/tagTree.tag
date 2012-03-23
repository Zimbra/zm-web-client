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
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<app:handleError>    
    <zm:getMailbox var="mailbox"/>
    <jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
    <c:choose>
        <c:when test="${empty sessionScope.expanded.tags}">
            <c:set var="expanded" value="${mailbox.prefs.tagTreeOpen}"/>
        </c:when>
        <c:otherwise>
            <c:set var="expanded" value="${sessionScope.expanded.tags ne 'collapse'}"/>
        </c:otherwise>
    </c:choose>
    <c:if test="${expanded}">
         <zm:modifyPrefs var="updated">
            <zm:pref name="zimbraPrefTagTreeOpen" value="TRUE"/>
         </zm:modifyPrefs>
    </c:if>
    <c:if test="${not expanded}">
         <zm:modifyPrefs var="updated">
            <zm:pref name="zimbraPrefTagTreeOpen" value="FALSE"/>
         </zm:modifyPrefs>
    </c:if>
    <c:if test="${updated}">
        <zm:getMailbox var="mailbox" refreshaccount="${true}"/>
    </c:if>
</app:handleError>

<div class="TagTree Tree">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <c:url value="/h/mtags" var="mtagsUrl">
            <c:if test="${not empty param.sti}">
                <c:param name="sti" value="${param.sti}"/>
            </c:if>
        </c:url>
	    <c:set var="url" value="${calendars ? '/h/calendar' : '/h/search' }"  />  
        <tr>
            <c:url var="toggleUrl" value="${url}">
                <c:param name="${mailbox.prefs.tagTreeOpen ? 'collapse' : 'expand'}" value="tags"/>
                <c:if test="${not empty param.st}"><c:param name="st" value="${param.st}"/></c:if>
            </c:url>
            <th style="width:20px"><a href="${fn:escapeXml(toggleUrl)}"><app:img src="${mailbox.prefs.tagTreeOpen ? 'startup/ImgNodeExpanded.png' : 'startup/ImgNodeCollapsed.png'}" altkey="${mailbox.prefs.tagTreeOpen ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}"/></a></th>
            <th class="Header" nowrap="nowrap" width="99%"> <fmt:message key="tags"/></th>
            
            <th nowrap="nowrap" align="right" class="ZhTreeEdit">
                <a id="MTAGS" href="${fn:escapeXml(mtagsUrl)}"><fmt:message key="TREE_EDIT"/> </a>
            </th>
        </tr>
        <c:if test="${mailbox.prefs.tagTreeOpen}">
            <zm:forEachTag var="tag">
                <app:overviewTag calendars="${calendars}" tag="${tag}"/>
            </zm:forEachTag>
        </c:if>
    </table>
</div>
