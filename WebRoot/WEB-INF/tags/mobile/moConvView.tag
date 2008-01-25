<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>

    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" limit="100"
                   context="${context}" fetch="none" markread="false" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <c:set var="singleMessage" value="${convSummary.messageCount eq 1 or not empty param.mview}"/>

    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${singleMessage and (message eq null or not empty param.xim)}">
        <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
        </c:if>
        <zm:getMessage var="message" id="${not empty param.id ? param.id : convSearchResult.hits[csi].id}"
                       markread="true" neuterimages="${empty param.xim}"/>
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

    <c:set var="subject" value="${not empty message ? message.subject : convSearchResult.hits[0].messageHit.subject}"/>
</mo:handleError>


<mo:view mailbox="${mailbox}" title="${subject}" context="${context}"
         scale="${true or convSummary.messageCount eq 1}">
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" action="view"/>
<c:if test="${singleMessage}">
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" mview="1"
                         action="view" id="${message.id}"/>
</c:if>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<table class="x_list_container" cellspacing="0" cellpadding="0">

<c:choose>

<c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
    <tr>
        <td>
                <%--<table width="100%" cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar<c:out value="${pageContext.request.servletPath=='/m/main'?'1':''}"/>'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <zm:currentResultUrl var="closeUrl" value="${context_url}" action='view' context="${context}"
                                                         cso="${param.cso}" csi="${param.csi}" css="${param.css}"/>
                                    <td><a href="${fn:escapeXml(closeUrl)}" class='zo_leftbutton'><fmt:message key="backToConv"/></a></td>
                                    <td>
                                        <a class='zo_button' href="#action"><fmt:message key="MO_actions"/></a>
                                    </td>
                                    <td>
                                        <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}"
                                                                index="${param.csi}"/>
                                        <c:choose>
                                            <c:when test="${messCursor.hasPrev}">
                                                <zm:currentResultUrl var="prevMsgUrl" value="${context_url}" action='view'
                                                                     context="${context}" mview="1"
                                                                     cso="${messCursor.prevOffset}"
                                                                     csi="${messCursor.prevIndex}" css="${param.css}"/>
                                                <a class='zo_button' href="${fn:escapeXml(prevMsgUrl)}">
                                                    <fmt:message key="MO_PREV"/>
                                                </a>
                                            </c:when>
                                            <c:otherwise>
                                                <a class='zo_button' style='color:gray'>
                                                    <fmt:message key="MO_PREV"/>
                                                </a>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${messCursor.hasNext}">
                                                <zm:currentResultUrl var="nextMsgUrl" value="${context_url}" action="view"
                                                                     context="${context}" mview="1"
                                                                     cso="${messCursor.nextOffset}"
                                                                     csi="${messCursor.nextIndex}" css="${param.css}"/>
                                                <a class='zo_button' href="${fn:escapeXml(nextMsgUrl)}">
                                                    <fmt:message key="MO_NEXT"/>
                                                </a>
                                            </c:when>
                                            <c:otherwise>
                                                <a class='zo_button' style='color:gray'>
                                                    <fmt:message key="MO_NEXT"/>
                                                </a>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>--%>
            <mo:convToolbar urlTarget="${context_url}" context="${context}" keys="false" isConv="false"/>
        </td>
    </tr>
</c:when>
<c:otherwise>
    <tr>
        <td>
                <%--
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar<c:out value="${pageContext.request.servletPath=='/m/main'?'1':''}"/>'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <zm:currentResultUrl var="closeurl" value="${context_url}"
                                                         index="${context.currentItemIndex}"
                                                         context="${context}"/>
                                    <td><a href="${fn:escapeXml(closeurl)}#conv${convSummary.id}" class='zo_leftbutton'>
                                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                                    </a></td>
                                    <c:if test="${singleMessage}">
                                    <td>
                                        <a class='zo_button' href="#action"><fmt:message key="MO_actions"/></a>
                                    </td>
                                    </c:if>
                                    <td>
                                        <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                                                                        index="${context.currentItemIndex}"/>
                                        <c:choose>
                                            <c:when test="${context.hasPrevItem}">
                                                <zm:prevItemUrl var="prevItemUrl" value="${context_url}" action="view"
                                                                cursor="${convCursor}" context="${context}"
                                                                css="${param.css}"/>
                                                <a class='zo_button' href="${fn:escapeXml(prevItemUrl)}">
                                                    <fmt:message key="MO_PREV"/>
                                                </a>
                                            </c:when>
                                            <c:otherwise>
                                                <a class='zo_button' style='color:gray'>
                                                    <fmt:message key="MO_PREV"/>
                                                </a>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${context.hasNextItem}">
                                                <zm:nextItemUrl var="nextItemUrl" value="${context_url}" action="view"
                                                                cursor="${convCursor}" context="${context}"
                                                                css="${param.css}"/>
                                                <a class='zo_button' href="${fn:escapeXml(nextItemUrl)}">
                                                    <fmt:message key="MO_NEXT"/>
                                                </a>
                                            </c:when>
                                            <c:otherwise>
                                                <a class='zo_button' style='color:gray'>
                                                    <fmt:message key="MO_NEXT"/>
                                                </a>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>

                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                --%>
            <mo:convToolbar singleMessage="${singleMessage}" urlTarget="${context_url}" context="${context}"
                            keys="false" isConv="true" cid="${convSummary.id}"/>
        </td>
    </tr>
</c:otherwise>
</c:choose>
<c:choose>
<c:when test="${singleMessage}">
<tr>
    <td class='zo_appt_view'>
        <c:set var="extImageUrl" value="${context_url}"/>
        <c:if test="${empty param.xim}">
            <zm:currentResultUrl var="extImageUrl" id="${message.id}" value="${context_url}" action="view" mview="1"
                                 context="${context}" xim="1"/>
        </c:if>
        <zm:currentResultUrl var="composeUrl" value="mosearch" context="${context}"
                             action="compose" paction="view" id="${message.id}"/>
        <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
        <mo:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}"
                           showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
    </td>
</tr>


<tr>
<td>
    <%--form id="action" action="${fn:escapeXml(actionUrl)}" method="post">
 <input type="hidden" name="doMessageAction" value="1"/--%>
<a name="action" id="action"/>
<table width="100%" cellspacing="0" cellpadding="2">
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <c:choose>
                        <c:when test="${not message.isUnread}">
                            <input name="actionMarkUnread" type="submit" value="<fmt:message key="actionMarkUnread"/>"/>
                        </c:when>
                        <c:otherwise>
                            <input name="actionMarkRead" type="submit" value="<fmt:message key="actionMarkRead"/>"/>
                        </c:otherwise>
                    </c:choose>
                </td>
                <td style='padding-left:5px'>
                    <c:choose>
                        <c:when test="${not message.isFlagged}">
                            <input name="actionFlag" type="submit" value="<fmt:message key="actionAddFlag"/>"/>
                        </c:when>
                        <c:otherwise>
                            <input name="actionUnflag" type="submit" value="<fmt:message key="actionRemoveFlag"/>"/>
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <input name="actionMove" type="submit" value="<fmt:message key="actionMove"/>"/>
                </td>
                <td style='padding-left:5px'>
                    <select name="folderId">
                        <option value="" selected="selected"><fmt:message key="moveAction"/></option>
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </select>
                </td>
            </tr>
        </table>
    </td>
</tr>
<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,message.tagIds,true)}"/>
    <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,message.tagIds,false)}"/>
    <c:if test="${not empty tagsToAdd}">
        <tr>
            <td colspan="2">
                <hr size='1'/>
            </td>
        </tr>
        <tr class='zo_action'>
            <td colspan="2">
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <input name="actionAddTag" type="submit" value="<fmt:message key="MO_actionAddTag"/>"/>
                        </td>
                        <td style='padding-left:5px'>
                            <select name="tagId">
                                <c:forEach var="tag" items="${tagsToAdd}">
                                    <option value="${tag.id}">${fn:escapeXml(tag.name)}</option>
                                </c:forEach>
                            </select>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </c:if>
    <c:if test="${not empty tagsToRemove}">
        <tr>
            <td colspan="2">
                <hr size='1'/>
            </td>
        </tr>
        <tr class='zo_action'>
            <td colspan="2">
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <input name="actionRemoveTag" type="submit"
                                   value="<fmt:message key="MO_actionRemoveTag"/>"/>
                        </td>
                        <td style='padding-left:5px'>
                            <select name="tagRemoveId">
                                <c:forEach var="tag" items="${tagsToRemove}">
                                    <option value="${tag.id}">${fn:escapeXml(tag.name)}</option>
                                </c:forEach>
                            </select>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </c:if>
</c:if>
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
    </td>
</tr>
<c:if test="${uiv!='1'}">
    <tr>
        <td colspan="2">
            <hr size='1'/>
        </td>
    </tr>
</c:if>
</table>
    <%--/form--%>
</td>
</tr>
</c:when>
<c:otherwise>
<tr>
    <td class='zo_m_cv_sub'>
        <table cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <mo:img src="mail/ImgConversation.gif" alt="conv"/>
                </td>
                <td style='padding-left:5px;'>
                        ${fn:escapeXml(empty subject ? emptySubject : subject)}
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>
        <table width="100%" cellpadding="0" cellspacing="0" class='zo_m_list'>
            <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
                <c:set var="mhit" value="${hit.messageHit}"/>
                <zm:currentResultUrl var="msgUrl" value="${context_url}" cid="${convSummary.id}" id="${hit.id}"
                                     action='view' context="${context}" mview="1"
                                     cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                <tr>
                    <td class='zo_m_list_row'>
                        <table width="100%">
                            <tr>
                                <td class="zo_m_chk">
                                    <c:set value=",${mhit.id}," var="stringToCheck"/>
                                    <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'} name="id" value="${mhit.id}">
                                </td>
                                <td style='width:40px; ' valign="middle" align="center">
                                    <table>
                                        <tr>
                                            <td><mo:img
                                                    src="${(mhit.isUnread and hit.id == message.id) ? 'startup/ImgMsgStatusRead.gif' : mhit.statusImage}"
                                                    alt="status"/></td>
                                        </tr>
                                        <c:if test="${mhit.isFlagged}">
                                            <tr>
                                                <td><mo:img src="startup/ImgFlagRed.gif" alt="falg"/></td>
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
                                        <tr
                                                <c:if test="${mhit.isUnread}">
                                                    class='zo_m_list_unread'
                                                </c:if>
                                                >
                                            <td class='zo_m_list_from'>
                                                <c:set var="sender" value="${mhit.displaySender}"/>
                                                    ${fn:escapeXml(empty sender ? unknownSender : sender)}
                                            </td>
                                            <td nowrap="nowrap" align="right" valign="top" class='zo_m_list_date'>
                                                <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt"
                                                                pattern="yyyyMMdd" value="${chit.date}"/>
                                                <a <c:if test="${mailbox.features.calendar}">href="${context_url}?st=cal&view=month&date=${on_dt}"</c:if>>
                                                        ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class='zo_m_list_frag'>
                                                <a id="a${mhit.id}"
                                                   href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(zm:truncate(mhit.fragment,100,true))}</a>
                                            </td>
                                            <td nowrap="nowrap" class='zo_m_list_size' align="right" valign="top">
                                                    ${fn:escapeXml(zm:displaySize(mhit.size))}
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
    </td>
</tr>
<c:if test="${convSearchResult.size gt 0}">
    <tr>
        <td>
            <div class="wh_bg">
                <a name="action" id="action"/>
                 <table cellspacing="2" cellpadding="2" width="100%">
                        <tr class="zo_m_list_row">
                            <td>
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
            </div>
        </td>
    </tr>
</c:if>
</c:otherwise>
</c:choose>
</table>
</form>
</mo:view>
