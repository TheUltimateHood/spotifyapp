
import json
import re

def extract_track_id(spotify_url):
    """Extract track ID from Spotify URL"""
    match = re.search(r'/track/([a-zA-Z0-9]+)', spotify_url)
    return match.group(1) if match else None

def create_mock_spotify_metadata(track_urls):
    """Create mock metadata for Spotify tracks for testing purposes"""
    
    # Mock data for the specific tracks provided
    mock_tracks_data = {
        "1Iq8oo9XkmmvCQiGOfORiz": {
            "id": "1Iq8oo9XkmmvCQiGOfORiz",
            "name": "Shape of You",
            "artists": [{"name": "Ed Sheeran", "id": "6eUKZXaKkcviH0Ku9w2n3V"}],
            "album": {
                "name": "÷ (Divide)",
                "images": [
                    {
                        "url": "https://i.scdn.co/image/ab67616d0000b2734782d57b5b8a1b8346d1ad45",
                        "height": 640,
                        "width": 640
                    },
                    {
                        "url": "https://i.scdn.co/image/ab67616d00001e024782d57b5b8a1b8346d1ad45",
                        "height": 300,
                        "width": 300
                    }
                ]
            }
        },
        "2vPMoMDXxu9uX1igWZmXSG": {
            "id": "2vPMoMDXxu9uX1igWZmXSG",
            "name": "Blinding Lights",
            "artists": [{"name": "The Weeknd", "id": "1Xyo4u8uXC1ZmMpatF05PJ"}],
            "album": {
                "name": "After Hours",
                "images": [
                    {
                        "url": "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
                        "height": 640,
                        "width": 640
                    },
                    {
                        "url": "https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36",
                        "height": 300,
                        "width": 300
                    }
                ]
            }
        }
    }
    
    track_ids = []
    for url in track_urls:
        track_id = extract_track_id(url)
        if track_id:
            track_ids.append(track_id)
    
    if not track_ids:
        print("No valid track IDs found")
        return
    
    # Create tracks data based on extracted IDs
    tracks_data = []
    for track_id in track_ids:
        if track_id in mock_tracks_data:
            track_data = mock_tracks_data[track_id]
            tracks_data.append(track_data)
            print(f"✓ Created mock metadata for: {track_data['name']} by {track_data['artists'][0]['name']}")
        else:
            # Generic mock data for unknown track IDs
            track_data = {
                "id": track_id,
                "name": f"Unknown Track {track_id[:8]}",
                "artists": [{"name": "Unknown Artist", "id": "unknown"}],
                "album": {
                    "name": "Unknown Album",
                    "images": [
                        {
                            "url": "https://via.placeholder.com/640x640/1db954/ffffff?text=No+Cover",
                            "height": 640,
                            "width": 640
                        }
                    ]
                }
            }
            tracks_data.append(track_data)
            print(f"✓ Created generic mock metadata for track ID: {track_id}")
    
    # Create the metadata structure expected by the app
    metadata = {
        "tracks": {
            "items": tracks_data
        }
    }
    
    # Save to JSON file
    with open('spotify_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Mock metadata saved to spotify_metadata.json")
    print(f"Found {len(tracks_data)} tracks")
    
    # Display the metadata
    print("\n--- Mock Extracted Metadata ---")
    for track in tracks_data:
        print(f"Title: {track['name']}")
        print(f"Artist: {track['artists'][0]['name']}")
        print(f"Album: {track['album']['name']}")
        if track['album']['images']:
            print(f"Cover Art: {track['album']['images'][0]['url']}")
        print("---")

if __name__ == "__main__":
    # The track URLs provided
    track_urls = [
        "https://open.spotify.com/track/1Iq8oo9XkmmvCQiGOfORiz?si=s6zSs5RpTjy_ORuDutyHtQ",
        "https://open.spotify.com/track/2vPMoMDXxu9uX1igWZmXSG?si=hiXSp4-qS-25j_XV1oCHQQ"
    ]
    
    print("Creating mock Spotify metadata for testing...")
    create_mock_spotify_metadata(track_urls)
