<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- include TinyMCE code inline, saving a request/response per file --%>

<c:set var="tinyMCEBasePath"
       value="${pageContext.request.contextPath}/js/ajax/3rdparty/tinymce" />

<script type="text/javascript">
window.tinyMCEPreInit = {
    suffix: "_min",
    base: "${tinyMCEBasePath}"
};
</script>

<script type="text/javascript">
<!--
<jsp:include page="${tinyMCEBasePath}/tinymce_min.js" />
<jsp:include page="${tinyMCEBasePath}/locales.js" />
<jsp:include page="${tinyMCEBasePath}/localeconv.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/zemoticons/data.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/zemoticons/plugin.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/advlist/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/autolink/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/charmap/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/contextmenu/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/directionality/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/emoticons/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/image/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/hr/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/link/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/paste/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/table/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/plugins/textcolor/plugin_min.js" />
<jsp:include page="${tinyMCEBasePath}/themes/modern/theme_min.js" />
-->
</script>
