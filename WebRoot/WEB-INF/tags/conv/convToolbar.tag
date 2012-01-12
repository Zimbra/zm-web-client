<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class="TbBt">
            <table cellspacing="0" cellpadding="0" class="Tb">
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}" st="" sc=""/>
                        <%-- Create a URL pointing back, but without st or sc, because we may get here from a message view (using message->show conversation). If we try to get back to the inbox with st=conversation while we left it expecting "message", we'll be in trouble (unable to set "view by" back to "message" is one side effect) --%>
                        <zm:currentResultUrl var="delRedirectUrl" value="/h/search" context="${context}" />
                        <input type="hidden" value="${delRedirectUrl}" name="delRedirectUrl" />
                        <a href="${fn:escapeXml(closeurl)}" <c:if test="${keys}">id="CLOSE_ITEM"</c:if>> <app:img src="common/ImgClose.png" alt="close"/> <span>&nbsp;${fn:escapeXml(context.backTo)}&nbsp;</span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <app:button id="${keys ? 'OPDELETE' :''}" name="actionDelete" src="startup/ImgDelete.png" text="actionDelete" tooltip="actionTrashTT"/>
                    <td><div class='vertSep'></div></td>
                    <c:if test="${!context.folder.isDrafts}">
                    <td  nowrap valign="middle">
                        <select name="folderId" onchange="zclick('SOPMOVE')">
                            <option value="" selected><fmt:message key="moveAction"/></option>
                            <optgroup label=<fmt:message key="actionOptSep"/>>
                            <zm:forEachFolder var="folder">
                                <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                    <option <c:if test="${keys}">id="OPFLDR${folder.id}"</c:if> value="m:${folder.id}">${zm:getTruncatedFolderPath(pageContext, folder.id, 10, true)}</option>
                                </c:if>
                            </zm:forEachFolder>
                            </optgroup>    
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPMOVE' : ''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
                    <td><div class='vertSep'></div></td>
                     </c:if>
                    <td  nowrap valign="middle">
                        <select name="actionOp" onchange="zclick('SOPGO')">
                            <option value="" selected/><fmt:message key="moreActions"/>
                            <option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
                            <option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
                            <c:if test="${mailbox.features.flagging}">
                                <option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"/><fmt:message key="actionAddFlag"/>
                                <option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"/><fmt:message key="actionRemoveFlag"/>
                            </c:if>
                            <c:if test="${mailbox.features.spam}">
                                <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
                                    <option <c:if test="${keys}">id="OPSPAM" </c:if> value="actionSpam"/><fmt:message key="actionSpam"/>
                                </c:if>
                                <c:if test="${context.isFolderSearch and context.folder.isSpam}">
                                    <option <c:if test="${keys}">id="OPNOTSPAM" </c:if> value="actionNotSpam"/><fmt:message key="actionNotSpam"/>
                                </c:if>
                            </c:if>
                            <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPGO' :''}" name="action" tooltip="actionMessageGoTT" text="actionGo" />
                    <%--
                    <c:if test="${mailbox.features.spam}">
                        <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
                            <td><div class='vertSep'></div></td>
                            <app:button id="${keys ? 'OPSPAM' : ''}" name="actionSpam" tooltip="actionSpamTT" text="actionSpam" src="startup/ImgJunkMail.png"/>
                        </c:if>
                        <c:if test="${context.isFolderSearch and context.folder.isSpam}">
                            <td><div class='vertSep'></div></td>
                            <app:button name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam" src="startup/ImgNotJunk.png"/>
                        </c:if>
                    </c:if>
                    --%>
                    <td><div class='vertSep'></div>                    <input type="hidden" name="contextConvId" value="${convSearchResult.conversationSummary.id}"></td>
                   <app:button id="${keys ? 'OPMARKALL' :''}" name="actionMarkConvRead" src="startup/ImgReadMessage.png" text="actionMarkAllRead" tooltip="actionMarkAllRead"/>
                </tr>
            </table>
        </td>
        <td nowrap align="right">
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="PREV_PAGE"</c:if> href="${fn:escapeXml(prevItemUrl)}"><app:img altkey="ALT_CONV_PREVIOUS_CONVERSATION" src="arrows/ImgLeftDoubleArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_CONVERSATION' disabled='true' src="arrows/ImgLeftDoubleArrow.png" border="0"/>
            </c:if>
            <c:if test="${convSearchResult.hasPrevPage}">
                <zm:currentResultUrl var="prevPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.prevOffset}" css="${param.css}"/>
                <a <c:if test="${keys}">id="PREV_CONV_PAGE"</c:if> href="${fn:escapeXml(prevPageUrl)}"><app:img altkey="ALT_CONV_PREVIOUS_PAGE_IN_CONVERSATION" src="startup/ImgLeftArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasPrevPage}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_PAGE_IN_CONVERSATION' disabled='true' src="startup/ImgLeftArrow.png" border="0"/>
            </c:if>
            <app:searchPageOffset searchResult="${convSearchResult}" max="${convSearchResult.conversationSummary.messageCount}"/>
            <c:if test="${convSearchResult.hasNextPage}">
                <zm:currentResultUrl var="nextPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.nextOffset}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="NEXT_CONV_PAGE"</c:if> href="${fn:escapeXml(nextPageUrl)}"><app:img altkey="ALT_CONV_NEXT_PAGE_IN_CONVERSATION" src="startup/ImgRightArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasNextPage}">
                <app:img altkey='ALT_CONV_NO_NEXT_PAGE_IN_CONVERSATION' disabled='true' src="startup/ImgRightArrow.png" border="0"/>
            </c:if>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}"> id="NEXT_PAGE"</c:if> href="${fn:escapeXml(nextItemUrl)}"><app:img  altkey="ALT_CONV_NEXT_CONVERSATION" src="arrows/ImgRightDoubleArrow.png" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img altkey='ALT_CONV_NO_NEXT_CONVERSATION' disabled='true' src="arrows/ImgRightDoubleArrow.png" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
