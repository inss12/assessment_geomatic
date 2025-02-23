import numpy as np
from fastapi import FastAPI, Query
import pandas as pd
import json
from typing import List
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable Cross-Origin Resource Sharing (CORS) to allow requests from the React frontend.
origins = [
    "http://localhost:3000",  # Update this list if the frontend is hosted on a different origin.
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load GeoJSON data for provinces and regions from the local 'data' folder.
with open("data/provinces.geojson", "r", encoding="utf-8") as f:
    provinces_data = json.load(f)
with open("data/regions.geojson", "r", encoding="utf-8") as f:
    regions_data = json.load(f)

# Load transport station data from a CSV file and store it in a DataFrame.
transport_df = pd.read_csv("data/transport_stations.csv", encoding='utf-8')

@app.get("/")
def home():
    """
    Root endpoint that returns a welcome message.
    """
    return {"message": "Welcome to the IEF's assessement for Geomatic !"}

@app.get("/provinces")
def get_provinces():
    """
    Endpoint to retrieve provinces data as GeoJSON.
    """
    return provinces_data

@app.get("/regions")
def get_regions():
    """
    Endpoint to retrieve regions data as GeoJSON.
    """
    return regions_data

@app.get("/transport-stations")
def get_transport_stations(fclass: str = Query(None)):
    """
    Endpoint to retrieve transport stations data.
    Optionally filters stations based on their 'fclass' attribute if provided.
    """
    df = transport_df.copy()
    # Replace invalid numeric values with None.
    df = df.replace({np.nan: None, 'inf': None, '-inf': None})
    # Convert latitude and longitude to numeric, coercing any errors to NaN.
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
    # Drop rows that have invalid coordinates.
    df = df.dropna(subset=['latitude', 'longitude'])
    # Apply filter by fclass if the query parameter is provided.
    if fclass:
        df = df[df["fclass"].str == fclass]
    return df.to_dict(orient="records")
