/**
 * @author aby  
 */
$(function () {
		// tooltip, using bootstrap
		$('[data-toggle="tooltip"]').tooltip();
		// search form animate
		$('.search-form input[name="q"]')
			.on('focus',function(){$('.search-form').animate({width:'100%'});})
			.on('blur',function(){$('.search-form').animate({width:'50%'});});		
		var $tbb = $('.toolbar-bottom'),
			// browser window scroll (in pixels) after which the "back to top" link is shown
			offset = $(window).height()/2,
			//browser window scroll (in pixels) after which the "back to top" link opacity is reduced
			offset_opacity = $(window).height(),
			//duration of the top scrolling animation (in ms)
			scroll_top_duration = 700,
			//grab the "back to top" link
			$btt = $('.cd-top'),
			doAdjustToolbar = function(){
				( $(this).scrollTop() > offset ) ? $btt.addClass('cd-is-visible') : $btt.removeClass('cd-is-visible cd-fade-out');
				if( $(this).scrollTop() > offset_opacity )
					$btt.addClass('cd-fade-out');
				// @see https://github.com/customd/jquery-visible
				$tbb.toggleClass('navbar-fixed-bottom', !$('.pre-footer').visible(true));
			};
		//hide or show the "back to top" link
		$(window).scroll(doAdjustToolbar).resize(doAdjustToolbar);	
		//smooth scroll to top
		$btt.on('click', function(event){
			event.preventDefault();
			$('body,html').animate({scrollTop: 0 ,}, scroll_top_duration);
		});
});