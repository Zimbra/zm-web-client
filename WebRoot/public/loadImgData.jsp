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
