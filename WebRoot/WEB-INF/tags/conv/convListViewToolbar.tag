<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>

<table width="100%" cellspacing="0" cellpadding="0" class="Tb">
	<tr valign="middle">
		<td class="TbBt">
			<table cellspacing="0" cellpadding="0" class="Tb">
				<tr>
					<c:choose>
						<c:when test="${context.isFolderSearch and context.folder.isFeed}">
							<td><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
							<app:button name="actionLoadFeed" src="startup/ImgRefresh.png" tooltip="checkFeed" text="checkFeed"/>
						</c:when>
						<c:otherwise>
							<td norwap>
								<zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
								<a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgRefresh.png" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
							</td>
						</c:otherwise>
					</c:choose>
					<td><div class='vertSep'></div></td>
					<c:if test="${skin ne 'velodrome2'}">
                        <c:if test="${zm:isMailEnabled(mailbox)}">
						<td nowrap>
							<c:choose>
								<c:when test="${not empty context}">
									<zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
								</c:when>
								<c:otherwise>
									<c:url var="composeUrl" value="/h/search?action=compose"/>
								</c:otherwise>
							</c:choose>
							<a href="${fn:escapeXml(composeUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgNewMessage.png" altkey="compose"/><span>&nbsp;<fmt:message key="compose"/></span></a>
						</td>
						<td><div class='vertSep'></div></td>
                        </c:if>
					</c:if>
					<td height="100%" nowrap valign="middle" style="padding: 0 1px 0 1px">
						<input onclick="zprint();return false;" id="${keys ? 'IOPPRINT' : ''}" name="actionPrint" type="image" src="<app:imgurl value='startup/ImgPrint.png'/>" alt='<fmt:message key="actionPrint" />' title='<fmt:message key="actionPrint" />' />
					</td>
					<td height="100%" nowrap valign="middle" style="padding: 0 1px 0 1px">
						<input onclick="zprint();return false;" id="${keys ? 'SOPPRINT' : ''}" name="actionPrint" type="submit" value='<fmt:message key="actionPrint" />' title='<fmt:message key="actionPrint" />' />
					</td>
					<%--
					<zm:currentResultUrl var="refreshUrl" value="/h/printconversations" context="${context}" refresh="true" />
					<a id="OPPRINT" target="_blank" href="${refreshUrl}"><app:img src="startup/ImgPrint.png" altkey="actionPrint"/>&nbsp;<fmt:message key="actionPrint"/></a>
					--%>
					<td><div class='vertSep'></div></td>
					<c:choose>
						<c:when test="${context.isFolderSearch and context.folder.isTrash}">
							<app:button  id="${keys ? 'OPDELETE' : ''}" text="actionDelete" name="actionHardDelete" tooltip="actionTrashTT" src="startup/ImgDelete.png"/>
						</c:when>
						<c:otherwise>
							<app:button id="${keys ? 'OPDELETE' : ''}" text="actionDelete" name="actionDelete" tooltip="actionTrashTT"  src="startup/ImgDelete.png"/>
						</c:otherwise>
					</c:choose>
					<td><div class='vertSep'></div></td>
					<c:if test="${!context.folder.isDrafts}">
						<td nowrap valign="middle">
							<input  type="hidden" value="" id="drag_target_folder" name="dragTargetFolder" />
							<input  type="hidden" value="" id="drag_msg_id" name="dragMsgId" />
							<select name="folderId" onchange="zclick('SOPMOVE')">
								<option value="" selected><fmt:message key="moveAction"/></option>
								<optgroup label=<fmt:message key="actionOptSep"/>>
								<zm:forEachFolder var="folder">
									<c:if test="${folder.isConversationMoveTarget and !folder.isTrash and !folder.isSpam}">
										<option <c:if test="${keys}">id="OPFLDR${folder.id}"</c:if> value="m:${folder.id}">${zm:getTruncatedFolderPath(pageContext, folder.id, 10, true)}</option>
									</c:if>
								</zm:forEachFolder>
								</optgroup>
							</select>
						</td>
                        <td class='vSpace'></td>
						<app:button id="${keys ? 'OPMOVE' : ''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
						<td><div class='vertSep'></div></td>
					</c:if>
					<td  nowrap valign="middle">
						<select name="actionOp" onchange="zclick('SOPGO')">
							<option value="" selected><fmt:message key="moreActions"/>
							<option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
							<option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
							<c:if test="${mailbox.features.flagging}">
							<option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"><fmt:message key="actionAddFlag"/>
							<option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"><fmt:message key="actionRemoveFlag"/>
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
                    <td class='vSpace'></td>
					<app:button id="${keys ? 'OPGO' : ''}" name="action" tooltip="actionConvGoTT" text="actionGo"/>
					<%--
					<c:if test="${mailbox.features.spam}">
						<td><div class='vertSep'></div></td>
						<c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
							<app:button id="${keys ? 'OPSPAM' : ''}" name="actionSpam" tooltip="actionSpamTT" text="actionSpam" src="startup/ImgJunkMail.png"/>
						</c:if>
						<c:if test="${context.isFolderSearch and context.folder.isSpam}">
							<app:button id="${keys  ?'OPSPAM' : ''}" name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam" src="startup/ImgNotJunk.png"/>
						</c:if>
					</c:if>
					--%>
					<c:if test="${context.isFolderSearch}">

						<c:choose>
							<c:when test="${context.folder.isTrash}">
								<td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
								<app:button name="actionEmpty" src="startup/ImgDelete.png" tooltip="emptyTrash" text="emptyTrash"/>
								<input type="hidden" name="confirmed" value="0"/>
								<script type="text/javascript">
									var validatefn = function(){
										if(confirm('<fmt:message key="confirmEmptyTrashFolder"><fmt:param value=""/><fmt:param value=""/><fmt:param value=""/></fmt:message>')){
											if(document.forms.zform.confirmed.length > 1){
												document.forms.zform.confirmed[0].value = "1";
												document.forms.zform.confirmed[1].value = "1";
											}
											return true;
										}else{
											if(document.forms.zform.confirmed.length > 1){
												document.forms.zform.confirmed[0].value = "0";
												document.forms.zform.confirmed[1].value = "0";
											}
											return false;
										}
									}
									var el = document.getElementsByName("actionEmpty");
									if(el && el[0]) {
										el[0].onclick = validatefn;
									}
								</script>
							</c:when>
							<c:when test="${context.folder.isSpam}">
								<td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
								<app:button name="actionEmpty" src="mail/ImgEmptyFolder.png" tooltip="emptyJunk" text="emptyJunk"/>
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
