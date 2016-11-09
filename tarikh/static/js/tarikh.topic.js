/**
 * @author aby  
 */

$(function () {
	var evel = $(".event-item").clone().removeClass('hidden'),
		tl = $(".timeline"),
		width = $(window).width(), height = $(window).height(),
		minWidth = 768, minHeight = 540, 
		isVert = (width < minWidth) &&  (height < minHeight),
		$mode = $("input[name='mode']"), mode = $mode.filter(":checked").val(),
		$sort = $("input[name='sort']"), sort = $sort.filter(":checked").val(),
		$cal = $("input[name='calendar']"), cal = $cal.filter(":checked").val(),
		desktopHeight = mobileHeight = minHeight,
		doResizeTimeline = function(){
			var cmode = $mode.filter(":checked").val();
			mobileHeight = $('body').height() - $('.pre-toolbar').height() - $('.toolbar-top').height() -  $('.toolbar-bottom').height() - 10;
			desktopHeight = mobileHeight - $('.pre-toolbar').offset().top;
			(cmode!='vertical') && $('#timeline-embed').height((!isVert? (TL.Browser.mobile?mobileHeight:desktopHeight) : mobileHeight )+'px');
		},
		evData = [],
		activateTimeline=false,
		gc = $.calendars.instance(null,(document.documentElement.lang?document.documentElement.lang:navigator.language).substring(0, 2)),
		hc = $.calendars.instance('islamic'),
		formatDate = function(y,m,d,s,t){
			if (!y) return '';
			var c = (s=='hijri'?hc:gc), 
				nd = c.newDate(y,m?m:1,d?d:1),
				f = m?(d?'d M yyyy':'MM Y'):'Y',
				j = nd.toJD(), 
				fd = (t=='hijri'?hc:gc).fromJD(j).formatDate(f);
			//console.log(y,m,d,s, t, m?fd:parseInt(fd));
			return m?fd:parseInt(fd);
		},
		drawHorizontal = function(ccal){
			var ccal = $cal.filter(":checked").val(),
				// @see https://timeline.knightlab.com/docs/json-format.html
				timeline_json = {
					'title': {'text':{//'headline': $('.topic-header').text(),
														'text': //$('.topic-short').text() + 
																'<div class="topic-desc">' + $('.topic-desc').html() + '</div>' +'<div class="topic-footer">'+ $('.topic-footer').html()+'</div>' },
										'media': {'url':$('.topic-thumbnail img').attr('src')}
									},
					//'eras' : null,
					'scales' : $('.topic-scales').text(), // human or cosmological	
					'events': [],
				};
			$.each(evData, function(k,v){
				var f = v.fields,
				ev = {
					'start_date': { 'year': f.year_start, 'month': f.month_start, 'day': f.day_start, 
						'display_date': formatDate(f.year_start, f.month_start, f.day_start, f.calendar_type, ccal) }, // show display_date according to calendar used
					'text' : { 'headline': f.name, 'text': '<div class="topic-desc">' +(f.description?f.description: '')+ '</div>' +'<div class="topic-footer">'+(f.footnote?f.footnote:'')+"</div>"  }, 
					'group' : f.group?f.group:'',
					'background': $.parseJSON(f.xtra_attrs), //{'url':'#fff','color':'#000'}
					'autolink':true,
					'unique_id' : v.pk
				}
				f.media_url && (ev['media'] = {'url':f.media_url, 
								'credit':f.media_credit?f.media_credit:'', 
								'caption':f.media_caption?f.media_caption:''});
				f.year_end && (ev['end_date'] = { 'year': f.year_end});
				f.month_end && (ev['end_date']['month'] = f.month_end); 
				f.day_end && (ev['end_date']['day'] = f.day_end); 
				timeline_json['events'].push(ev);
			});
			
			doResizeTimeline();
			var timeline_options = {
					'timenav_position' : 'top',
					'height': $('#timeline-embed').height(), 
					'use_bc':true
				};
      window.timeline = new TL.Timeline('timeline-embed', timeline_json, timeline_options);
      //console.log('drawHorizontal done', ccal, timeline_json);
		},
		drawVertical = function(ccal,csort){
			var ccal = $cal.filter(":checked").val();
			tl.empty();
			$.each(sort==csort?evData:evData.reverse(), function(k,v){
				var el = evel.clone(), f = v.fields;
				$(el).find(".rm-state").attr('id', 'event-rm-wrap-' + v.pk);
				$(el).find("label").attr('for', 'event-rm-wrap-' + v.pk);
				$(el).find(".event-title").text(f.name);
				$(el).find(".event-start-time").text(formatDate(f.year_start, f.month_start, f.day_start, f.calendar_type, ccal));
				$(el).find(".event-end-time").text(formatDate(f.year_end, f.month_end, f.day_end, f.calendar_type, ccal));
				$(el).find(".event-desc").html(f.description);
				$(el).find(".event-note").html(f.footnote);
				$(tl).append(el);		
				!f.description && $(el).find('.event-rm-trigger').addClass('hidden');
			});
			//console.log('drawVertical done', ccal);
		},
		doDrawTimeline = function(){
			if (!activateTimeline) return;		
			var cmode = $mode.filter(":checked").val(),
					vertMode = (cmode=='vertical'),
					csort = $sort.filter(":checked").val(),
					ccal = $cal.filter(":checked").val();
			//console.log('doDrawTimeline', cmode, csort, ccal);
			$('.timeline, .topic-info label, .topic-info-more label, .topic-desc, .topic-footer').toggleClass('hidden', !vertMode);
			$('.timeline-wrap').toggleClass('hidden', vertMode); 
			(vertMode) ? drawVertical(ccal,csort) : drawHorizontal(ccal);
			sort = csort; cal = ccal; mode = cmode;
		},
		$tbt = $('.toolbar-top'),
		doAdjustToolbar = function(){
			// @see https://github.com/customd/jquery-visible
			if ('vertical'==$mode.filter(":checked").val()) 
				$tbt.toggleClass('navbar-fixed-top', !$('.topic-info').visible(true, true));
		};
	
	/* init page */
	!TL.Browser.mobile && $(window).resize(doResizeTimeline);	
	$(".event-item").remove();
	$(window).scroll(doAdjustToolbar).resize(doAdjustToolbar);
	
	/* toolbar init */
	$mode.on('change', function(){
			var cmode = $mode.filter(":checked").val();
			$sort.closest('.btn').toggleClass('disabled', cmode=='horizontal');
		});
	(!isVert && ('vertical'==mode)) &&
		$("input[name='mode'][value='horizontal']").closest('.btn').button('toggle');
	/* toolbar event */
	$("input[name='mode'],input[name='calendar'],input[name='sort']")
		.on('change', doDrawTimeline);
		
	/* last, get data and draw it */
	$.getJSON('?m=a',function(data){
		evData = data;
		activateTimeline=true;
		doDrawTimeline();
	});

});