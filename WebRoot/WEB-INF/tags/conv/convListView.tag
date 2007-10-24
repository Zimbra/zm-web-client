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
    <c:set var="context" value="${context}" />
</app:handleError>
<app:view mailbox="${mailbox}" title="${title}" selected='mail' folders="true" tags="true" searches="true" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <form name="zform" action="${fn:escapeXml(currentUrl)}" method="post">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:convListViewToolbar context="${context}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='List'>
                        <table width="100%" cellpadding="2" cellspacing="0">
                            <tr class='Header'>
                                <th class='CB' nowrap='nowrap'><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type="checkbox" name="allids"/></th>
                                <c:if test="${mailbox.features.flagging}">
                                <th class='Img'  nowrap='nowrap' width='20'><app:img src="startup/ImgFlagRed.gif" altkey="ALT_FLAGGED"/></th>
                                </c:if>
                                <c:if test="${mailbox.features.mailPriority}">
                                <th class='Img' nowrap='nowrap' width='20'><app:img src="tasks/ImgTaskHigh.gif" altkey="ALT_PRIORITY"/></th>
                                </c:if>
                                <c:if test="${mailbox.features.tagging}">
                                <th class='Img' nowrap width='20'><app:img src="startup/ImgTagOrange.gif" altkey="ALT_TAG_TAG"/></th>
                                </c:if>
                                <th width="10%" nowrap><fmt:message key="${useTo ? 'to' : 'from'}"/></th>
                                <th class='Img' nowrap width='1%'><app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/></th>
                                <th nowrap>
                                    <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                                <a href="${fn:escapeXml(subjectSortUrl)}">
                                    <fmt:message key="subject"/>
                                </a></th>
                                <th width="2%" nowrap><app:img src="mail/ImgConversation.gif" altkey="ALT_CONVERSATION"/></th>
                                <th nowrap width="2%">
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                <a href="${fn:escapeXml(dateSortUrl)}">
                                    <fmt:message key="received"/>
                                </a></th>
                            </tr>

                            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                                <c:set var="convHit" value="${hit.conversationHit}"/>
                                <c:choose>
                                    <c:when test="${convHit.isDraft}">
                                        <zm:currentResultUrl var="convUrl" value="search" index="${status.index}" context="${context}" usecache="true" id="${fn:substringAfter(convHit.id,'-')}" action="compose"/>
                                    </c:when>
                                    <c:otherwise>
                                        <zm:currentResultUrl var="convUrl" value="search" cid="${hit.id}" action='view' index="${status.index}" context="${context}" usecache="true"/>
                                    </c:otherwise>
                                </c:choose>
                                <c:if test="${empty selectedRow and convHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                                <c:set var="aid" value="A${status.index}"/>
                                <tr onclick='zSelectRow(event,"${aid}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'} ${convHit.isUnread ? ' Unread':''}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                                    <td class='CB' nowrap><input  id="C${status.index}" type="checkbox" name="id" value="${convHit.id}"></td>
                                    <c:if test="${mailbox.features.flagging}">
                                    <td class='Img'><app:flagImage flagged="${convHit.isFlagged}"/></td>
                                    </c:if>
                                    <c:if test="${mailbox.features.mailPriority}">
                                    <td class='Img'><app:priorityImage high="${convHit.isHighPriority}" low="${convHit.isLowPriority}"/></td>
                                    </c:if>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${convHit.tagIds}"/></td>
                                    </c:if>
                                    <td><%-- allow this column to wrap --%>
                                        <c:set var="dispRec" value="${convHit.displayRecipients}"/>${fn:escapeXml(empty dispRec ? unknownRecipient : dispRec)}
                                    </td>
                                    <td class='Img'><app:attachmentImage attachment="${convHit.hasAttachment}"/></td>
                                    <td><%-- allow this column to wrap --%>
                                        <a href="${fn:escapeXml(convUrl)}" id="${aid}">
                                            <c:set var='subj' value="${empty convHit.subject ? unknownSubject : zm:truncate(convHit.subject,100,true)}"/>
                                            <c:out value="${subj}"/>
                                            <c:if test="${mailbox.prefs.showFragments and not empty convHit.fragment and fn:length(subj) lt 90}">
                                                <span class='Fragment'> - <c:out value="${zm:truncate(convHit.fragment,100-fn:length(subj),true)}"/></span>
                                            </c:if>
                                        </a>
                                        <c:if test="${convHit.id == context.currentItem.id}">
                                            <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
                                            <c:if test="${cursor.hasPrev}">
                                                <zm:prevItemUrl var="prevItemUrl" value="search" cursor="${cursor}" context="${context}" usecache="true"/>
                                                <a href="${fn:escapeXml(prevItemUrl)}" id="PREV_ITEM"></a>
                                            </c:if>
                                            <c:if test="${cursor.hasNext}">
                                                <zm:nextItemUrl var="nextItemUrl" value="search" cursor="${cursor}" context="${context}" usecache="true"/>
                                                <a href="${fn:escapeXml(nextItemUrl)}" id="NEXT_ITEM"></a>
                                            </c:if>
                                        </c:if>
                                    </td>
                                    <td nowrap><c:if test="${convHit.messageCount > 1}">(${convHit.messageCount})&nbsp;</c:if><c:if
                                            test="${convHit.messageCount < 2}">&nbsp</c:if></td>
                                    <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, convHit.date))}</td>
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
        var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
        var zunflag = function() { zaction("OPUNFLAG"); }
        var zflag = function() { zaction("OPFLAG"); }
        var zread = function() { zaction("OPREAD"); }
        var zunread = function() { zaction("OPUNREAD"); }
        var zjunk = function() { zclick("SOPSPAM"); }
        function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
        //-->
    </SCRIPT>

    <app:keyboard cache="mail.convListView" globals="true" mailbox="${mailbox}" tags="true" folders="true">
        <c:if test="${mailbox.features.flagging}">
        <zm:bindKey message="mail.Flag" func="zflag"/>
        <zm:bindKey message="mail.UnFlag" func="zunflag"/>
        </c:if>
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
        <c:if test="${mailbox.features.tagging}">
            <zm:bindKey message="global.Tag" func="function() {zaction('OPTAG{TAGID}')}" alias="tag"/>
        </c:if>
        <zm:bindKey message="mail.MoveToFolder" func="function() {zmove('OPFLDR{FOLDERID}')}" alias="folder"/>
    </app:keyboard>

</app:view>
