(function($) {
  $(document).ready(function() {
    $("a.sidebar-link").each(function() {
      var id = $(this).attr("id");
      var tgtid = '#' + id.replace(/^sidebar-link-/, "sidebar-");
      (function(id, link) {
        $(link).hover(function() { $(id).removeClass("sidebar-hidden"); },
                      function() { $(id).addClass("sidebar-hidden"); });
      })(tgtid, this);
    });
  });
})(jQuery);
