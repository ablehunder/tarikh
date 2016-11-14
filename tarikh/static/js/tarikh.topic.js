/**
 * @author aby  
 */

$(function () {
	var $evl = $(".event-item:first").clone().removeClass('hidden'),
		hash = window.location.hash.substr(1),
		tophash = $evl.find('.event-pk').attr('name'),
		$tlv = $(".timeline"),
		width = $(window).width(), height = $(window).height(),
		minWidth = 768, minHeight = 540, 
		isVert = (width < minWidth) &&  (height < minHeight),
		$mode = $("input[name='mode']"), mode = $mode.filter(":checked").val(),
		$sort = $("input[name='sort']"), sort = $sort.filter(":checked").val(),
		$cal = $("input[name='calendar']"), cal = $cal.filter(":checked").val(),
		desktopH = mobileH = minHeight,
		doResizeTimeline = function(){
			var cmode = $mode.filter(":checked").val();
			mobileH = $('body').height() - $('.pre-toolbar').height() 
				- $('.toolbar-top').height() -  $('.toolbar-bottom').height() - 10;
			desktopH = mobileH - $('.pre-toolbar').offset().top;
			(cmode!='vertical') && $('#timeline-embed').height(
				(!isVert? (TL.Browser.mobile?mobileH:desktopH) : mobileH )+'px');
		},
		evData = [],
		activateTimeline=false, 
		dl = document.documentElement, lang = (dl.lang?dl.lang:navigator.language),
		gc = $.calendars.instance(null, lang.substring(0, 2)),
		hc = $.calendars.instance('islamic'),
		formatDate = function(y,m,d,s,t){
			if (!y) return '';
			var c = (s=='hijri'?hc:gc), 
				nd = c.newDate(y,m?m:1,d?d:1),
				f = m?(d?'d M yyyy':'MM Y'):'Y',
				j = nd.toJD(), 
				fd = (t=='hijri'?hc:gc).fromJD(j).formatDate(f);
			return m?fd:parseInt(fd);
		},
		drawHorizontal = function(ccal){
			if (window.tlembed) return;
			var ccal = $cal.filter(":checked").val(),
				// @see https://timeline.knightlab.com/docs/json-format.html
				timeline_json = {
					'title': {'text':{//'headline': $('.topic-header').text(),
														'text': //$('.topic-short').text() + 
																'<div class="topic-desc">' 
																+ $('.topic-desc').html() 
																+ '</div>' 
																+ '<div class="topic-footer">'
																+ $('.topic-footer').html()+'</div>' },
										'media': {'url':$('.topic-thumbnail img').attr('src')}
									},
					//'eras' : null,
					'scales' : $('.topic-scales').text(), // human or cosmological	
					'events': [],
				}, 
				setText = function(t){
					var f = t.fields, re = f.related_events,
						revs = $.map(re? re.split('\n'):'', function(v){
							return location.origin + v.trim();
						});
					return '<div class="event-desc">' 
						+ (f.description?f.description: '')
						+ '</div>' 
						+ '<div class="event-footer">'
						+ (f.footnote?f.footnote:'')
						+ '</div><div class="event-related">'
						+ TL.Util.linkify(f.related_events?revs.join('\n'):'')
						+ '</div>'
						+ '<a class="event-link" href="' + t.pk + '">' + t.pk + '</a>'
						+ '</div>' ;				
				};
      
			$.each(evData, function(k,v){
				var f = v.fields, 
					ev = {
						'start_date': { 'year': f.year_start, 'month': f.month_start, 
							'day': f.day_start, 
							// show display_date according to calendar used
							'display_date': formatDate(f.year_start, f.month_start, 
								f.day_start, f.calendar_type, ccal) 
						}, 
						'text' : { 'headline': f.name, 'text': setText(v) }, 
						'group' : f.group?f.group:'',
							// background : {'url':'#fff','color':'#000'},
						'background': f.xtra_attrs?$.parseJSON(f.xtra_attrs):null, 
						'autolink':true,
						'unique_id' : '/'+v.pk
					};
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
					//'hash_bookmark': true,
					'use_bc':true
				};
				
			var tl = window.tlembed 
				= new TL.Timeline('timeline-embed', timeline_json, timeline_options);
			
			tl.on('change', function(evt, dt){
				var sid = evt.target._getSlideIndex(evt.unique_id), 
					cs = evt.target.getCurrentSlide();
				//console.log(sid, evt.target.getCurrentSlide());
				if (sid==0 || evt.unique_id == null) return;				
				if (evData[sid-1]._fetch && evData[sid-1]._placed) return;
				if (evData[sid-1]._fetch) {
					$(cs._el.content).find('.tl-text-content')
						.html(setText(evData[sid-1]));
					evData[sid-1]._placed = true;
				}
				else
					$.getJSON(location.origin + location.pathname 
						+ evData[sid-1].pk + '/?m=a',function(data){
						evData[sid-1] = data[0];
						evData[sid-1]._placed = evData[sid-1]._fetch = true;
						$(cs._el.content).find('.tl-text-content').html(setText(data[0]));
					});      	
			});
			if (evData[0].pk == tophash.substr(1)) tophash=null;
      tl.goToId(hash || tophash);
			/**
			 * css check
			 */
			 
			if ($('.tl-timeline').css('background-color') !== '#FFF') { // timeline css
		      $('head').prepend('<link rel="stylesheet" href="/static/css/timeline.css">');
		  }			
      //console.log('topic:drawHorizontal end', ccal, timeline_json);
		},
		drawVertical = function(ccal,csort){
			var ccal = $cal.filter(":checked").val(),
				setText = function(el, t){
					var f = t.fields, re = f.related_events,
						revs = $.map(re? re.split('\n'):'', function(r){
							return location.origin + r.trim();
						});
					$(el).find(".event-desc").html(f.description?f.description:'');
					$(el).find(".event-note").html(f.footnote?f.footnote:'');
					$(el).find(".event-related").html(TL.Util.linkify(revs.join('\n')));
				};			
			$tlv.empty();
			$.each(sort==csort?evData:evData.reverse(), function(k,v){
				var el = $evl.clone(), f = v.fields;
				$(el).find(".rm-state").attr('id', 'event-rm-wrap-' + v.pk);
				$(el).find("label").attr('for', 'event-rm-wrap-' + v.pk);
				$(el).find(".event-pk").attr('name', "/"+v.pk);
				$(el).find(".event-title").text(f.name);
				$(el).find(".event-start-time").text(formatDate(f.year_start, 
					f.month_start, f.day_start, f.calendar_type, ccal));
				$(el).find(".event-end-time").text((f.year_end?' \u2014 ':'') 
					+ formatDate(f.year_end, f.month_end, 
							f.day_end, f.calendar_type, ccal));
				setText(el, v);
				$(el).find(".event-link")
					.attr('href', location.origin + location.pathname + v.pk)
					.text(v.pk);
				$tlv.append(el);		
				!f.description && $(el).find('.event-rm-trigger').addClass('hidden');
				$(el).attr('data-src',location.origin + location.pathname + v.pk);
				$.fn.unveil && $(el).addClass('unveil').unveil(200,function(){
       		//console.log($(this).find(".event-title").text());
					!v._fetch && $.getJSON(location.origin 
							+ location.pathname + v.pk + '/?m=a',function(data){
						evData[k] = data[0];
						evData[k]._fetch = true;
						setText(el, data[0]);
					});      	
	 			});
			});
			var o=$tlv.find('a.event-pk[name="'+(hash?hash:tophash)+'"]').offset();
			o && $('body,html').animate({scrollTop: o.top ,}, 1);
			//console.log('topic:drawVertical end', ccal);
		},
		doDrawTimeline = function(){
			//console.log('topic:doDrawTimeline begin');
			if (!activateTimeline) return;		
			var cmode = $mode.filter(":checked").val(),
					vertMode = (cmode=='vertical'),
					csort = $sort.filter(":checked").val(),
					ccal = $cal.filter(":checked").val();
			$('.timeline, .topic-info label, .topic-info-more')
				.toggleClass('hidden', !vertMode);
			$('.timeline-wrap').toggleClass('hidden', vertMode); 
			(vertMode) ? drawVertical(ccal,csort) : drawHorizontal(ccal);
			sort = csort; cal = ccal; mode = cmode;
			//console.log('topic:doDrawTimeline end');
		},
		$tbt = $('.toolbar-top'),
		doAdjustToolbar = function(){
			// @see https://github.com/customd/jquery-visible
			if ('vertical'==$mode.filter(":checked").val() && $.fn.visible) 
				$tbt.toggleClass('navbar-fixed-top', !$('.topic-info')
					.visible(true, true));
		};
	
	/* init page */
	!TL.Browser.mobile && $(window).resize(doResizeTimeline);	
	$(window).scroll(doAdjustToolbar).resize(doAdjustToolbar);
	
	/* toolbar init */
	$mode.on('change', function(){
			var cmode = $mode.filter(":checked").val();
			$sort.closest('.btn').toggleClass('disabled', cmode=='horizontal');
		});
	(!isVert && ('vertical'==mode)) && $.fn.button &&
		$("input[name='mode'][value='horizontal']")
			.closest('.btn')
			.button('toggle');
	/* toolbar event */
	$("input[name='mode'],input[name='calendar'],input[name='sort']")
		.on('change', doDrawTimeline);
		
	/* last, get data and draw it */
	$.getJSON('?m=a',function(data){
		evData = data;
		activateTimeline=true;
		if ($.fn.button){
		  $(".event-item, .pagination-wrap").remove()
		  $(".btn-mode-wrap").toggleClass('hidden')
		  doDrawTimeline();
		}
	});
	//console.log('topic:done');
		 	
});