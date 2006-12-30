<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:currentResultUrl var="closeUrl" value="/h/search" context="${context}"/>
<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>

<app:view selected="contacts" contacts="true" tags="true" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="search" action="view" context="${context}"/>
    <form action="${currentUrl}" method="post">
        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:contactToolbar context="${context}" cursor="${cursor}" keys="true" closeurl="${closeUrl}"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                        <app:displayContact contact="${contact}"/>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:contactToolbar context="${context}" cursor="${cursor}" keys="false" closeurl="${closeUrl}"/>
                </td>
            </tr>
            </table>
        <input type="hidden" name="doContactListViewAction" value="1"/>
        <input type="hidden" name="id" value="${contact.id}"/>
    </form>
</app:view>

