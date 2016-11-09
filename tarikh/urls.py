"""
@author: aby
"""

from django.conf.urls import url
from django.contrib import admin
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage
from tarikh.views import HomeView, PageView, TopicView

urlpatterns = [
    #url(r'^admin/', admin.site.urls),
    url(r'^idrtn/', admin.site.urls), # idarotan
    url(r'^(?P<slug>[a-zA-Z0-9_.-]+)/$', TopicView.as_view(), name='topic'),
    
    """
		favicon default browser handler, used in debug only
		it should be moved somewhere on http server to increase performance..
		"""
    url(r'^favicon.ico$',
        RedirectView.as_view(
            url=staticfiles_storage.url('favicon.ico'),
            permanent=False), name="favicon"
    ),
               
    url(r'^(?P<page_name>[a-zA-Z0-9_-]+)$', PageView.as_view(), name='pages'),
    url(r'^$', HomeView.as_view(), name='home'),
]
