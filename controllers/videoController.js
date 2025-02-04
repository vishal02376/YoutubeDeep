const youtubedl = require('youtube-dl-exec');

const downloadVideo = async (req, res) => {
    try {
        const { videoLink, format = 'mp4' } = req.query;

        if (!videoLink) {
            return res.status(400).json({ error: "Video link is required" });
        }

        // Set the content disposition header for the download
        res.header('Content-Disposition', `attachment; filename="video.${format}"`);

        // Use youtube-dl-exec to download and stream the video
        const process = youtubedl.exec(videoLink, {
            format: format === 'mp3' ? 'bestaudio' : 'best',
            output: '-', // Output to stdout
        });

        // Pipe the output directly to the response
        process.stdout.pipe(res);

        // Handle errors
        process.on('error', (error) => {
            console.error("❌ Error downloading video:", error);
            res.status(500).json({ error: "Failed to process the request" });
        });

        process.stderr.on('data', (data) => {
            console.error("❌ Error:", data.toString());
        });

    } catch (error) {
        console.error("❌ Error downloading video:", error);
        res.status(500).json({ error: "Failed to process the request" });
    }
};

module.exports = { downloadVideo };