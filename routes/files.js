const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    },
});

// size of file 100mb 
let upload = multer({
    storage, limits: { fileSize: 1000000 * 100 },
}).single('myfile');

router.post('/', (req, res) => {
    // store file 
    upload(req, res, async (err) => {
        // validate request 
        if (!req.file) {
            return res.json({ error: 'All fields are required' });
        }
        if (err) {
            return res.status(500).send({ error: err.message })
        }
        // store into database 
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        res.json({ file: `${process.env.APP_BASE_URL}files/${response.uuid}` });
    });

    // response 
});

router.post('/send',async (req,res)=>{
    const{uuid,emailTo,emailFrom} = req.body;
    // validate request 
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error:'All fields are required except expiry.'});
    }
    // get data from database
    try {
        const file = await File.findOne({uuid:uuid});
        if(file.sender){
            return res.status(422).send({error:'Email already sent once.'});
        }
        file.sender = emailFrom;
        file.receiver = emailTo;
        const response = await file.save();

        // send email 
        const sendEmail = require('../services/mailService');
        sendEmail({
            from:emailFrom,
            to:emailTo,
            subject:'inShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html:require('../services/emailTemplate')({
                emailFrom,
                downloadLink:`${process.env.APP_BASE_URL}files/${file.uuid}?source=email`,
                size: parseInt(file.size/1000) + 'KB',
                expires:'24 hours'
            })
        }).then(() => {
            return res.json({sucess:true});
        }).catch((err) => {
            return res.status(500).json({error: 'Error in email sending.'});
        });
    } catch (error) {
        return res.status(500).send({ error: 'Something went wrong.'});
    }
})
module.exports = router;