// Moved out of extuserprov.jsp (inline scripts and handlers are blocked by CSP).
(function () {
    var config = document.getElementById("zExtUserProvConfig");

    document.getElementById("confirmPassword").style.display = "table-row";

    function checkPasswords() {
        var password = document.getElementById("password").value;
        var password2 = document.getElementById("password2").value;
        var isError = false;
        var emptyPass = config.getAttribute("data-empty-password-msg");
        var bothPassMustMatch = config.getAttribute("data-both-passwords-must-match-msg");
        if (password == '' || password2 == '') {
            document.getElementById("errorMessage").innerHTML = emptyPass;
            isError = true;
        }
        if(password != password2){
            document.getElementById("errorMessage").innerHTML = bothPassMustMatch;
            isError = true;
        }
        if (isError)
            document.getElementById("ZLoginErrorPanel").style.display = "block";
        return !isError;
    }

    // Replaces the inline onsubmit="return checkPasswords();" on #zLoginForm.
    document.getElementById("zLoginForm").addEventListener("submit", function (event) {
        if (!checkPasswords()) {
            event.preventDefault();
        }
    });
})();
