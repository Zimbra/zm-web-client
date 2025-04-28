<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%
	
    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    pageContext.setAttribute("csrfToken", authResult.getCsrfToken());
%>
<script TYPE="text/javascript">
    localStorage.setItem("csrfToken" , "${csrfToken}");
    
    const currentURL = new URL(window.location.href);
    const redirectToPath = currentURL.searchParams.get("RelayState") || '';


    function clearIndexDbCache() {
        indexedDB.databases().then(function (dbs){
            //temp
            console.log('indexedDB databases', dbs);
            dbs.forEach(function (db){
                indexedDB.deleteDatabase(db.name);
            });
	    });
    }

    function clearCache() {
            // Open the IndexedDB database used by localforage
            const request = indexedDB.open('keyval-store');

            // Wait for it to succeed
            request.onsuccess = function (event) {

            try {
                const db = event.target.result;

                // Open a transaction on the store used by localforage
                const transaction = db.transaction(['keyval'], 'readonly');
                const store = transaction.objectStore('keyval');

                // Get the Apollo cache key
                const getRequest = store.get('apollo-cache-persist');

                getRequest.onsuccess = function (event) {
                    const cacheData = event.target.result;
                    const json = JSON.parse(cacheData);
                    let cosKey = '';
                    Object.keys(json).forEach(function (key) {
                        if (key.includes('AccountCos')){
                            cosKey = key;
                        }
                    });

                    db.close();

                    // temp
                    console.log('Cos value in Cache', json[cosKey].name);

                    if (json[cosKey].name === 'pre_migrated'){
                        console.log('clear cache');
                        clearIndexDbCache();
                    }

                };

                getRequest.onerror = function (event) {
                    console.error('Error reading Apollo cache:', event);
                };
                } catch (ex) {
                    console.error('clearing cache Error:', ex);
                }
            };

            request.onerror = function (event) {
                console.error('Error opening IndexedDB:', event);
            };
    }

    clearCache();

    /**
     * After sucessful login app will redirect to RelayState path if it exist and it start with /modern/ and'
     * if redirectToPath doesn't contains /../ (i.e. parent directory access)
     * i.e. https://<server>/?RelayState=%2Fmodern%2Fcalendar on this case app will 
     * redirect to https://<server>/modern/calendar
     */
    if (redirectToPath.indexOf('/modern/') === 0 && !redirectToPath.includes('/../')) {
        window.location.href = window.location.origin + redirectToPath;
    } else {
        var url = window.location.origin + "/modern/"
        window.location.href = url;
    }
</script>
