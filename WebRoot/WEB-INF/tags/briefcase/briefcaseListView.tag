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
    <c:set var="title" value="Briefcase"/>
    <c:set var="selectedRow" value="${param.selectedRow}"/>
    <fmt:message var="unknownSubject" key="noSubject"/>
    <zm:composeUploader var="uploader"/>
</app:handleError>

<app:view mailbox="${mailbox}" title="${title}" context="${context}" selected='briefcases' briefcases="true" searches="false" tags="true" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <form name="zform" action="${fn:escapeXml(currentUrl)}" method="post">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                     <app:briefcaseListViewToolbar context="${context}" keys="true"/>
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
                                    Name
                                </a>
                                <th width="15%" nowrap>
                                    <zm:newSortUrl var="typeSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'briefTypeAsc') ? 'briefTypeDesc' : 'briefTypeAsc'}"/>
                                <a href="${fn:escapeXml(typeSortUrl)}">
                                    Type
                                </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="sizeSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'briefSizeAsc') ? 'briefSizeDesc' : 'briefSizeAsc'}"/>
                                <a href="${fn:escapeXml(sizeSortUrl)}">
                                    Size
                                    </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                <a href="${fn:escapeXml(dateSortUrl)}">
                                    Date  
                                </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="ownerSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'briefOwnerDesc' or empty context.ss) ? 'briefOwnerAsc' : 'briefOwnerDesc'}"/>
                                <a href="${fn:escapeXml(ownerSortUrl)}">
                                    Owner
                                </a>
                                <th width="10%" nowrap>
                                    <zm:newSortUrl var="folderSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'briefFolderDesc' or empty context.ss) ? 'briefFolderAsc' : 'briefFolderDesc'}"/>
                                <a href="${fn:escapeXml(folderSortUrl)}">
                                    Folder
                                </a>
                            </tr>

                            <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                                <c:set var="briefHit" value="${hit.briefcaseHit}"/>
                                <zm:currentResultUrl var="docUrl" value="search" id="${briefHit.docId}" action="" index="${status.index}" context="${context}" usecache="true"/>

                                <c:if test="${empty selectedRow and briefHit.id == context.currentItem.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
                                <c:set var="aid" value="A${status.index}"/>
                                <tr onclick='zSelectRow(event,"${aid}")' id="R${status.index}" class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}${selectedRow eq status.index ? ' RowSelected' : ''}'>
                                    <td class='CB' nowrap><input  id="C${status.index}" type=checkbox name="id" value="${briefHit.docId}"></td>
                                    <c:if test="${mailbox.features.tagging}">
                                        <td class='Img'><app:miniTagImage ids="${briefHit.document.tagIds}"/></td>
                                    </c:if>
                                    <td class='Img'>
                                        <c:choose>
                                            <c:when test="${zm:contains(briefHit.document.contentType,'image')}">
                                                <app:img src="doctypes/ImgImageDoc.gif"/>
                                            </c:when>
                                            <c:when test="${zm:contains(briefHit.document.contentType,'video')}">
                                                <app:img src="doctypes/ImgVideoDoc.gif"/>
                                            </c:when>
                                            <c:when test="${zm:contains(briefHit.document.contentType,'pdf')}">
                                                <app:img src="doctypes/ImgPDFDoc.gif"/>
                                            </c:when>
                                            <c:when test="${zm:contains(briefHit.document.contentType,'zip')}">
                                                <app:img src="doctypes/ImgZipDoc.gif"/>
                                            </c:when>
                                            <c:otherwise>
                                                <app:img src="doctypes/ImgUnknownDoc.gif"/>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td><%-- allow this column to wrap --%>
                                        <a href="${fn:escapeXml(briefHit.document.restUrl)}" id="${aid}">
                                            <c:set var='docName' value="${empty briefHit.document.name ? unknownSubject : zm:truncate(briefHit.document.name,100,true)}"/>
                                            <c:out value="${docName}"/>
                                        </a>
                                    </td>
                                    <c:set var="ctype" value="${fn:split(briefHit.document.contentType,';')}" />
                                    <td width="15%" nowrap>${ctype[0]}</td>
                                    <td width="10%">${fn:escapeXml(zm:displaySize(briefHit.document.size))}</td>
                                    <td width="10%" nowrap>
                                        <fmt:formatDate value="${briefHit.modifiedDate}" pattern="M/d/yyyy" timeZone="${mailbox.prefs.timeZone}"/>
                                    </td>
                                        <c:set var="cname" value="${fn:split(briefHit.document.creator,'@')}" />
                                    <td width="10%">${cname[0]}</td>
                                    <td width="10%">${zm:getFolderPath(pageContext,briefHit.document.folderId)}</td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty param.sti}">
                                <c:set var="folders" value="${zm:getFolder(pageContext,empty param.sfi ? mailbox.briefcase.id : param.sfi)}"/>
                                <c:forEach var="subFolder" items="${folders.subFolders}" varStatus="status">
                                    <c:url var="url" value="/h/search">
                                        <c:param name="sfi" value="${subFolder.id}"/>
                                        <c:param name="st" value="briefcase"/>
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
                    <app:briefcaseListViewToolbar context="${context}" keys="true"/>
                </td>
            </tr>
        </table>
        <input type="hidden" name="doBriefcaseAction" value="1"/>
        <input type="hidden" name="view" value="${param.view}"/>
        <input id="sr" type="hidden" name="selectedRow" value="${empty selectedRow ? 0 : zm:cook(selectedRow)}"/>
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    </form>
    <SCRIPT TYPE="text/javascript">
        <!--
        var zrc = ${context.searchResult.size};
        var zsr = ${zm:cookInt(selectedRow, 0)};
        var zss = function(r,s) {
            var e = document.getElementById("R"+r);
            if (e == null) return;
            if (s) {
                if (e.className.indexOf(" RowSelected") == -1) e.className = e.className + " RowSelected";
                var e2 = document.getElementById("sr"); if (e2) e2.value = r;
            }
            else { if (e.className.indexOf(" RowSelected") != -1) e.className = e.className.replace(" RowSelected", "");}
        }
        var zsn = function() {if (zrc == 0 || (zsr+1 == zrc)) return; zss(zsr, false); zss(++zsr, true);}
        var zsp = function() {if (zrc == 0 || (zsr == 0)) return; zss(zsr, false); zss(--zsr, true);}
        var zos = function() {if (zrc == 0) return; var e = document.getElementById("A"+zsr); if (e && e.href) window.location = e.href;}
        var zcs = function(c) {if (zrc == 0) return; var e = document.getElementById("C"+zsr); if (e) e.checked = c ? c : !e.checked;}
        var zcsn = function () { zcs(true); zsn(); }
        var zcsp = function () { zcs(true); zsp(); }
        var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
        var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
        var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
        function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
        //-->
    </SCRIPT>

    <app:keyboard cache="mail.briefcaseListView" globals="true" mailbox="${mailbox}" tags="true">

        <zm:bindKey message="mail.Delete" func="function() { zclick('SOPDELETE')}"/>
        <zm:bindKey message="global.CheckCheckBox" func="zcs"/>
        <zm:bindKey message="global.SelectAllCheckBoxes" func="function() { zclick('OPCHALL')}"/>

        <zm:bindKey message="conversation.Open" func="zos"/>
        <zm:bindKey message="global.CheckAndPreviousItem" func="zcsp"/>
        <zm:bindKey message="global.CheckAndNextItem" func="zcsn"/>
        <zm:bindKey message="global.PreviousItem" func="zsp"/>
        <zm:bindKey message="global.NextItem" func="zsn"/>
        <zm:bindKey message="global.PreviousPage" id="PREV_PAGE"/>
        <zm:bindKey message="global.NextPage" id="NEXT_PAGE"/>
        <c:if test="${mailbox.features.tagging}">
            <zm:bindKey message="global.Tag" func="function() {zaction('OPTAG{TAGID}')}" alias="tag"/>
        </c:if>
        <zm:bindKey message="mail.MoveToFolder" func="function() {zmove('OPFLDR{FOLDERID}')}" alias="folder"/>
    </app:keyboard>

</app:view>