# TODO 
---
## priority
*	Set tick for Hijri calendar in horizontal timeline 

## nice to have
* disclaimer
* online translate page using google translator?
* Create side bar in home, contains top rated view and popular search terms ( from elasticsearch? ) 
* Combine django flatpages to use with current pages url (no trailing backslash)
* add font sizing in toolbar (switch between bigger or smaller font weight/line height) 
* add "fa fa-spinner fa-pulse fa-3x fa-fw" before js loading, except no-script

## done
* Vertical Timeline
* Horizontal timeline
* Hijri/gregorian feature
* Integrate haystack search to home.
* Create event detail, decorated version and plain version. Can be used for permalink, google index, or used in timeline. 
* do some 'random' order so the site seems like has new article
* add related events link
* Use haystack for search, whoosh/elasticsearch on heroku searchbox , https://elements.heroku.com/addons/searchbox $0/mo
* send only event's name on event's json, load details when event's element shown 
* for paginated event list, use hash of first event on the page to load slide for timeline

## clean on deploy / git push:
* settings.AUTH_PASSWORD_VALIDATORS
* urls (admin & favicon)
* google analytics ID
* database setting