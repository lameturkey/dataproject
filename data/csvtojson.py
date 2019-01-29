import csv
import json

athletefile = "athlete_events.csv"
populationfile = "poulation.csv"

def reader(filename):

    #isolate the relevant values
    keys = ["NOC", "Games", "Sport","Event","Medal"]
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
    # json object should have these keys
    medals = ["Gold", "Silver", "Bronze"]

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

def savejson(dictionaries, name):
    with open(name, 'w+') as jsonfile:
        json.dump(dictionaries, jsonfile, indent=4)

def convert(list):
    with open("conversion.json", "r") as jsonfile:
        conversionlist = json.load(jsonfile)
        for item in conversionlist:
            try:
                list[item[1]] = list[item[0]]
                del list[item[0]]
            except KeyError:
                pass
    return list

def savefilters(athletes):
    sportslist = []
    for country in athletes:
        for game in athletes[country]:
            for medal in athletes[country][game]:
                for sport in athletes[country][game][medal]:
                    if sport not in sportslist:
                        sportslist.append(sport)
    return sportslist

def saveyears(athletes):
    yearlist = []
    for country in athletes:
        for game in athletes[country]:
            game = game.split(" ")[0]
            if game not in yearlist:
                yearlist.append(game)
    return yearlist

def hardcode(athletes):
    hardcodelist = [["England", "Great Britain"], ["USA", "United States"], ["Lebanon", "LIB"], ["The Bahamas", "Bahamas"]]
    for element in hardcodelist:
        athletes[element[0]] = athletes[element[1]]
        del athletes[element[1]]
    return athletes

if __name__ == '__main__':

    # read the file
    athletes = reader(athletefile)

    # clean the file
    athletes = clean(athletes)

    # convert the file (NOC -> country conversion)
    athletes = convert(athletes)

    # make hardcoded adjustments to the countries that have different names for some reason
    athletes = hardcode(athletes)

    #  save the output (datajson)
    savejson(athletes, "output.json")

    # save all the sports
    sportslist = savefilters(athletes)
    savejson(sportslist, "sportslist.json")

    # save all the years
    years = saveyears(athletes)
    savejson(years, "yearlist.json")
