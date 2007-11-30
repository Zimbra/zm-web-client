<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class="TbBt">
            <table cellspacing="0" cellpadding="0" class="Tb">
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
                        <a href="${fn:escapeXml(closeurl)}" <c:if test="${keys}">id="CLOSE_ITEM"</c:if>> <app:img src="common/ImgClose.gif" alt="close"/> <span>&nbsp;${fn:escapeXml(context.backTo)}&nbsp;</span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <app:button id="${keys ? 'OPDELETE' :''}" name="actionDelete" src="startup/ImgDelete.gif" text="actionDelete" tooltip="actionTrashTT"/>
                    <td><div class='vertSep'></div></td>
                    <td  nowrap valign="middle">
                        <select name="folderId" onchange="zclick('SOPMOVE')">
                            <option value="" selected/><fmt:message key="moveAction"/>
                            <option disabled /><fmt:message key="actionOptSep"/>
                            <zm:forEachFolder var="folder">
                                <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                    <option <c:if test="${keys}">id="OPFLDR${folder.id}"</c:if> value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPMOVE' : ''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
                    <td><div class='vertSep'></div></td>
                    <td  nowrap valign="middle">
                        <select name="actionOp" onchange="zclick('SOPGO')">
                            <option value="" selected/><fmt:message key="moreActions"/>
                            <option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
                            <option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
                            <c:if test="${mailbox.features.flagging}">
                                <option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"/><fmt:message key="actionAddFlag"/>
                                <option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"/><fmt:message key="actionRemoveFlag"/>
                            </c:if>
                            <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPGO' :''}" name="action" tooltip="actionMessageGoTT" text="actionGo" />

                    <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
                        <td><div class='vertSep'></div></td>
                        <app:button id="${keys ? 'OPSPAM' : ''}" name="actionSpam" tooltip="actionSpamTT" text="actionSpam" src="mail/ImgJunkMail.gif"/>
                    </c:if>
                    <c:if test="${context.isFolderSearch and context.folder.isSpam}">
                        <td><div class='vertSep'></div></td>
                        <app:button name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam" src="startup/ImgInbox.gif"/>
                    </c:if>
                    <td><div class='vertSep'></div>                    <input type="hidden" name="contextConvId" value="${convSearchResult.conversationSummary.id}"></td>
                    <app:button id="${keys ? 'OPMARKALL' :''}" name="actionMarkConvRead" src="startup/ImgReadMessage.gif" text="actionMarkAllRead" tooltip="actionMarkAllRead"/>
                </tr>
            </table>
        </td>
        <td nowrap align="right">
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="PREV_PAGE"</c:if> href="${fn:escapeXml(prevItemUrl)}"><app:img altkey="ALT_CONV_PREVIOUS_CONVERSATION" src="arrows/ImgLeftDoubleArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_CONVERSATION' disabled='true' src="arrows/ImgLeftDoubleArrow.gif" border="0"/>
            </c:if>
            <c:if test="${convSearchResult.hasPrevPage}">
                <zm:currentResultUrl var="prevPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.prevOffset}" css="${param.css}"/>
                <a <c:if test="${keys}">id="PREV_CONV_PAGE"</c:if> href="${fn:escapeXml(prevPageUrl)}"><app:img altkey="ALT_CONV_PREVIOUS_PAGE_IN_CONVERSATION" src="startup/ImgLeftArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasPrevPage}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_PAGE_IN_CONVERSATION' disabled='true' src="startup/ImgLeftArrow.gif" border="0"/>
            </c:if>
            <app:searchPageOffset searchResult="${convSearchResult}" max="${convSearchResult.conversationSummary.messageCount}"/>
            <c:if test="${convSearchResult.hasNextPage}">
                <zm:currentResultUrl var="nextPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.nextOffset}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="NEXT_CONV_PAGE"</c:if> href="${fn:escapeXml(nextPageUrl)}"><app:img altkey="ALT_CONV_NEXT_PAGE_IN_CONVERSATION" src="startup/ImgRightArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasNextPage}">
                <app:img altkey='ALT_CONV_NO_NEXT_PAGE_IN_CONVERSATION' disabled='true' src="startup/ImgRightArrow.gif" border="0"/>
            </c:if>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="NEXT_PAGE"</c:if> href="${fn:escapeXml(nextItemUrl)}"><app:img  altkey="ALT_CONV_NEXT_CONVERSATION" src="arrows/ImgRightDoubleArrow.gif" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img altkey='ALT_CONV_NO_NEXT_CONVERSATION' disabled='true' src="arrows/ImgRightDoubleArrow.gif" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
