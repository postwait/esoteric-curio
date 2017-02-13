(function($) {
  $(document).ready(function() {
    $("a.sidebar-link").each(function() {
      var linkid = $(this).attr("id");
      var tgtid = '#' + linkid.replace(/^sidebar-link-/, "sidebar-");
      var aside = $(tgtid);
      //aside.remove();
      aside.insertAfter($(this));
    });
  });
})(jQuery);
