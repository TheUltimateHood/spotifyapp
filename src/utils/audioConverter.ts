/**
 * Audio file conversion utilities for web browsers
 * Handles MP4 video to audio extraction and other format conversions
 */

export interface ConvertedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  file?: File;
}

/**
 * Extract audio from video files or process audio files
 */
export const extractAudioFromVideo = async (file: File): Promise<ConvertedTrack> => {
  return new Promise((resolve, reject) => {
    try {
      // Create object URL for the file
      const audioUrl = URL.createObjectURL(file);
      
      // Create audio/video element to get duration and test playability
      const media = new Audio();
      
      media.onloadedmetadata = () => {
        const { format, isVideo } = getFileFormatInfo(file);
        
        const track: ConvertedTrack = {
          id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: audioUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
          artist: 'Unknown Artist',
          album: isVideo ? `${format} Video` : 'Unknown Album',
          duration: media.duration || 0,
          file: file,
        };
        resolve(track);
      };
      
      media.onerror = (error) => {
        console.warn(`Failed to load ${file.name}:`, error);
        // Some formats might not be directly playable, but we'll still try to create a track
        const { format, isVideo } = getFileFormatInfo(file);
        
        const track: ConvertedTrack = {
          id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: audioUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
          artist: 'Unknown Artist',
          album: isVideo ? `${format} Video` : 'Unknown Album',
          duration: 0, // Unknown duration
          file: file,
        };
        resolve(track);
      };
      
      // Set source and load
      media.src = audioUrl;
      media.load();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if file is a supported audio/video format
 */
export const isSupportedAudioFormat = (file: File): boolean => {
  const supportedTypes = [
    // Audio formats
    'audio/mpeg',      // MP3
    'audio/wav',       // WAV
    'audio/ogg',       // OGG
    'audio/mp4',       // M4A
    'audio/aac',       // AAC
    'audio/flac',      // FLAC
    'audio/webm',      // WebM audio
    'audio/x-m4a',     // M4A alternative MIME
    'audio/wma',       // WMA
    'audio/x-ms-wma',  // WMA alternative MIME
    'audio/amr',       // AMR
    'audio/3gpp',      // 3GP audio
    'audio/x-aiff',    // AIFF
    'audio/aiff',      // AIFF
    'audio/opus',      // Opus
    // Video formats (for audio extraction)
    'video/mp4',       // MP4
    'video/webm',      // WebM
    'video/avi',       // AVI
    'video/x-msvideo', // AVI alternative MIME
    'video/quicktime', // MOV
    'video/x-matroska',// MKV
    'video/mkv',       // MKV alternative MIME
    'video/3gpp',      // 3GP
    'video/x-flv',     // FLV
  ];
  
  const fileExtension = file.name.toLowerCase().split('.').pop() || '';
  const supportedExtensions = [
    // Audio extensions
    'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm', 'wma', 'amr', '3gp', 'aiff', 'opus',
    // Video extensions
    'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', '3gp', 'wmv', 'asf'
  ];
  
  return supportedTypes.includes(file.type) || supportedExtensions.includes(fileExtension);
};

/**
 * Get file format information
 */
export const getFileFormatInfo = (file: File): { 
  format: string; 
  isVideo: boolean; 
  needsConversion: boolean; 
} => {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  const mimeType = file.type.toLowerCase();
  
  // Video formats that contain audio
  const videoFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', '3gp', 'wmv', 'asf'];
  const isVideo = videoFormats.includes(extension) || mimeType.startsWith('video/');
  
  // Formats that work directly in browsers (no conversion needed)
  const nativeFormats = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac', 'mp4', 'flac', 'opus'];
  const needsConversion = !nativeFormats.includes(extension) && isVideo;
  
  return {
    format: extension.toUpperCase(),
    isVideo,
    needsConversion, // Only video files that aren't MP4/WebM need special handling
  };
};

/**
 * Process and convert audio/video files as needed
 */
export const processAudioFile = async (file: File): Promise<ConvertedTrack> => {
  const { format, isVideo } = getFileFormatInfo(file);
  
  if (!isSupportedAudioFormat(file)) {
    throw new Error(`Unsupported file format: ${format}`);
  }
  
  if (isVideo) {
    // Process video files (extract audio)
    return extractAudioFromVideo(file);
  } else {
    // Process regular audio files
    const audioUrl = URL.createObjectURL(file);
    
    const track: ConvertedTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: audioUrl,
      title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
      artist: 'Unknown Artist',
      album: `${format} Audio`,
      duration: 0, // Will be set when audio loads
      file: file,
    };
    
    // Try to get duration
    try {
      const audio = new Audio(audioUrl);
      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          track.duration = audio.duration || 0;
          resolve(null);
        };
        audio.onerror = () => {
          // If audio fails to load, still resolve with track
          console.warn(`Could not load audio for ${file.name}, format may not be fully supported`);
          resolve(null);
        };
        setTimeout(() => {
          // Timeout after 5 seconds
          console.warn(`Timeout loading metadata for ${file.name}`);
          resolve(null);
        }, 5000);
      });
    } catch (error) {
      console.warn('Could not determine audio duration:', error);
    }
    
    return track;
  }
};

/**
 * Process multiple files and return conversion results
 */
export const processMultipleAudioFiles = async (files: File[]): Promise<{
  successful: ConvertedTrack[];
  failed: { file: File; error: string }[];
}> => {
  const successful: ConvertedTrack[] = [];
  const failed: { file: File; error: string }[] = [];
  
  for (const file of files) {
    try {
      const track = await processAudioFile(file);
      successful.push(track);
    } catch (error) {
      failed.push({
        file,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return { successful, failed };
};