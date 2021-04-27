<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<!-- Dependencies -->
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/animation/animation-debug.js"></script>

<!-- Drag and Drop source file -->
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/dragdrop/dragdrop-debug.js"></script>

<app:handleError>
	<zm:getMailbox var="mailbox"/>
	<app:searchTitle var="title" context="${context}"/>
	<c:set var="cid" value="${(not empty param.cid && not zm:actionSet(param, 'actionHardDelete') && not zm:actionSet(param, 'actionDelete')) ? param.cid : ''}"/>
	<fmt:message var="unknownRecipient" key="unknownRecipient"/>
	<fmt:message var="unknownSubject" key="noSubject"/>
	<c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
	<c:set var="selectedRow" value="${param.selectedRow}"/>
	<c:set var="context" value="${context}" />
	<c:set var="csi" value="${param.csi}"/>
	<app:certifiedMessage var="reqHdr"/>
	<c:if test="${context.searchResult.size ne '0' and mailbox.prefs.readingPaneLocation eq 'bottom' and not empty cid}">
		<zm:searchConv  var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}" limit="${-1}" />
        <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
		<c:if test="${empty csi}">
			<c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
			<c:if test="${csi ge 0}">
				<zm:getMessage var="msg" id="${convSearchResult.hits[csi].id}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${mailbox.prefs.displayExternalImages ? '1' : empty param.xim}" requestHeaders="${reqHdr}"/>
				<c:if test="${not empty msg.requestHeader}">
					<zm:getMessage var="msg" id="${convSearchResult.hits[csi].id}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${false}" requestHeaders="${reqHdr}"/>
				</c:if>
			</c:if>
		</c:if>
		<c:if test="${msg eq null}">
			<c:if test="${csi lt 0 or csi ge convSearchResult.size}">
				<c:set var="csi" value="0"/>
			</c:if>
			<zm:getMessage var="msg" id="${not empty param.id and param.action ne 'compose'? param.id : convSearchResult.hits[csi].id}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${mailbox.prefs.displayExternalImages ? '1' : empty param.xim}" requestHeaders="${reqHdr}"/>
			<c:if test="${not empty msg.requestHeader}">
				<zm:getMessage var="msg" id="${not empty param.id and param.action ne 'compose' ? param.id : convSearchResult.hits[csi].id}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${false}" requestHeaders="${reqHdr}"/>
			</c:if>
		</c:if>
		<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
		<c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
        <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
        <fmt:message var="unknownSender" key="unknownSender"/>
        <c:set var="convdisp" value="true"/>
	</c:if>
</app:handleError>
<app:view mailbox="${mailbox}" title="${title}" selected='mail' folders="true" tags="true" searches="true" context="${context}" keys="true">
<c:set var="actionVar" value="${empty param.paction ? param.action : param.paction}" />
<zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
<form name="zform" action="${fn:escapeXml(currentUrl)}" method="post">
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td class='TbTop'>
            <app:convListViewToolbar context="${context}" keys="true"/>
        </td>
    </tr>
    <tr>
		<td class='List' valign="top" width="100%">
		<table width="100%" cellpadding="2" cellspacing="0">
            <tbody id="mess_list_tbody">
            <tr class='Header'>
                <th class='CB' nowrap='nowrap'><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type="checkbox" name="allids"/></th>
                <th class='Img' nowrap><app:img src="startup/ImgNodeCollapsed.png"/></th>
				<c:if test="${mailbox.features.flagging}">
					<th class='Img' nowrap='nowrap'><app:img src="startup/ImgFlagRed.png" altkey="ALT_FLAGGED"/></th>
				</c:if>
				<c:if test="${mailbox.features.mailPriority}">
					<th class='ImgNarrow' nowrap='nowrap'  width='12'><app:img src="startup/ImgPriorityHigh_list.png" altkey="ALT_PRIORITY"/></th>
				</c:if>
				<c:if test="${mailbox.features.tagging}">
					<th class='Img' nowrap><app:img src="startup/ImgTag.png" altkey="ALT_TAG_TAG"/></th>
				</c:if>
                <th class='Img' nowrap=""><app:img src="startup/ImgMsgStatus.png"/></th>
				<th width="10%" nowrap><fmt:message key="${useTo ? 'to' : 'from'}"/></th>
				<th class='Img' nowrap width='20'><app:img src="startup/ImgAttachment.png" altkey="ALT_ATTACHMENT"/></th>
				<th nowrap>
					<zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
					<a href="${fn:escapeXml(subjectSortUrl)}">
						<fmt:message key="subject"/>
					</a></th>
				<th width="20" nowrap><app:img src="startup/ImgConversation.png" altkey="ALT_CONVERSATION"/></th>
				<th nowrap width="5%">
					<zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
					<a href="${fn:escapeXml(dateSortUrl)}">
						<fmt:message key="received"/>
					</a>
                </th>
			</tr>
            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                <c:set var="convHit" value="${hit.conversationHit}"/>
                <zm:currentResultUrl var="convUrl" value="search" cid="${hit.id}" action="${(mailbox.prefs.readingPaneLocation eq 'bottom' and param.action != 'rowView') ? 'rowView' : (hit.id eq param.cid ? 'view' : 'rowView2')}" index="${status.index}" context="${context}" usecache="true" xim="${mailbox.prefs.displayExternalImages ? '1' : param.xim}"/>
                <zm:currentResultUrl var="expandUrl" value="search" cid="${hit.id}" action="rowView" index="${status.index}" context="${context}" usecache="true" xim="${mailbox.prefs.displayExternalImages ? '1' : param.xim}"/>
                <zm:currentResultUrl var="collapseUrl" value="search" cid="${hit.id}" index="${status.index}" context="${context}" usecache="true" xim="${mailbox.prefs.displayExternalImages ? '1' : param.xim}"/>
                <c:if test="${empty selectedRow and convHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                <c:set var="aid" value="A${status.index}"/>
                <tr onclick='zSelectRow(event,"B${status.index}","C${status.index}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd':'ZhRow'} ${convHit.isUnread ? ' Unread':''}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                    <td class='CB' nowrap="nowrap"><input  id="C${status.index}" type="checkbox" name="id" value="${convHit.id}"></td>
                    <td class='Img' nowrap>
                        <c:choose>
                            <c:when test="${convHit.messageCount > 1 and param.action == 'rowView' and hit.id eq param.cid}"><a href="${fn:escapeXml(collapseUrl)}" id="${aid}"><app:img src="startup/ImgNodeExpanded.png"/></a></c:when>
                            <c:when test="${convHit.messageCount > 1}"><a href="${fn:escapeXml(expandUrl)}" id="${aid}"><app:img src="startup/ImgNodeCollapsed.png"/></a></c:when>
                        </c:choose>
                    </td>
                    <c:if test="${mailbox.features.flagging}">
                        <td class='Img'><app:flagImage flagged="${convHit.isFlagged}"/></td>
                    </c:if>
                    <c:if test="${mailbox.features.mailPriority}">
                        <td class='ImgNarrow' nowrap='nowrap' width='12'><app:priorityImage high="${convHit.isHighPriority}" low="${convHit.isLowPriority}"/></td>
                    </c:if>
                    <c:if test="${mailbox.features.tagging}">
                        <td class='Img'><app:miniTagImage ids="${convHit.tagIds}"/></td>
                    </c:if>
                    <td class='Img' nowrap="">&nbsp;</td>
                    <td width='10%'><%-- allow this column to wrap --%>
                        <c:set var="dispRec" value="${zm:truncate(convHit.displayRecipients,20,true)}"/>${fn:escapeXml(empty dispRec ? unknownRecipient : dispRec)}
                    </td>
                    <td class='Img'><app:attachmentImage attachment="${convHit.hasAttachment}"/></td>
                    <td><%-- allow this column to wrap --%>
                        <a href="${fn:escapeXml(convUrl)}" id="B${status.index}">
                            <c:set var='subj' value="${empty convHit.subject ? unknownSubject : zm:truncate(convHit.subject,100,true)}"/>
                            <span><c:out value="${zm:truncate(subj,60,true)}"/></span>
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
                    <td nowrap='nowrap' width='20'><c:if test="${convHit.messageCount > 1}">(${convHit.messageCount})&nbsp;</c:if><c:if test="${convHit.messageCount < 2}">&nbsp</c:if></td>
                    <td nowrap='nowrap' width='5%'>${fn:escapeXml(zm:displayMsgDate(pageContext, convHit.date))}</td>
                </tr>
                <c:if test="${context.searchResult.size ne '0' and mailbox.prefs.readingPaneLocation eq 'bottom' and not empty cid and (param.action eq 'rowView' or param.action eq 'rowView2') and convdisp eq 'true' and selectedRow eq status.index and convHit.messageCount > 1}">
                <c:set var="convdisp" value="false"/>
                <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="stat">
                       <zm:currentResultUrl var="msgUrl" value="search" cid="${convSummary.id}" id="${hit.id}" action='${actionVar}' context="${context}"
                                                                 cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                       <zm:currentResultUrl var="msgSepUrl" value="search" action="${msg.isDraft ? 'compose' : 'view'}" context="${context}"
                                                                     cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}" st="${msg.isDraft ? '' : 'message'}" sc="" id="${msg.id}"/>
                       <c:set var="aid" value="A${stat.index}11"/>
                       <tr onclick='zSelectRow(event,"${aid}","C${stat.index}11")' id="R${stat.index}11" class='ZhRow${(hit.messageHit.isUnread and (hit.id != msg.id)) ? ' Unread':''}${hit.id eq msg.id ? ' RowSelected' : ((context.showMatches and hit.messageHit.messageMatched) ? ' RowMatched' : ' ZhConvExpanded')}'>
                            <td class='CB' nowrap><input id="C${stat.index}11"<c:if test="${hit.id eq msg.id}">checked</c:if> type=checkbox name="idcv" value="${hit.id}"/></td>
                            <td class="Img">&nbsp;</td>
                            <c:if test="${mailbox.features.flagging}">
                                <td class='Img'><app:flagImage flagged="${hit.messageHit.isFlagged}"/></td>
                            </c:if>
                            <c:if test="${mailbox.features.mailPriority}">
                                <td class='ImgNarrow' nowrap='nowrap' width='12'><app:priorityImage high="${hit.messageHit.isHighPriority}" low="${hit.messageHit.isLowPriority}"/></td>
                            </c:if>
                            <c:if test="${mailbox.features.tagging}">
                                <td class='Img'><app:miniTagImage ids="${hit.messageHit.tagIds}"/></td>
                            </c:if>
                            <td class='Img'><app:img src="${(hit.messageHit.isUnread and hit.id == msg.id) ? 'startup/ImgMsgStatusRead.png' : hit.messageHit.statusImage}" altkey="${(hit.messageHit.isUnread and hit.id == msg.id) ? 'ALT_MSG_STATUS_READ' : hit.messageHit.statusImageAltKey}"/></td>
                            <td nowrap width="10%">
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <c:set var="sender" value="${hit.messageHit.displaySender}"/>${fn:escapeXml(empty sender ? unknownSender : sender)}
                            </td>
                            <td class='Img' nowrap><app:attachmentImage attachment="${hit.messageHit.hasAttachment}"/></td>
                            <td nowrap> <%-- allow wrap --%>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a href="${hit.id eq msg.id ? fn:escapeXml(msgSepUrl) : fn:escapeXml(msgUrl)}" id="A${stat.index}11">
                                    <c:if test="${mailbox.prefs.showFragments and not empty hit.messageHit.fragment}">
                                        <span class='Fragment'>${fn:escapeXml(empty hit.messageHit.fragment ? emptyFragment : zm:truncate(hit.messageHit.fragment,50, true))}</span>
                                    </c:if>
                                </a>
                            </td>
                            <td nowrap='nowrap' width="20">&nbsp;</td>
                            <td nowrap='nowrap' width="5%">${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}</td>
                       </tr>
                </c:forEach>
                </c:if>
            </c:forEach>
			</tbody>
        </table>
        <c:if test="${context.searchResult.size == 0}">
			<div class='NoResults'><fmt:message key="noResultsFound"/></div>
		</c:if>
    	</td>
    </tr>
<tr>                    

<td class='ZhAppColContent' valign="top" width="55%">
<c:choose>
    <c:when test="${mailbox.prefs.readingPaneLocation eq 'bottom' and not empty msg}">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
        <td class='ZhAppContent2' valign="top">
							<c:set var="extImageUrl" value=""/>
							<c:if test="${empty param.xim and empty msg.requestHeader}">
								<zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
							</c:if>
							<zm:currentResultUrl var="composeUrl" value="search" context="${context}" action="compose" paction="view" id="${msg.id}"/>
							<zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
							<app:displayMessage mailbox="${mailbox}" message="${msg}" externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
						</td>
        </tr>
        </table>

    </c:when>
    <c:otherwise>
          <div class='NoResults'><fmt:message key="viewMessage"/></div>
     </c:otherwise>
</c:choose>
</td>
</tr>

<tr>
	<td class='TbBottom'>
		<app:convListViewToolbar context="${context}" keys="false"/>
	</td>
</tr>
</table>
<input type="hidden" name="doConvListViewAction" value="1"/>
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : zm:cook(selectedRow)}"/>

</form>

<SCRIPT TYPE="text/javascript">
	<!--
	var zrc = ${empty context.searchResult ? 0 : context.searchResult.size };
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
	var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
	var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
	var zunflag = function() { zaction("OPUNFLAG"); }
	var zflag = function() { zaction("OPFLAG"); }
	var zread = function() { zaction("OPREAD"); }
	var zunread = function() { zaction("OPUNREAD"); }
	var zjunk = function() { zclick("SOPSPAM"); }
	function setactionOp(val) {
		document.getElementById("actionOp").value = val;
		zclick('SOPSET');
	}
	function setviewOp(val) {
		document.getElementById("viewOp").value = val;
		zclick('SOPSET');
	}
	function setreadingPaneOp(val) {
    	document.getElementById("readingPaneOp").value = val;
		zclick("SOPVIEW");
	}
	function zSelectRow(ev,id,cid) {
		var t = ev.target || ev.srcElement;
		if (t&&t.className=="CB") {
			var cb = document.getElementById(cid);
			if (cb) {
				cb.checked = !cb.checked;
			}
		} else if (t&&t.nodeName != 'INPUT'){
			var a = document.getElementById(id);
			if (a)
				window.location = a.href;
		}
	}

	var zprint = function(){
		try{
			var idex = 0;
			var c ="";
			var elemid = document.getElementsByName('id');
            var elemidcv = document.getElementsByName('idcv');
            /*
            All conversations and messages(virtual conv) have the same name(id),
            loop over to find which of them is selected
             */
            while (elemid[idex]) {
                if (elemid[idex].checked) {
                    cid = elemid[idex].value;
                    c += "C:"+cid+",";
                }
                idex++;
            }
            idex = 0;
            /*
            Since conversations can be expanded inline, all the messages that are part of conversations
            have the same name(idcv), loop over to find which of them is selected.
             */
            while (elemidcv[idex]) {
                if (elemidcv[idex].checked) {
                    cid = elemidcv[idex].value;
                    c += cid+",";
                }
                idex++;
            }
            if (c.charAt(c.length-1) == ',') {
                c = c.substr(0, c.length-1);
            }
		}catch(ex){
		}
		if(c == ""){
			alert("<fmt:message key="actionNoConvSelected"/>");return;
		}
		window.open("/h/printmessage?id="+c);
	}

   //-->
</SCRIPT>

<app:keyboard cache="mail.convListView" globals="true" mailbox="${mailbox}" tags="true" folders="true">
	<c:if test="${mailbox.features.flagging}">
		<zm:bindKey message="mail.Flag" func="zflag"/>
		<zm:bindKey message="mail.UnFlag" func="zunflag"/>
	</c:if>
	<c:if test="${context.searchResult.size ne '0' and mailbox.prefs.readingPaneEnabled and not empty cid and (param.action eq 'paneView' or param.action eq 'paneView2')}">
		<zm:bindKey message="mail.Reply" id="OPREPLY"/>
		<zm:bindKey message="mail.ReplyAll" id="OPREPLYALL"/>
		<zm:bindKey message="mail.Forward" id="OPFORW"/>
	</c:if>
	<zm:bindKey message="mail.MarkRead" func="zread"/>
	<zm:bindKey message="mail.MarkUnread" func="zunread"/>
	<c:if test="${mailbox.features.spam}">
		<zm:bindKey message="mail.Spam" func="zjunk"/>
	</c:if>
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
<script type="text/javascript">
(function() {

	var target = [], lastTarget = false;
	YAHOO.util.DDM.mode = YAHOO.util.DDM.INTERSECT;

	var $E = YAHOO.util.Event;
	var $D = YAHOO.util.Dom;
	var $ = $D.get;
	//YAHOO.util.Event.onDOMReady(onReady)
	// setTimeout(onReady, 2000);

	function init() {
		var rowId, rowObj, rowNo, mesgId, endDr = false;

	<c:set var="ids" value="" />
	<zm:forEachFolder var="folder">
	<c:if test="${(folder.isConversationMoveTarget) and not context.folder.isDrafts}">
	<c:set var="ids" value="${ids}${folder.id}," />
	</c:if>

	</zm:forEachFolder>

		var ids_str = "${ids}";
		var ids  = ids_str.split(",");
		for(var i=0;i<ids.length; i++){
			if(ids[i] != ""){
				if ($D.get("folder_"+ids[i])) {
					target[target.length] = new YAHOO.util.DDTarget("folder_"+ids[i]);
				}
			}
		}


		var tBody = $("mess_list_tbody");
		var drop = new YAHOO.util.DDProxy(tBody, 'default', { dragElId: "ddProxy", resizeFrame: false, centerFrame: false });

		drop.onMouseDown = function(ev) {
			/*get TR el. from event obj */
			var target = $E.getTarget(ev);
			var parentNode = target.parentNode;
			while (parentNode.nodeName != "TR"){
				parentNode = parentNode.parentNode;
			}
			rowId = parentNode.id;
			rowObj = parentNode;
			rowNo = rowId.substring(1);

			/* to support multiple drag & drop */
			var msgIds = [];
			var count = 0;
			for(var k = 0 ; k < zrc ; k++) {
				if(document.getElementById("C"+k).checked) {
					msgIds[count] = document.getElementById("C"+k).value;
					count++;

				}
			}
			var msgIdstr = msgIds.join(",");
			mesgId = (msgIdstr != "") ? msgIdstr : document.getElementById("C"+rowNo).value;

			this.deltaY = 15;
			this.deltaX = (YAHOO.util.Event.getPageX(ev) - $D.getXY(document.getElementById(rowId))[0]);

		};

		drop.startDrag= function(){
			var dragEl = this.getDragEl();
			var clickEl = document.getElementById(rowId);
			var msglen = mesgId.split(",").length;
			dragEl.innerHTML = (msglen > 1) ? '<td><img id="zldragdrop" src="<c:url value='/img/large/ImgDndMultiNo_48.gif' />"/><div style="position:absolute;top:27;left:23;color:white;width:20px;text-align:center;font-weight:bold;">'+msglen+'</div></td>' : clickEl.innerHTML;
			document.getElementById("C"+rowNo).checked = true;
			if(msglen == 1) {
				dragEl.style.border = "2px solid #aaa";
				$D.setStyle(dragEl, "color", $D.getStyle(clickEl, "color"));
				$D.setStyle(dragEl, "height", clickEl.offsetHeight+"px");
				$D.setStyle(dragEl, "width", "70%");
				$D.addClass(dragEl.id, "proxy");
			} else {
				dragEl.style.border = "none";
				$D.setStyle(dragEl, "color", "");
				$D.setStyle(dragEl, "height","");
				$D.setStyle(dragEl, "width", "");
				$D.removeClass(dragEl.id, "proxy");
			}
		};

		drop.endDrag = function(){
			/* on proper drop dont animate it back to its place */
			if(!endDr){
				//var srcEl = this.getEl();
				var srcEl = document.getElementById(rowId);
				var proxy  = this.getDragEl();
				/* Show the proxy element and animate it to the src element's location */
				$D.setStyle(proxy, "visibility", "");
				var a = new YAHOO.util.Motion(
						proxy, {
					points: {
						to: $D.getXY(srcEl)
					}
				},0.6,YAHOO.util.Easing.easeOut )
				var proxyid = proxy.id;
				var thisid = this.id;

				/* Hide the proxy and show the source element when finished with the animation */
				a.onComplete.subscribe(function() {
					$D.setStyle(proxyid, "visibility", "hidden");
					$D.setStyle(thisid, "visibility", "");
				});
				a.animate();
			}
		};

		drop.onDragOver= function(ev, id){
			var msglen = mesgId.split(",").length;
			if (lastTarget) {
				$D.removeClass(lastTarget,'dragoverclass');
				if(msglen > 1) {
					document.getElementById("zldragdrop").src = "<c:url value='/img/large/ImgDndMultiNo_48.gif' />";
				}
			}
			lastTarget = id[0].id;
			$D.addClass(lastTarget,'dragoverclass');
			if(msglen > 1) {
				document.getElementById("zldragdrop").src = "<c:url value='/img/large/ImgDndMultiYes_48.gif' />";
			}
		};

		drop.onDragOut= function(ev, id){
			id = id[0].id;
			$D.removeClass(id,'dragoverclass');
			var msglen = mesgId.split(",").length;
			if(msglen > 1) {
				document.getElementById("zldragdrop").src = "<c:url value='/img/large/ImgDndMultiNo_48.gif' />";
			}
		};

		drop.onDragDrop= function(ev, id){
			var proxyId  = this.getDragEl().id;
			id=id[0].id;
			/*remove class after a little delay to make user sure of wher he dropped*/
			window.setTimeout( function() { $D.removeClass(id,'dragoverclass'); }, 800 );
			$D.setStyle(proxyId, "visibility", "hidden");
			YAHOO.util.DragDropMgr.stopDrag(ev,true);

			endDr = true ;
			targId=id.split("_")[1];
			$("drag_target_folder").value="m:"+targId;
			$("drag_msg_id").value = mesgId;
			zclick('SOPMOVE');

		};
	}

	YAHOO.util.Event.addListener(window, 'load', init);

})();

</script>
</app:view>

