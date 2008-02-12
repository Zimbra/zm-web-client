<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <mo:searchTitle var="title" context="${context}"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:message var="unknownSender" key="unknownSender"/>
    <zm:currentResultUrl var="currentUrl" value="${context_url}" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:if test="${false and mailbox.prefs.readingPaneEnabled}">
        <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                       neuterimages="${empty param.xim}"/>
        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
    </c:if>
    <fmt:message var="emptySubject" key="noSubject"/>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${title}" context="${context}" scale="${true}">
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<table cellspacing="0" cellpadding="0" width="100%">
<tr>
    <td>
        <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="true"/>
    </td>
</tr>
<tr>
    <td>
        <table width="100%" cellpadding="0" cellspacing="0" class='zo_m_list'>

            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                <c:set var="mhit" value="${hit.messageHit}"/>
                <c:choose>
                    <c:when test="${mhit.isDraft}">
                        <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}" action="compose"
                                         context="${context}" id="${mhit.id}"/>
                    </c:when>
                    <c:otherwise>
                        <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}" action="view"
                                         context="${context}" id="${mhit.id}"/>
                    </c:otherwise>    
                </c:choose>
                <tr id="msg${mhit.id}">
                    <td class='zo_m_list_row'>
                        <table width="100%">
                            <tr>
                                <td width="1%">
                                    <c:set value=",${mhit.id}," var="stringToCheck"/>
                                    <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'} name="id" value="${mhit.id}">
                                </td>
                                <td valign="middle" align="center" width="1%">
                                    <table>
                                        <tr>
                                            <td>
                                                <mo:img src="${(mhit.isUnread and hit.id == msg.id) ? 'startup/ImgMsgStatusRead.gif' : mhit.statusImage}"
                                                        alt="stastus"/>
                                            </td>
                                        </tr>
                                        <c:if test="${mhit.isFlagged}">
                                            <tr>
                                                <td><mo:img src="startup/ImgFlagRed.gif" alt="flag"/></td>
                                            </tr>
                                        </c:if>
                                        <c:if test="${mhit.hasTags}">
                                            <tr>
                                                <td><mo:miniTagImage ids="${mhit.tagIds}"/></td>
                                            </tr>
                                        </c:if>
                                    </table>
                                </td>
                                <td onclick='zClickLink("a${mhit.id}")'>
                                    <table width="100%">
                                        <tr ${mhit.isUnread ? "class='zo_m_list_unread'" : ""}>
                                            <td class='zo_m_list_sub'>
                                                <a id="a${mhit.id}"
                                                   href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(zm:truncate(mhit.subject,50,true))}</a>
                                            </td>
                                            <!-- td nowrap="nowrap" class='zo_m_list_size' align="right" valign="top">
                                                    ${fn:escapeXml(zm:displaySize(mhit.size))}
                                            </td -->
                                        </tr>
                                        <tr>
                                            <td class='zo_m_list_from'>
                                                <c:set var="sender" value="${mhit.displaySender}"/>
                                                    ${fn:escapeXml(empty sender ? unknownSender : sender)}
                                            </td>
                                            <td nowrap="nowrap" align="right" valign="top" class='zo_m_list_date'>
                                                <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt"
                                                                pattern="yyyyMMdd" value="${mhit.date}"/>
                                                <a	
                                                        <c:if test="${uiv == '1' && mailbox.features.calendar}">href="${context_url}?st=cal&view=month&date=${on_dt}"</c:if>>
                                                        ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class='zo_m_list_frag' colspan="2">
                                                <c:out value="${zm:truncate(mhit.fragment,50,true)}"/>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td style='width:5px'>&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </c:forEach>
        </table>
        <c:if test="${context.searchResult.size == 0}">
            <div class='zo_noresults'><fmt:message key="noResultsFound"/></div>
        </c:if>
    </td>
</tr>
<c:if test="${context.searchResult.size gt 0}">
    <tr>
        <td>
            <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="false"/>
        </td>
    </tr>
    <tr>
        <td>
            
                <a name="action" id="action"/>
                  <table cellspacing="2" cellpadding="2" width="100%">
                        <tr class="zo_m_list_row">
                            <td align="center">
                                <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                               <select name="anAction">
                                   <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                                   <optgroup label="Mark">
                                       <option value="actionMarkRead">Read</option>
                                       <option value="actionMarkUnread">Unread</option>
                                   </optgroup>
                                   <optgroup label="Flag">
                                      <option value="actionFlag">Add</option>
                                      <option value="actionUnflag">Remove</option>
                                  </optgroup>
                                  <optgroup label="<fmt:message key="moveAction"/>">
                                    <zm:forEachFolder var="folder">
                                        <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                            <option value="moveto_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                                        </c:if>
                                    </zm:forEachFolder>
                                  </optgroup>
                                  <zm:forEachFolder var="folder">
                                      <input type="hidden" name="folderId" value="${folder.id}"/>
                                  </zm:forEachFolder>
                               </select>
                               <input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/>
                            </td>
                        </tr>
                    </table>

        </td>
    </tr>
</c:if>
</table>
</form>
</mo:view>

