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
<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<!-- Dependencies -->
<script type="text/javascript" src="../yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="../yui/2.7.0/animation/animation-debug.js"></script>

<!-- Drag and Drop source file -->
<script type="text/javascript" src="../yui/2.7.0/dragdrop/dragdrop-debug.js"></script>

<app:handleError>
	<zm:getMailbox var="mailbox"/>
	<app:searchTitle var="title" context="${context}"/>
	<fmt:message key="noSubject" var="noSubject"/>
	<fmt:message var="unknownRecipient" key="unknownRecipient"/>
	<zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
	<c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
	<c:set var="context" value="${context}" />
	<c:set var="idcheck" value="${not empty param.id && not zm:actionSet(param, 'actionHardDelete') && not zm:actionSet(param, 'actionDelete') ? param.id : context.currentItem.id}"/>
	<app:certifiedMessage var="reqHdr"/>
	<c:if test="${mailbox.prefs.readingPaneLocation eq 'right' and not empty idcheck and param.action eq 'paneView'}">
		<zm:getMessage var="msg" id="${idcheck}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${empty param.xim}" requestHeaders="${reqHdr}"/>
		<c:if test="${not empty msg.requestHeader}">
			<zm:getMessage var="msg" id="${idcheck}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${false}" requestHeaders="${reqHdr}"/>
		</c:if>
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
	<td>
		<table width="100%" cellpadding="0" cellspacing="0">
			<tr>
				<td class='List' width="45%" valign="top">
					<table width="100%" cellpadding="2" cellspacing="0">
						<tr>
							<th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this);" type=checkbox name="allids"/>
							<th><fmt:message key="arrangedBy"/>:
								<span><select name="actionSort">
										<option value="${empty param.ss ? 'dateAsc' : (param.ss eq 'dateAsc' ? 'dateDesc' : 'dateAsc')}" <c:if test="${(empty param.ss) or (param.ss eq 'dateAsc') or (param.ss eq 'dateDesc')}">selected</c:if>/><fmt:message key="date"/>
										<option value="${empty param.ss ? 'nameAsc' : (param.ss eq 'nameAsc' ? 'nameDesc' : 'nameAsc')}" <c:if test="${(param.ss eq 'nameAsc') or (param.ss eq 'nameDesc')}">selected</c:if>/> <c:choose><c:when test="${param.sfi==5 or param.sfi==6}"><fmt:message key="to"/></c:when><c:otherwise><fmt:message key="from"/></c:otherwise></c:choose>
										<option value="${empty param.ss ? 'subjAsc' : (param.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc')}" <c:if test="${(param.ss eq 'subjAsc') or (param.ss eq 'subjDesc')}">selected</c:if>/> <fmt:message key="subject"/>
									</select>
									<input type="submit" value="<fmt:message key='actionGo'/>" name="sortAction"/>
								</span>
							</th>
							<th width="1%" nowrap><app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/>
						</tr>
					</table>
					<table width="100%" cellpadding="2" cellspacing="0">
						<tbody id="mess_list_tbody">
							<c:set value="${context.searchResult.hits[0].id}" var="cid"/>
							<c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
								<c:choose>
									<c:when test="${hit.messageHit.isDraft}">
										<zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/search" context="${context}" action="compose" id="${hit.messageHit.id}"/>
									</c:when>
									<c:otherwise>
										<zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/search" action="${mailbox.prefs.readingPaneLocation eq 'right' and hit.messageHit.id != context.currentItem.id ? 'paneView' : 'view'}" context="${context}" id="${hit.messageHit.id}" xim="${mailbox.prefs.displayExternalImages ? '1' : param.xim}"/>
									</c:otherwise>
								</c:choose>
								<c:if test="${empty selectedRow and hit.messageHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>

								<tr onclick='zSelectRow(event,"A${status.index}","C${status.index}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'} ${hit.messageHit.isUnread ? ' Unread':''}${ selectedRow eq status.index ? ' RowSelected' : ''}'>
									<td class='CB' nowrap><input id="C${status.index}" type=checkbox name="id" value="${hit.messageHit.id}"></td>
									<td class='MsgStatusImg' align="center"><app:img src="${hit.messageHit.statusImage}" altkey='${hit.messageHit.statusImageAltKey}'/></td>

									<td><%-- allow wrap --%>
										<c:set var="dispAddr" value="${zm:truncate(hit.messageHit.displayAddresses,20,true)}"/>${fn:escapeXml(empty dispAddr ? unknownRecipient :  dispAddr)}
										<br>
										<a href="${fn:escapeXml(currentItemUrl)}" id="A${status.index}">
											<c:set var="subj" value="${empty hit.messageHit.subject ? noSubject : hit.messageHit.subject}"/>
											<span class="Fragment"><c:out value="${zm:truncate(subj,45,true)}"/></span>
											<c:if test="${mailbox.prefs.showFragments and not empty hit.messageHit.fragment and fn:length(subj) lt 90}">
												<!--<br><span class='Fragment'><c:out value="${zm:truncate(hit.messageHit.fragment,100-fn:length(subj),true)}"/></span>-->
											</c:if>
										</a>
									</td>
									<td nowrap align="right">
									${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}
									<br>
										<c:if test="${mailbox.features.mailPriority}">
											<app:priorityImage high="${hit.messageHit.isHighPriority}" low="${hit.messageHit.isLowPriority}"/>
										</c:if>
										<c:if test="${mailbox.features.tagging}">
											<app:miniTagImage ids="${hit.messageHit.tagIds}"/>
										</c:if>
										<c:if test="${mailbox.features.flagging}">
											<app:flagImage flagged="${hit.messageHit.isFlagged}"/>
										</c:if>
									</td>
									<td class='Img'><app:attachmentImage attachment="${hit.messageHit.hasAttachment}"/></td>
								</tr>
							</c:forEach>
						</tbody>
					</table>
					<c:if test="${context.searchResult.size == 0}">
						<div class='NoResults'><fmt:message key="noResultsFound"/></div>
					</c:if>
				</td>
				<td class='ZhAppColContent' valign="top" width="55%">
					<c:choose>
						<c:when test="${mailbox.prefs.readingPaneLocation eq 'right' and not empty msg and param.action eq 'paneView'}">
							<table width="100%" cellpadding="0" cellspacing="0">
								<tr valign="top">
									<td class='ZhAppContent2' valign="top">
										<c:set var="extImageUrl" value=""/>
										<c:if test="${empty param.xim and empty msg.requestHeader}">
											<zm:currentResultUrl var="extImageUrl" value="search" action="paneView" context="${context}" xim="1"/>
										</c:if>
										<zm:currentResultUrl var="composeUrl" value="search" context="${context}" action="compose" paction="view" id="${msg.id}"/>
										<zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
										<app:displayMessage mailbox="${mailbox}" message="${msg}"externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
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
		</table>
		</td>
	</tr>
	<tr>
		<td class='TbBottom'>
			<app:messageListViewToolbar context="${context}" keys="false"/>
		</td>
	</tr>
</table>
<input type="hidden" name="doMessageAction" value="1"/>
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
	var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
	var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
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
			while (idex <= zrc )
			{
				if(document.getElementById("C"+idex).checked) {
					cid = document.getElementById("C"+idex).value;
					c += cid + ",";
				}
				idex++ ;
			}
		}catch(ex){
		}
		if(c == ""){
			alert('<fmt:message key="actionNoMessageSelected"/>');return;
		}
		window.open("/h/printmessage?id="+c);
	}
	
		//-->
</SCRIPT>

<app:keyboard cache="mail.messageListView" globals="true" mailbox="${mailbox}" folders="true" tags="true">
	<c:if test="${mailbox.features.flagging}">
		<zm:bindKey message="mail.Flag" func="zflag"/>
		<zm:bindKey message="mail.UnFlag" func="zunflag"/>
	</c:if>
	
	<c:if test="${mailbox.prefs.readingPaneEnabled and not empty msg and param.action eq 'paneView'}">
		<zm:bindKey message="mail.Reply" id="OPREPLY"/>
		<zm:bindKey message="mail.ReplyAll" id="OPREPLYALL"/>
		<zm:bindKey message="mail.Forward" id="OPFORW"/>
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
		var zrcount = ${empty context.searchResult ? 0 : context.searchResult.size };
	<c:set var="ids" value="" />
	<zm:forEachFolder var="folder">
	<c:if test="${(folder.isMessageMoveTarget) and not context.folder.isDrafts}">
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

			//
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
				$D.setStyle(dragEl, "width", "45%");
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
				},0.4,YAHOO.util.Easing.easeOut )
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
