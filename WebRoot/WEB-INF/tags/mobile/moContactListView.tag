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
                        <zm:currentResultUrl var="contactUrl" value="/m/mosearch" action="view" id="${hit.contactHit.id}" index="${status.index}" context="${context}"/>
                        <tr  onclick='window.location="${zm:jsEncode(contactUrl)}"' id="cn${hit.contactHit.id}">
                            <td style='width:5px'>&nbsp;</td>
                            <td><mo:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
                            <td class='zo_ab_list_arrow'>
                                    ${zm:truncate(fn:escapeXml(empty hit.contactHit.fileAsStr ? '<None>' : hit.contactHit.fileAsStr),50, true)}
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
