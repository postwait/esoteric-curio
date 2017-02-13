(function($) {
  $(document).ready(function() {
    $("a.sidebar-link").each(function() {
      var linkid = $(this).attr("id");
      var tgtid = '#' + linkid.replace(/^sidebar-link-/, "sidebar-");
/*
      (function(id, link) {
        var timerId = null;
        $(link).hover(function() {
                        timerId = setTimeout(function() {
                          $(".sidebar").not(id).addClass("sidebar-hidden");
                          $(".sidebar-link").not(link).removeClass("sidebar-linklive");
                          $(id).toggleClass("sidebar-hidden");
                          $(link).addClass("sidebar-linklive");
                        }, 500);
                      },
                      function() {
                        if(timerId) {
                          clearTimeout(timerId);
                        }            
                        timerId = null;
                      });
        $(link).click(function() {
          //if(timerId) clearTimeout(timerId);
          //timerId = null;
          // $(".sidebar").not(id).addClass("sidebar-hidden");
          // $(".sidebar-link").not(link).removeClass("sidebar-linklive");
          //$(id).toggleClass("sidebar-hidden");
          $(link).addClass("sidebar-linklive");
        });
*/
      })(tgtid, this);
    });
  });
})(jQuery);
