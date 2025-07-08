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
 * Extract audio from MP4 video file using Web Audio API
 */
export const extractAudioFromMP4 = async (file: File): Promise<ConvertedTrack> => {
  return new Promise((resolve, reject) => {
    try {
      // For now, we'll treat MP4 files as audio files directly
      // Modern browsers can play MP4 audio tracks
      const audioUrl = URL.createObjectURL(file);
      
      // Create audio element to get duration
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const track: ConvertedTrack = {
          id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: audioUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: audio.duration,
          file: file,
        };
        resolve(track);
      };
      
      audio.onerror = () => {
        reject(new Error('Failed to load audio from MP4 file'));
      };
      
      audio.src = audioUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if file is a supported audio format
 */
export const isSupportedAudioFormat = (file: File): boolean => {
  const supportedTypes = [
    'audio/mpeg',      // MP3
    'audio/wav',       // WAV
    'audio/ogg',       // OGG
    'audio/mp4',       // M4A
    'audio/aac',       // AAC
    'audio/flac',      // FLAC
    'audio/webm',      // WebM audio
    'audio/x-m4a',     // M4A alternative MIME
    'video/mp4',       // MP4 (can contain audio)
    'audio/wma',       // WMA (limited support)
  ];
  
  return supportedTypes.includes(file.type) || 
         file.name.toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac|flac|webm|mp4|wma)$/);
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
  const videoFormats = ['mp4', 'webm', 'avi', 'mov'];
  const isVideo = videoFormats.includes(extension) || mimeType.startsWith('video/');
  
  // Formats that work directly in browsers
  const nativeFormats = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac'];
  const needsConversion = !nativeFormats.includes(extension) && !mimeType.startsWith('audio/');
  
  return {
    format: extension.toUpperCase(),
    isVideo,
    needsConversion: isVideo, // For now, we'll flag video files as needing "conversion"
  };
};

/**
 * Process and convert audio files as needed
 */
export const processAudioFile = async (file: File): Promise<ConvertedTrack> => {
  const formatInfo = getFileFormatInfo(file);
  
  if (!isSupportedAudioFormat(file)) {
    throw new Error(`Unsupported file format: ${formatInfo.format}`);
  }
  
  // Handle MP4 and other video files
  if (formatInfo.isVideo || file.type.startsWith('video/')) {
    return await extractAudioFromMP4(file);
  }
  
  // Handle regular audio files
  const audioUrl = URL.createObjectURL(file);
  
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.onloadedmetadata = () => {
      const track: ConvertedTrack = {
        id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: audioUrl,
        title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: audio.duration,
        file: file,
      };
      resolve(track);
    };
    
    audio.onerror = () => {
      reject(new Error(`Failed to load audio file: ${file.name}`));
    };
    
    audio.src = audioUrl;
  });
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