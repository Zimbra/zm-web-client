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

<c:set var="packages" value="Ajax,Startup1_1,Startup1_2,Docs" scope="request"/>
<c:if test="${not empty param.packages}">
    <c:set var="packages" value="Ajax,Startup1_1,Startup1_2,Docs,${param.packages}" scope="request"/>
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
    <c:url var='cssurl' value='/css/images,common,dwt,msgview,login,zm,spellcheck,images,skin.css'>
        <c:param name="client"	value="standard" />
        <c:param name="skin"	value="${skin}" />
        <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
    </c:url>
    <link rel="stylesheet" type="text/css" href="${cssurl}" />

    <link rel="stylesheet" type="text/css" href="/yui/2.7.0/menu/assets/skins/sam/menu.css" />
    <link rel="stylesheet" type="text/css" href="/yui/2.7.0/button/assets/skins/sam/button.css" />
    <link rel="stylesheet" type="text/css" href="/yui/2.7.0/fonts/fonts-min.css" />
    <link rel="stylesheet" type="text/css" href="/yui/2.7.0/container/assets/skins/sam/container.css" />

    <link rel="stylesheet" type="text/css" href="/yui/2.7.0/editor/assets/skins/sam/editor.css" />
    <script type="text/javascript" src="/yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/animation/animation-min.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/element/element-min.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/container/container-min.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/menu/menu-min.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/button/button-min.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/editor/editor-min.js"></script>


    <!--link rel="stylesheet" type="text/css" href="/yui/2.7.0/assets/skins/sam/skin.css" />
    <script type="text/javascript" src="/yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js"></script>
    <script type="text/javascript" src="/yui/2.7.0/element/element-min.js"></script>
    <script src="/yui/2.7.0/container/container_core-min.js"></script>
    <script src="/yui/2.7.0/menu/menu-min.js"></script>

    <script src="/yui/2.7.0/button/button-min.js"></script>
    <script src="/yui/2.7.0/editor/editor-min.js"></script-->

    <script src="/yui/spellcheck/spellcheck.js"></script>

    <style type="text/css" media="screen">
        .yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck span.yui-toolbar-icon {
            background-image: url(/yui/spellcheck/img/ImgSpellCheck.gif );
            background-position: 1px 0px;
            top: 1px;
            left: 4px;
        }
        .yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck-selected span.yui-toolbar-icon {
            background-image: url(/yui/spellcheck/img/ImgSpellCheck.gif );
            background-position: 1px 0px;
            top: 1px;
            left: 4px;
        }
        .yui-spellcheck-list {
            cursor: pointer;
        }
        .yui-skin-sam .yui-editor-panel .yui-spellcheck-list li {
            padding-left: 5px;
        }

        .docsToolbar {
            background-color: #BCCBD6;
        }
    </style>


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

<body class="yui-skin-sam">

<noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>

<script type="text/javascript" language="JavaScript">

    var shell = null;
    var docsEditView = null;
    var model = null;

    window.contextPath = '${pageContext.request.contextPath}';
    window.appContextPath = '${pageContext.request.contextPath}';

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


    function launch() {

    <c:choose>
    <c:when test="${isDevMode}">
        AjxDispatcher.require("Debug");
        DBG = new AjxDebug(AjxDebug.NONE, null, false);
    </c:when>
    <c:otherwise>
        createDummyDBG();
    </c:otherwise>
    </c:choose>

        window.appCtxt = new ZmAppCtxt();
        appCtxt.rememberMe = false;

        window.skin = null;

        // Create and initialize settings
        var settings = new ZmSettings();
        appCtxt.setSettings(settings);

        var shell = window.shell = new DwtShell({className:"MainShell", userShell: document.getElementById("main_shell"), id:ZmId.SHELL});
        appCtxt.setShell(shell);
        shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));
        shell._veilOverlay.style.display = "none";

        var controller = new ZmDocsEditController();
        appCtxt.setAppController(controller);        

        docsEditView  = new ZmDocsEditView(shell, null, DwtControl.ABSOLUTE_STYLE, controller);
        var size = shell.getSize();
        docsEditView.setSize(size.x, size.y);

        var slideToolbar = new DwtToolBar({parent:docsEditView, cellSpacing:2, index:0, posStyle:DwtControl.RELATIVE_STYLE, className: 'docsToolbar'});
        controller.setCurrentView(docsEditView);
        docsEditView.setZIndex(Dwt.Z_VIEW);
        _resize();
        //render editor after resizing the container
        docsEditView.renderEditor();
        controller.setToolBar(slideToolbar);


        window.onresize = _resize;

        window.fileInfo = {id: '${requestScope.zimbra_target_item_id}', contentType: 'application/x-zimbra-doc'};
        controller.setFileName(window.fileInfo.name ? window.fileInfo.name : "Untitled");

        var item = null;
        item = docsEditView.loadData('${requestScope.zimbra_target_item_id}');
        if(item) {
            //REST URL will not be generated on server side
            item.rest = location.href;        
            window.fileInfo = item;
            docsEditView.loadDoc(item);
        }
    }

    _resize = function() {
        docsEditView.setDisplay("none");
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        if (!AjxEnv.isIE) {
            w -= 2;
            h -= 2;
        }
        docsEditView.setDisplay("block");
        docsEditView.setBounds(0, 0, w, h);
    };

    AjxCore.addOnloadListener(launch);

</script>
</body>

