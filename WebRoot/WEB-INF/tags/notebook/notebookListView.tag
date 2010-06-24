<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:choose>
    <c:when test="${not empty mailbox.prefs.locale}">
        <fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
    </c:when>
    <c:otherwise>
        <fmt:setLocale value='${pageContext.request.locale}' scope='request' />
    </c:otherwise>
    </c:choose>
    <fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
    <fmt:message var="title" key="notebook"/>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <zm:composeUploader var="uploader"/>
</app:handleError>
<c:set var="toolbar">
        <table cellspacing="0" cellpadding="0" class='Tb'>
            <tr>
                <td nowrap>&nbsp;</td>
                <td nowrap>
                    <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                    <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgRefresh.gif" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
                </td>
                <td nowrap>&nbsp;</td>
                <td><div class='vertSep'></div></td>
                <td nowrap>&nbsp;</td>
                <td nowrap>
                    <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                    <c:choose>
                    <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                        <app:button id="${keys ? 'OPDELETE' : ''}" name="actionHardDelete" src="startup/ImgDelete.gif" text="actionDelete" tooltip="actionTrashTT" />
                    </c:when>
                    <c:otherwise>
                        <app:button id="${keys ? 'OPDELETE' : ''}" name="actionDelete" src="startup/ImgDelete.gif" text="actionDelete" tooltip="actionTrashTT"/>
                    </c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </table>

</c:set>

<app:view mailbox="${mailbox}" title="${title}" context="${context}" selected='notebook' notebook="true" searches="false" tags="true" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <form name="zform" action="${fn:escapeXml(currentUrl)}" method="post">
            <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    ${toolbar}
                </td>
            </tr>
            <tr>
                <td class='List'>
                        <table width="100%" cellpadding="2" cellspacing="0">
                            <tr class='Header'>
                                <th class='CB' nowrap><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                                <c:if test="${mailbox.features.tagging}">
                                    <th class='Img' nowrap><app:img src="startup/ImgTagOrange.gif" altkey="ALT_TAG_TAG"/>
                                </c:if>
                                <th class='Img' nowrap><app:img src="common/ImgGlobe.gif" altkey="ALT_TAG_TAG"/>
                                <th nowrap>
                                    <zm:newSortUrl var="nameSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameAsc' ? 'nameDesc' : 'nameAsc'}"/>
                                <a href="${fn:escapeXml(nameSortUrl)}">
                                    <fmt:message key="name"/>
                                </a>
                                <th width="15%" nowrap>
                                    <fmt:message key="type"/>
                                <th width="10%" nowrap>
                                    <fmt:message key="size"/>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                <a href="${fn:escapeXml(dateSortUrl)}">
                                    <fmt:message key="date"/>
                                </a>
                                <th width="10%" nowrap>
                                    <fmt:message key="owner"/>
                                <th width="10%" nowrap>
                                    <fmt:message key="folder"/>
                            </tr>

                            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                                <c:set var="wikiHit" value="${hit.wikiHit}"/>
                                <zm:currentResultUrl var="docUrl" value="search" id="${wikiHit.docId}" action="" index="${status.index}" context="${context}" usecache="true"/>

                                <c:if test="${empty selectedRow and wikiHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                                <c:set var="aid" value="A${status.index}"/>
                                <tr onclick='zSelectRow(event,"${aid}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                                    <td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${wikiHit.docId}"></td>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${wikiHit.document.tagIds}"/></td>
                                    </c:if>
                                    <c:set var="ctype" value="${fn:split(wikiHit.document.contentType,';')}" />
                                    <td class='Img'>
                                        <app:mimeTable contenttype="${ctype[0]}"/>
                                        <app:img src="${mimeImg}"/>
                                    </td>
                                    <td><%-- allow this column to wrap --%>
                                        <c:set var="briefUrl" value="/service/home/~/?id=${wikiHit.id}&auth=co"/>
                                        <a href="${fn:escapeXml(briefUrl)}" id="${aid}" onclick="return false;">
                                            <c:set var='docName' value="${empty wikiHit.document.name ? unknownSubject : zm:truncate(wikiHit.document.name,100,true)}"/>
                                            <c:out value="${docName}"/>
                                        </a>
                                    </td>
                                    <td width="15%" nowrap><fmt:message key="${mimeDesc}"/></td>
                                    <td width="10%">${fn:escapeXml(zm:displaySize(pageContext, wikiHit.document.size))}</td>
                                    <td width="10%" nowrap>
                                        <fmt:formatDate value="${wikiHit.modifiedDate}" pattern="M/d/yyyy" timeZone="${mailbox.prefs.timeZone}"/>
                                    </td>
                                        <c:set var="cname" value="${fn:split(wikiHit.document.creator,'@')}" />
                                    <td width="10%">${cname[0]}</td>
                                    <td width="10%">${zm:getFolderPath(pageContext,wikiHit.document.folderId)}</td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty param.sti}">
                                <c:set var="folders" value="${zm:getFolder(pageContext,empty param.sfi ? mailbox.briefcase.id : param.sfi)}"/>
                                <c:forEach var="subFolder" items="${folders.subFolders}" varStatus="status">
                                    <c:url var="url" value="/h/search">
                                        <c:param name="sfi" value="${subFolder.id}"/>
                                        <c:param name="st" value="briefcase"/>
                                        <c:param name="expand" value="${subFolder.parentId}"/>
                                    </c:url>
                                    <tr id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}'>
                                         <td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${subFolder.id}"></td>
                                        <td>&nbsp;</td>
                                        <td class='Img'><app:img src="${folders.image}" alt='${fn:escapeXml(subFolder.name)}'/></td>
                                        <td><a href="${fn:escapeXml(url)}" id="${aid}">${subFolder.name}</a></td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>${zm:getFolderPath(pageContext,subFolder.parentId)}</td>
                                    </tr>
                                </c:forEach>
                            </c:if>
                        </table>
                        <c:if test="${context.searchResult.size == 0 and not folders.hasChildren}">
                            <div class='NoResults'><fmt:message key="noResultsFound"/></div>
                        </c:if>
                </td>
            </tr>
         <tr>
            <td class='TbBottom'>
                ${toolbar}
            </td>
         </tr>
        </table>
        <input type="hidden" name="doNotebookAction" value="1"/>
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    </form>
    <SCRIPT TYPE="text/javascript">
        <!--
        var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
        function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.open(a.href);} }
        //-->
    </SCRIPT>
    <app:keyboard cache="mail.notebookListView" globals="true" mailbox="${mailbox}" tags="true">
        <zm:bindKey message="mail.Delete" func="function() { zclick('SOPDELETE')}"/>
    </app:keyboard>
</app:view>

