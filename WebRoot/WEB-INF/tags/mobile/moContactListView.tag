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
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<mo:view mailbox="${mailbox}" title="${title}" context="${context}">
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
    <form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
        <input type="hidden" name="doContactAction" value="1"/>
        <script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
        <table width=100% cellspacing="0" cellpadding="0" border="0">
            <%--<c:if test="${context.searchResult.size gt 0}">--%>
                <tr>
                    <td>
                        <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="true"/>
                    </td>
                </tr>
           <%-- </c:if>--%>
            <tr>
                <td valign="top" height="100%">
                    <table width=100% cellpadding="4" cellspacing="0" border="0">
                        <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                            <c:set var="chit" value="${hit.contactHit}"/>
                            <zm:currentResultUrl var="contactUrl" value="${context_url}" action="view" id="${chit.id}"
                                                 index="${status.index}" context="${context}"/>
                            <tr class="zo_m_list_row highlight" id="cn${chit.id}">
                                <td width="1%">
                                    <c:set value=",${hit.id}," var="stringToCheck"/>
                                    <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'}
                                           name="id" value="${chit.id}">
                                </td>
                                <td width="1%">
                                    <mo:img src="${chit.image}" altkey="${chit.imageAltKey}" valign="top"/>
                                </td>
                                <td onclick='zClickLink("a${chit.id}")'>
                            <span class="zo_m_list_sub">
                                <a id="a${chit.id}"
                                   href="${contactUrl}"><strong>${zm:truncate(fn:escapeXml(empty chit.fileAsStr ? '<None>' : chit.fileAsStr),50, true)}</strong></a>
                            </span>
                                    <c:set var="nmail" value="st=newmail"/>
                                    <c:if test="${uiv != '1'}">
                                        <c:set var="nmail" value="action=compose"/>
                                    </c:if>
                                    <c:url var="murl" value="?${nmail}&to=${chit.email}"/>
                                    <p class="Email"><a href="${fn:escapeXml(murl)}">${fn:escapeXml(chit.email)}</a></p>
                                </td>
                                <td width="1%">
                                    <c:if test="${chit.isFlagged}">
                                        <mo:img src="startup/ImgFlagRed.gif" alt="flag"/>
                                    </c:if>
                                    <c:if test="${chit.hasTags}">
                                        <mo:miniTagImage
                                                ids="${chit.tagIds}"/>
                                    </c:if>
                                </td>
                            </tr>
                        </c:forEach>
                    </table>
                    <c:if test="${empty context or context.searchResult.size eq 0}">
                        <div class='zo_noresults'><fmt:message key="noResultsFound"/></div>
                    </c:if>
                </td>
            </tr>
            <%--<c:if test="${context.searchResult.size gt 0}">--%>
                <tr>
                    <td>
                        <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="false"/>
                    </td>
                </tr>
           <%-- </c:if>--%>
                <%--<tr onclick='zClickLink("ABOOKS")'>
                    <td class='Folders zo_m_list_row' style='padding: 5px;'>
                        <a id="ABOOKS" href="${fn:escapeXml(context_url)}?st=ab">
                            <img src="<app:imgurl value='contacts/ImgContactsFolder.gif'/>">
                            <fmt:message key="addressBooks"/>
                        </a>
                    </td>
                </tr>--%>
        </table>
    </form>
</mo:view>
