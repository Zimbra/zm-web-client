// Moved out of Boot.jsp (inline scripts are blocked by CSP). Values come from data attributes on #zBootConfig.
(function () {
    var config = document.getElementById("zBootConfig");
    var contextPath = config.getAttribute("data-context-path");

    AjxPackage.setBasePath(contextPath + "/js");
    AjxPackage.setExtension(config.getAttribute("data-package-extension"));
    AjxPackage.setQueryString("v=" + config.getAttribute("data-version"));

    AjxTemplate.setBasePath(contextPath + "/templates");
    AjxTemplate.setExtension(".template.js");
})();
