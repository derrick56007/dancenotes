'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {

    // $('#login-btn').click(function(e) {
    //     e.preventDefault();
    //
    //     window.location.href = document.location.origin + "/index";
    // });
});

function openSignUp() {
    $('#login-card').css("display","none");
    $('#register-card').css("display","flex");
}

function openLogin() {
    $('#login-card').css("display","flex");
    $('#register-card').css("display","none");
}