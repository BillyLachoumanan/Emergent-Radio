from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import os
from typing import List, Dict, Any, Optional
import asyncio
import httpx
from pydantic import BaseModel

app = FastAPI(title="Global Radio API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RadioStation(BaseModel):
    stationuuid: str
    name: str
    url: str
    url_resolved: str
    homepage: str
    favicon: str
    country: str
    countrycode: str
    state: str
    language: str
    votes: int
    lastchangetime: str
    codec: str
    bitrate: int
    hls: int
    lastcheckok: int
    lastchecktime: str
    clickcount: int
    clicktrend: int
    tags: str

# Cache for radio browser servers
radio_browser_servers = []

async def get_radio_browser_servers():
    """Get list of radio browser API servers for load balancing"""
    global radio_browser_servers
    if not radio_browser_servers:
        try:
            import socket
            result = socket.getaddrinfo('all.api.radio-browser.info', None)
            servers = list(set([ip[4][0] for ip in result]))
            radio_browser_servers = [f"https://{server}" for server in servers]
            random.shuffle(radio_browser_servers)
        except Exception as e:
            # Fallback to default server
            radio_browser_servers = ["https://de1.api.radio-browser.info"]
    return radio_browser_servers

async def make_radio_request(endpoint: str, params: dict = None):
    """Make request to radio browser API with server failover"""
    servers = await get_radio_browser_servers()
    
    last_error = None
    for server in servers:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"{server}/json/{endpoint}"
                print(f"Trying URL: {url} with params: {params}")
                response = await client.get(url, params=params)
                print(f"Response status: {response.status_code}")
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"Bad status from {server}: {response.status_code}")
        except Exception as e:
            print(f"Error with server {server}: {e}")
            last_error = e
            continue
    
    raise HTTPException(status_code=503, detail=f"Radio service temporarily unavailable. Last error: {last_error}")

@app.get("/")
async def root():
    return {"message": "Global Radio API is running"}

@app.get("/api/stations/popular")
async def get_popular_stations(limit: int = 50):
    """Get most popular radio stations"""
    try:
        params = {
            "limit": limit,
            "order": "clickcount",
            "reverse": "true",
            "hidebroken": "true"
        }
        stations = await make_radio_request("stations/search", params)
        return {"stations": stations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stations/by-country/{country_code}")
async def get_stations_by_country(country_code: str, limit: int = 100):
    """Get radio stations by country code"""
    try:
        params = {
            "countrycode": country_code.upper(),
            "limit": limit,
            "order": "clickcount",
            "reverse": "true",
            "hidebroken": "true"
        }
        stations = await make_radio_request("stations/search", params)
        return {"stations": stations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stations/search")
async def search_stations(
    name: Optional[str] = None,
    country: Optional[str] = None,
    language: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 50
):
    """Search radio stations with various filters"""
    try:
        params = {
            "limit": limit,
            "order": "clickcount",
            "reverse": "true",
            "hidebroken": "true"
        }
        
        if name:
            params["name"] = name
        if country:
            params["country"] = country
        if language:
            params["language"] = language
        if tag:
            params["tag"] = tag
            
        stations = await make_radio_request("stations/search", params)
        return {"stations": stations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/countries")
async def get_countries():
    """Get list of countries with radio stations"""
    try:
        countries = await make_radio_request("countries")
        # Sort by station count
        sorted_countries = sorted(countries, key=lambda x: x.get('stationcount', 0), reverse=True)
        return {"countries": sorted_countries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/languages")
async def get_languages():
    """Get list of languages"""
    try:
        languages = await make_radio_request("languages")
        sorted_languages = sorted(languages, key=lambda x: x.get('stationcount', 0), reverse=True)
        return {"languages": sorted_languages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tags")
async def get_tags(limit: int = 100):
    """Get popular tags/genres"""
    try:
        tags = await make_radio_request("tags")
        sorted_tags = sorted(tags, key=lambda x: x.get('stationcount', 0), reverse=True)
        return {"tags": sorted_tags[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/station/{station_uuid}/click")
async def click_station(station_uuid: str):
    """Register a click for a station (for statistics)"""
    try:
        await make_radio_request(f"url/{station_uuid}")
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)