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
<script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
<table cellspacing="0" cellpadding="0" width="100%" border="0">

<c:choose>

<c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
    <tr>
        <td>
                <%--<table width="100%" cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar<c:out value="${pageContext.request.servletPath=='/m/main'?'1':''}"/>'>
                        <td>
                            <table cellspacing="0" cellpadding="0" width="100%">
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
<tr class="Stripes">
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
<td class="Stripes">
<div class="View">
<a name="action" id="action"/>
<table width="100%" cellspacing="0" cellpadding="2" border="0">
<tr class='zo_action'>
    <td colspan="2">
        <table cellspacing="2" cellpadding="2" width="100%" border="0">
                    <tr class="zo_m_list_row">
                        <td>
                            <c:set var="inTrash" value="${zm:getFolder(pageContext, message.folderId).isInTrash}"/>
                            <c:choose>
                                <c:when test="${inTrash}">
                                    <input name="actionHardDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                </c:when>
                                <c:otherwise>
                                    <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                </c:otherwise>
                            </c:choose>
                            <%--<input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>--%>
                           <select name="anAction" onchange="document.getElementById('actions').submit();">
                               <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                               <optgroup label="Mark">
                                   <c:if test="${message.isUnread}">
                                        <option value="actionMarkRead">Read</option>
                                   </c:if>
                                   <c:if test="${not message.isUnread}">
                                        <option value="actionMarkUnread">Unread</option>
                                   </c:if>
                               </optgroup>
                               <optgroup label="Flag">
                                   <c:if test="${not message.isFlagged}">
                                    <option value="actionFlag">Add</option>
                                   </c:if>
                                   <c:if test="${message.isFlagged}">
                                        <option value="actionUnflag">Remove</option>
                                   </c:if>
                              </optgroup>
                              <optgroup label="<fmt:message key="moveAction"/>">
                                <zm:forEachFolder var="folder">
                                    <c:if test="${folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                        <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                                    </c:if>
                                </zm:forEachFolder>
                              </optgroup>
                               <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                               <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,message.tagIds,true)}"/>
                               <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,message.tagIds,false)}"/>
                               <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                                <c:forEach var="atag" items="${tagsToAdd}">
                                <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                                <c:forEach var="atag" items="${tagsToRemove}">
                                <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               </c:if>
                              <%--<zm:forEachFolder var="folder">
                                  <input type="hidden" name="folderId" value="${folder.id}"/>
                              </zm:forEachFolder>--%>
                           </select>
                           <noscript><input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
                        </td>
                    </tr>
                </table>
    </td>
</tr>
<%--<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,message.tagIds,true)}"/>
    <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,message.tagIds,false)}"/>
    <c:if test="${not empty tagsToAdd}">
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
</c:if>--%>
<c:if test="${uiv!='1'}">
    <tr>
        <td colspan="2">
            <hr size='1'/>
        </td>
    </tr>
</c:if>
</table>
    <%--/form--%>
</div>
</td>
</tr>
</c:when>
<c:otherwise>
<tr>
    <td class='zo_m_cv_sub' style="padding:3px;">
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
                        <table cellspacing="0" cellpadding="4" width="100%">
                            <tr>
                                <td class="zo_m_chk" width="1%">
                                    <c:set value=",${mhit.id}," var="stringToCheck"/>
                                    <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'} name="id" value="${mhit.id}">
                                </td>
                                <td class="zo_m_chk" valign="middle" align="center" width="1%">
                                    <mo:img src="${(mhit.isUnread and hit.id == message.id) ? 'startup/ImgMsgStatusRead.gif' : mhit.statusImage}"
                                                    alt="status"/>
                                </td>
                                <td onclick='zClickLink("a${mhit.id}")'>
                                    <table cellspacing="0" width="100%" >
                                        <tr class='zo_m_list_<c:if test="${mhit.isUnread}">un</c:if>read'>
                                            <td width="95%">
                                                <c:set var="sender" value="${mhit.displaySender}"/>
                                                <c:set var="_f" value="${empty sender ? unknownSender : sender}"/>
                                                <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                                                <a class="zo_m_list_from" id="a${mhit.id}" href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(_f)}</a>
                                                <div class="zo_m_list_sub">
                                                    <c:set var="_f" value="${mhit.subject}"/>
                                                    <c:if test="${fn:length(_f) > 20}"><c:set var="_f" value="${fn:substring(_f, 0, 20)}..."/></c:if>
                                                    ${fn:escapeXml(_f)}
                                                </div>
                                                <div class='zo_m_list_frag'>
                                                    <c:set var="_f" value="${mhit.fragment}"/>
                                                    <c:if test="${fn:length(_f) > 50}"><c:set var="_f" value="${fn:substring(_f, 0, 50)}..."/></c:if>
                                                    ${fn:escapeXml(_f)}
                                                </div>
                                            </td>
                                            <td align="center" width="2%" valign="middle" style="padding-top: 5px;padding-left: 4px;">
                                                <c:if test="${mhit.isFlagged}">
                                                    <mo:img src="startup/ImgFlagRed.gif" alt="flag"/>
                                                </c:if>
                                                <c:if test="${mhit.hasTags}">
                                                    <mo:miniTagImage
                                                            ids="${mhit.tagIds}"/>
                                                </c:if>
                                            </td>
                                            <td nowrap="nowrap" class='zo_m_list_size' align="right" valign="top">
                                                <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt" pattern="yyyyMMdd" value="${mhit.date}"/>
                                                <a <c:if test="${sessionScope.uiv == '1' && mailbox.features.calendar}">href='${context_url}?st=cal&view=month&date=${on_dt}'</c:if>>
                                                    ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                                                </a><br/>
                                                 (${fn:escapeXml(zm:displaySize(mhit.size))})
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
                                 <c:choose>
                                    <c:when test="${not context.folder.isInTrash}">
                                        <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                    </c:when>
                                    <c:otherwise>
                                        <input name="actionHardDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                    </c:otherwise>
                                </c:choose>
                                <%--<input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>--%>
                               <select name="anAction" onchange="document.getElementById('actions').submit();">
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
                                        <c:if test="${folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                            <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                                        </c:if>
                                    </zm:forEachFolder>
                                  </optgroup>
                                  <%--<zm:forEachFolder var="folder">
                                      <input type="hidden" name="folderId" value="${folder.id}"/>
                                  </zm:forEachFolder>--%>
                                  <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                               <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
                               <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                                <c:forEach var="atag" items="${allTags}">
                                <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                                <c:forEach var="atag" items="${allTags}">
                                <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               </c:if>
                               </select>
                               <noscript><input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
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
