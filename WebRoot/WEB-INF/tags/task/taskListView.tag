<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <app:searchTitle var="title" context="${context}"/>
    <c:set var="id" value="${empty param.id ? context.searchResult.hits[0].taskHit.inviteId : param.id}"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:set var="isReadOnly"  value="${context.folder.effectivePerm eq 'r'}"/>
	<c:set var="selectedRow" value="${param.selectedRow}"/>
</app:handleError>

<app:view mailbox="${mailbox}" title="${title}" selected='tasks' tasks="${true}" tags="true" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <form name="zform" action="${fn:escapeXml(currentUrl)}" method="post">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:taskListViewToolbar context="${context}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='List'>
                        <table width="100%" cellpadding="2" cellspacing="0">
                            <tr class='Header'>
                                <th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                                <c:if test="${mailbox.features.tagging}">
                                <th class='Img' nowrap><app:img src="startup/ImgTagOrange.gif" altkey="ALT_TAG_TAG"/>
                                </c:if>
                                <th class='Img' nowrap><app:img src="tasks/ImgTaskHigh.gif" altkey="ALT_PRIORITY"/>
                                <th class='Img' nowrap><app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/>
                                <th nowrap>
                                    <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                                <a href="${fn:escapeXml(subjectSortUrl)}">
                                    <fmt:message key="subject"/>
                                </a>
                                <th width="15%" nowrap>
                                    <zm:newSortUrl var="statusSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'taskStatusAsc') ? 'taskStatusDesc' : 'taskStatusAsc'}"/>
                                <a href="${fn:escapeXml(statusSortUrl)}">
                                    <fmt:message key="status"/>
                                    </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="perSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'taskPercCompletedAsc') ? 'taskPercCompletedDesc' : 'taskPercCompletedAsc'}"/>
                                <a href="${fn:escapeXml(perSortUrl)}">
                                    <fmt:message key="taskPerComplete"/>
                                    </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'taskDueDesc' or empty context.ss) ? 'taskDueAsc' : 'taskDueDesc'}"/>
                                <a href="${fn:escapeXml(dateSortUrl)}">
                                    <fmt:message key="taskDueDate"/>
                                </a>
                            </tr>

                            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                                <c:set var="taskHit" value="${hit.taskHit}"/>
                                <zm:currentResultUrl var="taskUrl" value="search" id="${taskHit.inviteId}" action="${isReadOnly ? 'viewtask' : 'edittask'}" index="${status.index}" context="${context}" usecache="true"/>

                                <c:if test="${empty selectedRow and taskHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                                <c:set var="aid" value="A${status.index}"/>
                                <tr onclick='zSelectRow(event,"${aid}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                                    <td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${taskHit.inviteId}"></td>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${taskHit.tagIds}"/></td>
                                    </c:if>
                                    <td class='Img'><app:img src="${taskHit.priorityImage}" alt="priority"/></td>
                                    <td class='Img'><app:attachmentImage attachment="${taskHit.hasAttachment}"/></td>
                                    <td><%-- allow this column to wrap --%>
                                        <a href="${fn:escapeXml(taskUrl)}" id="${aid}">
                                            <c:set var='subj' value="${empty taskHit.subject ? unknownSubject : zm:truncate(taskHit.subject,100,true)}"/>
                                            <c:out value="${subj}"/>
                                        </a>
                                        <c:if test="${taskHit.id == context.currentItem.id}">
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
                                    <td width="15%" nowrap><fmt:message key="TASK_${taskHit.status}"/></td>
                                    <td width="10%">${empty taskHit.percentComplete ? '0' : taskHit.percentComplete}%</td>
                                    <td width="10%" nowrap>
                                        <c:choose>
                                            <c:when test="${taskHit.hasDueDate}">
                                                <fmt:formatDate value="${taskHit.dueDate}" dateStyle="short" timeZone="${mailbox.prefs.timeZone}"/>
                                            </c:when>
                                            <c:otherwise>
                                                &nbsp;
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
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
                    <app:taskListViewToolbar context="${context}" keys="false"/>
                </td>
            </tr>
        </table>
        <input type="hidden" name="doTaskAction" value="1"/>
        <input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : zm:cook(selectedRow)}"/>        
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
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
        var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
        var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
        function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
        //-->
    </SCRIPT>

    <app:keyboard cache="mail.taskListView" globals="true" mailbox="${mailbox}" tags="true">

        <zm:bindKey message="mail.Delete" func="function() { zclick('SOPDELETE')}"/>
        <zm:bindKey message="global.CheckCheckBox" func="zcs"/>
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
