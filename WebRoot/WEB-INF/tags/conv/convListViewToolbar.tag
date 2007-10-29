<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>

<table width="100%" cellspacing="0" cellpadding="0" class="Tb">
    <tr valign="middle">
        <td class="TbBt">
            <table cellspacing="0" cellpadding="0" class="Tb">
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="arrows/ImgRefresh.gif" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
                    </td>
                            <td><div class='vertSep'></div></td>
                    <td nowrap>
                     <c:choose>
                        <c:when test="${not empty context}">
                            <zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
                        </c:when>
                        <c:otherwise>
                            <c:url var="composeUrl" value="/h/search?action=compose"/>
                        </c:otherwise>
                    </c:choose>
                    <a href="${fn:escapeXml(composeUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgNewMessage.gif" altkey="compose"/><span>&nbsp;<fmt:message key="compose"/></span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                     <td nowrap>
                         <zm:currentResultUrl var="convPrintUrl" value="/h/search" context="${context}"  print="true"/>
                         <a href="${fn:escapeXml(convPrintUrl)}" ><app:img src="startup/ImgPrint.gif" altkey="actionPrint"/><span>&nbsp;<fmt:message key="actionPrint"/></span></a>
                        
                         <%-- <app:button id="${keys ? 'OPPRINT' : ''}" text="actionPrint" name="actionPrint" tooltip="actionTrashTT"  src="startup/ImgPrint.gif"/ --%>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                        <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                            <app:button  id="${keys ? 'OPDELETE' : ''}" text="actionDelete" name="actionHardDelete" tooltip="actionTrashTT" src="startup/ImgDelete.gif"/>
                        </c:when>
                        <c:otherwise>
                            <app:button id="${keys ? 'OPDELETE' : ''}" text="actionDelete" name="actionDelete" tooltip="actionTrashTT"  src="startup/ImgDelete.gif"/>
                        </c:otherwise>
                    </c:choose>
                    <td><div class='vertSep'></div></td>
                    <td nowrap valign="middle">
                        <select name="folderId" onchange="zclick('SOPMOVE')">
                            <option value="" selected><fmt:message key="moveAction"/>
                            <option disabled><fmt:message key="actionOptSep"/>
                            <zm:forEachFolder var="folder">
                                <c:if test="${folder.isConversationMoveTarget and !folder.isTrash and !folder.isSpam}">
                                    <option <c:if test="${keys}">id="OPFLDR${folder.id}"</c:if> value="m:${folder.id}">${fn:escapeXml(folder.rootRelativePath)}
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPMOVE' : ''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
                    <td><div class='vertSep'></div></td>
                    <td  nowrap valign="middle">
                        <select name="actionOp" onchange="zclick('SOPGO')">
                            <option value="" selected><fmt:message key="moreActions"/>
                            <option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
                            <option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
                            <c:if test="${mailbox.features.flagging}">
                                <option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"><fmt:message key="actionAddFlag"/>
                                <option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"><fmt:message key="actionRemoveFlag"/>
                            </c:if>
                            <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPGO' : ''}" name="action" tooltip="actionConvGoTT" text="actionGo"/>

                    <td><div class='vertSep'></div></td>
                    <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
                        <app:button id="${keys ? 'OPSPAM' : ''}" name="actionSpam" tooltip="actionSpamTT" text="actionSpam" src="mail/ImgJunkMail.gif"/>
                    </c:if>
                    <c:if test="${context.isFolderSearch and context.folder.isSpam}">
                        <app:button id="${keys  ?'OPSPAM' : ''}" name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam" src="startup/ImgInbox.gif"/>
                    </c:if>
                    <c:if test="${context.isFolderSearch}">

                        <c:choose>
                            <c:when test="${context.folder.isTrash}">
                                <td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
                                <app:button name="actionEmpty" src="startup/ImgDelete.gif" tooltip="emptyTrash" text="emptyTrash"/>
                            </c:when>
                            <c:when test="${context.folder.isSpam}">
                                <td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
                                <app:button name="actionEmpty" src="startup/ImgDelete.gif" tooltip="emptyJunk" text="emptyJunk"/>
                            </c:when>
                            <c:when test="${context.folder.isFeed}">
                                <td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
                                <app:button name="actionLoadFeed" src="arrows/ImgRefresh.gif" tooltip="checkFeed" text="checkFeed"/>
                            </c:when>
                        </c:choose>
                    </c:if>
                </tr>
            </table>
        </td>
        <td nowrap align="right">
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
