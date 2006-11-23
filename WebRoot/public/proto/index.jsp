<%
    // no caching
    response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.addHeader("Cache-Control", "post-check=0, pre-check=0");
    response.setHeader("Pragma", "no-cache");

    // information
    String path = request.getContextPath();

    // parameters
    String controller = request.getParameter("controller");
    String template = request.getParameter("template");
    String skin = request.getParameter("skin");
    if (skin == null) skin = "sand";

%><html>
<head>
<link rel='stylesheet' type="text/css"
      href='<%=path%>/css/common,dwt,msgview,login,zm,spellcheck,wiki,imgs,<%=skin%>,skin.css?debug=true'
>
<script src='<%=path%>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZaMsg,ZmMsg.js?debug=true'></script>
<script src='<%=path%>/js/ajax/boot/AjxEnv.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxLoader.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxPackage.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxTemplate.js'></script>
<script>
function onLoad() {
    var html = "No template.";

    var templateId = "<%=template!=null?template:""%>";
    if (templateId) {
        var controllerId = "<%=controller!=null?controller:""%>" || templateId.replace(/#.*$/,"")+"Controller";

        AjxPackage.setBasePath("<%=path%>/js");
        AjxPackage.require(controllerId);
        
        html = AjxTemplate.expand(templateId, window.data);
    }

    var body = document.getElementsByTagName("BODY")[0];
    body.innerHTML = html;
}
</script>
</head>
<body onload='onLoad()'></body>
</html>
