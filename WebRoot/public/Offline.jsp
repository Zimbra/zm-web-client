<html manifest="<%=request.getParameter("url")%>">
<head>
    <script>
        window.onload = function(){
            if (navigator.onLine){
                if (<%=request.getParameter("reload")%>){
                    window.applicationCache.addEventListener('updateready', function(e) {
                        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                            window.parent.location.reload();
                        }
                    }, false);
                }
                window.applicationCache.addEventListener('cached', function(e) {
                    window.parent.ZmOffline._checkAppCacheDone();
                }, false);
                window.applicationCache.addEventListener('noupdate', function(e) {
                    window.parent.ZmOffline._checkAppCacheDone();
                }, false);
            }
        }
</script>
</head>
    <body></body>
</html>
