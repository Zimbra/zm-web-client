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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %><%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="top_stb" value="${param.top_stb eq '0' ? '0' : (empty sessionScope.top_stb ? '1' : sessionScope.top_stb)}"/>
<c:set var="btm_stb" value="${param.btm_stb eq '0' ? '0' : (empty sessionScope.btm_stb ? '1' : sessionScope.btm_stb)}"/>

<c:set var="top_tb" value="${param.top_tb eq '0' ? '0' : (empty sessionScope.top_tb ? '1' : sessionScope.top_tb)}"/>
<c:set var="btm_tb" value="${param.btm_tb eq '0' ? '0' : (empty sessionScope.btm_tb ? '1' : sessionScope.btm_tb)}"/>

<c:set var="top_fldr_select" value="${param.top_fldr_select eq '1' ? '1' : (empty sessionScope.top_fldr_select ? '0' : sessionScope.top_fldr_select)}"/> <%-- Default disabled--%>
<c:set var="btm_fldr_select" value="${param.btm_fldr_select eq '0' ? '0' : (empty sessionScope.btm_fldr_select ? '1' : sessionScope.btm_fldr_select)}"/> <%-- Default enabled--%>
<%--<c:if test="${not empty requestScope.statusMessage && isTop}"> --%><%-- For search query errors --%><%--
    <div class="${requestScope.statusClass}">${fn:escapeXml(requestScope.statusMessage)} </div>
</c:if>--%>
<c:if test="${isTop && '1' eq  top_stb}">
    <div class="stb tbl top_${context.isContactSearch ? 'cont' : (context.isMessageSearch ? 'mesg' : 'conv') }_lv_subtoolbar">
        <div class="tr">
            <div class="td">
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=tasks"><fmt:message
                                key="tasks"/></a> &laquo;
                        <c:if test="${top_fldr_select ne '1'}">
                                ${fn:escapeXml(zm:truncateFixed(context.shortBackTo,12,true))}
                        </c:if>
                        <c:if test="${top_fldr_select eq '1'}">
                        <select class="_zo_select_button" name="sfi"
                                onchange="document.location.href='?sfi='+this.value+'&amp;st=task';"><c:set var="count" value="${0}"/>
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${count lt sessionScope.F_LIMIT and fldr.isTaskView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(zm:truncateFixed(zm:getFolderName(pageContext,fldr.id),15,true))}
                                    </option>
                                <c:set var="count" value="${count+1}"/></c:if>
                            </zm:forEachFolder>
                        </select>
                        </c:if>

                <c:if test="${not empty param.sq && context.searchResult.size > 0}">
                &laquo; <a href="?saveSearch=1&sq=${param.sq}&search=0"  onclick='toggleElem("searchbar",this); return toggleElem("savesearchbar",this);'><fmt:message key="saveSearch"/></a>
                </c:if>    
            </div>
        </div>
    </div>
</c:if>
<c:if test="${((isTop && '1' eq  top_tb ) || (!isTop && '1' eq btm_tb))}">
<div class="tb tbl">
<div class="tr">
<span class="td">
<span class="zo_button_group">
<c:choose>
    <c:when test="${context.searchResult.hasPrevPage}">
        <zm:prevResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
        <a accesskey="${requestScope.prev_accesskey}" href="${fn:escapeXml(url)}" class='zo_button prev_button'>
            <fmt:message key="MO_PREV"/>
        </a>
    </c:when>
    <c:otherwise>
        <a class='zo_button_disabled prev_button'>
            <fmt:message key="MO_PREV"/>
        </a>
    </c:otherwise>
</c:choose>
<c:choose>
    <c:when test="${context.searchResult.hasNextPage}">
        <zm:nextResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
        <a accesskey="${requestScope.next_accesskey}" class='zo_button next_button' href="${fn:escapeXml(url)}">
           <fmt:message key="MO_NEXT"/>
        </a>
    </c:when>
    <c:otherwise>
        <a class='zo_button_disabled next_button'>
           <fmt:message key="MO_NEXT"/>
        </a>
    </c:otherwise>
</c:choose>
</span>
<c:if test="${context.searchResult.size gt 0}">
    <span>
        <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'),null,this.value)">
            <option value="" selected="selected"><fmt:message key="moreActions"/></option>
            <c:choose>
                <c:when test="${not context.folder.isInTrash}">
                    <option value="actionDelete"><fmt:message key="delete"/></option>
                </c:when>
                <c:otherwise>
                    <option value="actionHardDelete"><fmt:message key="delete"/></option>
                </c:otherwise>
            </c:choose>
            <optgroup label="<fmt:message key='select'/>">
                <option value="selectAll"><fmt:message key="all"/></option>
                <option value="selectNone"><fmt:message key="none"/></option>
            </optgroup>
            <%--At present, change of task status can only be done by editing the task(same as lite and ajax client)--%>
            <%--<optgroup label="<fmt:message key='markAs'/>">--%>
                <%--<option value="TASK_COMP"><fmt:message key="TASK_COMP"/></option>--%>
                <%--<option value="TASK_WAITING"><fmt:message key="TASK_WAITING"/></option>--%>
                <%--<option value="TASK_CANC"><fmt:message key="TASK_CANC"/></option>--%>
                <%--<option value="TASK_INPR"><fmt:message key="TASK_INPR"/></option>--%>
                <%--<option value="TASK_NEED"><fmt:message key="TASK_NEED"/></option>--%>
            <%--</optgroup>--%>
            <optgroup label="<fmt:message key="moveAction"/>">
                        <c:set var="count" value="${0}"/>
                        <zm:forEachFolder var="folder">
                            <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isTaskMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            <c:set var="count" value="${count+1}"/></c:if>
                        </zm:forEachFolder>
            </optgroup>
            <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
                <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
                <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
            </c:if>
        </select>
        <noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    <script type="text/javascript">var actGo = document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
    </span>
</c:if>
<span class=" f-right">
    <c:choose>
        <c:when test="${not empty param.tz}">
            <fmt:setTimeZone var="tz" value="${param.tz}" scope="request"/>
        </c:when>
        <c:otherwise>
            <c:set var="tz" value="${mailbox.prefs.timeZone}" scope="request"/>
        </c:otherwise>
    </c:choose>
    <c:choose>
        <c:when test="${not empty param.date}">
            <fmt:parseDate var="date" timeZone="${tz}" pattern="yyyyMMdd" value="${param.date}"/>
            <c:set scope="request" var="dateContext" value="${zm:getCalendarMidnight(date.time, tz)}"/>
        </c:when>
        <c:otherwise>
            <c:set scope="request" var="dateContext" value="${zm:getToday(tz)}"/>
        </c:otherwise>
    </c:choose>
    <fmt:formatDate var="dateDf" value="${dateContext.time}" pattern="yyyyMMdd" timeZone="${tz}"/>
    <c:url var="composeUrl" value="${urlTarget}">
        <c:param name="action" value="edit"/>
        <c:param name="st" value="newtask"/>
        <c:param name="date" value="${dateDf}"/>
        <c:param name="folderid" value="${context.folder.id}"/>
    </c:url>
    <a accesskey="${requestScope.mainaction_accesskey}" href="${composeUrl}" class="zo_button">
        <fmt:message key="add"/>
    </a>
</span>
</span>
</div>
</div>
</c:if>
<c:if test="${!isTop && '1' eq  btm_stb }"> <%-- no_btm_stb => no bottom sub toolbar, set this param to disable bottom subtoolbar --%>
    <div class="stb tbl">
        <div class="tr">
            <div class="td">
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=tasks"><fmt:message
                                key="tasksLabel"/></a>
                        <c:if test="${btm_fldr_select eq '0'}">
                            ${fn:escapeXml(zm:truncateFixed(context.shortBackTo,12,true))}
                        </c:if>
                        <c:if test="${btm_fldr_select ne '0'}">
			<select class="_zo_select_button" name="sfi"
                                onchange="fetchIt('?sfi='+this.value+'&amp;st=${context.st}');"><c:set var="count" value="${0}"/>
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${count lt sessionScope.F_LIMIT and fldr.isTaskView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(zm:truncateFixed(zm:getFolderName(pageContext,fldr.id),15,true))}
                                    </option>
                                <c:set var="count" value="${count+1}"/></c:if>
                            </zm:forEachFolder>
                        </select>       
                        </c:if>
            </div>
        </div>
    </div>
</c:if>
<input type="hidden" name="isInTrash" value="${context.folder.isInTrash}">
<c:if test="${isTop}">
<div id="fbbar" class="tb tbl" style="display:none;">
<div class="tr"><span class="td" id="fbtd"><span id="sc"></span>
<input type='submit' class='zo_button delete_button' name='action${context.folder.isInTrash ? 'Hard' : ''}Delete' value='<fmt:message key="delete"/>'>
<c:if test="${context.searchResult.size gt 0}">
<span>
    <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'),null,this.value)">
        <option value="" selected="selected"><fmt:message key="moreActions"/></option>
        <c:choose>
            <c:when test="${not context.folder.isInTrash}">
                <option value="actionDelete"><fmt:message key="delete"/></option>
            </c:when>
            <c:otherwise>
                <option value="actionHardDelete"><fmt:message key="delete"/></option>
            </c:otherwise>
        </c:choose>
        <optgroup label="<fmt:message key='select'/>">
            <option value="selectAll"><fmt:message key="all"/></option>
            <option value="selectNone"><fmt:message key="none"/></option>
        </optgroup>
        <optgroup label="<fmt:message key='markAs'/>">
            <option value="TASK_COMP"><fmt:message key="TASK_COMP"/></option>
            <option value="TASK_WAITING"><fmt:message key="TASK_WAITING"/></option>
            <option value="TASK_CANC"><fmt:message key="TASK_CANC"/></option>
            <option value="TASK_INPR"><fmt:message key="TASK_INPR"/></option>
            <option value="TASK_NEED"><fmt:message key="TASK_NEED"/></option>
        </optgroup>
        <optgroup label="<fmt:message key="moveAction"/>">
                    <c:set var="count" value="${0}"/>
                    <zm:forEachFolder var="folder">
                        <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isTaskMoveTarget and !folder.isTrash and !folder.isSpam}">
                            <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                        <c:set var="count" value="${count+1}"/></c:if>
                    </zm:forEachFolder>
        </optgroup>
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
            <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                <c:forEach var="atag" items="${allTags}">
                    <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                </c:forEach>
            </optgroup>
            <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                <c:forEach var="atag" items="${allTags}">
                    <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                </c:forEach>
            </optgroup>
        </c:if>
    </select>
    <noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    <script type="text/javascript">var actGo = document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
</span>
</c:if>
<span class="zo_button1" onclick="return checkAll($('zForm').getElementsByClassName('chk'),false);"><span class="SmlIcnHldr Cancel"></span></span></span></div>
</div>
</c:if>