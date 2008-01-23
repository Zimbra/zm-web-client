<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:set var="contactId" value="${context.currentItem.id}"/>    
    <c:if test="${not empty contactId}"><zm:getContact id="${contactId}" var="contact"/></c:if>
    <app:searchTitle var="title" context="${context}"/>
</app:handleError>

<app:view mailbox="${mailbox}" title="${title}" selected='contacts' contacts="true" tags="true"  context="${context}" keys="true">
   <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
   <form action="${fn:escapeXml(currentUrl)}" method="post" name="zform">
       <table width="100%" cellspacing="0" cellpadding="0">
           <tr>
               <td class='TbTop'>
                   <app:contactListViewToolbar context="${context}" contact="${contact}" keys="true"/>
               </td>
           </tr>
           <tr>
               <td>
               <table width="100%" cellspacing="0" cellpadding="0">
               <tr>
                   <td width="200" class='List' valign='top'>
                       <table width="100%" cellpadding="2" cellspacing="0">
                           <tr>
                               <th class='CB'><input id="OPCHALL" onClick="checkAll(document.zform.id,this)" type=checkbox name="allids"/>
                               <c:if test="${mailbox.features.tagging}">
                                <th class='Img' nowrap><app:img altkey='ALT_TAG_TAG' src="startup/ImgTagOrange.gif" alt="Tagged"/>
                                </c:if>
                               <th class='Img'>&nbsp;
                               <th nowrap>
                                   <zm:newSortUrl var="nameSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameDesc' ? 'nameAsc' : 'nameDesc'}"/>
                               <a href="${fn:escapeXml(nameSortUrl)}">
                                   <fmt:message key="name"/>
                               </a>
                           </tr>
                           <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                               <c:set var="isCurr" value="${hit.contactHit.id == context.currentItem.id}"/>
                               <tr onclick='zSelectRow(event,"A${status.index}")'
                                       class='${status.index mod 2 eq 1 ? 'ZhRowOdd' :'ZhRow'}${hit.contactHit.id == context.currentItem.id ? ' RowSelected': ''}'>
                                   <td class='CB' nowrap><input <c:if test="${isCurr}">id="CURRCHECK"</c:if> type=checkbox  name="id" value="${hit.contactHit.id}"></td>
                                   <c:if test="${mailbox.features.tagging}">
                                       <td class='Img'><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
                                   </c:if>
                                   <td class='Img'><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
                                   <td ><span style='padding:3px'>
                                       <zm:currentResultUrl var="contactUrl" value="/h/search" id="${hit.contactHit.id}" index="${status.index}" context="${context}"/>
                                       <a  href="${fn:escapeXml(contactUrl)}" id="A${status.index}">
                                               ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '<None>' : hit.contactHit.fileAsStr)}
                                       </a></span>
                                       <c:if test="${hit.contactHit.id == context.currentItem.id}">
                                           <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>

                                           <c:if test="${cursor.hasPrev}">
                                               <zm:prevItemUrl var="prevItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                               <a id="PREV_ITEM" href="${fn:escapeXml(prevItemUrl)}"></a>
                                           </c:if>
                                           <c:if test="${cursor.hasNext}">
                                               <zm:nextItemUrl var="nextItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                               <a id="NEXT_ITEM" href="${fn:escapeXml(nextItemUrl)}"></a>
                                           </c:if>
                                       </c:if>
                                   </td>
                               </tr>
                           </c:forEach>
                           <c:if test="${context.searchResult.size eq 0}">
                               <tr>
                                   <td colspan="4">
                                       <div class='NoResults'><fmt:message key="noResultsFound"/></div>
                                   </td>
                               </tr>
                           </c:if>
                           <c:if test="${false and context.searchResult.size lt 10}">
                               <c:forEach begin="0" end="${10-context.searchResult.size}">
                                   <tr><td colspan="4">&nbsp;</td></tr>
                               </c:forEach>
                           </c:if>
                       </table>
                   </td>
                   <td class='ZhAppViewContent' valign='top'>
                       <c:if test="${not empty contact}">
                           <app:displayContact contact="${contact}"/>
                       </c:if>
                   </td>
               </tr>
               </table>
               </td>
           </tr>
           <tr>
               <td class='TbBottom'>
                   <app:contactListViewToolbar context="${context}" contact="${contact}" keys="true"/>
               </td>
           </tr>
       </table>
       <input type="hidden" name="doContactListViewAction" value="1"/>
       <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
  </form>

   <SCRIPT TYPE="text/javascript">
    <!--
    var zcheck = function() {var e = document.getElementById("CURRCHECK"); if (e) e.checked = !e.checked;}
    var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
    function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
    function handleEnter (ev) {
		var keyCode = ev.keyCode ? ev.keyCode : ev.which ? ev.which : ev.charCode;
		if (keyCode == 13) {
            zclick('SSEARCH_CONTACT');
            return false;
        }
        return true;
    }
    //-->
   </SCRIPT>

   <app:keyboard cache="ab.contactListView" globals="true" mailbox="${mailbox}" contacts="true" tags="true">
       <zm:bindKey message="contacts.NewGroup" func="function() { zclick('SNEW_GROUP')}"/>
       <zm:bindKey message="global.SelectAllCheckBoxes" func="function() { zclick('OPCHALL')}"/>
       <zm:bindKey message="contacts.Delete" func="function() { zclick('SOPDELETE')}"/>
       <zm:bindKey message="contacts.Edit" func="function() { zclick('SOPEDIT')}"/>
       <zm:bindKey message="global.CheckCheckBox" func="zcheck"/>
       <zm:bindKey message="global.PreviousItem" id="PREV_ITEM"/>
       <zm:bindKey message="global.NextItem" id="NEXT_ITEM"/>
       <zm:bindKey message="global.PreviousPage" id="PREV_PAGE"/>
       <zm:bindKey message="global.NextPage" id="NEXT_PAGE"/>
   </app:keyboard>

</app:view>

