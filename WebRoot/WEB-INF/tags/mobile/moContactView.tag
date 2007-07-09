<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${empty param.id ? context.currentItem.id : param.id}" var="contact"/>
    <zm:currentResultUrl var="closeUrl" value="/m/mosearch" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${contact.displayFileAs}" context="${null}" clazz="zo_obj_body">

    <table width=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td><a href="${closeUrl}" class='zo_button'>
                            <fmt:message key="close"/>
                        </a></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class='zo_appt_view'>
                <mo:displayContact contact="${contact}"/>
            </td>
        </tr>
    </table>

</mo:view>
