
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const {v4} = require('uuid')
const Image = require('../models/Image');

const keyFilename = path.join(__dirname, '../../config/serviceAccountKey.json');

const storageClient = new Storage({
    projectId: "shop24h-7d406",
    keyFilename: keyFilename, // Replace with the path to your service account keyfile
});

const bucketName = "shop24h-7d406.appspot.com";

const createNewImageUrl =  async (req, res) => {
    try {
        // Get the uploaded file
        const file = req.file;
        const isExistImg = await Image.findOne({ originalname: file.originalname });
        if (isExistImg) {
            return res.status(200).json(isExistImg.imageUrl)
        }
        // Generate a unique filename and save in folder images
        const uniqueFilename = `images/${file.originalname.split('.')[0]}_${v4()}${path.extname(file.originalname)}`;

        // Upload the file to Firebase Storage
        const bucket = storageClient.bucket(bucketName);
        const blob = bucket.file(uniqueFilename);
        const blobStream = blob.createWriteStream();
        blobStream.on("error", (err) => {
            console.error(err);
            res.status(500).send("Failed to upload file");
        });
        blobStream.on("finish", async () => {
            try {
                // Get the download URL from Firebase
                const [url] = await blob.getSignedUrl({
                    action: 'read',
                    expires: '03-17-2025'
                });
                const image = await Image.create({ originalname: file.originalname, imageUrl: url })
                image.save()

                // Return the download URL to the client
                res.status(200).json(url);
            } catch (err) {
                console.error(err);
                res.status(500).send("Failed to upload file");
            }
        });
        blobStream.end(file.buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to upload file");
    }
}


module.exports = { createNewImageUrl }