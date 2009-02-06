<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

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

<c:set var="packages" value="Ajax,Startup1_1,Startup1_2,Spreadsheet" scope="request"/>
<c:if test="${not empty param.packages}">
    <c:set var="packages" value="Ajax,Startup1_1,Startup1_2,Spreadsheet,${param.packages}" scope="request"/>
</c:if>
<c:set var="pnames" value="${fn:split(packages,',')}" scope="request"/>

<c:set var="ext" value="${requestScope.fileExtension}" scope="page"/>
<c:set var="vers" value="${requestScope.version}" scope="page"/>

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
<head>
    <c:set value="/img" var="iconPath" scope="request"/>
    <c:url var='cssurl' value='/css/images,common,dwt,msgview,login,zm,spellcheck,skin,spreadsheet.css'>
        <c:param name="client"	value="standard" />
        <c:param name="skin"	value="${skin}" />
        <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
    </c:url>
    <link rel="stylesheet" type="text/css" href="${cssurl}" />

    <jsp:include page="/public/Resources.jsp">
        <jsp:param name="res" value="I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys" />
        <jsp:param name="skin" value="${skin}" />
    </jsp:include>

    <script type="text/javascript">
        <jsp:include>
        <jsp:attribute name='page'>/js/Boot_all.js</jsp:attribute>
        </jsp:include>
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
        AjxEnv.DEFAULT_LOCALE = "${locale}";
        <jsp:include page="/js/ajax/util/AjxTimezoneData.js" />
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

<body>

<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>

<script type="text/javascript" language="JavaScript">

    var shell = null;
    var slideEditView = null;
    var model = null;


    createDummyDBG =
    function() {
        window.AjxDebug = function() {};
        window.AjxDebug.prototype.toString		= function() { return "dummy DBG class"};
        window.AjxDebug.prototype.display		= function() {};
        window.AjxDebug.prototype.dumpObj		= function() {};
        window.AjxDebug.prototype.getDebugLevel	= function() {};
        window.AjxDebug.prototype.isDisabled	= function() {};
        window.AjxDebug.prototype.println		= function() {};
        window.AjxDebug.prototype.printRaw		= function() {};
        window.AjxDebug.prototype.printXML		= function() {};
        window.AjxDebug.prototype.setDebugLevel	= function() {};
        window.AjxDebug.prototype.setTitle		= function() {};
        window.AjxDebug.prototype.showTiming	= function() {};
        window.AjxDebug.prototype._getTimeStamp	= function() {};
        window.AjxDebug.prototype.timePt		= function() {};
        window.DBG = new window.AjxDebug();
    };

    <c:choose>
    <c:when test="${isDevMode}">
    AjxDispatcher.require("Debug");
    DBG = new AjxDebug(AjxDebug.NONE, null, false);
    </c:when>
    <c:otherwise>
    createDummyDBG();
    </c:otherwise>
    </c:choose>


    window.contextPath = '${pageContext.request.contextPath}';
    window.appContextPath = '${pageContext.request.contextPath}';
    window.fileInfo = {id: '${requestScope.zimbra_target_item_id}', contentType: 'application/x-zimbra-xls'};


    create();

</script>


</body>

