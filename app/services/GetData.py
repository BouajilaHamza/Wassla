import pandas as pd
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

def GetLatest():
  url = 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
  parameters = {
    'start':'1',
    'limit':'5000',
    'convert':'USD'
  }
  headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': 'c0fef76c-7d4e-43e1-bdfa-3b02bead65e0',
  }

  session = Session()
  session.headers.update(headers)

  try:
    response = session.get(url, params=parameters)
    data = json.loads(response.text)
  except (ConnectionError, Timeout, TooManyRedirects) as e:
    print(e)
  return data




def GetMap(id):
  url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/category'
  parameters = {
    'id':f'{id}',
  }
  headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': 'c0fef76c-7d4e-43e1-bdfa-3b02bead65e0',
  }

  session = Session()
  session.headers.update(headers)

  try:
    response = session.get(url, params=parameters)
    map = json.loads(response.text)
  except (ConnectionError, Timeout, TooManyRedirects) as e:
    print(e)
  return map



def GetCategories():
  url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/categories'
  parameters = {}
  headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': 'c0fef76c-7d4e-43e1-bdfa-3b02bead65e0',
  }

  session = Session()
  session.headers.update(headers)

  try:
    response = session.get(url, params=parameters)
    categories = json.loads(response.text)
  except (ConnectionError, Timeout, TooManyRedirects) as e:
    print(e)
  return categories




def Streaming():
    DATA = []
    categories = GetCategories()
    Dict = {
        "CategoryName" :None,
        "CoinName" :None,
        "NumMarketPairs" :None,
        "DateAdded" :None,
        "IsActive" :None,
        "CMCRank" :None,
        "PriceUSD" :None,
        "Volume24" :None,
        "PercentChange1h" :None,
        "PercentChange24h" :None,
        "PercentChange7d" :None,
        "MarketCap" :None,
        "LastUpdated" :None
    }
    for i in range(len(categories['data'])):
        ID = categories['data'][i]['id']
        map = GetMap(ID)
        try:
            for j in range(len(map["data"]["coins"])):
                    Dict["CategoryName"] = categories['data'][j]['name']
                    Dict["CoinName"] = map['data']['coins'][0]['name']
                    Dict["NumMarketPairs"] = map['data']['coins'][0]['num_market_pairs']
                    Dict["DateAdded"] = map['data']['coins'][0]['date_added']
                    Dict["IsActive"] = map['data']['coins'][0]['is_active']
                    Dict["CMCRank"] = map['data']['coins'][0]['cmc_rank']
                    Dict["PriceUSD"] = map['data']['coins'][0]["quote"]["USD"]['price']
                    Dict["Volume24"] = map['data']['coins'][0]["quote"]["USD"]['volume_24h']
                    Dict["PercentChange1h"] = map['data']['coins'][0]["quote"]["USD"]['percent_change_1h']
                    Dict["PercentChange24h"] = map['data']['coins'][0]["quote"]["USD"]['percent_change_24h']
                    Dict["PercentChange7d"] =  map['data']['coins'][0]["quote"]["USD"]['percent_change_7d']
                    Dict["MarketCap"] = map['data']['coins'][0]["quote"]["USD"]['market_cap']
                    Dict["LastUpdated"] = map['data']['coins'][0]["quote"]["USD"]['last_updated']
                    DATA.append(Dict)
        except:
            continue  