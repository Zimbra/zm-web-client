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
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:message var="unknownRecipient" key="unknownRecipient"/>
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:set var="context" value="${context}" />
    <c:if test="${false and mailbox.prefs.readingPaneEnabled}">
        <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true" neuterimages="${empty param.xim}"/>
        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
        <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
    </c:if>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
</app:handleError>

<app:view mailbox="${mailbox}" title="${title}" context="${context}" selected='mail' folders="true" tags="true" searches="true" keys="true">

<form action="${fn:escapeXml(currentUrl)}" method="post" name="zform">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td class='TbTop'>
                <app:messageListViewToolbar context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='List'>
                    <table width="100%" cellpadding="2" cellspacing="0">
                        <tr>
                            <th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                            <c:if test="${mailbox.features.flagging}">
                            <th class='Img' nowrap><app:img src="startup/ImgFlagRed.gif" altkey="ALT_FLAGGED"/>
                            </c:if>
                            <c:if test="${mailbox.features.mailPriority}">
                            <th class='ImgNarrow' nowrap='nowrap' width='12'><app:img src="startup/ImgPriorityHigh_list.gif" altkey="ALT_PRIORITY"/></th>
                            </c:if>
                            <c:if test="${mailbox.features.tagging}">
                            <th class='Img' nowrap><app:img src="startup/ImgTagOrange.gif" altkey="ALT_TAG_TAG"/>
                            </c:if>
                            <th class='MsgStatusImg' nowrap>&nbsp;
                            <th width="10%">
                                <zm:newSortUrl var="fromSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                            <a href="${fn:escapeXml(fromSortUrl)}">
                                <fmt:message key="${useTo ? 'to' : 'from'}"/>
                            </a>
                            <th width="1%" nowrap><app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/>
                            <th nowrap>
                                <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                            <a href="${fn:escapeXml(subjectSortUrl)}">
                                <fmt:message key="subject"/>
                            </a>

                            <c:if test="${!context.isFolderSearch}">
                            <th width="1%" nowrap><fmt:message key="folder"/>
                            </c:if>
                            <th width="1%" nowrap><fmt:message key="size"/>
                            <th width="1%" nowrap>
                                <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss)? 'dateAsc' : 'dateDesc'}"/>
                            <a href="${fn:escapeXml(dateSortUrl)}">
                                <fmt:message key="received"/>
                            </a>
                        </tr>
                        <c:set value="${context.searchResult.hits[0].id}" var="cid"/>
                        <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                            <c:choose>
                                <c:when test="${hit.messageHit.isDraft}">
                                    <zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/search" context="${context}" action="compose" id="${hit.messageHit.id}"/>
                                </c:when>
                                <c:otherwise>
                                    <zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/search" action="view" context="${context}" id="${hit.messageHit.id}"/>
                                </c:otherwise>
                            </c:choose>
                            <c:if test="${empty selectedRow and hit.messageHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>

                            <tr onclick='zSelectRow(event,"A${status.index}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'} ${hit.messageHit.isUnread ? ' Unread':''}${ selectedRow eq status.index ? ' RowSelected' : ''}'>
                                <td class='CB' nowrap><input id="C${status.index}" type=checkbox name="id" value="${hit.messageHit.id}"></td>
                                <c:if test="${mailbox.features.flagging}">
                                <td class='Img'><app:flagImage flagged="${hit.messageHit.isFlagged}"/></td>
                                </c:if>
                                <c:if test="${mailbox.features.mailPriority}">
                                <td class='ImgNarrow'><app:priorityImage high="${hit.messageHit.isHighPriority}" low="${hit.messageHit.isLowPriority}"/></td>
                                </c:if>
                                 <c:if test="${mailbox.features.tagging}">
                                     <td class='Img'><app:miniTagImage ids="${hit.messageHit.tagIds}"/></td>
                                </c:if>
                                <td class='MsgStatusImg' align="center"><app:img src="${hit.messageHit.statusImage}" altkey='${hit.messageHit.statusImageAltKey}'/></td>
                                <td><%-- allow wrap --%>
                                    <c:set var="dispAddr" value="${hit.messageHit.displayAddresses}"/>${fn:escapeXml(empty dispAddr ? unknownRecipient :  dispAddr)}
                                </td>
                                <td class='Img'><app:attachmentImage attachment="${hit.messageHit.hasAttachment}"/></td>
                                <td > <%-- allow this col to wrap --%>

                                    <a href="${fn:escapeXml(currentItemUrl)}" id="A${status.index}">
                                        <c:set var="subj" value="${empty hit.messageHit.subject ? noSubject : hit.messageHit.subject}"/>
                                        <c:out value="${subj}"/>
                                        <c:if test="${mailbox.prefs.showFragments and not empty hit.messageHit.fragment and fn:length(subj) lt 90}">
                                            <span class='Fragment'> - <c:out value="${zm:truncate(hit.messageHit.fragment,100-fn:length(subj),true)}"/></span>
                                        </c:if>
                                    </a>
                                    <c:if test="${hit.id == context.currentItem.id}">
                                        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
                                        <c:if test="${cursor.hasPrev}">
                                            <zm:prevItemUrl var="prevItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                            <a href="${fn:escapeXml(prevItemUrl)}"></a>
                                        </c:if>
                                        <c:if test="${cursor.hasNext}">
                                            <zm:nextItemUrl var="nextItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                            <a href="${fn:escapeXml(nextItemUrl)}"></a>
                                        </c:if>
                                    </c:if>
                                </td>
                                <c:if test="${!context.isFolderSearch}">
                                    <td nowrap>${fn:escapeXml(zm:getFolderName(pageContext, hit.messageHit.folderId))}</td>
                                </c:if>
                                <td nowrap>${fn:escapeXml(zm:displaySize(hit.messageHit.size))}
                                <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}
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
                <app:messageListViewToolbar context="${context}" keys="false"/>
            </td>
        </tr>
        <c:if test="${false and mailbox.prefs.readingPaneEnabled and not empty msg}">
            <tr>
                   <td class='ZhAppContent'>
                        <c:set var="extImageUrl" value=""/>
                        <c:if test="${empty param.xim}">
                            <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                        </c:if>
                        <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                             action="compose" paction="view" id="${msg.id}"/>
                       <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                       <app:displayMessage mailbox="${mailbox}" message="${msg}"externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                </td>
            </tr>
        </c:if>
    </table>
    <input type="hidden" name="doMessageAction" value="1"/>
    <input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : zm:cook(selectedRow)}"/>
  </form>


<SCRIPT TYPE="text/javascript">
    <!--
    var zrc = ${context.searchResult.size};
    var zsr = ${zm:cookInt(selectedRow, 0)};
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
    var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
    var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
    var zunflag = function() { zaction("OPUNFLAG"); }
    var zflag = function() { zaction("OPFLAG"); }
    var zread = function() { zaction("OPREAD"); }
    var zunread = function() { zaction("OPUNREAD"); }
    var zjunk = function() { zclick("SOPSPAM"); }
    function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
    //-->
</SCRIPT>

<app:keyboard cache="mail.messageListView" globals="true" mailbox="${mailbox}" folders="true" tags="true">
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
    <zm:bindKey message="mail.Open" func="zos"/>
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
