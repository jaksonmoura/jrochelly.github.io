$(document).ready(function() {

  $(document).on('scroll', function(){
    var wScroll = $(this).scrollTop();
    showProjects(wScroll);
  });

  function showProjects(s) {
    if (s > 300) {
      $('section.projects ul').addClass('show');
      $('section.projects .projects__head').addClass('projects__head--show');
    }
  }

})