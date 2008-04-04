<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
</app:handleError>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}"><fmt:message key="zimbraTitle"/>: ${fn:escapeXml(title)}</c:if>
    </title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <!-- skin is ${skin} -->
    <c:if test="${empty param.print}" >
		<c:url var='cssurl' value='/css/common,login,images,skin.css'>
			<c:param name="client"	value="standard" />
			<c:param name="skin"	value="${skin}" />
			<c:param name="v"		value="${version}" />
		</c:url>
		<link rel="stylesheet" type="text/css" href="${cssurl}">
    </c:if>

    <c:if test="${param.action eq 'compose' and mailbox.prefs.composeFormat eq 'html'}">
        
        <link rel="stylesheet" type="text/css" href="../yui/2.5.1/assets/skins/sam/skin.css" />
        <script type="text/javascript" src="../yui/2.5.1/yahoo-dom-event/yahoo-dom-event.js"></script>
        <script type="text/javascript" src="../yui/2.5.1/element/element-beta-min.js"></script>
        <!-- Needed for Menus, Buttons and Overlays used in the Toolbar -->
        <script src="../yui/2.5.1/container/container_core-min.js"></script>

        <script src="../yui/2.5.1/menu/menu-min.js"></script>

        <script src="../yui/2.5.1/button/button-beta-min.js"></script>
        <!-- Source file for Rich Text Editor-->
        <script src="../yui/2.5.1/editor/editor-beta-min.js"></script>

		<script src="../yui/spellcheck/spellcheck.js"></script>
		<style type="text/css" media="screen">
			.yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck span.yui-toolbar-icon {
				background-image: url( ../yui/spellcheck/img/ImgSpellCheck.gif );
				background-position: 1px 0px;
				top: 1px;
				left: 4px;
			}
			.yui-skin-sam .yui-toolbar-container .yui-toolbar-spellcheck-selected span.yui-toolbar-icon {
				background-image: url( ../yui/spellcheck/img/ImgSpellCheck.gif );
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
		</style>
    </c:if>

    <fmt:message key="favIconUrl" var="favIconUrl"/>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
    <jsp:doBody/>

    <script type="text/javascript">

        function checkAll(cb, allbox) {
            if (cb.length)
                for (i = 0; i < cb.length; i++)
                    cb[i].checked = allbox.checked;
            else
                cb.checked = allbox.checked;
        }

    </script>
</head>
