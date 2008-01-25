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

<mo:view mailbox="${mailbox}" title="${title}" context="${context}">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>    
    <table width=100% cellspacing="0" cellpadding="0" >
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_leftbutton'><fmt:message key="MO_MAIN"/></a></td>
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
                <table width=100% cellpadding="0" cellspacing="0" class='zo_ab_list'>
                    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                        <c:set var="chit" value="${hit.contactHit}"/>
                        <zm:currentResultUrl var="contactUrl" value="/m/mosearch" action="view" id="${chit.id}" index="${status.index}" context="${context}"/>
                        <tr  onclick='zClickLink("a${chit.id}")' id="cn${chit.id}">
                            <td style='width:5px'>&nbsp;</td>
                            <td><mo:img src="${chit.image}" altkey="${chit.imageAltKey}"/></td>
                            <td class='zo_ab_list_arrow'>
                                <a id="a${chit.id}" href="${contactUrl}">${zm:truncate(fn:escapeXml(empty chit.fileAsStr ? '<None>' : chit.fileAsStr),50, true)}</a>
                            </td>
                        </tr>
                    </c:forEach>
                </table>
                <c:if test="${empty context or context.searchResult.size eq 0}">
                    <div class='zo_noresults'><fmt:message key="noResultsFound"/></div>
                </c:if>
            </td>
        </tr>
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_leftbutton'><fmt:message key="MO_MAIN"/></a></td>
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
