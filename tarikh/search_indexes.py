"""
@author: aby
"""
import datetime
from haystack import indexes
from tarikh.models import Topic, Event

class TopicIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    pub_date = indexes.DateTimeField(model_attr='published_date')
    
    # We add this for autocomplete.
    #content_auto = indexes.EdgeNgramField(model_attr='title')
    
    def get_model(self):
        return Topic

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.filter(published=True)