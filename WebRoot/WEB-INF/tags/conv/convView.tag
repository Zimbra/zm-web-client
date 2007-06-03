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
    <c:set var="selectedRow" value="${param.selectedRow}"/>

</app:handleError>

<%-- get the message up front, so when we output the overview tree unread counts are correctly reflected --%>
<c:set var="ads" value='${message.subject} ${message.fragment}'/>

<app:view mailbox="${mailbox}" title="${message.subject}" selected='mail' context="${context}" folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="search" action="view" cid="${convSummary.id}" context="${context}" csi="${param.csi}" cso="${param.cso}" css="${param.css}"/>

    <SCRIPT TYPE="text/javascript">
        <!--
        var zrc = ${context.searchResult.size};
        var zsr = ${empty selectedRow ? 0 : selectedRow};
        var zss = function(r,s) {
            var e = document.getElementById("R"+r);
            if (e == null) return;
            if (s) {
                if (e.className.indexOf(" RowSelected") == -1) e.className = e.className + " RowSelected";
                var e2 = document.getElementById("sr"); if (e2) e2.value = r;
            }
            else { if (e.className.indexOf(" RowSelected") != -1) e.className = e.className.replace(" RowSelected", "");}
        }
        var zsn = function() {if (zrc == 0 || (zsr+1 == zrc)) return; zss(zsr, false); zss(++zsr, true);}
        var zsp = function() {if (zrc == 0 || (zsr == 0)) return; zss(zsr, false); zss(--zsr, true);}
        var zos = function() {if (zrc == 0) return; var e = document.getElementById("A"+zsr); if (e && e.href) window.location = e.href;}
        var zcs = function(c) {if (zrc == 0) return; var e = document.getElementById("C"+zsr); if (e) e.checked = c ? c : !e.checked;}
        var zcsn = function () { zcs(true); zsn(); }
        var zcsp = function () { zcs(true); zsp(); }
        var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
        var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
        var zunflag = function() { zaction("OPUNFLAG"); }
        var zflag = function() { zaction("OPFLAG"); }
        var zread = function() { zaction("OPREAD"); }
        var zunread = function() { zaction("OPUNREAD"); }
        var zjunk = function() { zclick("SOPSPAM"); }
        var zmarkall = function() { zclick("SOPMARKALL"); }
        //-->
    </SCRIPT>

    <app:keyboard globals="true">
        <zm:bindKey message="mail.MarkAllRead" func="zmarkall"/>
        <zm:bindKey message="mail.Flag" func="zflag"/>
        <zm:bindKey message="mail.UnFlag" func="zunflag"/>
        <zm:bindKey message="mail.MarkRead" func="zread"/>
        <zm:bindKey message="mail.MarkUnread" func="zunread"/>
        <zm:bindKey message="mail.Spam" func="zjunk"/>
        <zm:bindKey message="global.CheckCheckBox" func="zcs"/>
        <zm:bindKey message="global.SelectAllCheckBoxes" func="function() { zclick('OPCHALL')}"/>

        <zm:bindKey message="mail.ShowExternalImages" id="DISPEXTIMG"/>
        <zm:bindKey message="mail.GoToInbox" id="FLDR2"/>
        <zm:bindKey message="mail.GoToDrafts" id="FLDR6"/>
        <zm:bindKey message="mail.GoToSent" id="FLDR5"/>
        <zm:bindKey message="mail.GoToTrash" id="FLDR3"/>
        <zm:bindKey message="mail.Reply" id="OPREPLY"/>
        <zm:bindKey message="mail.ReplyAll" id="OPREPLYALL"/>
        <zm:bindKey message="mail.Forward" id="OPFORW"/>
        <zm:bindKey message="mail.Close" id="CLOSE_ITEM"/>
        <zm:bindKey message="mail.Open" id="CURR_ITEM"/>

        <zm:bindKey message="global.PreviousItem" id="PREV_ITEM"/>
        <zm:bindKey message="global.NextItem" id="NEXT_ITEM"/>
        <zm:bindKey message="global.PreviousPage" id="PREV_PAGE"/>
        <zm:bindKey message="global.NextPage" id="NEXT_PAGE"/>

        <zm:bindKey message="conversation.PreviousConversation" id="PREV_CONV"/>
        <zm:bindKey message="conversation.NextConversation" id="NEXT_CONV"/>
    </app:keyboard>
    
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
                                                <th class='CB'nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
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

                                                <c:if test="${empty selectedRow and hit.id eq message.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>


                                                <tr id="R${status.index}" class='ZhRow${hit.messageHit.isUnread ? ' Unread':''}${selectedRow eq status.index ? ' RowSelected' : ((context.showMatches and hit.messageHit.messageMatched) ? ' RowMatched' : '')}'>
                                                    <td class='CB' nowrap><input _ignore="1" id="C${status.index}" <c:if test="${hit.id eq message.id}">checked</c:if> type=checkbox name="id" value="${hit.id}"></td>
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
            <input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : selectedRow}"/>

        </table>
    </form>

</app:view>
