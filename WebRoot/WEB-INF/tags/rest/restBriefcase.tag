<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
    <zm:getBriefcase varSearch="searchResult" varFolder="folder" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>
    <fmt:message key="noName" var="noName"/>
</rest:handleError>

<head><link rel='stylesheet' type='text/css' href='/zimbra/css/wiki.css'></head>
<body>
<div id="ZimbraWikiPage">
    <table cellspacing="0" cellpadding="0" class="zmwiki-chromeTable">
        <tbody>
	    <tr>
            <td colspan="2" class="zmwiki-headerContainer"></td>
	    </tr>
	    <tr>
    		<td valign="top" rowspan="2" class="zmwiki-sideBarContainer"></td>
	    	<td valign="top" class="zmwiki-titleBarContainer">
			    <table width="100%" cellspacing="0" cellpadding="0">
                    <tbody>
	                <tr>
                        <td class="zmwiki-breadcrumbHeader">
			                <table width="100%" cellspacing="0" cellpadding="0">
				                <tbody>
                                <tr>
					                <td width="100%" class="zmwiki-breadcrumbs zmwiki-smallGrayLinks"><table cellspacing="0" cellpadding="0" class="zmwiki-breadcrumb_table">
	                                <tbody><tr></tr></tbody></table>
                                    </td>
					                <td width="100%" class="zmwiki-tags"></td>
				                </tr>
			                    </tbody>
                            </table>
		                </td>
	                </tr>
	                <tr>
		                <td class="zmwiki-titleHeader">
			            <table width="100%" cellspacing="0" cellpadding="0" border="0">
				            <tbody>
                            <tr>
					            <td valign="top" class="zmwiki-pageIcon"><!--wiklet class='ICON' /--></td>
					            <td><span class="zmwiki-pageName">${requestScope.zimbra_target_item_name}</span><br>
					            <span class="zmwiki-author zmwiki-smallGrayLinks"><fmt:message key="by"/>&nbsp;${requestScope.zimbra_target_account_name}</span><br>
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
		    <td valign="top" class="zmwiki-contentContainer">
			<div class="zmwiki-toc">
	        <table cellspacing="0" cellpadding="2" class="zmwiki-tocTable">
		    <tbody>
            <tr>
                <td colspan="3">
		        <table width="100%" cellspacing="0" cellpadding="0" border="0" class="zmwiki-horzBorder">
			    <tbody>
                <tr>
			        <td class="zmwiki-tocHeader"><fmt:message key="wikiTOC"/></td>
		        </tr>
		        </tbody>
                </table>
		        </td>

            </tr>
		    <tr>
                <td class="zmwiki-tocLineSeparator" colspan="3"><div></div></td>
            </tr>
		    <tr>
		        <td width="16" class="zmwiki-ImgNotebook"></td>
		        <td class="zmwiki-linespace" colspan="2"></td>
		    </tr>
		    <tr>
		        <td colspan="3">
			    <table width="100%" cellspacing="0" cellpadding="8" border="0" class="zmwiki-tocListTable">
                <tbody>
                <tr class="zmwiki-headerUnderLine">
			        <td width="16" class="zmwiki-header">&nbsp;</td>
			        <td class="zmwiki-header"><fmt:message key="wikiDocName"/></td>
			        <td class="zmwiki-header"><fmt:message key="wikiModifiedBy"/></td>
			        <td class="zmwiki-header"><fmt:message key="wikiModifiedOn"/></td>
			        <td class="zmwiki-header"><fmt:message key="wikiVersion"/></td>
			    </tr>
                <c:forEach var="subFolder" items="${folder.subFolders}" varStatus="status">
                    <tr class="zmwiki-dotLine">
                        <td width="16" class="zmwiki-pageIcon"><div class="ImgSection"></div></td>
                        <td class="zmwiki-pageLink">
                            <c:set var="subFolderUrl" value="/home/${requestScope.zimbra_target_account_name}${folder.path}/${subFolder.name}"/>
                            <a href="${fn:escapeXml(subFolderUrl)}" target="_blank">
                                <c:set var='subFolderName' value="${empty subFolder.name  ? noName : zm:truncate(subFolder.name,100,true)}"/>
                                <c:out value="${subFolderName}"/>
                            </a>
                        </td>
                        <td class="zmwiki-author">&nbsp;</td>
                    </tr>
                </c:forEach>
                <c:forEach items="${searchResult.hits}" var="hit" varStatus="status">
                    <c:set var="briefHit" value="${hit.briefcaseHit}"/>
                    <tr class="zmwiki-dotLine">
                        <td width="16" class="zmwiki-pageIcon"><div class="ImgSection"></div></td>
                        <td class="zmwiki-pageLink"><%-- allow this column to wrap --%>
                            <c:choose>
                                <c:when test="${fn:contains(briefHit.document.contentType, 'application/x-zimbra-doc')}">
                                    <c:set var="briefUrl" value="/home/${requestScope.zimbra_target_account_name}${folder.path}/${briefHit.document.name}?fmt=html&preview=1"/>
                                </c:when>
                                <c:otherwise>
                                    <c:set var="briefUrl" value="/home/${requestScope.zimbra_target_account_name}${folder.path}/${briefHit.document.name}"/>
                                </c:otherwise>
                            </c:choose>
                            <a href="${fn:escapeXml(briefUrl)}" target="_blank">
                                <c:set var='docName' value="${empty briefHit.document.name ? noName : zm:truncate(briefHit.document.name,100,true)}"/>
                                <c:out value="${docName}"/>
                            </a>
                        </td>
                        <td class="zmwiki-author"><c:set var="authorName" value="${empty briefHit.document.editor ? noName : zm:truncate(briefHit.document.editor,50,true) }"/>
                            <c:out value="${authorName}"/>
                        </td>
                        <td class="zmwiki-author"><fmt:formatDate value="${empty briefHit.modifiedDate ? '' : briefHit.modifiedDate}" pattern="M/d/yyyy h:mm a" timeZone="${timezone}"/></td>
                        <td class="zmwiki-author"><c:out value="${empty briefHit.document.version ? '' :  briefHit.document.version}"/></td>
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
	    </tbody>
    </table>
</div>
</body>
