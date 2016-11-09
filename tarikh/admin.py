'''
@author: aby
'''

from django.contrib import admin
from .models import Topic, Event
from .forms import TopicForm, EventForm

class InlineEventAdmin(admin.TabularInline):    
    model = Event
    fields = ['name', 'visible', 'calendar_type',
		        ('year_start', 'month_start', 'day_start', ),
		        'year_end', 'month_end', 'day_end'
				]

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'short_description', 'visible']
    list_filter = ['visible',]
    list_editable = ['visible','short_description']
    form = TopicForm
    search_fields = ['title', 'short_description', 'event__name',]
    prepopulated_fields = {"slug": ("title",)}
    #readonly_fields = ('slug',)
    inlines = [InlineEventAdmin,]
    
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'topic', 'visible']
    list_display_links = ['name','topic',]
    list_editable = ['visible',]
    form = EventForm
    save_as = True