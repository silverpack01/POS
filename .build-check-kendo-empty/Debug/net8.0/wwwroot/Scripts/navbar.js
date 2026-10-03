$(document).ready(function () {
    // Ensuring the dropdown stays open on hover
    $(".nav-item.dropdown").hover(
        function () {
            $(this).children(".dropdown-menu").stop(true, true).fadeIn(200);
        },
        function () {
            $(this).children(".dropdown-menu").stop(true, true).fadeOut(200);
        }
    );
});
