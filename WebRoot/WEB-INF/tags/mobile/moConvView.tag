<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>

    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>

    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}"
                   context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                            index="${context.currentItemIndex}"/>
    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${message eq null}">
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
    <c:set var="selectedRow" value="${param.selectedRow}"/>

    <c:set var="singleMessage" value="${convSummary.messageCount eq 1 or not empty param.mview}"/>
</mo:handleError>


<mo:view mailbox="${mailbox}" title="${message.subject}" context="${context}"
         scale="${true or convSummary.messageCount eq 1}">

<table width=100% cellspacing="0" cellpadding="0">


<c:choose>

<c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
    <tr>
        <td>
            <table width=100% cellspacing="0" cellpadding="0">
                <tr class='zo_toolbar'>
                    <td>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <zm:currentResultUrl var="closeUrl" value="mosearch" action='view' context="${context}"
                                                     cso="${param.cso}" csi="${param.csi}" css="${param.css}"/>
                                <td><a href="${closeUrl}" class='zo_leftbutton'>
                                    <fmt:message key="backToConv"/>
                                </a></td>
                            </tr>
                        </table>
                    </td>
                    <td align=right>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td>
                                    <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}"
                                                            index="${param.csi}"/>
                                    <c:choose>
                                        <c:when test="${messCursor.hasPrev}">
                                            <zm:currentResultUrl var="prevMsgUrl" value="mosearch" action='view'
                                                                 context="${context}" mview="1"
                                                                 cso="${messCursor.prevOffset}"
                                                                 csi="${messCursor.prevIndex}" css="${param.css}"/>
                                            <a class='zo_button' href="${prevMsgUrl}">
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
                                            <zm:currentResultUrl var="nextMsgUrl" value="mosearch" action="view"
                                                                 context="${context}" mview="1"
                                                                 cso="${messCursor.nextOffset}"
                                                                 csi="${messCursor.nextIndex}" css="${param.css}"/>
                                            <a class='zo_button' href="${nextMsgUrl}">
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
        </td>
    </tr>
</c:when>
<c:otherwise>
    <tr>
        <td>
            <table width=100% cellspacing="0" cellpadding="0">
                <tr class='zo_toolbar'>
                    <td>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <zm:currentResultUrl var="closeurl" value="/m/mosearch"
                                                     index="${context.currentItemIndex}"
                                                     context="${context}"/>
                                <td><a href="${closeurl}#conv${convSummary.id}" class='zo_button'>
                                    <fmt:message key="backToConvList"/>
                                </a></td>
                            </tr>
                        </table>
                    </td>
                    <td align=right>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td>
                                    <c:choose>
                                        <c:when test="${context.hasPrevItem}">
                                            <zm:prevItemUrl var="prevItemUrl" value="mosearch" action="view"
                                                            cursor="${convCursor}" context="${context}"
                                                            css="${param.css}"/>
                                            <a class='zo_button' href="${prevItemUrl}">
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
                                            <zm:nextItemUrl var="nextItemUrl" value="" action="view"
                                                            cursor="${convCursor}" context="${context}"
                                                            css="${param.css}"/>
                                            <a class='zo_button' href="${nextItemUrl}">
                                                <fmt:message key="MO_NEXT"/>
                                                    <%--<img src="<c:url value='/images/arrows/PreviousPage.gif'/>" border="0"/>--%>
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
        </td>
    </tr>
</c:otherwise>
</c:choose>
<c:choose>
    <c:when test="${singleMessage}">
        <tr>
            <td class='zo_appt_view'>
                <c:set var="extImageUrl" value=""/>
                <c:if test="${empty param.xim}">
                    <zm:currentResultUrl var="extImageUrl" id="${message.id}" value="mosearch" action="view"
                                         context="${context}" xim="1"/>
                </c:if>
                <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                     action="compose" paction="view" id="${message.id}"/>
                <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
                <mo:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}"
                                   showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
            </td>
        </tr>

    </c:when>
    <c:otherwise>


        <tr>
            <td class='zo_m_cv_sub'>
                    ${fn:escapeXml(empty message.subject ? emptySubject : message.subject)}
            </td>
        </tr>
        <tr>
            <td>
                <zm:currentResultUrl var="currentUrl" value="/m/mosearch" context="${context}"/>
                <table width=100% cellpadding="0" cellspacing="0" class='zo_m_list'>


                    <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
                        <zm:currentResultUrl var="msgUrl" value="mosearch" cid="${convSummary.id}" id="${hit.id}"
                                             action='view' context="${context}" mview="1"
                                             cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>

                        <c:if test="${empty selectedRow and hit.id eq message.id}">
                            <c:set var="selectedRow" value="${status.index}"/>
                        </c:if>
                        <tr>
                            <td class='zo_m_list_row' onclick='window.location="${zm:jsEncode(msgUrl)}"'>
                                <table width=100%>
                                    <tr>
                                        <td style='width:40px; ' valign="middle" align="center">
                                            <mo:img src="${(hit.messageHit.isUnread and hit.id == message.id) ? 'mail/MsgStatusRead.gif' : hit.messageHit.statusImage}"/>
                                        </td>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td class='zo_m_list_from'>
                                                        <c:set var="sender" value="${hit.messageHit.displaySender}"/>
                                                            ${fn:escapeXml(empty sender ? unknownSender : sender)}
                                                    </td>
                                                    <td nowrap align=right valign=top class='zo_m_list_date'>
                                                            ${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class='zo_m_list_frag'>
                                                        <c:out value="${zm:truncate(hit.messageHit.fragment,100,true)}"/>
                                                    </td>
                                                    <td nowrap class='zo_m_list_size' align=right valign="top">
                                                            ${fn:escapeXml(zm:displaySize(hit.messageHit.size))}
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
    </c:otherwise>
</c:choose>
</table>
</mo:view>

<%--


<tr>
    <td>
        <table width=100% cellspacing="0" cellpadding="0">
            <tr class='zo_toolbar'>
                <td>
                    <table cellspacing="0" cellpadding="0">
                        <tr>
                            <zm:currentResultUrl var="closeurl" value="/m/mosearch" index="${context.currentItemIndex}"
                                                 context="${context}"/>
                            <td><a href="${closeurl}" class='zo_button'>${fn:escapeXml(context.backTo)}</a></td>
                        </tr>
                    </table>
                </td>
                <td align=right>
                    <table cellspacing="0" cellpadding="0">
                        <tr>
                            <td>
                                <c:choose>
                                    <c:when test="${context.hasPrevItem}">
                                        <zm:prevItemUrl var="prevItemUrl" value="mosearch" action="view"
                                                        cursor="${convCursor}" context="${context}" css="${param.css}"/>
                                        <a class='zo_button' href="${prevItemUrl}">
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
                                <c:if test="${singleMessage}">
                                    <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}" index="${param.csi}"/>

                                    <c:if test="${messCursor.hasNext}">
                                        <zm:currentResultUrl var="nextItemUrl" value="mosearch" action="view" context="${context}"
                                                             cso="${messCursor.nextOffset}" csi="${messCursor.nextIndex}"
                                                             css="${param.css}" mview="1"/>
                                    </c:if>
                                </c:if>
                                <c:if test="${empty nextItemUrl and context.hasNextItem}">
                                    <zm:nextItemUrl var="nextItemUrl" value="" action="view" cursor="${convCursor}"
                                                    context="${context}" css="${param.css}"/>
                                </c:if>

                                <c:choose>
                                    <c:when test="${not empty nextItemUrl}">
                                        <a class='zo_button' href="${nextItemUrl}">
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
    </td>
</tr>
--%>