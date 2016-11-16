'''
@author: aby
'''

from django.utils import timezone
from django import forms
from django.forms.models import ModelForm
from tarikh.models import Topic, Event

class TopicForm(ModelForm):
    pass
    #slug = forms.SlugField(disabled=True,)
            
    class Meta:
        model = Topic
        #fields = '__all__'
        exclude = ['authors',]

class EventForm(ModelForm):
    pass

    class Meta:
        model = Event
        exclude = ['authors',]
