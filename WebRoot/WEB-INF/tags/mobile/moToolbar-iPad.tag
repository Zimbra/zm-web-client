<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="app" rtexprvalue="true" required="true" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<c:set var="id" value="${not empty id?id:(empty param.id ? context.currentItem.id : param.id)}"/>
<mo:handleError>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<c:choose>
    <c:when test="${app eq 'contact' || app eq 'ab'}">
        <zm:getContact var="contact" id="${id}"/>
    </c:when>
    <c:when test="${app eq 'message'}">
        <zm:getMessage var="message" id="${id}" markread="true" neuterimages="${empty param.xim}"/>
    </c:when>
    <c:when test="${app eq 'conversation'}">
        
    </c:when>
</c:choose>
</mo:handleError>
<%--This takes care of the toolbar on the right pane, decide the buttons to be displayed depending on the app--%>
<div class="overviewActions toolbar">
        <c:choose>
            <c:when test="${app eq 'contact' || app eq 'ab'}">
                <c:url var="editUrl" value="${closeUrl}">
                    <c:param name="action" value="edit"/>
                    <c:param name="id" value="${contact.id}"/>
                    <c:param name="pid" value="${contact.id}"/>
                    <c:param name="_ajxnoca" value="1"/>
                </c:url>
                <c:url var="addUrl" value="${closeUrl}">
                   <c:param name="action" value="edit"/>
                   <c:param name="pid" value="${contact.id}"/>
                   <c:param name="folderid" value="${context.folder.id}"/>
                </c:url>
                <div class ="compose button"><a id="add" accesskey="${requestScope.mainaction_accesskey}" href="${addUrl}"><span onclick="return zClickLink('add')"><fmt:message key="add"/></span></a></div>
                <div class ="actions">
                    <div class ="right button">
                        <a id="edit" accesskey="${requestScope.mainaction_accesskey}" href="${editUrl}"><span onclick="return zClickLink('edit')"><fmt:message key="edit"/></span></a>
                    </div>
                 </div>
            </c:when>
            <c:when test="${app eq 'message' || app eq 'conversation'}">

                    <div class="folder button"><div>Folders</div></div>

                    <div class="icons button"></div>
                    <div class="icons button"></div>
                    <div class="select button">
                        <div>
                            <select>
                                <option>Move to...</option>
                                <option>Inbox</option>
                                <option>Sent</option>
                                <option>Spam</option>
                                <option>Trash</option>
                                <option>----------------</option>
                                <option>Personal Folder 1</option>
                                <option>Personal Folder 2</option>
                            </select>
                        </div>
                    </div>

            </c:when>
        </c:choose>
</div>

