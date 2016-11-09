'''
@author: aby
'''

from django.db import models 
from tinymce.models import HTMLField
from jsonfield.fields import JSONField
from django.core.urlresolvers import reverse
from django.utils.text import slugify
import datetime
from django.utils.translation import ugettext_lazy as _
from django.db.models.fields import URLField

class Topic(models.Model):
    title = models.CharField(_("Title"), max_length=256, help_text="Provide title for this topic")
    slug = models.SlugField(_("Slug"), max_length=256, null=True, blank=True, )
    short_description = models.CharField(_('Short Description'), max_length=256, null=True, blank=True, )
    description = HTMLField(_('Description'), null=True, blank=True, )
    footnote = HTMLField(_('Footnote'), blank=True, null=True)
    thumbnail_url = URLField(_('Thumbnail URL'), null=True, blank=True)
    thumbnail_credit = models.CharField(_('Thumbnail Credit'), max_length=128, null=True, blank=True, )
    visible = models.BooleanField(_("Visible"), blank=True, default=True)
    scales = models.CharField(_('Scales'), max_length=12, choices=[("human", _("Human")), ("cosmological", _("Cosmological")),], default="human" )
    tags = models.CharField(_('Tags'), max_length=128, null=True, blank=True, )
    authors = models.CharField(_('Authors'), max_length=256, null=True, blank=True, )
    xtra_attrs = JSONField(_('JSON Attributes'), null=True, blank=True, default={})
    
    def get_absolute_url(self):
        return reverse('topic', kwargs={'slug': self.slug})
    
    def __str__(self):
        return self.title

    def save(self, force_insert=False, force_update=False, using=None, 
        update_fields=None):
        
        self.slug = slugify(self.title)
        
        return models.Model.save(self, force_insert=force_insert, 
                                 force_update=force_update, 
                                 using=using, update_fields=update_fields)    
        
class Event(models.Model):
    name = models.CharField(_('Name'), max_length=256)
    topic = models.ForeignKey(Topic)
    description = HTMLField(_('Description'), blank=True, null=True)
    footnote = HTMLField(_('Footnote'), blank=True, null=True)
    visible = models.BooleanField(_("Visible"), blank=True, default=True)
    group = models.CharField(_('Event Group'), max_length=64, null=True, blank=True, )
    media_url = URLField(_('Media URL'), null=True, blank=True)
    media_caption = models.CharField(_('Media Caption'), max_length=128, null=True, blank=True, )
    media_credit = models.CharField(_('Media Credit'), max_length=128, null=True, blank=True, )
    tags = models.CharField(_('Tags'),blank=True, null=True, max_length=128)    
    authors = models.CharField(_('Authors'), max_length=256, null=True, blank=True, )

    calendar_type_choice = [("hijri", _("Hijri")), ("gregorian", _("Gregorian")),]
    calendar_type = models.CharField('Calendar Type', max_length=16, choices=calendar_type_choice, default="gregorian")
    year_start = models.IntegerField('Occurance Year', default=datetime.datetime.now().year,
                            help_text='Occurance year, you may fill negative value if it is BC in Gregorian Calendar')
    month_start = models.PositiveSmallIntegerField('Occurance Month', blank=True, null=True)
    day_start = models.PositiveSmallIntegerField('Occurance Day', blank=True, null=True)
    year_end = models.IntegerField('Year of Occurance End', blank=True, null=True)
    month_end = models.PositiveSmallIntegerField('Month of Occurance End', blank=True, null=True)
    day_end = models.PositiveSmallIntegerField('Date of Occurance End', blank=True, null=True)
    
    url_references = models.TextField(_('References'), max_length=1024, blank=True, null=True,
                        help_text='Urls, one url per line. First url will be fetched to fill description whenever it is empty')
    related_events = models.TextField('Related events', max_length=1024, blank=True, null=True,
                        help_text='Related events, one event per line')
    xtra_attrs = JSONField('JSON Attributes', blank=True, null=True, default={})
    
    class Meta:
    	get_latest_by = "year_start"
    	ordering = ['-year_start', '-month_start', 'day_start']
    	
    def __str__(self):
        return self.name