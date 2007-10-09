<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>
    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="false" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <c:set var="message" value="${null}"/>
    <c:set var="print" value="${param.print}"/>
    <fmt:message var="unknownSender" key="unknownSender"/>

    <c:if test="${message eq null}">
        <c:set var="csi" value="0"/>
        <zm:getMessage var="message" id="${convSearchResult.hits[csi].id}" markread="false" neuterimages="${empty param.xim}"/>
    </c:if>
</app:handleError>

<app:head title="${message.subject}" mailbox="${mailbox}"/>
<body <c:if test="${param.print}">onload="window.print()"</c:if> >
     <c:if test="${print}">
                <table  border=0 width=100% cellpadding="7">
                    <tr>
                        <td style="font-size:20px;font-weight:bold;" ><fmt:message key="zimbraTitle"/></td>
                        <td style="font-size:14px;font-weight:bold;" align=right> <c:out  value="${mailbox.defaultIdentity.fromAddress}"/></td>
                    </tr>
                </table>
                <hr>
                <div style='padding:10px;font-size:20px;font-weight:bold;"' >
                    <c:out value="${message.subject}" />
                </div>
                <hr>
    </c:if>

<zm:currentResultUrl var="currentUrl" value="search" action="view" cid="${convSummary.id}" context="${context}" csi="${param.csi}" cso="${param.cso}" css="${param.css}"/>
<c:forEach var="convItem" items="${convSearchResult.hits}" >
<zm:getMessage var="message" id="${convItem.id}" markread="false" neuterimages="${empty param.xim}"/>
    <c:set var="extImageUrl" value=""/>
    <c:if test="${empty param.xim}">
        <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}"
                             cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}" xim="1"/>
    </c:if>
        <zm:currentResultUrl var="composeUrl" value="search" context="${context}" id="${message.id}"
                             action="compose" paction="view" cid="${convSearchResult.conversationSummary.id}" cso="${convSearchResult.offset}" csi="${csi}" css="${param.css}"/>
       <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
<app:messagePrintView mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}"  hideops="true" newWindowUrl="${newWindowUrl}"/>
</c:forEach>
</body>

