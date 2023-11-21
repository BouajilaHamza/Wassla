import streamlit as st
import pandas as pd
import time

 
st.write("""
# My first app
Hello *world!*
""")
 
fulldf = pd.read_csv(r"C:\Users\LENOVO\Desktop\Hamza Bouajila\3IDSD SD\Spark\TP\Projet\WeatherForcast\app\research\CoinMarketCap.csv")
while True:
    time.sleep(10)
    # st.cache_resource(df)
    df.LastUpdated = pd.to_datetime(df.LastUpdated)
    st.dataframe(df)
    # st.dataframe(df[df.CategoryName == "Discord Bots"].loc[:,['CoinName','PriceUSD']].groupby("CoinName").mean().reset_index(drop = False))
    st.line_chart(df[df.CategoryName == "Discord Bots"].loc[:,['CoinName','PriceUSD']].groupby("CoinName").mean().reset_index(drop = False).rename(columns={"Unnamed 0":"CoinName"}),x='CoinName',y='PriceUSD')
    st.line_chart(df[df.CategoryName == "Friend Tech"].loc[:,['CoinName','PriceUSD']].groupby("CoinName").mean().reset_index(drop = False).rename(columns={"Unnamed 0":"CoinName"}),x='CoinName',y='PriceUSD')
    st.bar_chart(df,x='CoinName',y='PriceUSD')