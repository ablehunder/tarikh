'''
@author: aby
'''

import os
from urllib.parse import urlparse
from django.utils.translation import ugettext_lazy as _


SITE_NAME = 'tarikh'
META_DESCRIPTION = 'Tarikh, kronologi sejarah indah dan mudah'

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
DEBUG = True
ALLOWED_HOSTS = []
#DEBUG = False
#ALLOWED_HOSTS = ['localhost']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'haystack',
    'logentry_admin',
    'tinymce',
    'tarikh',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
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
                'django_settings_export.settings_export',         
            ],
        },
    },
]

WSGI_APPLICATION = 'tarikh.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'dev': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },    
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'tarikh',
        'USER': 'tarikhmysql',
				'PASSWORD': 'tarikhmysql', 
				'HOST': 'localhost',
				'PORT': '3306',
    }
}


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

DEBUG_FRONT = DEBUG
#DEBUG_FRONT = False

# available context from settings in template
SETTINGS_EXPORT = [
    'DEBUG',
    'DEBUG_FRONT', 
    'LANGUAGE_CODE',
    'SITE_NAME',
    'META_DESCRIPTION',
]