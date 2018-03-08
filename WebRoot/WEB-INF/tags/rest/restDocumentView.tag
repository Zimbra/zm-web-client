<!DOCTYPE html>
<html>
<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>  	
<%	
// no caching    
response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
response.setHeader("Pragma", "no-cache");
%>

<rest:handleError>
    <zm:getItemInfoJSON var="fileInfoJSON" authtoken="${requestScope.zimbra_authToken}" id="${requestScope.zimbra_target_account_id}:${requestScope.zimbra_target_item_id}"/>
<c:if test="${not empty param.dev and param.dev eq '1'}">
    <c:set var="mode" value="mjsf" scope="request"/>
    <c:set var="gzip" value="false" scope="request"/>
    <c:set var="fileExtension" value="" scope="request"/>
    <c:if test="${empty param.debug}">
        <c:set var="debug" value="1" scope="request"/>
    </c:if>
    <c:set var="packages" value="dev" scope="request"/>
</c:if>

<c:set var="isDevMode" value="${not empty requestScope.mode and requestScope.mode eq 'mjsf'}" scope="request"/>
<c:set var="isSkinDebugMode" value="${not empty requestScope.mode} and ${requestScope.mode eq 'skindebug'}" scope="request"/>

<c:set var="packages" value="JQuery,Ajax,Startup1_1,Startup1_2,Startup2,Docs" scope="request"/>
<c:if test="${not empty param.packages}">
    <c:set var="packages" value="JQuery,Ajax,Startup1_1,Startup1_2,Startup2,Docs,${param.packages}" scope="request"/>
</c:if>
<c:set var="pnames" value="${fn:split(packages,',')}" scope="request"/>

<c:set var="ext" value="${requestScope.fileExtension}" scope="page"/>
<c:set var="vers" value="${empty requestScope.version ? initParam.zimbraCacheBusterVersion : requestScope.version}" scope="page"/>

<c:if test="${empty ext or isDevMode}">
    <c:set var="ext" value="" scope="page"/>
</c:if>

<c:set var="pprefix" value="js" scope="request"/>
<c:choose>
    <c:when test="${isDevMode}">
        <c:set var="pprefix" value="public/jsp" scope="request"/>
        <c:set var="psufix" value=".jsp" scope="request"/>
    </c:when>
    <c:otherwise>
        <c:set var="pprefix" value="js" scope="request"/>
        <c:set var="psufix" value="_all.js" scope="request"/>
    </c:otherwise>
</c:choose>
<fmt:getLocale var="locale"/>    
<c:set var="localeId" value="${not empty param.localeId ? param.localeId : (not empty requestScope.zimbra_target_account_prefLocale ? requestScope.zimbra_target_account_prefLocale : locale)}"/>
</rest:handleError>
<head>
    <c:set value="/img" var="iconPath" scope="request"/>
    <c:url var='cssurl' value='/css/images,common,dwt,msgview,login,zm,spellcheck,skin,docs.css'>
        <c:param name="client"	value="standard" />
        <c:param name="skin"	value="${skin}" />
        <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
    </c:url>
    <link rel="stylesheet" type="text/css" href="${cssurl}" />

    <jsp:include page="/public/Resources.jsp">
        <jsp:param name="res" value="I18nMsg,TzMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
        <jsp:param name="skin" value="${skin}" />
        <jsp:param name="localeId" value="${localeId}"/>
    </jsp:include>
    <script type="text/javascript">
        <jsp:include page="/js/Boot_all.js" />
    </script>
    <script type="text/javascript">
        AjxPackage.setBasePath("${pageContext.request.contextPath}/js");
        AjxPackage.setExtension("_all.js");
        AjxPackage.setQueryString("v=${initParam.zimbraCacheBusterVersion}");

        AjxTemplate.setBasePath("${pageContext.request.contextPath}/templates");
        AjxTemplate.setExtension(".template.js");

        window.restView = true;
    </script>

    <script>
        //AjxEnv.DEFAULT_LOCALE = "${localeId}";
        <jsp:include page="/js/ajax/util/AjxTimezoneData.js" />

        window.isRestView = true;
        window.contextPath = '${pageContext.request.contextPath}';
        window.appContextPath = '${pageContext.request.contextPath}';
        window.appRequestLocaleId = "${zm:cook(localeId)}";
        window.appDevMode     = ${isDevMode};

    </script>

    <c:forEach var="pname" items="${pnames}">
        <c:set var="pageurl" value="/${pprefix}/${pname}${psufix}" scope="request"/>
        <c:choose>
            <c:when test="${isDevMode}">
                <jsp:include>
                    <jsp:attribute name='page'>${pageurl}</jsp:attribute>
                </jsp:include>
            </c:when>
            <c:otherwise>
                <script type="text/javascript" src="${pageContext.request.contextPath}${pageurl}${requestScope.fileExtension}?v=${vers}"></script>
            </c:otherwise>
        </c:choose>
    </c:forEach>

    <c:if test="${param.embed eq '1'}">
        <script type="text/javascript">
            window.viewMode = "embed";
        </script>
    </c:if>

</head>

<body class="editorBody">
<div id="main_shell"></div>
<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>

<script type="text/javascript" language="JavaScript">
    if(!ZmCsfeCommand.noAuth){

    var itemInfo = ${fileInfoJSON};
    itemInfo = itemInfo.Body && itemInfo.Body.GetItemResponse;
    
    if(itemInfo && itemInfo.doc && (itemInfo.doc.length==1)) {
        var item = ZmDocletMgr.createItem(itemInfo);
        //REST URL will not be generated on server side
        item.rest = location.href;
        ZmDocsEditApp.setItemInfo(item);
    } else {
        ZmDocsEditApp.setFile('${requestScope.zimbra_target_account_id}:${requestScope.zimbra_target_item_id}');
    }

    ZmDocsEditApp.launch();

    }else{
        window.location = window.appContextPath;
    }

</script>


</body>
</html>
