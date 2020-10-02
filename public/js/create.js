'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function () {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        direction: 'bottom'
    });

    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);

    $('#back-btn').click(function (e) {
        e.preventDefault();

        window.location.href = document.location.origin + "/index";
    });

    function toMin(num) {
        var n = num;
        var minutes = Math.floor(n / 60);
        var seconds = (n - minutes * 60);
        return (minutes.toString() + ':' + seconds.toString());
    }

    $(".rslider-my").ionRangeSlider({
        prettify: toMin
    });
});

function addStartEndToForm(formId, type, author, name) {
    var from = $(formId).find(".js-range-slider").data("from");
    var to = $(formId).find(".js-range-slider").data("to");

    // alert(from);

    $(formId).attr("action", "/" + type + "/" + author + "/" + name + "/" + from + "/" + to);
    $(formId).submit();
}