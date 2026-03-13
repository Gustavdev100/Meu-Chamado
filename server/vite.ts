import { type Express } from "express";
import { type Server } from "http";
import fs from "fs";
import path from "path";

export async function setupVite(_server: Server, app: Express) {
  // Serve static files from client directory
  const clientPath = path.resolve(import.meta.dirname, "..", "client");
  
  app.use("/", (req, res, _next) => {
    // Try to serve the requested file
    let filePath = path.join(clientPath, req.path);
    
    // Handle .css and .js files
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    // Default: serve index.html for all other routes (SPA fallback)
    const indexPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('File not found');
    }
  });
}
