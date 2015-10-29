<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
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
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="types" rtexprvalue="true" required="false"%>       
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderPath(pageContext, folder.id)}"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<div <c:if test="${!ua.isIE}">onclick='return zClickLink("FLDR${folder.id}")'</c:if> class='Folders ${param.sid eq folder.id ? 'StatusWarning' : ''} list-row${folder.hasUnread ? "-unread" : ""}'>
    <div class="tbl">
    <div class="tr"><c:set var="url" value="${context_url}?sfi=${folder.id}"/><c:if test="${not empty types}"><c:set var="url" value="${url}&st=${types}"/></c:if>
    <span class="td left">
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}"><c:if test="${ua.isiPad eq false}"><span class="Img Img${folder.type}"></span></c:if>&nbsp;${label}</a>
    </span>
    <c:if test="${!folder.isSystemFolder}"><span class="td right editFix" width="5%"> <a class="Img ImgEdit" href="?st=${param.st}&_ajxnoca=1&show${folder.isSearchFolder ? 'Search' : 'Folder'}Create=1&${folder.isSearchFolder ? 's' : ''}id=${folder.id}">&nbsp;</a></span></c:if>
    </div>
    </div>    
</div>
