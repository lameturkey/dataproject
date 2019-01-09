import csv
import json

athletefile = "athlete_events.csv"
populationfile = "poulation.csv"


#isolate the relevant values
keys = ["NOC", "Games", "Sport","Event","Medal"]

# json object should have these keys
medals = ["Gold", "Silver", "Bronze"]

def reader(filename):
    dicts = []


    with open(filename, 'r') as csvfile:
        athletelist = []
        # read the file
        dict = csv.DictReader(csvfile)
        for row in dict:
            newathlete = {}
            for key in keys:
                newathlete[key] = row[key]
            athletelist.append(newathlete)

    return athletelist


def clean(athletes):

    # remove all duplicate athletes turning it into the events by each country participated in
    events = [dict(touple) for touple in set(tuple(dict.items()) for dict in athletes if dict["Medal"] != "NA")]

    # placeholder for new structure
    countrydict = {}

    # for every event (athlete)
    for event in events:
        if event["NOC"] not in countrydict:
            countrydict[event["NOC"]] = {}
        if event["Games"] not in countrydict[event["NOC"]]:
            medaldict = {}
            for key in medals:
                medaldict[key] = {}
            countrydict[event["NOC"]][event["Games"]] = medaldict
        try:
            countrydict[event["NOC"]][event["Games"]][event["Medal"]][event["Sport"]] += 1
        except:
            countrydict[event["NOC"]][event["Games"]][event["Medal"]][event["Sport"]] = 1

    return countrydict

def savejson(dictionaries):
    with open('output.json', 'w+') as jsonfile:
        json.dump(dictionaries, jsonfile, indent=4)

# def addpop(struct):
#     with open("population.csv", "r") as csvfile:
#         dict = csv.DictReader(csvfile)
#         errorlist = []
#         for row in dict:
#
#             # store relevant variables
#             code = row["Country Code"]
#             year = row["Year"]
#             value = row["Value"]
#
#
#             # assign each value to the correct place
#             try:
#                 keys = struct[code].keys()
#             except KeyError:
#                 keys = []
#                 errorlist.append(code)
#
#             for key in keys:
#                 key = key.split(' ')
#                 if year == key[0]:
#                     try:
#                         struct[code][key[0] + " " + key[1]]["population"] = value
#                     except KeyError:
#                         pass
#
#
#
#         print(set(errorlist))
#         return struct



if __name__ == '__main__':
    athletes = reader(athletefile)
    athletes = clean(athletes)
    savejson(athletes)
