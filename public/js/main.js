'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
    initializePage();

    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
});

function createBtn(user) {
    console.log(user);

    $.get("/create_new/" + user).then(function(data) {
        window.location = "/create/" + user + "/" + data['name'];
    });
}

/*
 * Function that is called when the document is ready.
 */
function editDance(user, name) {
    var string = "/create/" + user + "/" + name;

    window.location = string;
}

function openDance(user, name) {
    window.location = "/dance/" + user + "/" + name;
}

function initializePage() {
    console.log("Javascript connected!");
}

// $(window).load(function () {
//     $(".trigger_popup_fricc").click(function(){
//        $('.hover_bkgr_fricc').show();
//     });
//     $('.hover_bkgr_fricc').click(function(){
//         $('.hover_bkgr_fricc').hide();
//     });
//     $('.popupCloseButton').click(function(){
//         $('.hover_bkgr_fricc').hide();
//     });
// });

// function recordPageScroll(e) {
//     ga('create', 'UA-135507455-1', 'auto');
//     ga("send", "event", 'pagescroll', 'bottom');

// Feature detects Navigation Timing API support.
// if (window.performance) {
//   // Gets the number of milliseconds since page load
//   // (and rounds the result since the value must be an integer).
//   var timeSincePageLoad = Math.round(performance.now());
//
//   // Sends the timing hit to Google Analytics.
//   ga('send', 'timing', 'JS Dependencies', 'load', timeSincePageLoad);
// }