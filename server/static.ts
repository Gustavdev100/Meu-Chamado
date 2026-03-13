import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    // On Vercel, static files are served by the CDN, so we don't need to throw.
    // This prevents the Lambda from crashing during initialization.
    console.log(`Static path ${distPath} not found. Assuming Vercel is handling static assets via rewrites.`);
    return;
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
