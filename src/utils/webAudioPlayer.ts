export class WebAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private onProgressUpdate: ((position: number, duration: number) => void) | null = null;
  private onStateChange: ((isPlaying: boolean) => void) | null = null;
  private onTrackEnded: (() => void) | null = null;
  private progressInterval: NodeJS.Timeout | null = null;

  async setupPlayer() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => this.handleTrackEnd());
      this.audio.addEventListener('play', () => this.updateState(true));
      this.audio.addEventListener('pause', () => this.updateState(false));
      this.audio.addEventListener('loadedmetadata', () => this.startProgressTracking());
      
      // Restore saved volume
      const savedVolume = localStorage.getItem('musicPlayerVolume');
      if (savedVolume) {
        this.audio.volume = parseFloat(savedVolume);
      }
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
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audio.volume = clampedVolume;
      localStorage.setItem('musicPlayerVolume', clampedVolume.toString());
    }
  }

  getVolume(): number {
    if (this.audio) {
      return this.audio.volume;
    }
    // Return saved volume or default
    const savedVolume = localStorage.getItem('musicPlayerVolume');
    return savedVolume ? parseFloat(savedVolume) : 1;
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

  setOnStateChange(callback: (isPlaying: boolean) => void) {
    this.onStateChange = callback;
  }

  setOnTrackEnded(callback: () => void) {
    this.onTrackEnded = callback;
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
    this.onTrackEnded?.();
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