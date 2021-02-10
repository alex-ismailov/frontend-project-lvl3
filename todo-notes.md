# TODO & notes

## to do
* Разобраться, что в итоге хранить в feed link, только ссылку на домен или полный путь до фида?
* Глючит RSS Example 

## Есть баги:

* Надо учить parser работать с разными форматами данных, так как из некторых фидов 
не корректно парсяться данные, это отражается в модальном окне, напрмер контент может быть обрамлен 
html тегами
* У некотрых фидов очень большой description, из-за этого текст вылезает за пределы модального окна.
* Не отбражается крестик в правом верх.углу в модальном окне
* 


## Фиды

каталог Rss фидов:
http://alfaru.com/

http://www.teleport2001.ru/rss/news.rss
http://www.klerk.ru/export/news.rss
http://www.sarbc.ru/rss/data-utf/main.rss
http://news.rambler.ru/rss/world/
http://informer.gismeteo.ru/rss/27612.xml

https://www.bbc.co.uk/news/10628494

глючный фиды:

нечитаемый текст во view, видимо проблема с кодировкой:
http://www.liveinternet.ru/users/marshag/rss/

Нет description в модальном окне:
http://www.1prime.ru/export/rss2/index.xml
http://promodj.ru/tracks/rss.xml

теги внтури desc в модальном окне:
https://www.finam.ru/international/imdaily/rsspoint


descript содержит спец код спецсимвола:
http://feeds.feedburner.com/istorizru
