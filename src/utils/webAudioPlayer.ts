export class WebAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private onProgressUpdate?: (position: number, duration: number) => void;
  private onStateChange?: (playing: boolean) => void;
  private progressInterval: NodeJS.Timeout | null = null;

  async setupPlayer() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => this.handleTrackEnd());
      this.audio.addEventListener('play', () => this.updateState(true));
      this.audio.addEventListener('pause', () => this.updateState(false));
      this.audio.addEventListener('loadedmetadata', () => this.startProgressTracking());
    }
  }

  async play(url: string, trackId: string) {
    if (!this.audio) await this.setupPlayer();
    
    if (this.currentTrackId !== trackId) {
      this.audio!.src = url;
      this.currentTrackId = trackId;
    }
    
    await this.audio!.play();
    this.startProgressTracking();
  }

  async pause() {
    this.audio?.pause();
  }

  async resume() {
    await this.audio?.play();
  }

  async seekTo(position: number) {
    if (this.audio) {
      this.audio.currentTime = position;
    }
  }

  async setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume(): number {
    return this.audio?.volume || 1;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  getPosition(): number {
    return this.audio?.currentTime || 0;
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  setOnProgressUpdate(callback: (position: number, duration: number) => void) {
    this.onProgressUpdate = callback;
  }

  setOnStateChange(callback: (playing: boolean) => void) {
    this.onStateChange = callback;
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (this.audio && this.onProgressUpdate) {
        this.onProgressUpdate(this.audio.currentTime, this.audio.duration);
      }
    }, 250);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private updateState(playing: boolean) {
    this.onStateChange?.(playing);
    if (!playing) {
      this.stopProgressTracking();
    }
  }

  private handleTrackEnd() {
    this.updateState(false);
    // Could emit an event for track end to handle next track
  }

  destroy() {
    this.stopProgressTracking();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}

export const webAudioPlayer = new WebAudioPlayer();