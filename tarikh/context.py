from django.contrib.sites.models import Site

def site(request):
    current = Site.objects.get_current(request)
    context = { 
        'site': current,
 	      'site_name' : current.name, 
    }
    
    return context