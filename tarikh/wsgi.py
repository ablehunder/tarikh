'''
@author: aby
'''

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tarikh.settings")

application = get_wsgi_application()
