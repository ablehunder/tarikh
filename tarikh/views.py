'''
@author: aby
'''

from tarikh import settings
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from tarikh.models import Topic, Event
from django.views.generic.list import ListView
import json
from django.core import serializers
from django.http.response import HttpResponse
from django.db.models import Q
from haystack import views
from datetime import datetime
from constance import config
from django.contrib.sites.shortcuts import get_current_site

class BaseView(TemplateView):
    
    def render_to_response(self, context, **response_kwargs):
        default_context = {
            'title': config.SITE_NAME,
            'meta_description': config.META_DESCRIPTION,
        }
        new_context = {**default_context,  **context}
        
        return TemplateView.render_to_response(self, new_context, **response_kwargs)

class HomeView(ListView):
    model = Topic
    template_name = "index.html"
        
    query = None
    paginate_by = 7
    type = None
    mode = None
    lang = settings.LANGUAGE_CODE    
    site = None
    
    def query_using_db(self):
        qfilter = None
        if self.query:
            for q in self.query.split():
                qr = Q(title__icontains=q) | Q(event__name__icontains=q) | Q(description__icontains=q) | Q(event__description__icontains=q)
                qfilter = (qfilter | qr) if qfilter else qr
        qfilter = qfilter & Q(published=True) if qfilter else Q(published=True)
        # do some 'random' order so the site seems like has new article 
        orders = ('-modify_date', '-published_date', '-creation_date')								 
        return Topic.objects.filter(qfilter).distinct().order_by(orders[(datetime.now().day) % 3])  
    
    def get_queryset(self):
        return self.query_using_db()
    
    def dispatch(self, request, *args, **kwargs):
        try:
            self.site = get_current_site(request)
            self.query = request.GET.get("q")
            self.type = request.GET.get("c")
            self.mode = request.GET.get('m')
            self.paginate_by = int(request.GET.get('s'))
            self.lang = request.LANGUAGE_CODE
        except (TypeError, ValueError):
            pass
        
        return ListView.dispatch(self, request, *args, **kwargs)

    def render_to_response(self, context, **response_kwargs):
        
        default_context = {
            'title': self.site.name + ' - ' + config.META_DESCRIPTION,
            'meta_description': config.META_DESCRIPTION,
        }
        new_context = {**default_context,  **context}
        
        return ListView.render_to_response(self, new_context, **response_kwargs)

class SearchView(views.SearchView):
    template = 'index.html'
    #results_per_page = 7 #see HAYSTACK_SEARCH_RESULTS_PER_PAGE

    def get_context(self):
        context = views.SearchView.get_context(self);

        extra_context = {
            'object_list': context['page'].object_list,
            'page_obj': context['page'],
        }
        
        context.update(extra_context)

        return context
    
class PageView(BaseView):
    
    def dispatch(self, request, *args, **kwargs):
        try:
            self.page_name =kwargs['page_name']
        except:
            self.page_name = ""
        
        self.template_name = "_page.html"
        return BaseView.dispatch(self, request, *args, **kwargs)
    
    def render_to_response(self, context, **response_kwargs):
        pagecontext = {
            'page_name' : self.page_name,
        }
        new_context = {**pagecontext,  **context}
        
        return BaseView.render_to_response(self, new_context, **response_kwargs)
    
class TopicView(ListView):
    model = Event
    template_name = "topic_detail.html"
    paginate_by = 5
    mode = None
        
    def get_queryset(self):
        return Event.objects.filter(
                topic__slug = self.kwargs['slug'],
                visible = True
            ).order_by('-year_start', '-month_start', '-day_start', '-time_start')	

    def dispatch(self, request, *args, **kwargs):
        try:
            self.mode = request.GET.get('m')
            self.ordering = request.GET.get('o')
        except (TypeError, ValueError):
            pass
        if self.mode == 'a': # return ajax/json
            self.paginate_by = 0
        
        return ListView.dispatch(self, request, *args, **kwargs)
    
    def render_to_response(self, context, **response_kwargs):
        obj = Topic.objects.get(slug=self.kwargs['slug'])
        context ['topic'] = obj
        context ['title'] = obj.title
        context ['meta_description'] = obj.short_description
        
        if self.mode == 'a': # return ajax/json
            data = serializers.serialize('json', context['object_list'], 
                fields=( "name", "group", "calendar_type",
                    "year_start", "month_start", "day_start", "time_start",
                    "year_end", "month_end", "day_end", "time_end",
                    "media_url", "media_caption", "media_credit"
                ))
            return HttpResponse(data, content_type='application/json')
        
        return ListView.render_to_response(self, context, **response_kwargs)

class EventView(DetailView):
    model = Event
    template_name = "event_detail.html"
    mode = None
    
    def get_queryset(self):
        return Event.objects.filter(
               pk=self.kwargs['pk'], 
               topic__slug = self.kwargs['slug']
            )
    
    def dispatch(self, request, *args, **kwargs):
        try:
            self.mode = request.GET.get('m')
        except (TypeError, ValueError):
            pass
        
        return ListView.dispatch(self, request, *args, **kwargs)
    
    def render_to_response(self, context, **response_kwargs):
        obj = context['object']        

        if self.mode == 'a': # return ajax/json
            data = serializers.serialize('json', [obj])
            return HttpResponse(data, content_type='application/json')

        return DetailView.render_to_response(self, context, **response_kwargs)
