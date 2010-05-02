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
<div class="tb tbl"><div class="tr"><div class="td toolbar">
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

                    <!--div class="icons button" onclick="return submitForm(document.getElementById('zForm'),null,'actionDelete');">
                        <c:choose><c:when test="${not context.folder.isInTrash}"><input type="submit" name="actionDelete" value=<fmt:message key='delete'/></c:when>
                            <c:otherwise><option value="actionHardDelete"><fmt:message key="delete"/></option></c:otherwise>
                        </c:choose>
                    </div-->
                    <div class="icons button"></div>
                    <div class="select button">
                        <div>
                            <select class="zo_select_button" name="anAction" onchange="return submitForm(document.getElementById('zForm'),null,this.value);">
                                <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                                <optgroup label="<fmt:message key='select'/>">
                                    <option value="selectAll"><fmt:message key="all"/></option>
                                    <option value="selectNone"><fmt:message key="none"/></option>
                                </optgroup><c:choose><c:when test="${context.isConversationSearch || context.isMessageSearch}">
                                <optgroup label="<fmt:message key="markAs"/>">
                                    <option value="actionMarkRead"><fmt:message key="MO_read"/></option>
                                    <option value="actionMarkUnread"><fmt:message key="MO_unread"/></option><c:choose>
                                    <c:when test="${context.folder.isSpam}"><option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option></c:when>
                                    <c:otherwise><option value="actionMarkSpam"><fmt:message key="actionSpam"/></option></c:otherwise></c:choose>
                                </optgroup></c:when><c:when test="${context.isContactSearch}">
                                <optgroup label="<fmt:message key="compose"/>">
                                    <option value="composeTo"><fmt:message key="to"/></option>
                                    <option value="composeCC"><fmt:message key="cc"/></option>
                                    <option value="composeBCC"><fmt:message key="bcc"/></option>
                                </optgroup></c:when></c:choose>
                                <optgroup label="<fmt:message key="MO_flag"/>">
                                    <option value="actionFlag"><fmt:message key="add"/></option>
                                    <option value="actionUnflag"><fmt:message key="remove"/></option>
                                </optgroup>
                                <optgroup label="<fmt:message key="moveAction"/>">
                                    <c:choose>
                                        <c:when test="${context.isContactSearch}"><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="folder">
                                                <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isContactMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${zm:getFolderPath(pageContext, folder.id)}</option><c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>
                                        </c:when>
                                        <c:otherwise><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="folder">
                                                <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${zm:getFolderPath(pageContext, folder.id)}</option><c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>
                                        </c:otherwise>
                                    </c:choose>
                                </optgroup><c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                                <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
                                <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                                    <c:forEach var="atag" items="${allTags}"><option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option></c:forEach>
                                </optgroup>
                                <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                                    <c:forEach var="atag" items="${allTags}"><option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option></c:forEach>
                                </optgroup>
                            </c:if>
                            </select>
                        </div>
                    </div>

            </c:when>
        </c:choose>
</div></div></div>

