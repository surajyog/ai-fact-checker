import express from 'express';
import helmet from 'helmet';
import { join } from 'path';

const app = express();
const distPath = join(process.cwd(), 'dist');

// Required for GitNexus iframe embedding
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
}));

// Serve pre-built React SPA static assets
app.use(express.static(distPath, { extensions: ['html'] }));

// SPA fallback — use app.use() with no route to avoid path-to-regexp wildcard issues
app.use((req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

// Port 8080 required by gitnexus-bundler / WebContainer
app.listen(8080, '0.0.0.0', () => {
    console.log('✅ FactChecker running at http://localhost:8080');
});
