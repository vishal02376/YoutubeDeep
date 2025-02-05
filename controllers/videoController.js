const youtubedl = require('youtube-dl-exec');
const path = require('path');

const INSTAGRAM_COOKIES_PATH = path.join(__dirname, 'cookies.txt');

const getProgress = (req, res) => {
    const { videoLink, format = 'mp4' } = req.query;

    if (!videoLink) {
        return res.status(400).json({ error: "Video link is required" });
    }

    const isValidLink = videoLink.includes('youtube.com') || videoLink.includes('youtu.be') || videoLink.includes('instagram.com');
    if (!isValidLink) {
        return res.status(400).json({ error: "Invalid or unsupported video link" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const process = youtubedl.exec(videoLink, {
        format: format === 'mp3' ? 'bestaudio' : 'best',
        output: '-',
        quiet: true,
        noWarnings: true,
        cookies: INSTAGRAM_COOKIES_PATH // ✅ Using cookies
    });

    process.stderr.on('data', (data) => {
        const progressMatch = data.toString().match(/\[download\]\s+(\d+\.\d+)%/);
        if (progressMatch) {
            res.write(`data: ${JSON.stringify({ progress: parseFloat(progressMatch[1]) })}\n\n`);
        }
    });

    process.on('error', () => {
        res.write(`data: ${JSON.stringify({ error: "Failed to process the request" })}\n\n`);
        res.end();
    });

    process.on('close', (code) => {
        res.write(`data: ${JSON.stringify({ completed: code === 0 })}\n\n`);
        res.end();
    });
};

const downloadVideo = (req, res) => {
    const { videoLink, format = 'mp4' } = req.query;

    if (!videoLink) {
        return res.status(400).json({ error: "Video link is required" });
    }

    const isValidLink = videoLink.includes('youtube.com') || videoLink.includes('youtu.be') || videoLink.includes('instagram.com');
    if (!isValidLink) {
        return res.status(400).json({ error: "Invalid or unsupported video link" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="video.${format}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    const process = youtubedl.exec(videoLink, {
        format: format === 'mp3' ? 'bestaudio' : 'best',
        output: '-',
        quiet: true,
        noWarnings: true,
        cookies: INSTAGRAM_COOKIES_PATH // ✅ Using cookies
    });

    process.stdout.pipe(res);

    process.on('error', () => {
        res.status(500).json({ error: "Failed to process the request" });
    });

    process.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: "Download failed" });
        }
    });
};

module.exports = { downloadVideo, getProgress };
