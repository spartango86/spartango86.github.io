import json

rows = []
itemsWithAddons = {}

SEL = ['not selected', 'selected']
head = [
    '''<!doctype html>
<html>
    <head>
        <title>Lt Ouroumov's Worm CYOA V6 - Addons</title>
        <link href="style.css" rel="stylesheet" />
    </head>
    <body>'''
]
body = []
footer = [
    '''
    </body>
</html>'''

]

with open("project.json", "r", encoding="utf8") as f:
    data = json.load(f)
    rows = data['rows']

for row in rows:
    objects = row['objects']
    for object in objects:
        if len(object['addons']) > 0:
            for addon in object['addons']:
                json_object = {
                    "name": "",
                    "requires": []
                }
                json_object['name'] = addon['title']

                for requirement in addon['requireds']:
                    if requirement['reqId'] == "" and requirement['type'] != 'or':
                        continue
                    elif requirement['type'] == 'or' and len(requirement['orRequired']):
                        json_object['requires'].append(requirement['orRequired'])
                    else:
                        json_object['requires'].append([requirement['reqId'], 1 if requirement['required'] else 0])

                if len(json_object['requires']) == 0:
                    continue
                else:
                    if object['title'] in itemsWithAddons:
                        itemsWithAddons[object['title']].append(json_object)
                    else:
                        itemsWithAddons[object['title']] = [row["title"], json_object]

def search_by_id(search_id):
    for row in rows:
        objects = row['objects']
        for object in objects:
            if object['id'] == search_id:
                return object['title']
    return None

def catlist_to_html(_list):
    _powers = []
    for power in _list:
        name = power[0]
        sub = power[1::]
        _powers.append(f"<li>{name} {addon_list_to_html(sub)}</li>")
    return ["<ul>"] + _powers + ["</ul>"]

def addon_list_to_html(_list):
    _addons = []
    for addon in _list:
        name = addon['name']
        _addons.append(f"<li>{name} {reqs_list_to_html(addon['requires'])}</li>")
    return "\n<ul>" + "\n".join(_addons) + "</ul>"

def or_list_to_html(_list):
    _ids = []
    for req in _list[0]:
        id = req['req']
        id = search_by_id(id)
        _ids.append(f"<li>{id}</li>")
    sub_list = "<ul>" + "\n".join(_ids) + "</ul>"
    orlist = "<ul><li>One (or more) of:\n" + sub_list + "\n</li></ul>"
    return orlist

def reqs_list_to_html(_list):
    _reqs = []
    _type = 1 if isinstance(_list[0][0], str) else 0
    if _type:
        for and_req in _list:
            if isinstance(and_req, dict):
                _reqs.append(or_list_to_html(and_req))
                continue
            id = and_req[0]
            if and_req[1]:
                condition = SEL[1]
            else:
                condition = SEL[0]
            _reqs.append(f"<li>{search_by_id(id)} <strong>{condition}</strong>")
        return "\n<ul>" + "\n".join(_reqs) + "</ul>"
    else:
        _reqs.append(or_list_to_html(_list))
        return "\n".join(_reqs)


cats = {}

for key, val in itemsWithAddons.items():
    category = val[0]
    if category not in cats:
        cats[category] = [[key] + val[1::]]
    else:
        cats[category] += [[key] + val[1::]]

for category, cat_list in cats.items():
    body.append(f"<h1>{category}</h1>")
    body += catlist_to_html(cat_list)

d = head + body + footer
with open("addons.html", "w+", encoding="utf8") as f:
    f.write("\n".join(d))