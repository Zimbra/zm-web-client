<!--
NOTE: it should not happen, but if for some reason updating this file does not cause a recompile of the files including it
(currently launchZCS and launchNewWindow), make sure you touch those files too to test.
I tested on my Jetty and it does recognize included files and recompiles the files that include them. But just in case.
-->
<script>
<jsp:include page="/img/images.css.js" />
<jsp:include page="/skins/${skin}/img/images.css.js" />
document.write("<DIV style='display:none'>");
for (var id in AjxImgData) {
	var data = AjxImgData[id];
	if (data.f) data.f = data.f.replace(/@AppContextPath@/,appContextPath);
	if (data.ief) data.ief = data.ief.replace(/@AppContextPath@/,appContextPath);
	var f = AjxEnv.isIE ? data.ief : data.f;
	document.write("<IMG id='",id,"' src='",data.d||f,"?v=${vers}'>");
}
document.write("</DIV>");
</script>
