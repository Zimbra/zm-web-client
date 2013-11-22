<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
