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
        # Use known working servers
        radio_browser_servers = [
            "https://de1.api.radio-browser.info",
            "https://nl1.api.radio-browser.info", 
            "https://at1.api.radio-browser.info"
        ]
    return radio_browser_servers

async def make_radio_request(endpoint: str, params: dict = None):
    """Make request to radio browser API with server failover"""
    servers = await get_radio_browser_servers()
    
    last_error = None
    for server in servers:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"{server}/json/{endpoint}"
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            last_error = e
            continue
    
    raise HTTPException(status_code=503, detail="Radio service temporarily unavailable")

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

@app.get("/api/stations/by-tag/{tag}")
async def get_stations_by_tag(tag: str, limit: int = 100):
    """Get radio stations by tag/genre"""
    try:
        params = {
            "tag": tag.lower(),
            "limit": limit,
            "order": "clickcount",
            "reverse": "true",
            "hidebroken": "true"
        }
        stations = await make_radio_request("stations/search", params)
        return {"stations": stations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stations/christian")
async def get_christian_stations(limit: int = 100):
    """Get Christian radio stations"""
    try:
        # Search for Christian, Gospel, and Religious stations
        christian_tags = ["christian", "gospel", "religious", "christian music", "christian rock", "christian pop"]
        all_stations = []
        
        for tag in christian_tags:
            params = {
                "tag": tag,
                "limit": 50,
                "order": "clickcount",
                "reverse": "true",
                "hidebroken": "true"
            }
            try:
                stations = await make_radio_request("stations/search", params)
                all_stations.extend(stations)
            except:
                continue
        
        # Remove duplicates and sort by click count
        seen = set()
        unique_stations = []
        for station in all_stations:
            if station['stationuuid'] not in seen:
                seen.add(station['stationuuid'])
                unique_stations.append(station)
        
        # Sort by clickcount descending
        unique_stations.sort(key=lambda x: x.get('clickcount', 0), reverse=True)
        
        return {"stations": unique_stations[:limit]}
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

@app.get("/api/stations/by-genre")
async def get_stations_by_genre(genre: str, limit: int = 50):
    """Get stations by specific genre"""
    try:
        # Map common genres to tags
        genre_mapping = {
            "rock": "rock",
            "pop": "pop",
            "jazz": "jazz",
            "classical": "classical",
            "country": "country",
            "hip-hop": "hip hop,hiphop,rap",
            "electronic": "electronic,dance,techno,house",
            "blues": "blues",
            "reggae": "reggae",
            "folk": "folk",
            "metal": "metal",
            "punk": "punk",
            "alternative": "alternative",
            "indie": "indie",
            "soul": "soul,r&b",
            "funk": "funk",
            "latin": "latin,salsa,merengue",
            "world": "world music,ethnic",
            "ambient": "ambient,chillout",
            "news": "news,talk",
            "sports": "sports",
            "christian": "christian,gospel,religious"
        }
        
        tag = genre_mapping.get(genre.lower(), genre)
        
        params = {
            "tag": tag,
            "limit": limit,
            "order": "clickcount",
            "reverse": "true",
            "hidebroken": "true"
        }
        
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

@app.get("/api/genres")
async def get_popular_genres():
    """Get curated list of popular music genres"""
    genres = [
        {"name": "Rock", "slug": "rock", "icon": "🎸"},
        {"name": "Pop", "slug": "pop", "icon": "🎵"},
        {"name": "Jazz", "slug": "jazz", "icon": "🎺"},
        {"name": "Classical", "slug": "classical", "icon": "🎼"},
        {"name": "Country", "slug": "country", "icon": "🤠"},
        {"name": "Hip-Hop", "slug": "hip-hop", "icon": "🎤"},
        {"name": "Electronic", "slug": "electronic", "icon": "🎧"},
        {"name": "Blues", "slug": "blues", "icon": "🎷"},
        {"name": "Reggae", "slug": "reggae", "icon": "🌴"},
        {"name": "Folk", "slug": "folk", "icon": "🪕"},
        {"name": "Metal", "slug": "metal", "icon": "⚡"},
        {"name": "Punk", "slug": "punk", "icon": "🤘"},
        {"name": "Alternative", "slug": "alternative", "icon": "🎭"},
        {"name": "Indie", "slug": "indie", "icon": "🎨"},
        {"name": "Soul/R&B", "slug": "soul", "icon": "💫"},
        {"name": "Latin", "slug": "latin", "icon": "💃"},
        {"name": "World", "slug": "world", "icon": "🌍"},
        {"name": "Ambient", "slug": "ambient", "icon": "🌙"},
        {"name": "Christian", "slug": "christian", "icon": "✝️"},
        {"name": "News/Talk", "slug": "news", "icon": "📰"},
        {"name": "Sports", "slug": "sports", "icon": "⚽"}
    ]
    return {"genres": genres}

@app.get("/api/station/{station_uuid}")
async def get_station_details(station_uuid: str):
    """Get detailed information about a specific station"""
    try:
        stations = await make_radio_request("stations/byuuid", {"uuid": station_uuid})
        if stations and len(stations) > 0:
            return {"station": stations[0]}
        else:
            raise HTTPException(status_code=404, detail="Station not found")
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