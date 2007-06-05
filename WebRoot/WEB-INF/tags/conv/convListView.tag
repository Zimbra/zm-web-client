<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <app:searchTitle var="title" context="${context}"/>
    <c:set var="cid" value="${empty param.id ? context.searchResult.hits[0].id : param.id}"/>
    <fmt:message var="unknownRecipient" key="unknownRecipient"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
</app:handleError>
<app:view mailbox="${mailbox}" title="${title}" selected='mail' folders="true" tags="true" searches="true" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <form name="zform" action="${currentUrl}" method="post">
        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:convListViewToolbar context="${context}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='List'>
                        <table width=100% cellpadding=2 cellspacing=0>
                            <tr class='Header'>
                                <th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                                <th class='Img' nowrap><app:img src="tag/FlagRed.gif" altkey="ALT_FLAGGED"/>
                                <c:if test="${mailbox.features.tagging}">
                                <th class='Img' nowrap><app:img src="tag/MiniTagOrange.gif" altkey="ALT_TAG_TAG"/>
                                </c:if>
                                <th width=10% nowrap><fmt:message key="${useTo ? 'to' : 'from'}"/>
                                <th class='Img' nowrap><app:img src="common/Attachment.gif" altkey="ALT_ATTACHMENT"/>
                                <th nowrap>
                                    <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                                <a href="${subjectSortUrl}">
                                    <fmt:message key="subject"/>
                                </a>
                                <th width=1% nowrap><app:img src="mail/Conversation.gif" altkey="ALT_CONVERSATION"/>
                                <th width=1% nowrap>
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                <a href="${dateSortUrl}">
                                    <fmt:message key="received"/>
                                </a>
                            </tr>

                            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                                <c:choose>
                                    <c:when test="${hit.conversationHit.isDraft}">
                                        <zm:currentResultUrl var="convUrl" value="search" index="${status.index}" context="${context}" usecache="true" id="${fn:substringAfter(hit.conversationHit.id,'-')}" action="compose"/>
                                    </c:when>
                                    <c:otherwise>
                                        <zm:currentResultUrl var="convUrl" value="search" cid="${hit.id}" action='view' index="${status.index}" context="${context}" usecache="true"/>
                                    </c:otherwise>
                                </c:choose>
                                <c:if test="${empty selectedRow and hit.conversationHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                                <tr id="R${status.index}" class='ZhRow ${hit.conversationHit.isUnread ? ' Unread':''}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                                    <td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${hit.conversationHit.id}"></td>
                                    <td class='Img'><app:flagImage flagged="${hit.conversationHit.isFlagged}"/></td>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${hit.conversationHit.tagIds}"/></td>
                                    </c:if>
                                    <td><%-- allow this column to wrap --%>
                                        <c:set var="dispRec" value="${hit.conversationHit.displayRecipients}"/>
                                        <a href="${convUrl}">${fn:escapeXml(empty dispRec ? unknownRecipient : dispRec)}</a>
                                    </td>
                                    <td class='Img'><app:attachmentImage attachment="${hit.conversationHit.hasAttachment}"/></td>
                                    <td><%-- allow this column to wrap --%>
                                        <a href="${convUrl}" id="A${status.index}">
                                            <c:set var='subj' value="${empty hit.conversationHit.subject ? unknownSubject : zm:truncate(hit.conversationHit.subject,100,true)}"/>
                                            <c:out value="${subj}"/>
                                            <c:if test="${mailbox.prefs.showFragments and not empty hit.conversationHit.fragment and fn:length(subj) lt 90}">
                                                <span class='Fragment'> - <c:out value="${zm:truncate(hit.conversationHit.fragment,100-fn:length(subj),true)}"/></span>
                                            </c:if>
                                        </a>
                                        <c:if test="${hit.conversationHit.id == context.currentItem.id}">
                                            <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
                                            <c:if test="${cursor.hasPrev}">
                                                <zm:prevItemUrl var="prevItemUrl" value="search" cursor="${cursor}" context="${context}" usecache="true"/>
                                                <a href="${prevItemUrl}" id="PREV_ITEM"></a>
                                            </c:if>
                                            <c:if test="${cursor.hasNext}">
                                                <zm:nextItemUrl var="nextItemUrl" value="search" cursor="${cursor}" context="${context}" usecache="true"/>
                                                <a href="${nextItemUrl}" id="NEXT_ITEM"></a>
                                            </c:if>
                                        </c:if>
                                    </td>
                                    <td nowrap><c:if test="${hit.conversationHit.messageCount > 1}">(${hit.conversationHit.messageCount})&nbsp;</c:if><c:if
                                            test="${hit.conversationHit.messageCount < 2}">&nbsp</c:if></td>
                                    <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.conversationHit.date))}</td>
                                </tr>
                            </c:forEach>
                        </table>
                        <c:if test="${context.searchResult.size == 0}">
                            <div class='NoResults'><fmt:message key="noResultsFound"/></div>
                        </c:if>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:convListViewToolbar context="${context}" keys="false"/>
                </td>
            </tr>
        </table>
        <input type="hidden" name="doConvListViewAction" value="1"/>
        <input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : selectedRow}"/>        

    </form>

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
        //-->
    </SCRIPT>

    <app:keyboard globals="true">

        <zm:bindKey message="mail.Flag" func="zflag"/>
        <zm:bindKey message="mail.UnFlag" func="zunflag"/>
        <zm:bindKey message="mail.MarkRead" func="zread"/>
        <zm:bindKey message="mail.MarkUnread" func="zunread"/>
        <zm:bindKey message="mail.Spam" func="zjunk"/>
        <zm:bindKey message="mail.Delete" func="function() { zclick('SOPDELETE')}"/>
        <zm:bindKey message="global.CheckCheckBox" func="zcs"/>

        <zm:bindKey message="mail.GoToInbox" id="FLDR2"/>
        <zm:bindKey message="mail.GoToDrafts" id="FLDR6"/>
        <zm:bindKey message="mail.GoToSent" id="FLDR5"/>
        <zm:bindKey message="mail.GoToTrash" id="FLDR3"/>

        <zm:bindKey message="global.SelectAllCheckBoxes" func="function() { zclick('OPCHALL')}"/>
        <zm:bindKey message="conversation.Open" func="zos"/>
        <zm:bindKey message="global.CheckAndPreviousItem" func="zcsp"/>
        <zm:bindKey message="global.CheckAndNextItem" func="zcsn"/>
        <zm:bindKey message="global.PreviousItem" func="zsp"/>
        <zm:bindKey message="global.NextItem" func="zsn"/>
        <zm:bindKey message="global.PreviousPage" id="PREV_PAGE"/>
        <zm:bindKey message="global.NextPage" id="NEXT_PAGE"/>
    </app:keyboard>

</app:view>
