<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:set var="id" value="${not empty id?id:(empty param.id ? context.currentItem.id : param.id)}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${id}" var="contact"/>
    <c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" action="view"
                                     id="${contact.id}"/>
                       
</mo:handleError>
<c:set var="title" value="${zm:truncate(contact.displayFileAs,20,true)}" scope="request"/>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
    <input type="hidden" name="doContactAction" value="1"/>
    <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    
    <script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
    <mo:contactToolbar contact="${contact}" urlTarget="${context_url}" context="${context}" keys="false"
                               isTop="true" mailbox="${mailbox}"/>
    <div class="Stripes cont_view">
        <div class="View">
            <div class="table cont_sum_table">
            <div class="table-row">
                <span class="table-cell Person48">&nbsp;
                     <%--<img id="cont-img" src="<app:imgurl value='large/ImgPerson_48.gif' />" border="0"
                                       class=""/>--%>
                 </span>
                <span class="table-cell">
                   <div>
                       <b>${fn:escapeXml(contact.displayFileAs)}</b>
                   </div>
                   <c:if test="${not empty contact.jobTitle}">
                        <div>${fn:escapeXml(contact.jobTitle)}</div>
                   </c:if>
                   <c:if test="${not empty contact.company}">
                        <div>${fn:escapeXml(contact.company)}</div>
                    </c:if>
             </span>
            </div>
            </div>    
            <c:if test="${contact.isFlagged || (contact.hasTags && mailbox.features.tagging)}">
            <div class="table">
            <div class="table-row">
                <span class="table-cell">
                <c:if test="${contact.isFlagged}">
                                <span class="SmlIcnHldr Flag">&nbsp;</span></c:if>
                <c:if test="${contact.hasTags and mailbox.features.tagging}">
                        <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                        <c:forEach items="${tags}" var="tag">
                        <span class="SmlIcnHldr Tag${tag.color}">&nbsp;</span><span>${fn:escapeXml(tag.name)}</span>
                        </c:forEach>
                </c:if>
                </span>
            </div>    
          </div>
          </c:if>
        </div>
                    
        <div class="table">
        <div class="table-row">
            <div class="table-cell">
                    <mo:displayContact contact="${contact}"/>
            </div>
        </div>
        </div>    
    </div>
     <mo:contactToolbar contact="${contact}" urlTarget="${context_url}" context="${context}" keys="false"
                       isTop="false" mailbox="${mailbox}"/>
</form>
