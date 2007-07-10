<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <mo:searchTitle var="title" context="${context}"/>
    <c:set var="cid" value="${empty param.id ? context.searchResult.hits[0].id : param.id}"/>
    <fmt:message var="unknownRecipient" key="unknownRecipient"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
</mo:handleError>
<mo:view mailbox="${mailbox}" title="${title}" context="${context}">
    <table width=100% cellspacing="0" cellpadding="0">
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_button'><fmt:message key="MO_MAIN"/></a></td>
                                </tr>
                            </table>
                        </td>
                        <td align=right>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <mo:searchPageLeft urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                    <td>
                                        <mo:searchPageRight urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table width=100% cellpadding="0" cellspacing="0" class='zo_m_list'>
                    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                        <c:choose>
                            <c:when test="${hit.conversationHit.isDraft}">
                                <zm:currentResultUrl var="convUrl" value="mosearch" index="${status.index}" context="${context}" usecache="true" id="${fn:substringAfter(hit.conversationHit.id,'-')}" action="compose"/>
                            </c:when>
                            <c:otherwise>
                            <zm:currentResultUrl var="convUrl" value="mosearch" cid="${hit.id}" action='view' index="${status.index}" context="${context}" usecache="true"/>
                        </c:otherwise>
                        </c:choose>
                        <tr>
                            <td class='zo_m_list_row' onclick='window.location="${zm:jsEncode(convUrl)}"'>
                                <table width=100%>
                                    <tr>
                                        <td style='width:5px; '>
                                            &nbsp;
                                        </td>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td class='zo_m_list_from'>
                                                        <c:set var="dispRec" value="${hit.conversationHit.displayRecipients}"/>
                                                            ${fn:escapeXml(empty dispRec ? unknownRecipient : dispRec)}
                                                    </td>
                                                    <td align=right class='zo_m_list_date' nowrap>
                                                            ${fn:escapeXml(zm:displayMsgDate(pageContext, hit.conversationHit.date))}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class='zo_m_list_sub'>
                                                            ${fn:escapeXml(empty hit.conversationHit.subject ? unknownSubject : zm:truncate(hit.conversationHit.subject,50,true))}
                                                    </td>
                                                    <td align=right class='zo_m_list_frag'>
                                                        <c:choose>
                                                            <c:when test="${hit.conversationHit.messageCount gt 1}">(${hit.conversationHit.messageCount})</c:when>
                                                            <c:otherwise>&nbsp;</c:otherwise>
                                                        </c:choose>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class='zo_m_list_frag' colspan=2>
                                                            ${fn:escapeXml(zm:truncate(hit.conversationHit.fragment,50,true))}
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
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_button'><fmt:message key="MO_MAIN"/></a></td>
                                </tr>
                            </table>
                        </td>
                        <td align=right>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <mo:searchPageLeft urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                    <td>
                                        <mo:searchPageRight urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</mo:view>
