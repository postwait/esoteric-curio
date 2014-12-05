(function($) {
  $(document).ready(function() {
    $("a.sidebar-link").each(function() {
      var id = $(this).attr("id");
      var tgtid = '#' + id.replace(/^sidebar-link-/, "sidebar-");
      (function(id, link) {
        $(link).click(function() {
          $(".sidebar").not(id).addClass("sidebar-hidden");
          $(id).toggleClass("sidebar-hidden");
        });
      })(tgtid, this);
    });
  });
})(jQuery);
