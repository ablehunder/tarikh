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
		$mode = $("input[name='mode']"), mode = $mode.is(":checked"),
		$sort = $("input[name='sort']"), sort = $sort.is(":checked"),
		$cal = $("input[name='calendar']"), cal = $cal.is(":checked"),
		desktopH = mobileH = minHeight,
		doResizeTimeline = function(){
			var cmode = $mode.is(":checked");
			mobileH = $('body').height() - $('.pre-toolbar').height() 
				- $('.toolbar-top').height() -  $('.toolbar-bottom').height() - 10;
			desktopH = mobileH - $('.pre-toolbar').offset().top;
			(cmode) && $('#timeline-embed').height(
				(!isVert? (TL.Browser.mobile?mobileH:desktopH) : mobileH )+'px');
		},
		evData = [],
		activateTimeline=false, 
		dl = document.documentElement, lang = (dl.lang?dl.lang:navigator.language),
		gc = $.calendars.instance(null, lang.substring(0, 2)),
		hc = $.calendars.instance('islamic'),
		getDate = function(y,m,d,t,s,tg){
			if (!y) return '';
			var c = (s=='hijri'?hc:gc), 
				nd = c.newDate(y,m?m:1,d?d:1),
				j = nd.toJD(), 
				rd = (tg?gc:hc).fromJD(j);
			return rd;
		},
		formatDate = function(y,m,d,t,s,tg){
			if (!y) return '';
			var c = (s=='hijri'?hc:gc), 
				nd = c.newDate(y,m?m:1,d?d:1),
				f = m?(d?'d MMM yyyy':'MMM Y'):'Y',
				j = nd.toJD(), 
				fd = (tg?gc:hc).fromJD(j).formatDate(f) + (t?' <sup>~ '+t+'</sup>':'');
			return m?(d?gc.fromJD(j).formatDate('DDD, '):'')+fd:parseInt(fd);
		},
		drawHorizontal = function(ccal, gotohash){
			var ccal = $cal.is(":checked"),
        csid=null,
				// @see https://timeline.knightlab.com/docs/json-format.html
				timeline_json = {
					'title': {'text':{//'headline': $('.topic-header').text(),
														'text': //$('.topic-short').text() + 
																'<div class="topic-desc">' 
																+ $('.topic-desc').html() 
																+ '</div>' 
																+ '<div class="topic-footer">'
																+ $('.topic-footer').html()+'</div>' },
										'media': {'url':$('.topic-thumbnail img').attr('src'),
                              'caption': $('.topic-thumbnail img').attr('title')
                    }
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
					return ''  
						+ (f.description?'<div class="event-desc">'
              + f.description + '</div>': '') 
						+ (f.footnote?
              '<div class="event-note">' + f.footnote + '</div>':'')
						+ TL.Util.linkify(f.related_events?
              '<div class="event-related">' + revs.join('\n') + '</div>':'')
						+ '<a class="event-link" href="' + t.pk + '">' + t.pk + '</a>';
				},
        setData = function(v){
  				var f = v.fields, 
  					sd = getDate(f.year_start, f.month_start, f.day_start, 
  						f.time_start, f.calendar_type, ccal),
            ts = f.time_start?f.time_start.split(':'):null,
            te = f.time_end?f.time_end.split(':'):null,
  					ev = {
  						'start_date': { 'year': f.year_start?sd.year():null, 
  							'month': f.month_start?sd.month():null, 
  							'day': f.day_start?sd.day():null, 
  							// 'hour', 'minute', 'second', 'millisecond'
  							// show display_date according to calendar used
  							'display_date': formatDate(f.year_start, f.month_start, 
  								f.day_start, f.time_start, f.calendar_type, ccal) 
  						}, 
  						'text' : { 'headline': f.name, 'text': setText(v) },
  						'group' : f.group?f.group:'',
  							// background : {'url':'#fff','color':'#000'},
  						'background': f.xtra_attrs?$.parseJSON(f.xtra_attrs):null, 
  						'autolink':true,
  						'unique_id' : '/'+v.pk
  					};
          if (ts) { 
             ev['start_date']['hour'] = ts[0];
             ev['start_date']['minute'] = ts[1];
             ev['start_date']['second'] = ts[2];
          }   
  				f.media_url && (ev['media'] = {'url':f.media_url, 
  								'credit':f.media_credit?f.media_credit:'', 
  								'caption':f.media_caption?f.media_caption:''});
  				if (f.year_end) {
            ev['end_date'] = { 'year': f.year_end };
            ev['end_date']['display_date'] = formatDate(f.year_end, 
                f.month_end, f.day_end, f.time_end, f.calendar_type, ccal);
            if (f.day_end == f.day_start 
                && f.month_end == f.month_start
                && f.year_end == f.year_start && f.time_end!=null) 
              ev['end_date']['display_date'] = '<sup>' + f.time_end +'</sup>';
                    
          };
  				f.month_end && (ev['end_date']['month'] = f.month_end ); 
  				f.day_end && ( ev['end_date']['day'] = f.day_end );
          if (te) { 
             ev['end_date']['hour'] = te[0];
             ev['end_date']['minute'] = te[1];
             ev['end_date']['second'] = te[2];
          }   
          console.log(ev,ts,f.time_end);
          return ev;
        };
			$.each(evData, function(k,v){
				timeline_json['events'].push(setData(v));
			});
			if (window.tlembed) csid = window.tlembed.getCurrentSlide();
			doResizeTimeline();
			var timeline_options = {
					'timenav_position' : 'top',
					'height': $('#timeline-embed').height(), 
					//'hash_bookmark': true,
					'use_bc':true
				};
			TL.Language.languages['en']['era_labels']['negative_year']['suffix'] = 
				ccal?'BCE':'BHE';
			var tl = window.tlembed 
				= new TL.Timeline('timeline-embed', timeline_json, timeline_options);
			
			tl.on('change', function(evt, dt){
				var sid = evt.target._getSlideIndex(evt.unique_id), 
					cs = evt.target.getCurrentSlide();
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
			if (tophash && evData[0].pk == tophash.substr(1)) tophash=null;
      if (!gotohash) tl.goToId(csid.data.unique_id);
      gotohash && tl.goToId(hash || tophash);
			/**
			 * css check
			 */
			 
			if ($('.tl-timeline').css('background-color') !== '#FFF') { // timeline css
		      $('head').prepend('<link rel="stylesheet" href="/static/css/timeline.css">');
		  }			
      //console.log('topic:drawHorizontal end', ccal, timeline_json);
		},
		drawVertical = function(ccal,csort,gotohash){
			var ccal = $cal.is(":checked"),
        sctop = $(window).scrollTop(),
				setText = function(el, t){
					var f = t.fields, re = f.related_events,
						revs = $.map(re? re.split('\n'):'', function(r){
							return location.origin + r.trim();
						});
					$(el).find(".event-desc")
              .toggleClass('hidden', !f.description)
              .html(f.description?f.description:'');
					$(el).find(".event-note")
              .toggleClass('hidden', !f.footnote)
              .html(f.footnote?f.footnote:'');
					$(el).find(".event-related")
              .toggleClass('hidden', !re)
              .html(TL.Util.linkify(revs.join('\n')));
					var $et = $(el).find(".event-thumbnail");
          $et.toggleClass('hidden', !f.media_url)
              .find('.event-img').attr('src',f.media_url);
          $et.find('.tl-credit').text(f.media_credit);
          $et.find('.tl-caption').text(f.media_caption);
				};			
			$tlv.empty();
			$.each(sort==csort?evData:evData.reverse(), function(k,v){
				var el = $evl.clone(), f = v.fields;
				$(el).find(".rm-state").attr('id', 'event-rm-wrap-' + v.pk);
				$(el).find("label").attr('for', 'event-rm-wrap-' + v.pk);
				$(el).find(".event-pk").attr('name', "/"+v.pk);
				$(el).find(".event-title").text(f.name);
				$(el).find(".event-start-time").html(formatDate(f.year_start, 
					f.month_start, f.day_start, f.time_start, f.calendar_type, ccal));
				$(el).find(".event-end-time").html((f.year_end?' \u2014 ':'') 
					+ (f.day_end == f.day_start 
                && f.month_end == f.month_start
                && f.year_end == f.year_start && f.time_end!=null? 
              '<sup>' + f.time_end +'</sup>'
              : formatDate(f.year_end, f.month_end, 
							    f.day_end, f.time_end, f.calendar_type, ccal)));
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
      !gotohash && $('body,html').animate({scrollTop: sctop ,}, 1);
			gotohash && o && $('body,html').animate({scrollTop: o.top ,}, 1);
			//console.log('topic:drawVertical end', csort, sort, ccal, gotohash, sctop);
		},
		doDrawTimeline = function(gotohash){
			//console.log('topic:doDrawTimeline begin');
			if (!activateTimeline) return;		
			var cmode = $mode.is(":checked"),
					csort = $sort.is(":checked"),
					ccal = $cal.is(":checked");
			$('.timeline, .topic-info label, .topic-info-more')
				.toggleClass('hidden', cmode);
			$('.timeline-wrap').toggleClass('hidden', !cmode); 
			(cmode) ? drawHorizontal(ccal,gotohash) : drawVertical(ccal,csort,gotohash);
			sort = csort; cal = ccal; mode = cmode;
			//console.log('topic:doDrawTimeline end',gotohash);
		},
		$tbt = $('.toolbar-top'),
		doAdjustToolbar = function(){
			// @see https://github.com/customd/jquery-visible
			if (!$mode.is(":checked") && $.fn.visible) 
				$tbt.toggleClass('navbar-fixed-top', !$('.topic-info')
					.visible(true, true));
		};
	
	/* init page */
	!TL.Browser.mobile && $(window).resize(doResizeTimeline);	
	$(window).scroll(doAdjustToolbar).resize(doAdjustToolbar);
	
	/* toolbar init */
	$mode.on('change', function(){
			var cmode = $mode.filter(":checked").val();
			$sort.attr('disabled', cmode=='horizontal');
		});
	(!isVert && ('vertical'==mode)) && $.fn.button &&
		$("input[name='mode'][value='horizontal']")
			.closest('.btn')
			.button('toggle');
	/* toolbar event */
	$("input[name='mode']")
		.on('change', function(){doDrawTimeline(true)});
  $("input[name='calendar'],input[name='sort']")
		.on('change', function(){doDrawTimeline(false)});
		
	/* last, get data and draw it */
	$.getJSON('?m=a',function(data){
		evData = data;
		activateTimeline=true;
		if ($.fn.button){
		  $(".event-item, .pagination-wrap").remove()
		  $(".btn-mode-wrap").toggleClass('hidden')
		  doDrawTimeline(true);
		}
	});
	//console.log('topic:done');
		 	
});