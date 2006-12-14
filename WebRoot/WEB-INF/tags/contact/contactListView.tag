<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:view selected='contacts' contacts="true" tags="true"  context="${context}">
   <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
   <form action="${currentUrl}" method="post">
       <table width=100% cellspacing="0" cellpadding="0">
           <tr>
               <td class='TbTop'>
                   <app:contactListViewToolbar context="${context}" keys="true"/>
               </td>
           </tr>
           <tr>
               <td class='List'>
                       <table width=100% cellpadding=2 cellspacing=0>
                           <tr>
                               <th class='CB'>&nbsp;
                               <th class='Img'>&nbsp;
                               <th class='Img'>&nbsp;
                               <th width=35% nowrap>
                                   <zm:newSortUrl var="nameSortUrl" value="/h/search" context="${context}" sort="${context.ss eq 'nameDesc' ? 'nameAsc' : 'nameDesc'}"/>
                               <a href="${nameSortUrl}">
                                   <fmt:message key="name"/>
                               </a>
                               <th ><fmt:message key="email"/>
                           </tr>
                           <c:forEach items="${context.searchResult.contactHits}" var="contact" varStatus="status">
                               <tr <c:if test="${contact.id == context.currentItem.id}">class='RowSelected'</c:if>>
                                   <td class='CB' nowrap><input type=checkbox  name="id" value="${contact.id}"></td>
                                   <td class='Img'><app:miniTagImage ids="${contact.tagIds}"/></td>
                                   <td class='Img'><app:img src="${contact.image}" alt="Contact"/></td>
                                   <td ><span style='padding:3px'>
                                       <zm:currentResultUrl var="contactUrl" value="/h/contact"  id="${contact.id}" index="${status.index}" context="${context}"/>
                                       <a href="${contactUrl}" <c:if test="${contact.id == context.currentItem.id}">accesskey='o'</c:if>>
                                               ${fn:escapeXml(empty contact.fileAsStr ? '<None>' : contact.fileAsStr)}
                                       </a></span>
                                       <c:if test="${contact.id == context.currentItem.id}">
                                           <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>

                                           <c:if test="${cursor.hasPrev}">
                                               <zm:prevItemUrl var="prevItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                               <a href="${prevItemUrl}" accesskey='k'></a>
                                           </c:if>
                                           <c:if test="${cursor.hasNext}">
                                               <zm:nextItemUrl var="nextItemUrl" value="/h/search" cursor="${cursor}" context="${context}" usecache="true"/>
                                               <a href="${nextItemUrl}" accesskey='j'></a>
                                           </c:if>
                                       </c:if>
                                   </td>
                                   <td ><c:if test="${empty contact.displayEmail}">
                                       &nbsp;</c:if><a href="${contactUrl}">${fn:escapeXml(contact.displayEmail)}</a></td>
                               </tr>
                           </c:forEach>
                       </table>
                       <c:if test="${context.searchResult.contactSize == 0}">
                           <div class='NoResults'><fmt:message key="noResultsFound"/></div>
                       </c:if>
               </td>
           </tr>
           <tr>
               <td class='TbBottom'>
                   <app:contactListViewToolbar context="${context}" keys="false"/>
               </td>
           </tr>
       </table>
    <input type="hidden" name="doAction" value="1"/>
  </form>
</app:view>

