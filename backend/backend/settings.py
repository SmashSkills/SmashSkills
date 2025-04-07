"""
Django-Einstellungen für das Backend-Projekt.

Generiert durch 'django-admin startproject' mit Django 5.1.7.

Weitere Informationen zu dieser Datei finden Sie unter:
https://docs.djangoproject.com/en/5.1/topics/settings/

Die vollständige Liste der Einstellungen und ihrer Werte finden Sie unter:
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path

# Pfade innerhalb des Projekts so aufbauen: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Schnellstart-Entwicklungseinstellungen - ungeeignet für die Produktion
# Siehe https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SICHERHEITSWARNUNG: Halten Sie den geheimen Schlüssel für die Produktion geheim!
SECRET_KEY = 'django-insecure-5t^9kne=nnog5hdycd$5qe(g!2r^#(mg-42zw92*1t5730go53'

# SICHERHEITSWARNUNG: Debug-Modus nicht in der Produktion einschalten!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Anwendungsdefinition

INSTALLED_APPS = [
    #"grappelli",
    'admin_interface',
    'colorfield',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    "import_export",
    "nested_admin",


    
    #Apps
    "user",
    "curriculum",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Datenbank
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Passwortvalidierung
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalisierung
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Statische Dateien (CSS, JavaScript, Bilder)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Standard-Primärschlüsseltyp
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


DATA_UPLOAD_MAX_NUMBER_FIELDS = 100000
DATA_UPLOAD_MAX_MEMORY_SIZE = 26214400  # 25MB

# Import-Export Einstellungen
IMPORT_EXPORT_USE_TRANSACTIONS = True
IMPORT_EXPORT_CHARSET = 'utf-8'
IMPORT_EXPORT_CSV_DELIMITER = ','  
