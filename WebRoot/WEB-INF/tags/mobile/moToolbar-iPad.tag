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
<div class="tb tbl">
        <c:choose>
            <c:when test="${app eq 'contact' || app eq 'ab'}">
                <div class="tr">
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
                </div>    
            </c:when>
            <c:when test="${app eq 'message' || app eq 'conversation'}">
                <div class="tr">
                <div class="td toolbar">
                    <div class="folder button">
                            <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=folders&_pv=1"><fmt:message key="folders"/></a> 
                            <!-- &laquo; <c:if test="${top_fldr_select ne '1'}">${fn:escapeXml(zm:truncateFixed(context.shortBackTo,12,true))}</c:if> -->
                    </div>


                    <!-- div class="icons button"><input type="image" name="${not context.folder.isInTrash ? 'actionDelete' : 'actionHardDelete'}" src="/zimbra/img/startup/ImgTrash.gif" value="<fmt:message key='delete'/>" onclick="return submitForm(document.getElementById('zForm'),null,this.value);"/></div -->

                    <!-- div class="icons button"><img src="/zimbra/img/startup/ImgRefresh.gif" border="0"/></div -->
                    
                    <div class="select button" onclick="toggle">
                   		<a>Actions</a> 
                    <div class="menu">
                         <span class="arrowBox"><span class="arrowHead">&#9650;</span></span>
                        <button type="submit" name="anAction" value="actionMarkRead" class="menuButton"><fmt:message key="MO_read"/></button>
                        
                        <button type="submit" name="anAction" value="actionMarkUnread" class="menuButton"><fmt:message key="MO_unread"/></button>
                        
                        <c:choose>
                            <c:when test="${context.folder.isSpam}"><button type="submit" name="anAction" value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></button></c:when>
                            <c:otherwise><button type="submit" name="anAction" value="actionMarkSpam" class="menuButton"><fmt:message key="actionSpam"/></button></c:otherwise>
                        </c:choose>
                        
                        <button type="submit" name="anAction" value="${not context.folder.isInTrash ? 'actionDelete' : 'actionHardDelete'}" class="menuButton"><fmt:message key='delete'/></button>
                    
                    </div>
                    </div>
                    
                </div>
                </div>
                <div class="tr">
                  <div class="td searchBar">  
                      <div>

                          <c:set var="userQuota" value="0"/>
                          <c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
                          <c:catch>
                              <fmt:message var="unlimited" key="unlimited"/>
                              <fmt:message key="quotaUsage" var="quotaUsage">
                                  <fmt:param value="${zm:displaySizeFractions(pageContext, mailbox.size,2)}"/>
                                  <fmt:param value="${max==0 ? unlimited : zm:displaySizeFractions(pageContext, max,2)}"/>
                              </fmt:message>
                          </c:catch>
                          
                        <div class="quota">
				            ${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)} (${quotaUsage})
			            </div>
                        <form method="post" accept-charset="UTF-8" action="${context_url}" onsubmit="if(!this.sq.value){showLoadingMsg('<fmt:message key="actionNoSearchQuerySpecified"/>',true,'Warning',1000);return false;}else{return submitForm(this);}">
                            <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
                            <input type="hidden" name="st" id="st" value="${empty param.st? mailbox.prefs.groupMailBy : (param.st eq 'cal' ? 'appointment' : zm:cook(param.st))}"/>
                            <input type="hidden" name="search" value="1"/>
                            <span class="search"><input type="search" id="sq" name="sq" placeholder="Search..." onclick="this.value=''"></span>
                        </form>
                      </div>
                  </div>    
                </div>
            </c:when>
            <c:when test="${app eq 'cal' || app eq 'cals'}">
                <div class="tr">
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

                <c:choose>
                    <c:when test="${view eq 'appt'}">
                        <div class="composeToolbar">
                            <div class="compose button"><span><a accesskey="${requestScope.mainaction_accesskey}" href="${eaction}&action=popup" class='zo_button'><fmt:message key="${empty invId ? 'add' : 'edit'}"/></a></span></div>
                            <div class="buttonRight button" onclick="return toggleCompose('compose-pop','veil');"><span><fmt:message key="close"/></span></div>
                        </div>
                    </c:when>
                <c:otherwise>
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
                               <a id="cal-day" ${day} class='next_button ${view!=null && view=='day'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewDayShort"/></a>
                            </div>
                            <div class="actionCenter button" onclick="return zClickLink('cal-day');">
                               <a id="cal-month" ${month} class='next_button ${view!=null && view=='month'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewMonthShort"/></a>
                            </div>
                            <div class="actionRight button" onclick="return zClickLink('cal-month');">
                               <a id="cal-list" ${list} class='prev_button ${view!=null && view=='list'?'zo_button_disabled':'zo_button'}'><fmt:message key="calViewListShort"/></a>
                            </div>
                        </div>
                    </div>
                </c:otherwise>
                </c:choose>
                </div>    
            </c:when>
        </c:choose>
</div>

