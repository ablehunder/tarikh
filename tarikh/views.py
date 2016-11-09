'''
@author: aby
'''

from tarikh import settings
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from tarikh.models import Topic
from django.views.generic.list import ListView
import json
from django.core import serializers
from django.http.response import HttpResponse
from django.db.models import Q

class BaseView(TemplateView):
    
    def render_to_response(self, context, **response_kwargs):
        default_context = {
            'meta_description': settings.META_DESCRIPTION,
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
    
    def query_using_db(self):
        qs = None
        qfilter = None
        if self.query:
            qs = self.query.split();
            for q in qs:
                qr = Q(title__icontains=q) | Q(event__name__icontains=q) | Q(description__icontains=q) | Q(event__description__icontains=q)
                qfilter = (qfilter | qr) if qfilter else qr
        qfilter = qfilter & Q(visible=True) if qfilter else Q(visible=True) 
        return Topic.objects.filter(qfilter).distinct()  
    
    def get_queryset(self):
        return self.query_using_db()
    
    def dispatch(self, request, *args, **kwargs):
        try:
            self.query = request.GET.get("q")
            self.type = request.GET.get("c")
            self.mode = request.GET.get('m')
            self.paginate_by = int(request.GET.get('s'))
            self.lang = request.LANGUAGE_CODE
        except (TypeError, ValueError):
            pass
        
        return ListView.dispatch(self,request, *args, **kwargs)

    def render_to_response(self, context, **response_kwargs):
        
        default_context = {
            'meta_description': settings.META_DESCRIPTION,
        }
        new_context = {**default_context,  **context}
        
        return ListView.render_to_response(self, new_context, **response_kwargs)

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
    
class TopicView(DetailView):
    model = Topic
    template_name = "topic_detail.html"
    
    event = None
    mode = None
    
    def dispatch(self, request, *args, **kwargs):
        try:
            self.mode = request.GET.get('m')
            self.event = int(request.GET.get('e'))
        except (TypeError, ValueError):
            pass
        
        return DetailView.dispatch(self, request, *args, **kwargs)
    
    def render_to_response(self, context, **response_kwargs):
        obj = context['object']        
        context ['meta_description'] = obj.title
        
        if self.mode == 'a': # return ajax/json
            data = serializers.serialize('json', obj.event_set.all())
            return HttpResponse(data, content_type='application/json')
        
        return DetailView.render_to_response(self, context, **response_kwargs)
