from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class LocationPing(Base):
    __tablename__ = "location_pings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    speed = Column(Float)
    heading = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
