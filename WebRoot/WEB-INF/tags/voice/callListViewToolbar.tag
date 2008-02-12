<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width=100% cellspacing=0 cellpadding=0 class='Tb'>
    <tr valign="middle">
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <td nowrap>
                    <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                    <a href="${refreshUrl}"><c:if test="${keys}"></c:if><app:img src="arrows/ImgRefresh.gif" altkey="getCalls"/><span><fmt:message key="getCalls"/></span></a>
                </td>
                <td><div class='vertSep'></div></td>
                <td nowrap>
                    <zm:currentResultUrl var="refreshUrl" value="/h/printcalls" context="${context}" refresh="true" />
                    <a id="OPPRINT" target="_blank" href="${refreshUrl}"><app:img src="startup/ImgPrint.gif" altkey="actionPrint"/></a>
                </td>
                <td><div class='vertSep'></div></td>
                <td nowrap>
                    <c:url var="optionsUrl" value="/h/options">
                        <c:param name="selected" value="voice"/>
                        <c:param name="phone" value="${zm:getPhoneFromVoiceQuery(context.query)}"/>
                    </c:url>
                    <a id="OPCALLMANAGER" href="${optionsUrl}"><app:img src="voicemail/ImgCallManager.gif" altkey="callManager"/><span><fmt:message key="actionCallManager"/></span></a>
                </td>
            </table>
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
