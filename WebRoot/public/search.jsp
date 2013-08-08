<%@ page buffer="8kb" session="true" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<!--
 search.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<script type="text/javascript">

        function checkAll(cb, allbox) {
        	if(!cb) { return; }
            if (cb.length) {
				for (i = 0; i < cb.length; i++) {
                    cb[i].checked = allbox.checked;
                    markDefaultSelection(cb[i].value, cb[i].checked);
                    var rid = cb[i].id;
                    rid = rid.replace("C","R");
                    markRow(rid, allbox.checked);
                }
            }else {
                cb.checked = allbox.checked;
                markDefaultSelection(cb.value, cb.checked);
                var rid = cb[i].id;
                rid = rid.replace("C","R");
                markRow(rid, allbox.checked);
            }
        }

        window.defaultSelection = [];

        function zSelectRow(ev,idx, rowClass) {
        	var cid = "C"+idx;
        	var rid = "R"+idx;
        	var result = true;
        	var t = ev.target || ev.srcElement;
        	var cbox = document.getElementById(cid);

        	if(!cbox) { return; }

        	var mid = cbox.value;


			if (t&&t.nodeName != 'INPUT') {
        		cbox.checked = !cbox.checked;
        	}
        	result = cbox.checked;

        	markDefaultSelection(mid, result);

        	var row = document.getElementById(rid);
        	if(row) {
        		row.className = rowClass + (result ? ' Row-selected': '');
        	}

    	}

		function markDefaultSelection(mid, result) {
			if(result) {
				window.defaultSelection[mid] = result;
			}else{
				delete window.defaultSelection[mid];
			}
		}

		function markRow(rid, val) {
            var row = document.getElementById(rid);
			if(row) {
              	var classStr = row.className;
               	classStr = classStr.replace(" Row-selected","");
               	row.className = classStr + (val ?" Row-selected" : "")
           }
		}

</script>
<app:handleError>
   	<zm:getMailbox var="mailbox"/>
   	<fmt:setBundle basename="/messages/ZhMsg" scope="session"/>
	<app:composeCheck/>
	<c:set var="action" value="${empty param.paction ? param.action : param.paction}" scope="request"/>
	<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
  	<zm:computeSearchContext var="context" usecache="true"/>
</app:handleError>

<div id="htmlContent" style="display:none;">
<form action="" onsubmit="return false;" method="post" name="zform">
	<c:choose>
        <c:when test="${context.isConversationSearch}">
	    <c:if test="${mailbox.features.flagging}">

         <table width="100%" cellpadding="1" cellspacing="0">
                            <tr class='HF_Header'>
                                <th width="16" height="16" class='CB HF_Header_Left DwtListView-Column DwtListHeaderItem-label' style="font-weight:normal;" nowrap='nowrap'><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type="checkbox" name="allids"/></th>
                                <c:if test="${mailbox.features.flagging}">
                                <th class='Img HF_Header DwtListView-Column DwtListHeaderItem-label' style="font-weight:normal;" nowrap='nowrap' width='20'><div class="ImgFlagRed"/></th>
                                </c:if>
                                <c:if test="${mailbox.features.mailPriority}">
                                <th class='ImgNarrow HF_Header DwtListView-Column DwtListHeaderItem-label'  style="font-weight:normal;" nowrap='nowrap' width='12'><div class="ImgPriorityHigh_list"/></th>
                                </c:if>
                                <c:if test="${mailbox.features.tagging}">
                                <th class='Img HF_Header DwtListView-Column DwtListHeaderItem-label' style="font-weight:normal;" nowrap width='20'><div class="ImgTag"/></th>
                                </c:if>
                                <th class="HF_Header DwtListView-Column DwtListHeaderItem-label" style="font-weight:normal;" width="10%" nowrap><fmt:message key="${useTo ? 'to' : 'from'}"/></th>
                                <th class='Img HF_Header DwtListView-Column DwtListHeaderItem-label' style="font-weight:normal;" nowrap width='1%'><div class="ImgAttachment"/></th>
                                <th class="HF_Header HF_Header DwtListView-Column DwtListHeaderItem-label" style="font-weight:normal;" nowrap>
                                    <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                                    <fmt:message key="subject"/>
								</th>
                                <th class="HF_Header DwtListView-Column DwtListHeaderItem-label" style="font-weight:normal;" width="2%" nowrap><div class="ImgConversation"/></th>
                                <th class="HF_Header_Right DwtListView-Column DwtListHeaderItem-label" style="font-weight:normal;" nowrap width="2%">
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                    <fmt:message key="received"/>
                               </th>
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
								<c:set var="rowClass" value="${status.index mod 2 eq 1 ? 'Row RowOdd' :'Row RowEven'}${convHit.isUnread ? ' Unread':''}"/>

								<tr onclick='zSelectRow(event,"${status.index}", "${rowClass}")' id="R${status.index}" class='${rowClass}'>

                                   <td width="16" height="16" class='CB' nowrap><input  id="C${status.index}" type="checkbox" name="id" value="${convHit.id}"></td>
                                    <c:if test="${mailbox.features.flagging}">
                                    <td class='Img'><app:flagImage flagged="${convHit.isFlagged}"/></td>
                                    </c:if>
                                    <c:if test="${mailbox.features.mailPriority}">
                                    <td class='ImgNarrow'><app:priorityImage high="${convHit.isHighPriority}" low="${convHit.isLowPriority}"/></td>
                                    </c:if>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${convHit.tagIds}"/></td>
                                    </c:if>
                                    <td><%-- allow this column to wrap --%>
                                        <c:set var="dispRec" value="${convHit.displayRecipients}"/>${fn:escapeXml(empty dispRec ? unknownRecipient : dispRec)}
                                    </td>
                                    <td class='Img'><c:choose><c:when test="${convHit.hasAttachment}"><div class="ImgAttachment" /></c:when><c:otherwise>&nbsp;</c:otherwise></c:choose></td>

                                   <td><%-- allow this column to wrap --%>
                                            <c:set var='subj' value="${empty convHit.subject ? unknownSubject : zm:truncate(convHit.subject,100,true)}"/>
                                            <c:out value="${subj}"/>
                                            <c:if test="${mailbox.prefs.showFragments and not empty convHit.fragment and fn:length(subj) lt 90}">
                                                <span class='Fragment'> - <c:out value="${zm:truncate(convHit.fragment,100-fn:length(subj),true)}"/></span>
                                            </c:if>
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
                               </c:if>
		</c:when>
		<c:when test="${context.isMessageSearch}">
			<table width="100%" cellpadding="1" cellspacing="0">
                        <tr class='HF_Header'>
                            <th width="16" height="16" class='CB HF_Header_Left DwtListView-Column DwtListHeaderItem-label' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/></th>
                            <c:if test="${mailbox.features.flagging}">
                            <th class='Img HF_Header DwtListView-Column DwtListHeaderItem-label' nowrap><div class="ImgFlagRed"/></th>
                            </c:if>
                            <c:if test="${mailbox.features.mailPriority}">
                            <th class='ImgNarrow HF_Header DwtListView-Column DwtListHeaderItem-label' nowrap='nowrap' width='12'><div class="ImgPriorityHigh_list"/></th>
                            </c:if>
                            <c:if test="${mailbox.features.tagging}">
                            <th class='Img HF_Header DwtListView-Column DwtListHeaderItem-label' nowrap><div class="ImgTag"/></th>
                            </c:if>
                            <th class='MsgStatusImg HF_Header DwtListView-Column DwtListHeaderItem-label' nowrap><div class="ImgMsgStatus"/></th>
                            <th class='HF_Header DwtListView-Column DwtListHeaderItem-label' width="10%">
                                <zm:newSortUrl var="fromSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                                <fmt:message key="${useTo ? 'to' : 'from'}"/>
                            </th>
                            <th class='HF_Header DwtListView-Column DwtListHeaderItem-label' width="1%" nowrap><div class="ImgAttachment"/></th>
                            <th class='HF_Header DwtListView-Column DwtListHeaderItem-label' nowrap>
                                <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                                <fmt:message key="subject"/>
							</th>
                            <c:if test="${!context.isFolderSearch}">
                            <th class='HF_Header DwtListView-Column DwtListHeaderItem-label' width="1%" nowrap><fmt:message key="folder"/></th>
                            </c:if>
                            <th class='HF_Header DwtListView-Column DwtListHeaderItem-label' width="1%" nowrap><fmt:message key="size"/></th>
                            <th class='HF_Header_Right DwtListView-Column DwtListHeaderItem-label' width="1%" nowrap>
                                <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss)? 'dateAsc' : 'dateDesc'}"/>
                                <fmt:message key="received"/>
                            </th>
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
							<c:set var="rowClass" value="${status.index mod 2 eq 1 ? 'Row RowOdd' :'Row RowEven'}${convHit.isUnread ? ' Unread':''}"/>

                            <tr onclick='zSelectRow(event,"${status.index}", "${rowClass}")' id="R${status.index}" class='${rowClass}'>
                                <td width="16" height="16" class='CB' nowrap><input id="C${status.index}" type=checkbox name="id" value="${hit.messageHit.id}"></td>
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
                                <td class='Img'><c:choose><c:when test="${hit.messageHit.hasAttachment}"><div class="ImgAttachment" /></c:when><c:otherwise>&nbsp;</c:otherwise></c:choose></td>
                                <td > <%-- allow this col to wrap --%>

                                        <c:set var="subj" value="${empty hit.messageHit.subject ? noSubject : hit.messageHit.subject}"/>
                                        <c:out value="${subj}"/>
                                        <c:if test="${mailbox.prefs.showFragments and not empty hit.messageHit.fragment and fn:length(subj) lt 90}">
                                            <span class='Fragment'> - <c:out value="${zm:truncate(hit.messageHit.fragment,100-fn:length(subj),true)}"/></span>
                                        </c:if>
                                    <c:if test="${hit.id == context.currentItem.id}">
                                        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
                                        <c:if test="${cursor.hasPrev}">
                                            <zm:prevItemUrl var="prevItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                        </c:if>
                                        <c:if test="${cursor.hasNext}">
                                            <zm:nextItemUrl var="nextItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                        </c:if>
                                    </c:if>
                                </td>
                                <td nowrap>${fn:escapeXml(zm:displaySize(pageContext, hit.messageHit.size))}</td>
                                <td>${zm:displayMsgDate(pageContext, hit.messageHit.date)}</td>
                            </tr>
                        </c:forEach>
                    </table>
			</c:when>
	</c:choose>
</form>
</div>

<script>
var appMain = document.getElementById("skin_container_app_main");
var treeContainer = document.getElementById("skin_container_tree");
var htmlContent = document.getElementById("htmlContent");
var splashContent = document.getElementById("skin_container_splash_screen");
var appLoaded = "<c:out value="${app}"/>";
if(htmlContent && treeContainer && (splashContent.className == "SplashScreen") && ((appLoaded == "") || (appLoaded == "mail"))) {

	if(splashContent) {
		splashContent.style.display = "none";
	}

    var h = appMain.offsetHeight;
    var w = appMain.offsetWidth;
    appMain.innerHTML = ["<div id='facadeContainer' style='height:" + (h-10) + "px;width:" + w + "px;display:block;overflow:auto;'>"].join("") + htmlContent.innerHTML + "</div>";
    treeContainer.innerHTML = '<table id="loadingFacade" height="100%" width="100%" align=center><tr><td bgcolor="white" align=center><b>' + ZmMsg.splashScreenLoading + '</b></td></tr></table>';
    htmlContent.parentNode.removeChild(htmlContent);
    window._facadeCleanup = function() {
        var fc = document.getElementById("facadeContainer");
        if(fc) {
            fc.parentNode.removeChild(fc);
        }
        var fc1 = document.getElementById("loadingFacade");
        if(fc1) {
            fc1.parentNode.removeChild(fc1);
        }
    };
}
</script>

