# import time
# import json
# import logging
# from fastapi import APIRouter
# from fastapi import status as st
# from pyspark.sql import SparkSession
# from fastapi.responses import JSONResponse
# from app.services.GetData import GetCategories, GetMap,Streaming


# Dashboard_router = APIRouter()
# spark = SparkSession.builder.appName("SparkByExamples.com").getOrCreate()
# DATA = []
# @Dashboard_router.post("/Dashboard")
# async def get_dashboard():
#     while True :
#         time.sleep(5)
#         categories = GetCategories()
#         for i in range(len(categories['data'])):
#             ID = categories['data'][i]['id']
#             map = GetMap(ID)
#             try:
#                 for j in range(len(map["data"]["coins"])):
#                     DATA.append(Streaming(categories,map,j))
#                     with open (r'C:\Users\LENOVO\Desktop\Hamza Bouajila\3IDSD SD\Spark\TP\Projet\WeatherForcast\app\data\data.json', 'w') as f:
#                         json.dump(DATA, f)
#             except Exception as e:
#                 print("Error : ",e)
#                 continue
