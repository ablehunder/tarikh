'''
@author: aby
'''

import os
from urllib.parse import urlparse
from django.utils.translation import ugettext_lazy as _
import dj_database_url

SITE_NAME = os.environ.get('SITE_NAME') or 'tarikh'
META_DESCRIPTION = os.environ.get('META_DESCRIPTION') or 'Tarikh, timeline / lini masa, kronologi sejarah indah dan mudah'

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
PACKAGE_ROOT = os.path.abspath(os.path.dirname(__file__))
BASE_DIR = PROJECT_ROOT
PAGES_DIR = os.path.join(BASE_DIR, "pages")
#BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'mg6s@2m0ez%ho%9!nbc=jvx(=0e=)yqx2*5ya0d1#(ivzx9c@)'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = (os.environ.get('DJANGO_DEBUG')=='True') or False
#ALLOWED_HOSTS = []
#DEBUG = False
ALLOWED_HOSTS = ['localhost']
# Allow all host headers
ALLOWED_HOSTS = ['*']

APPEND_SLASH = False

# Application definition
CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.flatpages',
    'constance.backends.database',
    'constance',
    'haystack',
    'logentry_admin',
    'tinymce',
    'tarikh',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware'
]

ROOT_URLCONF = 'tarikh.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(PROJECT_ROOT, 'pages'),
            os.path.join(PACKAGE_ROOT, "templates"),
            ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                #'django_settings_export.settings_export',
								'constance.context_processors.config',         
            ],
        },
    },
]

WSGI_APPLICATION = 'tarikh.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },
}

# Update database configuration with $DATABASE_URL.
db_from_env = dj_database_url.config(conn_max_age=500)
DATABASES['default'].update(db_from_env)

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
#    {
#        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
#    {
#        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#    },
#    {
#        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGES = [
    ('id', _('Indonesia')),
#    ('en', _('English'))
]

#LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'id-id'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(PROJECT_ROOT, "site_media", 'static')

# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/
STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'


# Haystack + Elasticsearch

#elasticsearch
es = urlparse(os.environ.get('SEARCHBOX_URL') or 'http://127.0.0.1:9200/')
port = es.port or 80

HAYSTACK_CONNECTIONS = {
    'default': {
        #'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
        'ENGINE': 'haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine',
        'URL': es.scheme + '://' + es.hostname + ':' + str(port),
        'INDEX_NAME': 'documents',
        'HAYSTACK_SEARCH_RESULTS_PER_PAGE':7,
        'INCLUDE_SPELLING': True,
    },
}

#HAYSTACK_SIGNAL_PROCESSOR = 'haystack.signals.BaseSignalProcessor'
HAYSTACK_SIGNAL_PROCESSOR = 'haystack.signals.RealtimeSignalProcessor'

if es.username:
    HAYSTACK_CONNECTIONS['default']['KWARGS'] = {"http_auth": es.username + ':' + es.password}
    
#tinymce
TINYMCE_DEFAULT_CONFIG = {
    'theme': "advanced", 
    'relative_urls': False,
    'selector': 'textarea',
    'plugins': 'paste',
}

DEBUG_FRONT = (os.environ.get('DJANGO_DEBUG_FRONT')=='True') or False

# available context from settings in template
CONSTANCE_CONFIG = {
    'DEBUG' : ( DEBUG, "Debug Mode" ),
    'DEBUG_FRONT' : ( DEBUG_FRONT, "Debug Mode for Front End" ),
    'LANGUAGE_CODE' : ( LANGUAGE_CODE, "Language Code" ),
    'META_DESCRIPTION' : ( META_DESCRIPTION, "Meta Description" ),
}