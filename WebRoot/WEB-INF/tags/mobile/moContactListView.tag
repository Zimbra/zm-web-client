<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:set var="contactId" value="${context.currentItem.id}"/>
    <c:if test="${not empty contactId}"><zm:getContact id="${contactId}" var="contact"/></c:if>
    <mo:searchTitle var="title" context="${context}"/>
</mo:handleError>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
<c:set var="title" value="${zm:truncate(context.shortBackTo,20,true)}" scope="request"/>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    <input type="hidden" name="doContactAction" value="1"/>
    <script type="text/javascript">document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
    <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="true" mailbox="${mailbox}"/>
    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
        <c:set var="chit" value="${hit.contactHit}"/>
        <zm:currentResultUrl var="contactUrl" value="${context_url}" action="view" id="${chit.id}"
                             index="${status.index}" context="${context}"/>

        <div class="list-row row" id="cn${chit.id}">
            <c:set value=",${hit.id}," var="stringToCheck"/>
            <c:set var="class" value="Contact${chit.isGroup ? 'Group' : ''}"/>
            <span class="cell f ${class}">
                    <input class="chk" type="checkbox" ${requestScope.select ne 'none' && (fn:contains(requestScope._selectedIds,stringToCheck) || requestScope.select eq 'all') ? 'checked="checked"' : ''}
                           name="id" value="${chit.id}"/>
            <%--        <mo:img src="${chit.image}" valign="top" clazz="left-icon"/>--%>
            </span>
            <span class="cell m" onclick='zClickLink("a${chit.id}")'>
                <div>
                    <a id="a${chit.id}"
                           href="${contactUrl}"><strong>${zm:truncate(fn:escapeXml(empty chit.fileAsStr ? '<None>' : chit.fileAsStr),50, true)}</strong></a>
                </div>
                <div class="Email">
                    <c:set var="nmail" value="st=newmail"/>
                    <c:url var="murl" value="?${nmail}&to=${chit.email}"/>
                    <a href="${fn:escapeXml(murl)}">${fn:escapeXml(chit.email)}</a>
                </div>
            </span>
            <span class="cell l" onclick='zClickLink("a${chit.id}")'>
                <c:if test="${chit.isFlagged}">
                    <span class="SmlIcnHldr Flag">&nbsp;</span>
                </c:if>
                <c:if test="${chit.hasTags}">
                    <mo:miniTagImage
                                           ids="${chit.tagIds}"/>
                </c:if>
            </span>
        </div>
    </c:forEach>
    <c:if test="${empty context || empty context.searchResult or context.searchResult.size eq 0}">
        <div class='table'>
                <div class="table-row">
                    <div class="table-cell zo_noresults">
                        <fmt:message key="noResultsFound"/>
                     </div>
                </div>
            </div>
    </c:if>
    <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="false" mailbox="${mailbox}"/>
</form>
