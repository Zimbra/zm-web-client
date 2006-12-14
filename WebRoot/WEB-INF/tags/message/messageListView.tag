<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:view context="${context}" selected='mail' folders="true" tags="true" searches="true" keys="true">
<fmt:message key="noSubject" var="noSubject"/>
<zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
<zm:getMailbox var="mailbox"/>
<form action="${currentUrl}" method="post" name="zform">
    <table width=100% cellpadding="0" cellspacing="0">
        <tr>
            <td class='TbTop'>
                <app:messageListViewToolbar context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='List'>
                    <table width=100% cellpadding=2 cellspacing=0>
                        <tr>
                            <th class='CB' nowrap><input onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                            <th class='Img' nowrap><app:img src="tag/FlagRed.gif"alt="Starred"/>
                            <th class='Img' nowrap><app:img src="tag/MiniTagOrange.gif"alt="Tagged"/>
                            <th class='MsgStatusImg' nowrap>
                            <th width=10%>
                                <zm:newSortUrl var="fromSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                            <a href="${fromSortUrl}">
                                <fmt:message key="from"/>
                            </a>
                            <th width=1% nowrap><app:img src="common/Attachment.gif" alt=""/>
                            <th nowrap>
                                <zm:newSortUrl var="subjectSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'subjAsc' ? 'subjDesc' : 'subjAsc'}"/>
                            <a href="${subjectSortUrl}">
                                <fmt:message key="subject"/>
                            </a>

                                    <c:if test="${!context.isFolderSearch}">
                            <th width=1% nowrap><fmt:message key="folder"/>
                            </c:if>
                            <th width=1% nowrap><fmt:message key="size"/>
                            <th width=1% nowrap>
                                <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss)? 'dateAsc' : 'dateDesc'}"/>
                            <a href="${dateSortUrl}">
                                <fmt:message key="received"/>
                            </a>
                        </tr>
                        <c:set value="${context.searchResult.hits[0].id}" var="cid"/>
                        <c:forEach items="${context.searchResult.messageHits}" var="msg" varStatus="status">
                            <c:choose>
                                <c:when test="${msg.isDraft}">
                                    <zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/search" context="${context}" action="compose" id="${msg.id}"/>
                                </c:when>
                                <c:otherwise>
                                    <zm:currentResultUrl index="${status.index}" var="currentItemUrl" value="/h/mv" context="${context}" id="${msg.id}"/>
                                </c:otherwise>
                            </c:choose>

                            <tr class='ZhRow ${msg.isUnread ? ' Unread':''}${msg.id == context.currentItem.id ? ' RowSelected' : ''}'>
                                <td class='CB' nowrap><input type=checkbox name="id" value="${msg.id}"></td>
                                <td class='Img'><app:flagImage flagged="${msg.isFlagged}"/></td>
                                <td class='Img'><app:miniTagImage ids="${msg.tagIds}"/></td>
                                <td class='MsgStatusImg' align=center><app:img src="${msg.statusImage}"/></td>
                                <td><%-- allow wrap --%> <a href="${currentItemUrl}"><c:out value="${msg.displaySender}" default="<Unknown>"/></a></td>
                                <td class='Img'><app:attachmentImage attachment="${msg.hasAttachment}"/></td>
                                <td > <%-- allow this col to wrap --%>

                                    <a href="${currentItemUrl}" <c:if test="${msg.id == context.currentItem.id}">accesskey='o'</c:if>>
                                        <c:set var="subj" value="${empty msg.subject ? noSubject : msg.subject}"/>
                                        <c:out value="${subj}"/>
                                        <c:if test="${mailbox.prefs.showFragments and not empty msg.fragment and fn:length(subj) lt 90}">
                                            <span class='Fragment'> - <c:out value="${zm:truncate(msg.fragment,100-fn:length(subj),true)}"/></span>
                                        </c:if>
                                    </a>
                                    <c:if test="${msg.id == context.currentItem.id}">
                                        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
                                        <c:if test="${cursor.hasPrev}">
                                            <zm:prevItemUrl var="prevItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                            <a href="${prevItemUrl}" accesskey='k'></a>
                                        </c:if>
                                        <c:if test="${cursor.hasNext}">
                                            <zm:nextItemUrl var="nextItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                            <a href="${nextItemUrl}" accesskey='j'></a>
                                        </c:if>
                                    </c:if>
                                </td>
                                <c:if test="${!context.isFolderSearch}">
                                    <td nowrap>${fn:escapeXml(zm:getFolderName(pageContext, msg.folderId))}</td>
                                </c:if>
                                <td nowrap>${fn:escapeXml(zm:displaySize(msg.size))}
                                <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, msg.date))}
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
    </table>
    <input type="hidden" name="doAction" value="1"/>
  </form>
</app:view>
