import express, { request, response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';

import * as Validation from './validations/validation.js';

import checkAuth from './utils/checkAuth.js';

import * as UserController from './controllers/UserController.js'
import * as PostController from './controllers/PostController.js'
import { validationResult } from 'express-validator';
import handleValidationErrors from './utils/handleValidationErrors.js';

dotenv.config();

mongoose
    .connect(process.env.DB_CONNECTION)
    .then(() => console.log('Database OK'))
    .catch((err) => console.log('Database error ', err));

const app = express();
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    }
  });

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.get('/', (request, response) => {
    response.send('Hello world');
});

app.get('/auth/me', checkAuth, UserController.getMe);
app.post('/auth/login', Validation.loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', Validation.registerValidation, handleValidationErrors, UserController.register);

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.post('/auth/edit-avatar', checkAuth, UserController.editAvatar);

app.get('/posts', PostController.index);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.show);
app.post('/posts', checkAuth, Validation.postCreateValidation, PostController.create);
app.patch('/posts/:id', checkAuth, Validation.postCreateValidation, PostController.update);
app.delete('/posts/:id', checkAuth, PostController.remove);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
});