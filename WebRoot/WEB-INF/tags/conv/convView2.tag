<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>
    <zm:searchConv limit="${mailbox.prefs.mailItemsPerPage}" var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}"/>
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
</app:handleError>

<%-- get the message up front, so when we output the overview tree unread counts are correctly reflected --%>
<c:set var="ads" value='${message.subject} ${message.fragment}'/>

<app:view mailbox="${mailbox}" selected='mail' title="${message.subject}" context="${context}" folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}" keys="true">
    <zm:currentResultUrl var="currentUrl" action="view2" value="search" context="${context}" csi="${param.csi}" cso="${param.cso}" css="${param.css}"/>
    <form action="${currentUrl}" method="post">
       <table width=100% cellpadding=0 cellspacing=0>
            <tr>
                <td class='TbTop'>
                    <app:convToolbar2Top top='true' context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td>
                    <table width=100% cellpadding=0 cellspacing=0>
                        <tr valign='top'>
                            <td class='ZhAppContent' width=400>
                                <table width=400 cellpadding=0 cellspacing=0>
                                    <tr valign="top">
                                        <td class='TbBottom'>
                                            <app:convToolbar2 top='true' context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" keys="true"/>
                                        </td>
                                    </tr>
                                    <tr valign='top'>
                                        <td class=List>
                                            <table width=100% height=100% cellpadding=0 cellspacing=0>
                                                <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
                                                    <zm:currentResultUrl var="msgUrl" value="search" action="view2" context="${context}"
                                                                         cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                                                    <tr class='ZhRow${(hit.messageHit.isUnread and (hit.id != message.id)) ? ' Unread':''}${hit.id eq message.id ? ' RowSelected' : ((context.showMatches and hit.messageHit.messageMatched) ? ' RowMatched' : '')}'>
                                                        <td style='border:none' class='CB' nowrap><input <c:if test="${hit.id eq message.id}">checked</c:if> type=checkbox name="id" value="${hit.id}"></td>
                                                        <td style='border:none' class='MsgStatusImg' align=center><app:img src="${(hit.messageHit.isUnread and hit.id == message.id) ? 'startup/ImgMsgStatusRead.gif' : hit.messageHit.statusImage}"/></td>
                                                        <td style='border:none' nowrap><a href="${msgUrl}">${fn:escapeXml(hit.messageHit.displaySender)}</a></td>
                                                        <td style='border:none' class='Img' ><app:attachmentImage attachment="${hit.messageHit.hasAttachment}"/></td>
                                                        <td style='border:none' width=1% nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}</td>
                                                    </tr>
                                                    <tr class='ZhRow${(hit.messageHit.isUnread and (hit.id != message.id)) ? ' Unread':''}${hit.id eq message.id ? ' RowSelected' : ((context.showMatches and hit.messageHit.messageMatched) ? ' RowMatched' : '')}'>
                                                        <td class='Bottom Img'>
                                                            <c:if test="${mailbox.features.flagging}">
                                                                <app:flagImage flagged="${hit.messageHit.isFlagged}"/>
                                                            </c:if>
                                                        </td>
                                                        <td class='Bottom Img'><app:miniTagImage ids="${hit.messageHit.tagIds}"/></td>
                                                        <td nowrap colspan=3 class='Bottom'>
                                                            <a href="${msgUrl}"><span style='overflow: hidden;'>${fn:escapeXml(empty hit.messageHit.fragment ? emptyFragment : zm:truncate(hit.messageHit.fragment,50, true))}</span></a>
                                                            <c:if test="${hit.id == message.id}">
                                                                <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}" index="${status.index}"/>
                                                                <c:if test="${messCursor.hasPrev}">
                                                                    <zm:currentResultUrl var="prevMsgUrl" value="search" action="view2" context="${context}" cso="${messCursor.prevOffset}" csi="${messCursor.prevIndex}" css="${param.css}"/>
                                                                    <a href="${prevMsgUrl}" ></a>
                                                                </c:if>
                                                                <c:if test="${messCursor.hasNext}">
                                                                    <zm:currentResultUrl var="nextMsgUrl" value="search" action="view2" context="${context}" cso="${messCursor.nextOffset}" csi="${messCursor.nextIndex}" css="${param.css}"/>
                                                                    <a href="${nextMsgUrl}" ></a>
                                                                </c:if>
                                                            </c:if>
                                                        </td>
                                                    </tr>
                                                </c:forEach>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td class='ZhAppContent'>
                                <table width=100% cellpadding=0 cellspacing=0>
                                    <tr valign='top'>
                                        <td class='ConvSummary2'>
                                            <table width=100% cellpadding=1 cellspacing=0>
                                                <tr>
                                                    <td>
                                                        <app:img src="mail/ImgConversation.gif"/> <span class='MsgHdrSub'>${fn:escapeXml(empty message.subject ? emptySubject : message.subject)}</span>
                                                    </td>
                                                    <td align="right">
                                                        <span class='Tags'>
                                                            <c:set var="tags" value="${zm:getTags(pageContext, convSummary.tagIds)}"/>
                                                            <c:forEach items="${tags}" var="tag">
                                                                <app:img src="${tag.miniImage}"/> <span>${fn:escapeXml(tag.name)}</span>
                                                            </c:forEach>
                                                            <c:if test="${mailbox.features.flagging and convSummary.flagged}">
                                                                <app:img src="startup/ImgFlagRed.gif"/>
                                                            </c:if>
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr valign='top'>
                                        <td valign=top class='ZhAppContent2'>
                                            <c:set var="extImageUrl" value=""/>
                                            <c:if test="${empty param.xim}">
                                                <zm:currentResultUrl var="extImageUrl" value="search" context="${context}" action="view2"
                                                                     cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}" xim="1"/>
                                            </c:if>
                                            <zm:currentResultUrl var="composeUrl" value="search" context="${context}" id="${message.id}"
                                                                 action="compose" cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}"/>
                                            <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
                                            <app:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:convToolbar2Top top='false' context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" keys="false"/>
                </td>
            </tr>
        </table>

        <input type="hidden" name="doMessageAction" value="1"/>
    </form>
</app:view>
