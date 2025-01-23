import json
import streamlit as st
import numpy as np
import pandas as pd 
import time  
import plotly.express as px
from pyspark.sql import SparkSession
spark = SparkSession.builder.appName("SparkByExamples.com").getOrCreate()
 
st.write("""
# My first app Hello *world!*
        """)

placeholder = st.empty()

while True:   
   
    df = spark.read.json(r'C:\Users\LENOVO\Desktop\Hamza Bouajila\3IDSD SD\Spark\TP\Projet\WeatherForcast\app\data\data.json')
    
    try:
        with placeholder.container():
            # create three columns
            kpi1, kpi2, kpi3 = st.columns(3)
            

            # fill in those three columns with respective metrics or KPIs 
            # kpi1.metric(label="Age ⏳", value=round(avg_age), delta= round(avg_age) - 10)
            # kpi2.metric(label="Married Count 💍", value= int(count_married), delta= - 10 + count_married)
            # kpi3.metric(label="A/C Balance ＄", value= f"$ {round(balance,2)} ", delta= - round(balance/count_married) * 100)

            # create two columns for charts 
            bar = px.bar(data_frame=df, x = 'CategoryName', y = 'PriceUSD', height=400, width=600)
            fig_col1, fig_col2 = st.columns(2)
            with fig_col1:
                st.markdown("### First Chart")
                Price_CategoryName = df.groupby(["CategoryName"]).mean().sort("avg(PriceUSD)",ascending=False)
                st.bar_chart(data=Price_CategoryName , x = "CategoryName", y = "avg(PriceUSD)", height=400, width=600)
            with fig_col2:
                st.markdown("### Second Chart")
                fig2 = px.line(data_frame=df, y = 'PriceUSD', x = 'RealTime')
                st.write(fig2)
            st.markdown("### Detailed Data View")
            st.dataframe(df)
        # placeholder.empty()
    except Exception as e:
        print(e)
        continue
    time.sleep(5)