<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convHit" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZConversationHitBean"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
<fmt:message var="emptySubject" key="noSubject"/>
<zm:getMailbox var="mailbox"/>
<c:set var="csi" value="${param.csi}"/>
<zm:searchConv var="convSearchResult" conv="${convHit}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}"/>
<zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
<c:set var="message" value="${null}"/>
<c:if test="${empty csi}">
    <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
     <c:if test="${csi ge 0}">
         <c:set var="message" value="${convSearchResult.messageHits[csi].message}"/>
    </c:if>
</c:if>
<c:if test="${message eq null}">
    <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
    </c:if>
    <zm:getMessage var="message" id="${convSearchResult.messageHits[csi].id}" markread="true" neuterimages="${empty param.xim}"/>
</c:if>

<%-- get the message up front, so when we output the overview tree unread counts are correctly reflected --%>
<c:set var="ads" value='${convHit.subject} ${convHit.fragment}'/>

<app:view selected='mail' context="${context}" folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}">
    <zm:currentResultUrl var="currentUrl" value="cv" context="${context}" csi="${param.csi}" cso="${param.cso}" css="${param.css}"/>
    <form action="${currentUrl}" method="post">
        <table width=100% cellpadding=0 cellspacing=0>
            <tr>
                <td>
                    <app:convToolbar top='true' context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" convHit="${convHit}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td>
                    <div class='ZhAppContent'>
                        <div class='ConvSummary'>
                            <table width=100% cellpadding=1 cellspacing=0>
                                <tr>
                                    <td>
                                        <app:img src="mail/Conversation.gif"/> <span class='MsgHdrSub'>${fn:escapeXml(empty convHit.subject ? emptySubject : convHit.subject)}</span>
                                    </td>
                                    <td align="right">
                                        <span class='Tags'>
                                            <c:set var="tags" value="${zm:getTags(pageContext, convHit.tagIds)}"/>
                                            <c:forEach items="${tags}" var="tag">
                                                <app:img src="${tag.miniImage}"/> <span>${fn:escapeXml(tag.name)}</span>
                                            </c:forEach>
                                            <c:if test="${convHit.isFlagged}">
                                                <app:img src="tag/FlagRed.gif"/>
                                            </c:if>
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class=List>
                            <table width=100% cellpadding=0 cellspacing=0>
                                <tr>
                                    <th class='CB'nowrap>
                                    <th class='Img' nowrap><app:img src="tag/FlagRed.gif"alt="Starred"/>
                                    <th class='Img' nowrap><app:img src="tag/MiniTagOrange.gif"alt="Tagged"/>
                                    <th class='MsgStatusImg' nowrap>
                                    <th width=10% nowrap>
                                        <zm:currentResultUrl var="fromSortUrl" value="cv" context="${context}" csi="${param.csi}" css="${param.css eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                                    <a href="${fromSortUrl}"><fmt:message key="from"/></a>
                                    <th class='Img' nowrap><app:img src="common/Attachment.gif"alt="Attachment"/>
                                    <th nowrap><fmt:message key="fragment"/>
                                    <th width=1% nowrap><fmt:message key="folder"/>
                                    <th width=1% nowrap><fmt:message key="size"/>
                                    <th width=1% nowrap>
                                        <zm:currentResultUrl var="dateSortUrl" value="cv" context="${context}" csi="${param.csi}" css="${param.css eq 'dateDesc' ? 'dateAsc' : 'dateDesc'}"/>
                                    <a href="${dateSortUrl}"><fmt:message key="received"/></a>
                                </tr>
                                <c:forEach items="${convSearchResult.messageHits}" var="hit" varStatus="status">
                                    <zm:currentResultUrl var="msgUrl" value="cv"  context="${context}"
                                                         cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                                    <tr class='ZhRow${(hit.isUnread and (hit.id != message.id)) ? ' Unread':''}${hit.id eq message.id ? ' RowSelected' : ((context.showMatches and hit.messageMatched) ? ' RowMatched' : '')}'>
                                        <td class='CB' nowrap><input <c:if test="${hit.id eq message.id}">checked</c:if> type=checkbox name="id" value="${hit.id}"></td>
                                        <td class='Img'><app:flagImage flagged="${hit.isFlagged}"/></td>
                                        <td class='Img'><app:miniTagImage ids="${hit.tagIds}"/></td>
                                        <td class='MsgStatusImg' align=center><app:img src="${(hit.isUnread and hit.id == message.id) ? 'mail/MsgStatusRead.gif' : hit.statusImage}"/></td>
                                        <td nowrap><a href="${msgUrl}">${fn:escapeXml(hit.displaySender)}</a></td>
                                        <td class='Img' ><app:attachmentImage attachment="${hit.hasAttachment}"/></td>
                                        <td ><%-- allow this column to wrap --%>
                                            <a href="${msgUrl}"><span style='overflow: hidden;'>${fn:escapeXml(empty hit.fragment ? emptyFragment : zm:truncate(hit.fragment,100, true))}</span></a>
                                            <c:if test="${hit.id == message.id}">
                                                <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}" index="${status.index}"/>
                                                <c:if test="${messCursor.hasPrev}">
                                                    <zm:currentResultUrl var="prevMsgUrl" value="cv" context="${context}" cso="${messCursor.prevOffset}" csi="${messCursor.prevIndex}" css="${param.css}"/>
                                                    <a href="${prevMsgUrl}" accesskey='k'></a>
                                                </c:if>
                                                <c:if test="${messCursor.hasNext}">
                                                    <zm:currentResultUrl var="nextMsgUrl" value="cv"  context="${context}" cso="${messCursor.nextOffset}" csi="${messCursor.nextIndex}" css="${param.css}"/>
                                                    <a href="${nextMsgUrl}" accesskey='j'></a>
                                                </c:if>
                                            </c:if>
                                        </td>
                                        <td nowrap>${fn:escapeXml(zm:getFolderName(pageContext, hit.folderId))}</td>
                                        <td nowrap>${fn:escapeXml(zm:displaySize(hit.size))}</td>
                                        <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.date))}</td>
                                    </tr>
                                </c:forEach>
                                <tr><td colspan=10>&nbsp;</td></tr>
                            </table>
                        </div> <%-- list --%>

                        <c:set var="extImageUrl" value=""/>
                        <c:if test="${empty param.xim}">
                            <zm:currentResultUrl var="extImageUrl" value="cv" context="${context}"
                                                 cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}" xim="1"/>
                        </c:if>
                        <zm:currentResultUrl var="composeUrl" value="" context="${context}" id="${message.id}"
                                             action="compose" cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}"/>
                        <app:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}"/>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <app:convToolbar top='false' context="${context}" convSearchResult="${convSearchResult}" convCursor="${convCursor}" convHit="${convHit}" keys="false"/>
                </td>
            </tr>
            <input type="hidden" name="doAction" value="1"/>
        </table>
    </form>
</app:view>
