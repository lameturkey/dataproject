import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup
import json

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None

def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)

def extract(dom):
    try:
        convertlist = []
        for row in dom.find_all("tr")[1:]:
            data = row.find_all("td")
            print(data)
            code = data[0].span.string
            country = data[1].a.string
            convertlist.append([code, country])
    except:
        return convertlist

def savejson(dictionaries):
    with open('conversion.json', 'w+') as jsonfile:
        json.dump(dictionaries, jsonfile, indent=4)

if __name__ == '__main__':
    html = simple_get("https://en.wikipedia.org/wiki/List_of_IOC_country_codes")
    dom = BeautifulSoup(html, 'html.parser')
    conversionlist = extract(dom)
    savejson(conversionlist)
