 <%--
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

 
<link rel="stylesheet" type="text/css" href="../yui/2.7.0/assets/skins/sam/skin.css" />
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

<script type="text/javascript" src="../yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="../yui/2.7.0/animation/animation-min.js"></script>
<script type="text/javascript" src="../yui/2.7.0/element/element-min.js"></script>
<!-- Needed for Menus, Buttons and Overlays used in the Toolbar -->
<script type="text/javascript" src="../yui/2.7.0/container/container_core-min.js"></script>
<script type="text/javascript" src="../yui/2.7.0/menu/menu-min.js"></script>
<script type="text/javascript" src="../yui/2.7.0/button/button-min.js"></script>
<!-- Source file for Rich Text Editor-->
<script type="text/javascript" src="../yui/2.7.0/editor/editor-min.js"></script>
<app:spellcheck/>