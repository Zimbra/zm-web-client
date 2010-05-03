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
<%@ attribute name="isConv" rtexprvalue="true" required="false" %>
<%@ attribute name="cid" rtexprvalue="true" required="false" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ attribute name="singleMessage" rtexprvalue="true" required="false" %>
<%@ attribute name="message" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${isConv != null && isConv}">
    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" limit="100"
                   context="${context}" fetch="none" markread="false" sort="${param.css}"/>
</c:if>

<c:choose>
<c:when test="${ua.isiPad == true && empty param.hc}">
    <div class="tb tbl"><div class="tr"><div class="td toolbar">
        <div class="compose button" onclick="return zClickLink('compose');">
            <c:url var="composeUrl" value="${urlTarget}?st=newmail"/>
            <a accesskey="${requestScope.mainaction_accesskey}" href="${composeUrl}" id="compose"><fmt:message key="compose"/></a>
        </div>
        <div class="actions">
            <div class="left button" onclick="return zClickLink('reply');">
                <a href="?st=newmail&amp;id=${message.id}&amp;op=reply" id="reply"><fmt:message key="reply"/></a>
            </div>
            <div class="center button" onclick="return zClickLink('replyall');">
                <a href="?st=newmail&id=${message.id}&amp;op=replyAll" id="replyall"><fmt:message key="replyAll"/></a>
            </div>
            <div class="right button" onclick="return zClickLink('forward');">
                <a href="?st=newmail&id=${message.id}&amp;op=forward" id="forward"><fmt:message key="forward"/></a>
            </div>
        </div>
    </div></div></div>
</c:when>
<c:when test="${ua.isiPad == true && not empty param.hc}">
    <c:if test="${isConv!=null && isConv}">
        <zm:currentResultUrl var="closeurl" value="${urlTarget}" _pv="1"
                             index="${context.currentItemIndex}"
                             context="${context}"/>
    </c:if>
    <zm:currentResultUrl var="closeurl" value="${urlTarget}" _pv="1"
                         index="${context.currentItemIndex}"
                         context="${context}"/>
    <div class="tb tbl"><div class="tr"><div class="td toolbar">
        <div class="compose button" onclick="return zClickLink('compose');">
            <a href="${fn:escapeXml(closeurl)}${empty param.ajax ? '#conv' : '&conv'}${cid}" class='zo_leftbutton'>${fn:escapeXml(zm:truncateFixed(context.shortBackTo,15,true))}</a>
        </div>
        <div class="icons button"><img src="/zimbra/img/startup/ImgRefresh.gif" border="0"/></div>
        <div class="select button">

        <c:if test="${context.searchResult.size gt 0}">
        <span>
            <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'));">
                <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                <optgroup label="Delete">
                    <c:choose>
                        <c:when test="${not context.folder.isInTrash}"><option value="actionHardDelete"><fmt:message key="delete"/></option></c:when>
                        <c:otherwise><option value="actionDelete"><fmt:message key="delete"/></option></c:otherwise>
                    </c:choose>
                </optgroup>
                <optgroup label="<fmt:message key="markAs"/>">
                    <option value="actionMarkRead"><fmt:message key="MO_read"/></option>
                    <option value="actionMarkUnread"><fmt:message key="MO_unread"/></option>
                    <c:choose>
                        <c:when test="${context.folder.isSpam}"><option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option></c:when>
                        <c:otherwise><option value="actionMarkSpam"><fmt:message key="actionSpam"/></option></c:otherwise>
                    </c:choose>
                </optgroup>
                <optgroup label="<fmt:message key="MO_flag"/>">
                    <option value="actionFlag"><fmt:message key="add"/></option>
                    <option value="actionUnflag"><fmt:message key="remove"/></option>
                </optgroup>
                <optgroup label="<fmt:message key="moveAction"/>"><c:set var="count" value="${0}"/>
                    <zm:forEachFolder var="folder">
                        <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option><c:set var="count" value="${count+1}"/></c:if></zm:forEachFolder>
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
            <noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
            <script type="text/javascript">var actGo=document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
        </span>
        </c:if>

        </div>    
    </div></div></div>
</c:when>
<c:otherwise>
<c:if test="${isTop}"><div class="stb tbl top_conv_v_subtoolbar"><div class="tr"><div class="td">
    <c:if test="${isConv!=null && isConv}">
        <zm:currentResultUrl var="closeurl" value="${urlTarget}" _pv="1"
                             index="${context.currentItemIndex}"
                             context="${context}"/>
    </c:if>
    <zm:currentResultUrl var="closeurl" value="${urlTarget}" _pv="1"
                         index="${context.currentItemIndex}"
                         context="${context}"/>
    <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=folders"><fmt:message key="folders"/></a> &laquo; <a href="${fn:escapeXml(closeurl)}${empty param.ajax ? '#conv' : '&conv'}${cid}" class='zo_leftbutton'>${fn:escapeXml(zm:truncateFixed(context.shortBackTo,15,true))}</a>
    <c:if test="${isConv!=null && isConv}">&laquo; <fmt:message key="backToConv"/></c:if>
    <c:if test="${isConv==null || !isConv }"><zm:currentResultUrl var="closeUrl" value="${urlTarget}" action='view' context="${context}" _pv="1"
                             cso="${param.cso}" csi="${param.csi}" css="${param.css}"/>
        &laquo; <a href="${fn:escapeXml(closeUrl)}" class='zo_leftbutton'> <fmt:message key="backToConv"/> </a> &laquo; ${fn:escapeXml(zm:truncateFixed(message.subject,12,true))}
    </c:if>

</div></div></div></c:if>
<div class="tb tbl"><div class="tr"><div class="td"><span class="zo_button_group">
    <c:if test="${isConv !=null && isConv}">
        <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:choose>
            <c:when test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="${urlTarget}" action="view"
                                cursor="${convCursor}" context="${context}" _pv="1"
                                css="${param.css}"/>
                <a accesskey="${requestScope.prev_accesskey}" class='zo_button prev_button' href="${fn:escapeXml(prevItemUrl)}"><fmt:message key="MO_PREV"/></a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled prev_button'><fmt:message key="MO_PREV"/></a>
            </c:otherwise>
        </c:choose>
    </c:if>
    <c:if test="${isConv == null || !isConv}">
        <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}" index="${param.csi}"/>
        <c:choose>
            <c:when test="${messCursor.hasPrev}">
                <zm:currentResultUrl var="prevMsgUrl" value="${urlTarget}" action='view'
                                     context="${context}" mview="1" _pv="1"
                                     cso="${messCursor.prevOffset}"
                                     csi="${messCursor.prevIndex}" css="${param.css}"/>
                <a accesskey="${requestScope.prev_accesskey}" class='zo_button prev_button' href="${fn:escapeXml(prevMsgUrl)}"><fmt:message key="MO_PREV"/></a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled prev_button'><fmt:message key="MO_PREV"/></a>
            </c:otherwise>
        </c:choose>
    </c:if>
    <c:if test="${isConv !=null && isConv}">
        <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:choose>
            <c:when test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="${urlTarget}" action="view"
                                cursor="${convCursor}" context="${context}"
                                css="${param.css}"/>
                <a accesskey="${requestScope.next_accesskey}" class='zo_button next_button' href="${fn:escapeXml(nextItemUrl)}"><fmt:message key="MO_NEXT"/></a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled next_button'><fmt:message key="MO_NEXT"/></a>
            </c:otherwise>
        </c:choose>
    </c:if>
    <c:if test="${isConv == null || !isConv}">
        <c:choose>
            <c:when test="${messCursor.hasNext}">
                <zm:currentResultUrl var="nextMsgUrl" value="${urlTarget}" action="view"
                                     context="${context}" mview="1"
                                     cso="${messCursor.nextOffset}"
                                     csi="${messCursor.nextIndex}" css="${param.css}"/>
                <a accesskey="${requestScope.next_accesskey}" class='zo_button next_button' href="${fn:escapeXml(nextMsgUrl)}"><fmt:message key="MO_NEXT"/></a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled next_button'><fmt:message key="MO_NEXT"/></a>
            </c:otherwise>
        </c:choose>
    </c:if>
</span><span>
<c:if test="${singleMessage}">
    <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'));">
        <option value="" selected="selected"><fmt:message key="moreActions"/></option>
        <c:set var="myFolder" value="${zm:getFolder(pageContext, message.folderId)}"/>
        <c:set var="inTrash" value="${myFolder.isInTrash}"/>
        <c:choose>
            <c:when test="${inTrash}"><option value="actionHardDelete"><fmt:message key="delete"/></option></c:when>
            <c:otherwise><option value="actionDelete"><fmt:message key="delete"/></option></c:otherwise>
        </c:choose>
        <optgroup label="<fmt:message key="markAs"/>">
            <c:if test="${message.isUnread}"><option value="actionMarkRead"><fmt:message key="MO_read"/></option></c:if>
            <c:if test="${not message.isUnread}"><option value="actionMarkUnread"><fmt:message key="MO_unread"/></option></c:if>
            <c:choose>
                <c:when test="${myFolder.isSpam}"><option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option></c:when>
                <c:otherwise><option value="actionMarkSpam"><fmt:message key="actionSpam"/></option></c:otherwise>
            </c:choose>
        </optgroup>
        <optgroup label="<fmt:message key="MO_flag"/>">
            <c:if test="${not message.isFlagged}"><option value="actionFlag"><fmt:message key="add"/></option></c:if>
            <c:if test="${message.isFlagged}"><option value="actionUnflag"><fmt:message key="remove"/></option></c:if>
        </optgroup>
        <optgroup label="<fmt:message key="moveAction"/>"><c:set var="count" value="${0}"/>
            <zm:forEachFolder var="folder">
                <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${zm:getFolderPath(pageContext, folder.id)}</option><c:set var="count" value="${count+1}"/></c:if>
            </zm:forEachFolder>
        </optgroup>
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,message.tagIds,true)}"/>
            <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,message.tagIds,false)}"/>
            <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                <c:forEach var="atag" items="${tagsToAdd}"><option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option></c:forEach>
            </optgroup>
            <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                <c:forEach var="atag" items="${tagsToRemove}"><option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option></c:forEach>
            </optgroup>
        </c:if>
    </select><noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    <script type="text/javascript">var actGo=document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
</c:if>
<c:if test="${!singleMessage && convSearchResult.size gt 0}">
    <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'));">
        <option value="" selected="selected"><fmt:message key="moreActions"/></option>
        <optgroup label="Delete">
            <c:choose>
                <c:when test="${not context.folder.isInTrash}"><option value="actionHardDelete"><fmt:message key="delete"/></option></c:when>
                <c:otherwise><option value="actionDelete"><fmt:message key="delete"/></option></c:otherwise>
            </c:choose>
        </optgroup>
        <option value="actionAttachToCompose"><fmt:message key="sendAsAttachments"/></option>
        <optgroup label="<fmt:message key="markAs"/>">
            <option value="actionMarkRead"><fmt:message key="MO_read"/></option>
            <option value="actionMarkUnread"><fmt:message key="MO_unread"/></option>
            <c:choose>
                <c:when test="${context.folder.isSpam}"><option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option></c:when>
                <c:otherwise><option value="actionMarkSpam"><fmt:message key="actionSpam"/></option></c:otherwise>
            </c:choose>
        </optgroup>
        <optgroup label="<fmt:message key="MO_flag"/>">
            <option value="actionFlag"><fmt:message key="add"/></option>
            <option value="actionUnflag"><fmt:message key="remove"/></option>
        </optgroup>
        <optgroup label="<fmt:message key="moveAction"/>"><c:set var="count" value="${0}"/>
        <zm:forEachFolder var="folder">
        <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option><c:set var="count" value="${count+1}"/></c:if></zm:forEachFolder>
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
    <noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    <script type="text/javascript">var actGo=document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
</c:if>
</span>
<span class=""><c:url var="composeUrl" value="${urlTarget}?st=newmail"/>
    <a accesskey="${requestScope.mainaction_accesskey}" href="${composeUrl}" class="zo_button"><fmt:message key="compose"/></a>
</span>
</div></div></div>
<input type="hidden" name="isInTrash" value="${context.folder.isInTrash}">
<c:if test="${isTop && !singleMessage}">
<div id="fbbar" class="tb tbl" style="display:none;">
<div class="tr"><span class="td" id="fbtd"><span id="sc"></span>
<span class="zo_button_group delete_button">
<input type='button' class='zo_button prev_button' name='actionJunk' value='<fmt:message key="${context.folder.isSpam ? 'actionNotSpam' : 'actionSpam'}"/>' onclick="$('zForm').anAction[0].value='actionMark${context.folder.isSpam ? 'Unspam' : 'Spam' }';submitForm($('zForm'));">
<input type='submit' class='zo_button next_button' name='action${context.folder.isInTrash ? 'Hard' : ''}Delete' value='<fmt:message key="delete"/>'>
</span>
<c:if test="${context.searchResult.size gt 0}">
<span>
    <select class="zo_select_button" name="anAction" onchange="submitForm(document.getElementById('zForm'));">
        <option value="" selected="selected"><fmt:message key="moreActions"/></option>
        <optgroup label="Delete">
            <c:choose>
                <c:when test="${not context.folder.isInTrash}"><option value="actionHardDelete"><fmt:message key="delete"/></option></c:when>
                <c:otherwise><option value="actionDelete"><fmt:message key="delete"/></option></c:otherwise>
            </c:choose>
        </optgroup>
        <option value="actionAttachToCompose"><fmt:message key="sendAsAttachments"/></option>
        <optgroup label="<fmt:message key="markAs"/>">
            <option value="actionMarkRead"><fmt:message key="MO_read"/></option>
            <option value="actionMarkUnread"><fmt:message key="MO_unread"/></option>
            <c:choose>
                <c:when test="${context.folder.isSpam}"><option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option></c:when>
                <c:otherwise><option value="actionMarkSpam"><fmt:message key="actionSpam"/></option></c:otherwise>
            </c:choose>
        </optgroup>
        <optgroup label="<fmt:message key="MO_flag"/>">
            <option value="actionFlag"><fmt:message key="add"/></option>
            <option value="actionUnflag"><fmt:message key="remove"/></option>
        </optgroup>
        <optgroup label="<fmt:message key="moveAction"/>"><c:set var="count" value="${0}"/>
        <zm:forEachFolder var="folder">
        <c:if test="${count lt sessionScope.F_LIMIT and folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}"><option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option><c:set var="count" value="${count+1}"/></c:if></zm:forEachFolder>
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
    <noscript><input id="actGo${isTop}" class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    <script type="text/javascript">var actGo=document.getElementById('actGo${isTop}');if(actGo){actGo.style.display='none';}</script>
</span>
</c:if>
<span class="zo_button1" onclick="return checkAll($('zForm').getElementsByClassName('chk'),false);"><span class="SmlIcnHldr Cancel"></span></span></span></div>
</div>
</c:if>
</c:otherwise>
</c:choose>    