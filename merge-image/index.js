const mergeImages = require('merge-images');
const {Canvas, Image} = require('canvas');
const fs = require("fs");
const sharp = require('sharp');
const express = require('express')
const app = express();
const port = 3000;
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
// enable files upload
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 3 * 1024 * 1024 * 1024 //3MB max file(s) size
    },
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('merged'));
app.use(express.static('static'));


async function resize(images) {
    let resizedImages = [];
    let now = new Date().getTime();
    for (let i = 0; i < images.length; i++) {
        let img = images[i];
        let outPath = './resized/' + now + '-' + i + ".png";
        await sharp(img).resize(280, 600).toFile(outPath)
        resizedImages.push(outPath)
    }
    return resizedImages;
}

async function merge(resizedImages) {
    console.log('start merge')
    let sources = [];
    for (let i = 0; i < resizedImages.length; i++) {
        let obj = {
            src: resizedImages[i],
            x: (i % 3) * 280,
            y: Math.floor(i / 3) * 600
        };
        sources.push(obj);
    }

    let b64 = await mergeImages(sources, {
        Canvas: Canvas,
        Image: Image,
        width: 840,
        height: Math.ceil(resizedImages.length / 3) * 600
    });

    const buffer = Buffer.from(b64.substring(b64.indexOf(',')), "base64");
    let mergedImg = './merged/' + new Date().getTime() + ".png";
    fs.writeFileSync(mergedImg, buffer);
    return mergedImg;
}

// resize().then(() => {
//     merge();
// });


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/upload', (req, res) => {
    res.send('Post Hello World')

})

app.post('/upload-photos', async (req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let data = [];

            let photos = req.files.photos.map(photo => photo.data);
            // let photoPaths = [];
            // photos.forEach(photo => {
            //     let p = './uploads/' + photo.name;
            //     await photo.mv(p);
            //     photoPaths.push(p)
            // })
            resize(photos).then(async resizedPhotoPaths => {
                return await merge(resizedPhotoPaths);
            }).then(mergedImg => {
                console.log('merged image', mergedImg);
                res.send({
                    status: true,
                    message: 'Files are uploaded',
                    data: mergedImg.substring(mergedImg.lastIndexOf('/') + 1)
                });
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// resize(images).then((xxx) => console.log('xxxo', xxx))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})