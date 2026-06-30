<p align="center">
  <img src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/9afe0493484903.5e66500f8dea4.gif"
    width="95%"
  />
</p>

#  API Integration Projects | U2T01
---
> **Course Assignment** | Web Applications (AWOS)  
> Consuming external web services with four distinct API categories.
> --
>**Sandra Perales**  
>ITIID-5 Student



---

<div align="right">
	<img src="https://pixelsafari.neocities.org/dividers/bluestarribbon2.gif" width="50%">
			<img src="https://pixelsafari.neocities.org/dividers/bluestarribbon2.gif" width="49%">
		</div>
</div>


## Overview

This repository contains **four independent projects**, each consuming a different category of web service. Together they cover streaming media, social platforms, open data, and geolocation — reflecting real-world patterns in modern web development.

| # | Project | API | Category |
|---|---------|-----|----------|
| 1 | [YouTube Explorer](#1-youtube-explorer) | YouTube Data API v3 | 🎬 Streaming |
| 2 | [Bluesky Feed Viewer](#2-bluesky-feed-viewer) | Bluesky AT Protocol | 🦋 Social Media |
| 3 | [NASA APOD Gallery](#3-nasa-apod-gallery) | NASA Astronomy Picture of the Day | 🚀 Open Data |
| 4 | [GeoLocator Map](#4-geolocator-map) | Google Maps JavaScript API | 🗺️ Geolocation |

---



## 1. YouTube Explorer

**Category:** Streaming  
**API Used:** [YouTube Data API v3](https://developers.google.com/youtube/v3)

### Description
A web application that allows users to search for YouTube videos and display results with thumbnails, titles, and embedded playback without leaving the page.

### Features
- Keyword based video search
- Embedded iframe video player
- Video metadata display (title, channel, title)
- Asynchronous data fetching with loading states

## 2. Bluesky Feed Viewer

**Category:** Social Media  
**API Used:** [Bluesky AT Protocol (ATP)](https://atproto.com/lexicons/app-bsky)

### Description
A lightweight client that authenticates with a Bluesky account and displays a user's home timeline feed, including post text, timestamps, author handles, and like counts.

### Features
- Session-based authentication via ATP
- Home timeline retrieval and display
- Post author avatars and handles

## 3. NASA APOD Gallery

**Category:** Databases / Open Data  
**API Used:** [NASA Astronomy Picture of the Day API](https://api.nasa.gov/)

### Description
A gallery application that fetches NASA's Astronomy Picture of the Day and displays the image (or video embed) alongside its scientific explanation.

### Features
- Fetch today's APOD 
- HD image
- Copyright and author attribution display
- Description

If the page doesnt show the data and it stuck on the loading screen go here to obtain (https://api.nasa.gov/) the api key and replace it on "const Nasa_key = 'keynumber'; "
  

## 4. GeoLocator Map

**Category:** Geolocation  
**API Used:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)

### Description
An interactive map application that retrieves a location via the pre-set coordinates Geolocation API, renders it on a Google Map, and allows users to see the established coordinates using API on a map.

### Features
- Reverse geocoding to display the location
- Browser geolocation to center the map on the user
- Info window popups with place name
- Change the map type


---

## API Documentation

| Service | Docs |
|---------|------|
| YouTube Data API v3 | https://developers.google.com/youtube/v3/docs |
| Bluesky AT Protocol | https://atproto.com/lexicons/app-bsky |
| NASA APIs | https://api.nasa.gov |
| Google Maps Platform | https://developers.google.com/maps/documentation |

---

 <div align="center">
  <img src="https://media.tenor.com/hGQZUS8D3fQAAAAM/flug-little-aliens-forever.gif" width="40%"/>
</div>
  
