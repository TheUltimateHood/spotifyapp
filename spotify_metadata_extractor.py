
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
import re

def extract_track_id(spotify_url):
    """Extract track ID from Spotify URL"""
    match = re.search(r'/track/([a-zA-Z0-9]+)', spotify_url)
    return match.group(1) if match else None

def get_spotify_metadata(track_urls):
    """Get metadata for Spotify tracks"""
    # Note: For this demo, we'll use public access without credentials
    # In production, you'd need to set up Spotify API credentials
    
    try:
        # Initialize Spotify client without credentials (limited access)
        sp = spotipy.Spotify()
        
        track_ids = []
        for url in track_urls:
            track_id = extract_track_id(url)
            if track_id:
                track_ids.append(track_id)
        
        if not track_ids:
            print("No valid track IDs found")
            return
        
        # Get track information
        tracks_data = []
        for track_id in track_ids:
            try:
                track = sp.track(track_id)
                track_data = {
                    "id": track["id"],
                    "name": track["name"],
                    "artists": [{"name": artist["name"], "id": artist["id"]} for artist in track["artists"]],
                    "album": {
                        "name": track["album"]["name"],
                        "images": track["album"]["images"] if track["album"]["images"] else []
                    }
                }
                tracks_data.append(track_data)
                print(f"✓ Extracted metadata for: {track['name']} by {track['artists'][0]['name']}")
            except Exception as e:
                print(f"✗ Failed to get metadata for track ID {track_id}: {e}")
        
        # Create the metadata structure expected by the app
        metadata = {
            "tracks": {
                "items": tracks_data
            }
        }
        
        # Save to JSON file
        with open('spotify_metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Metadata saved to spotify_metadata.json")
        print(f"Found {len(tracks_data)} tracks")
        
        # Display the metadata
        print("\n--- Extracted Metadata ---")
        for track in tracks_data:
            print(f"Title: {track['name']}")
            print(f"Artist: {track['artists'][0]['name']}")
            print(f"Album: {track['album']['name']}")
            if track['album']['images']:
                print(f"Cover Art: {track['album']['images'][0]['url']}")
            print("---")
            
    except Exception as e:
        print(f"Error accessing Spotify API: {e}")
        print("Note: This might require Spotify API credentials for full access")

if __name__ == "__main__":
    # The track URLs provided
    track_urls = [
        "https://open.spotify.com/track/1Iq8oo9XkmmvCQiGOfORiz?si=s6zSs5RpTjy_ORuDutyHtQ",
        "https://open.spotify.com/track/2vPMoMDXxu9uX1igWZmXSG?si=hiXSp4-qS-25j_XV1oCHQQ"
    ]
    
    print("Extracting Spotify metadata...")
    get_spotify_metadata(track_urls)
