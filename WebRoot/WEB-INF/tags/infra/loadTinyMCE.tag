<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2016 Synacor, Inc.
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

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- include TinyMCE code inline, saving a request/response per file --%>

<c:set var="tinyMCEBaseDir"
       value="/js/ajax/3rdparty/tinymce" />
<c:set var="tinyMCEBasePath"
       value="${pageContext.request.contextPath}${tinyMCEBaseDir}" />

<c:choose>
    <c:when test="${param.dev eq '1'}">
        <script type="text/javascript">
            window.tinyMCEPreInit = {
                suffix: "",
                base: "${tinyMCEBasePath}"
            };
        </script>

        <script type="text/javascript"
                src="${tinyMCEBasePath}/tinymce.js">
        </script>
        <script type="text/javascript"
                src="${tinyMCEBasePath}/locales.js">
        </script>
        <script type="text/javascript"
                src="${tinyMCEBasePath}/localeconv.js">
        </script>
        <script type="text/javascript"
                src="${tinyMCEBasePath}/plugins/zemoticons/data.js">
        </script>
    </c:when>
    <c:otherwise>
        <script type="text/javascript">
            window.tinyMCEPreInit = {
                suffix: "_min",
                base: "${tinyMCEBasePath}"
            };

            <jsp:include page="${tinyMCEBaseDir}/tinymce_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/locales.js" />
            <jsp:include page="${tinyMCEBaseDir}/localeconv.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/zemoticons/data.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/zemoticons/plugin.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/advlist/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/autolink/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/charmap/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/contextmenu/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/directionality/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/emoticons/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/image/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/hr/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/link/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/paste/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/table/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/plugins/textcolor/plugin_min.js" />
            <jsp:include page="${tinyMCEBaseDir}/themes/modern/theme_min.js" />
        </script>
    </c:otherwise>
</c:choose>
