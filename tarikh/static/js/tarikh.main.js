/**
 * @author aby  
 */
		 
$(function () {
	//console.log('main:ready');
	// tooltip, using bootstrap
	$.tooltip && $('[data-toggle="tooltip"]').tooltip();
	// search form animate
	$('.search-form input[name="q"]')
		.on('focus',function(){$('.search-form').animate({width:'100%'});})
		.on('blur',function(){$('.search-form').animate({width:'50%'});});		
	// "back to top" link
	var $tbb = $('.toolbar-bottom'),
		offset = $(window).height()/2, // offset link shown
		offset_opacity = $(window).height(), // offset link opacity is reduced
		scroll_top_duration = 700, // scrolling animation (in ms)
		$btt = $('.cd-top'),
		doAdjustToolbar = function(){
			( $(this).scrollTop() > offset ) ? $btt.addClass('cd-is-visible') 
				: $btt.removeClass('cd-is-visible cd-fade-out');
			if( $(this).scrollTop() > offset_opacity )
				$btt.addClass('cd-fade-out');
			// @see https://github.com/customd/jquery-visible
			$.fn.visible && $tbb.toggleClass('navbar-fixed-bottom', !$('.pre-footer')
					.visible(true));
		};
	$(window).scroll(doAdjustToolbar).resize(doAdjustToolbar);
	$btt.on('click', function(event){ //smooth scroll to top
		event.preventDefault();
		$('body,html').animate({scrollTop: 0 ,}, scroll_top_duration);
	});
	
	/* tricky for css
	thx to http://eddmann.com/posts/providing-local-js-and-css-resources-for-cdn-fallbacks/
	*/
  if ($('body').css('background-color') !== '#fff') { // bootstrap default
      $('head').prepend('<link rel="stylesheet" href="/static/css/bootstrap.min.css">');
  }			
  if ($('.fa-tty').css('content') !== '\f1e4') { // fa-tty
      $('head').prepend('<link rel="stylesheet" href="/static/css/font-awesome.min.css">');
  }			
	//console.log('main:done');
});