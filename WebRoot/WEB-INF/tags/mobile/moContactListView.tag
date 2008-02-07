<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
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
    <table width=100% cellspacing="0" cellpadding="0" >
        <tr>
            <td>
                <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="true"/>
            </td>
        </tr>
        <tr>
            <td>
                <table width=100% cellpadding="0" cellspacing="0" class='zo_ab_list'>
                    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                        <c:set var="chit" value="${hit.contactHit}"/>
                        <zm:currentResultUrl var="contactUrl" value="${context_url}" action="view" id="${chit.id}" index="${status.index}" context="${context}"/>
                        <tr class="zo_m_list_row" id="cn${chit.id}">
                            <td class="zo_m_chk">
                                <input type="checkbox"  name="id" value="${chit.id}">    
                            </td>
                            <td><mo:img src="${chit.image}" altkey="${chit.imageAltKey}" valign="top"/></td>
                            <td class='zo_ab_list_arrow' onclick='zClickLink("a${chit.id}")'>
                                <a id="a${chit.id}" href="${contactUrl}">${zm:truncate(fn:escapeXml(empty chit.fileAsStr ? '<None>' : chit.fileAsStr),50, true)}</a>
                                <c:if test="${uiv=='1'}">
                                <br style="margin:2px;"/>
                                <c:url var="murl" value="?action=compose&to=${chit.email}"/>
                                <a class="zo_m_list_frag" href="${fn:escapeXml(murl)}">${fn:escapeXml(chit.email)}</a>
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
        <c:if test="${context.searchResult.size gt 0}">
            <tr>
                <td>
                    <mo:toolbar context="${context}" urlTarget="${context_url}" isTop="false"/>
                </td>
            </tr>
                    <tr>
                    <td>
                        <div class="wh_bg">
                        <a name="action" id="action"/> 
                    <table cellspacing="2" cellpadding="2" width="100%">
                    <tr class="zo_m_list_row">
                       <td><input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/></td>
                    </tr>
                    </table>
                     </div>
                    </td>
                    </tr>
                    </c:if>
    </table>
</form>
</mo:view>
