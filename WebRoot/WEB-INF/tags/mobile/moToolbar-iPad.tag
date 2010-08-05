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

<%@ attribute name="date" rtexprvalue="true" required="false" type="java.util.Calendar"%>
<%@ attribute name="view" rtexprvalue="true" required="false" %>
<%@ attribute name="invId" rtexprvalue="true" required="false" %>
<%@ attribute name="timezone" rtexprvalue="true" required="false" type="java.util.TimeZone"%>

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
<div class="tb tbl"><div class="tr">
        <c:choose>
            <c:when test="${app eq 'contact' || app eq 'ab'}">
                <div class="td toolbar">
                <div class="folder button"><a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=ab&_pv=1"><fmt:message key="addressBooks"/></a></div>
                <c:if test="${top_fldr_select eq '1'}"><select class="_zo_select_button" name="sfi" onchange="document.location.href='?sfi='+this.value+'&amp;st=contact';"><c:set var="count" value="${0}"/>
                    <zm:forEachFolder var="fldr" skiproot="true"><c:if test="${count lt sessionScope.F_LIMIT and fldr.isContactView}"><option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''} value="${fldr.id}">${fn:escapeXml(zm:truncateFixed(zm:getFolderName(pageContext,fldr.id),15,true))}</option><c:set var="count" value="${count+1}"/></c:if></zm:forEachFolder>
                    </select></c:if>

                <div class="icons button"><input type="image" name="actionDelete" src="/zimbra/img/startup/ImgTrash.gif" value="<fmt:message key='delete'/>" onclick="return submitForm(document.getElementById('zForm'),null,this.value);"/></div>
                <div class="select button">
                    <div>
                       <select class="zo_select_button" name="anAction" onchange="return submitForm(document.getElementById('zForm'),null,this.value);">
                           <option value="" selected="selected"><fmt:message key="moveAction"/></option>
                            <optgroup>
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
                           </optgroup>
                       </select>
                    </div>
                </div>
                </div>    
            </c:when>
            <c:when test="${app eq 'message' || app eq 'conversation'}">
                <div class="td toolbar">
                    <div class="folder button">
                            <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=folders&_pv=1"><fmt:message key="folders"/></a> 
                            <!-- &laquo; <c:if test="${top_fldr_select ne '1'}">${fn:escapeXml(zm:truncateFixed(context.shortBackTo,12,true))}</c:if> -->
                    </div>


                    <div class="icons button"><input type="image" name="${not context.folder.isInTrash ? 'actionDelete' : 'actionHardDelete'}" src="/zimbra/img/startup/ImgTrash.gif" value="<fmt:message key='delete'/>" onclick="return submitForm(document.getElementById('zForm'),null,this.value);"/></div>

                    <div class="icons button"><img src="/zimbra/img/startup/ImgRefresh.gif" border="0"/></div>
                    
                    <div class="select button">
                        
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
                                </optgroup>
                                <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
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
            <c:when test="${app eq 'cal' || app eq 'cals'}">
                <fmt:formatDate var="dateDf" value="${date.time}" pattern="yyyyMMdd" timeZone="${timezone}"/>
                <mo:calendarUrl var="dayViewUrl" view="day" date="${dateDf}" _replaceDate="1"/>
                <mo:calendarUrl var="listViewUrl" view="list" date="${dateDf}" _replaceDate="1"/>
                <mo:calendarUrl var="monthViewUrl" view="month" date="${dateDf}" _replaceDate="1"/>

                <c:set var="list">href="${fn:escapeXml(listViewUrl)}"</c:set>
                <c:set var="day">href="${fn:escapeXml(dayViewUrl)}"</c:set>
                <c:set var="month">href="${fn:escapeXml(monthViewUrl)}"</c:set>

                <c:url var='eaction' value="?st=newappt&date=${dateDf}">
                    <c:if test="${empty invId}">
                        <c:param name="_replaceDate" value="1"/>
                    </c:if>
                    <c:if test="${not empty invId}">
                        <c:param name="useInstance" value="0"/>
                        <c:param name="invId" value="${invId}"/>
                        <c:param name="_ajxnoca" value="1"/>
                    </c:if>
                    <c:if test="${not empty param.bt}">
                        <c:param name="bt" value="${param.bt}"/>
                    </c:if>
                </c:url>
                <c:set var="today" value="${zm:getToday(timezone)}"/>
                <mo:calendarUrl view="${view}" var="todayURL" rawdate="${today}" timezone="${timezone}"/>

                <fmt:message key="checkedCalendars" var="checkedInUI"/>
                <div class="td toolbar">
                   <div class="folder button">
                            <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=cals&_pv=1"><fmt:message key="calendar"/></a>
                   </div>
                    <div class="icons button"><img src="/zimbra/img/startup/ImgRefresh.gif" border="0"/></div>
                </div>
                <div class="td toolbar">
                    <div class="folder button">
                        <a accesskey="${requestScope.mainaction_accesskey}" href="${eaction}"><fmt:message key="newAppointment"/></a>
                    </div>
                    <div class="folder button">
                        <a accesskey="${requestScope.navlink_accesskey}" href="${fn:escapeXml(todayURL)}"><fmt:message key="today"/></a>
                    </div>

                    <div class="actions">
                        <div class="actionLeft button" onclick="return zClickLink('cal-list');">
                            <a id="cal-list" ${list} class='prev_button ${view!=null && view=='list'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewListShort"/></a>
                        </div>
                        <div class="actionCenter button" onclick="return zClickLink('cal-day');">
                            <a id="cal-day" ${day} class='next_button ${view!=null && view=='day'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewDayShort"/></a>
                        </div>
                        <div class="actionRight button" onclick="return zClickLink('cal-month');">
                            <a id="cal-month" ${month} class='next_button ${view!=null && view=='month'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewMonthShort"/></a>
                        </div>
                    </div>
                </div>    
            </c:when>
        </c:choose>
</div></div>

