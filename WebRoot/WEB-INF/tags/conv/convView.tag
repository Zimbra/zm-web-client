<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>
    
    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${message eq null}">
        <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
        </c:if>
        <zm:getMessage var="message" id="${not empty param.id ? param.id : convSearchResult.hits[csi].id}" markread="true" neuterimages="${empty param.xim}"/>
    </c:if>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not message.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq message.id}">
                <zm:markMessageRead var="mmrresult" id="${message.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>
    <fmt:message var="unknownSender" key="unknownSender"/>

</app:handleError>

<%-- get the message up front, so when we output the overview tree unread counts are correctly reflected --%>
<c:set var="ads" value='${message.subject} ${message.fragment}'/>

<app:view mailbox="${mailbox}" title="${message.subject}" selected='mail' context="${context}" folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="search" action="view" cid="${convSummary.id}" context="${context}" csi="${param.csi}" cso="${param.cso}" css="${param.css}"/>
    <form action="${currentUrl}" method="post" name="zform">
        <table width=100% cellpadding=0 cellspacing=0>
            <tr>
                <td class='TbTop'>
                    <app:convToolbar context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                        <table width=100% cellpadding=0 cellspacing=0>
                            <tr>
                                <td class='ConvSummary'>
                                    <table width=100% cellpadding=1 cellspacing=0>
                                        <tr>
                                            <td>
                                                <app:img atkey='ALT_CONVERSATION' src="mail/Conversation.gif"/> <span class='MsgHdrSub'>${fn:escapeXml(empty message.subject ? emptySubject : message.subject)}</span>
                                            </td>
                                            <td align="right">
                                                <span class='Tags'>
                                                     <c:if test="${mailbox.features.tagging}">
                                                         <c:set var="tags" value="${zm:getTags(pageContext, convSummary.tagIds)}"/>
                                                         <c:forEach items="${tags}" var="tag">
                                                             <app:img alt='${fn:escapeXml(tag.name)}' src="${tag.miniImage}"/> <span>${fn:escapeXml(tag.name)}</span>
                                                         </c:forEach>
                                                     </c:if>
                                                    <c:if test="${convSummary.flagged}">
                                                        <app:img altkey='ALT_FLAGGED' src="tag/FlagRed.gif"/>
                                                    </c:if>
                                                </span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td class='List'>
                                        <table width=100% cellpadding=0 cellspacing=0>
                                            <tr>
                                                <th class='CB'nowrap><input onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                                                <th class='Img' nowrap><app:img src="tag/FlagRed.gif" altkey="ALT_FLAGGED"/>
                                                 <c:if test="${mailbox.features.tagging}">
                                                <th class='Img' nowrap><app:img src="tag/MiniTagOrange.gif" altkey="ALT_TAG"/>
                                                </c:if>
                                                <th class='MsgStatusImg' nowrap>
                                                <th width=10% nowrap>
                                                    <zm:currentResultUrl var="fromSortUrl" value="search" action="view" context="${context}" csi="${param.csi}" css="${param.css eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                                                <a href="${fromSortUrl}"><fmt:message key="from"/></a>
                                                <th class='Img' nowrap><app:img src="common/Attachment.gif" altkey="ALT_ATTACHMENT"/>
                                                <th nowrap><fmt:message key="fragment"/>
                                                <th width=1% nowrap><fmt:message key="folder"/>
                                                <th width=1% nowrap><fmt:message key="size"/>
                                                <th width=1% nowrap>
                                                    <zm:currentResultUrl var="dateSortUrl" value="search" action="view" context="${context}" csi="${param.csi}" css="${param.css eq 'dateDesc' ? 'dateAsc' : 'dateDesc'}"/>
                                                <a href="${dateSortUrl}"><fmt:message key="received"/></a>
                                            </tr>
                                            <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
                                                <zm:currentResultUrl var="msgUrl" value="search" cid="${convSummary.id}" id="${hit.id}" action='view' context="${context}"
                                                                     cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                                                <tr class='ZhRow${hit.messageHit.isUnread ? ' Unread':''}${hit.id eq message.id ? ' RowSelected' : ((context.showMatches and hit.messageHit.messageMatched) ? ' RowMatched' : '')}'>
                                                    <td class='CB' nowrap><input <c:if test="${hit.id eq message.id}">checked</c:if> type=checkbox name="id" value="${hit.id}"></td>
                                                    <td class='Img'><app:flagImage flagged="${hit.messageHit.isFlagged}"/></td>
                                                    <c:if test="${mailbox.features.tagging}">
                                                        <td class='Img'><app:miniTagImage ids="${hit.messageHit.tagIds}"/></td>
                                                    </c:if>
                                                    <td class='MsgStatusImg' align=center><app:img src="${(hit.messageHit.isUnread and hit.id == message.id) ? 'mail/MsgStatusRead.gif' : hit.messageHit.statusImage}" altkey="${(hit.messageHit.isUnread and hit.id == message.id) ? 'ALT_MSG_STATUS_READ' : hit.messageHit.statusImageAltKey}"/></td>
                                                    <td nowrap><a href="${msgUrl}">
                                                        <c:set var="sender" value="${hit.messageHit.displaySender}"/>
                                                            ${fn:escapeXml(empty sender ? unknownSender : sender)}
                                                    </a></td>
                                                    <td class='Img' ><app:attachmentImage attachment="${hit.messageHit.hasAttachment}"/></td>
                                                    <td ><%-- allow this column to wrap --%>
                                                        <a href="${msgUrl}"><span style='overflow: hidden;'>${fn:escapeXml(empty hit.messageHit.fragment ? emptyFragment : zm:truncate(hit.messageHit.fragment,100, true))}</span></a>
                                                        <c:if test="${hit.id == message.id}">
                                                            <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}" index="${status.index}"/>
                                                            <c:if test="${messCursor.hasPrev}">
                                                                <zm:currentResultUrl var="prevMsgUrl" value="search" action='view' context="${context}" cso="${messCursor.prevOffset}" csi="${messCursor.prevIndex}" css="${param.css}"/>
                                                                <a href="${prevMsgUrl}" accesskey='k' id="PREV_ITEM"></a>
                                                            </c:if>
                                                            <c:if test="${messCursor.hasNext}">
                                                                <zm:currentResultUrl var="nextMsgUrl" value="search"  action="view" context="${context}" cso="${messCursor.nextOffset}" csi="${messCursor.nextIndex}" css="${param.css}"/>
                                                                <a href="${nextMsgUrl}" accesskey='j' id="NEXT_ITEM"></a>
                                                            </c:if>
                                                        </c:if>
                                                    </td>
                                                    <td nowrap>${fn:escapeXml(zm:getFolderName(pageContext, hit.messageHit.folderId))}</td>
                                                    <td nowrap>${fn:escapeXml(zm:displaySize(hit.messageHit.size))}</td>
                                                    <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}</td>
                                                </tr>
                                            </c:forEach>
                                            <tr><td colspan='${mailbox.features.tagging ? "10" : "9"}'>&nbsp;</td></tr>
                                        </table>
                                </td>
                            </tr>
                                <c:set var="extImageUrl" value=""/>
                            <c:if test="${empty param.xim}">
                                <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}"
                                                     cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}" xim="1"/>
                            </c:if>
                                <zm:currentResultUrl var="composeUrl" value="search" context="${context}" id="${message.id}"
                                                     action="compose" paction="view" cid="${convSearchResult.conversationSummary.id}" cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}"/>
                               <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>

                            <tr>
                                <td>
                                <app:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                                </td>
                            </tr>
                        </table>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:convToolbar context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" keys="false"/>
                </td>
            </tr>
            <input type="hidden" name="doMessageAction" value="1"/>
        </table>
    </form>

<%--
    <app:keyboard>
        <zm:keyboardBindings>
            <zm:bindKey key="C" id="TAB_COMPOSE"/>
            <zm:bindKey key="N,M" id="TAB_COMPOSE"/>
            <zm:bindKey key="G,C" id="TAB_CALENDAR"/>
            <zm:bindKey key="G,A" id="TAB_ADDRESSBOOK"/>
            <zm:bindKey key="G,M" id="TAB_MAIL"/>
            <zm:bindKey key="G,O" id="TAB_OPTIONS"/>
            <zm:bindKey key="R" id="OPREPLY"/>
            <zm:bindKey key="A" id="OPREPLYALL"/>
            <zm:bindKey key="F" id="OPFORW"/>
            <zm:bindKey key="Esc; Z" id="CLOSE_ITEM"/>
            <zm:bindKey key="Enter; O" id="CURR_ITEM"/>
            <zm:bindKey key="Shift+ArrowUp; K" id="PREV_ITEM"/>
            <zm:bindKey key="Shift+ArrowDown; J" id="NEXT_ITEM"/>
            <zm:bindKey key="Shift+ArrowLeft; H" id="PREV_PAGE"/>
            <zm:bindKey key="Shift+ArrowRight; L" id="NEXT_PAGE"/>
            <zm:bindKey key="Ctrl+Shift+ArrowLeft; Shift+H" id="PREV_CONV"/>
            <zm:bindKey key="Ctrl+Shift+ArrowRight; Shift+L" id="NEXT_CONV"/>
        </zm:keyboardBindings>
    </app:keyboard>
    --%>
</app:view>
