 <%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

 
<link rel="stylesheet" type="text/css" href="../yui/2.9.0-alfresco-20140211/assets/skins/sam/skin.css" />
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

<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/animation/animation-min.js"></script>
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/element/element-min.js"></script>
<!-- Needed for Menus, Buttons and Overlays used in the Toolbar -->
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/container/container_core-min.js"></script>
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/menu/menu-min.js"></script>
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/button/button-min.js"></script>
<!-- Source file for Rich Text Editor-->
<script type="text/javascript" src="../yui/2.9.0-alfresco-20140211/editor/editor-min.js"></script>
<app:spellcheck/>