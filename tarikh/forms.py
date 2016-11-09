'''
@author: aby
'''

from django import forms
from django.forms.models import ModelForm
from tarikh.models import Topic, Event

class TopicForm(ModelForm):

    class Meta:
        model = Topic
        #fields = '__all__'
        exclude = ['authors',]

class EventForm(ModelForm):
    pass

    class Meta:
        model = Event
        exclude = ['authors',]
