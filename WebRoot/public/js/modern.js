(function () {
    var config = document.getElementById("zModernRedirect");
    localStorage.setItem("csrfToken", config.getAttribute("data-csrf-token"));

    var currentURL = new URL(window.location.href);
    var redirectToPath = currentURL.searchParams.get("RelayState") || '';

    /**
     * After sucessful login app will redirect to RelayState path if it exist and it start with /modern/ and'
     * if redirectToPath doesn't contains /../ (i.e. parent directory access)
     * i.e. https://<server>/?RelayState=%2Fmodern%2Fcalendar on this case app will
     * redirect to https://<server>/modern/calendar
     */
    if (redirectToPath.indexOf('/modern/') === 0 && !redirectToPath.includes('/../')) {
        window.location.href = window.location.origin + redirectToPath;
    } else {
        var url = window.location.origin + "/modern/";
        window.location.href = url;
    }
})();
