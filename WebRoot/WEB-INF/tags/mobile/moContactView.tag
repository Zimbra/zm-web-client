<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="id" value="${not empty id?id:(empty param.id ? context.currentItem.id : param.id)}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${id}" var="contact"/>
    <c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${contact.displayFileAs}" context="${null}" clazz="zo_obj_body" scale="true">

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td>
                <mo:contactToolbar cid="${contact.id}" urlTarget="${context_url}" context="${context}" keys="false"/>
            </td>
        </tr>
        <tr>
            <td class='zo_appt_view'>
                <mo:displayContact contact="${contact}"/>
            </td>
        </tr>
        <tr>
            <td>
                <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
                <div class="wh_bg">
                    <form id="action" action="${fn:escapeXml(actionUrl)}" method="post">
                        <input type="hidden" name="doContactAction" value="1"/>
                        <input type="hidden" name="id" value="${contact.id}"/>
                        <table cellspacing="2" cellpadding="2" width="100%">
                            <tr class="zo_m_list_row">
                                <td>
                                    <hr size="1"/>
                                    <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                    <input type="button" onclick="zClickLink('_edit_link')"
                                           value="<fmt:message key="edit"/>"/>
                                </td>
                            </tr>
                                <%--<tr>
                                    <td align="right"><a href="#top" style="font-size:large;">&nbsp;^&nbsp;</a></td>
                                </tr>--%>
                        </table>
                    </form>
                </div>
            </td>
        </tr>
    </table>

</mo:view>
