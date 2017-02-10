<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>

<rest:handleError>
	<zm:getBriefcase varSearch="searchResult" varFolder="folder"
		box="${mailbox}"
		id="${requestScope.zimbra_target_item_id}"
		resttargetaccountid="${requestScope.zimbra_target_account_id}"
		timezone="${timezone}"/>
	<fmt:message key="noName" var="noName"/>
</rest:handleError>

<head><link rel='stylesheet' type='text/css' href='/zimbra/css/briefcase.css'></head>
<body>
<div id="ZimbraBriefcasePage">
	<table class="layoutTable">
		<tbody>
		<tr>
			<td colspan="2" class="headerContainer"></td>
		</tr>
		<tr>
			<td valign="top" rowspan="2" class="sidebarContainer"></td>
			<td valign="top" class="titlebarContainer">
				<table class="layoutTable">
					<tbody>
					<!--tr>
						<td class="breadcrumbHeader">
							<table class="layoutTable">
								<tbody>
								<tr>
									<td class="breadcrumbs smallGrayLinks">
										<table class="breadcrumb_table">
											<tbody><tr></tr></tbody>
										</table>
									</td>
									<td class="tags"></td>
								</tr>
								</tbody>
							</table>
						</td>
					</tr-->
					<tr>
						<td class="titleHeader">
						<table class="layoutTable">
							<tbody>
							<tr>
								<td valign="top" class="pageIcon"><!--wiklet class='ICON' /--></td>
								<td>
									<span class="pageName">${zm:cook(requestScope.zimbra_target_item_name)}</span><br>
									<span class="owner">
										<fmt:message key="by"/>&nbsp;${requestScope.zimbra_target_account_name}
									</span>
									<br>
								</td>
							</tr>
							</tbody>
						</table>
						</td>
					</tr>
				</tbody>
				</table>
			</td>
		</tr>
		<tr>
			<td valign="top" class="contentContainer">
				<div class="toc">
					<table class="tocTable">
						<tbody>
							<!--tr>
								<td width="16" class="ImgNotebook"></td>
								<td class="linespace" colspan="2"></td>
							</tr-->
							<tr>
								<td colspan="3">
									<table class="tocListTable">
										<tbody>
											<tr class="headerUnderLine">
												<td width="16" class="header">&nbsp;</td>
												<td class="header"><fmt:message key="briefcaseDocName"/></td>
												<td class="header"><fmt:message key="briefcaseModifiedOn"/></td>
												<td class="header"><fmt:message key="briefcaseModifiedBy"/></td>
												<td class="header"><fmt:message key="briefcaseVersion"/></td>
											</tr>
										<c:forEach var="subFolder" items="${folder.subFolders}" varStatus="status">
											<tr class="dotLine">
												<td width="16" class="pageIcon"><div class="ImgSection"></div></td>
												<td class="pageLink">
													<c:set var="subFolderUrl" value="/home/${requestScope.zimbra_target_account_name}${folder.pathURLEncoded}/${subFolder.nameURLEncoded}"/>
													<a href="${fn:escapeXml(subFolderUrl)}">
														<c:set var='subFolderName' value="${empty subFolder.name  ? noName : zm:truncate(subFolder.name,100,true)}"/>
														<c:out value="${subFolderName}"/>
													</a>
												</td>
												<td class="modified">--</td>
												<td class="author">--</td>
												<td class="version">--</td>
											</tr>
										</c:forEach>
										<c:forEach items="${searchResult.hits}" var="hit" varStatus="status">
											<c:set var="briefHit" value="${hit.briefcaseHit}"/>
											<tr class="dotLine">
												<td width="16" class="pageIcon"><div class="ImgSection"></div></td>
												<td class="pageLink"><%-- allow this column to wrap --%>
													<c:set var="briefUrl" value="/home/${requestScope.zimbra_target_account_name}${folder.pathURLEncoded}/${briefHit.document.nameURLEncoded}"/>
													<c:if test="${fn:contains(briefHit.document.contentType, 'application/x-zimbra-doc')}">
														<c:set var="briefUrl" value="${briefUrl}?fmt=html&preview=1"/>
													</c:if>
													<a href="${fn:escapeXml(briefUrl)}">
														<c:set var='docName' value="${empty briefHit.document.name ? noName : zm:truncate(briefHit.document.name,100,true)}"/>
														<c:out value="${docName}"/>
													</a>
												</td>
												<td class="modified"><fmt:formatDate value="${empty briefHit.modifiedDate ? '' : briefHit.modifiedDate}" pattern="M/d/yyyy h:mm a" timeZone="${timezone}"/></td>
												<td class="author"><c:set var="authorName" value="${empty briefHit.document.editor ? noName : zm:truncate(briefHit.document.editor,50,true) }"/>
													<c:out value="${authorName}"/>
												</td>
												<td class="version"><c:out value="${empty briefHit.document.version ? '' :  briefHit.document.version}"/></td>
											</tr>
										</c:forEach>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" class="footerContainer"></td>
		</tr>
		</tbody>
	</table>
</div>
</body>
