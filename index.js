import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000','https://netrasarthiv1.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Cloudinary configuration
console.log('Configuring Cloudinary...');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    success: true, 
    message: 'Server is running!',
    cloudinary: 'Connected to Cloudinary',
    timestamp: new Date().toISOString()
  });
});

// Get all videos
app.get('/api/cloudinary/videos', async (req, res) => {
  console.log('Fetching videos from Cloudinary...');
  try {
    const result = await cloudinary.search
      .expression('resource_type:video')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();
    
    console.log(`Found ${result.resources.length} videos`);
    
    const videos = result.resources.map(video => ({
      id: video.public_id,
      title: video.context?.custom?.caption || video.public_id.split('/').pop().replace(/_/g, ' '),
      url: video.secure_url,
      thumbnail: video.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill/'),
      public_id: video.public_id,
      created_at: video.created_at,
      duration: video.duration || 0,
      bytes: video.bytes,
      format: video.format
    }));

    res.status(200).json({
      success: true,
      videos: videos
    });
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete a video
app.delete('/api/cloudinary/videos/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    console.log(`Deleting video: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'video' 
    });
    
    console.log('Delete result:', result);
    
    res.status(200).json({ 
      success: true, 
      result 
    });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Videos endpoint: http://localhost:${PORT}/api/cloudinary/videos`);
});