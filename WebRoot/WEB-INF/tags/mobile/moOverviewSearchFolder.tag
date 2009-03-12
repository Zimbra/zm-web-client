<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="types" rtexprvalue="true" required="false"%>       
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderPath(pageContext, folder.id)}"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<div onclick='return zClickLink("FLDR${folder.id}")' class='Folders ${param.sid eq folder.id ? 'StatusWarning' : ''} list-row${folder.hasUnread ? "-unread" : ""}'>
    <div class="table">
    <div class="table-row">
    <c:set var="url" value="${context_url}?sfi=${folder.id}"/>
    <c:if test="${not empty types}">
        <c:set var="url" value="${url}&st=${types}"/>
    </c:if>
    <span class="table-cell left">
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}">
            <%--<mo:img alt='${fn:escapeXml(label)}' src="${folder.image}"/>--%>
            <span class="SmlIcnHldr Fldr${folder.type}">&nbsp;</span>
            ${fn:escapeXml(label)}
        </a>
    </span>
    <c:if test="${!folder.isSystemFolder}">
        <span class="table-cell right" width="5%"> <a class="SmlIcnHldr Edit"
                href="?st=${param.st}&show${folder.isSearchFolder ? 'Search' : 'Folder'}Create=1&${folder.isSearchFolder ? 's' : ''}id=${folder.id}">&nbsp;</a></span>
    </c:if>    
    </div>
    </div>    
</div>
