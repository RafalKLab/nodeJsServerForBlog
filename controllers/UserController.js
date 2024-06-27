import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { validationResult } from 'express-validator';

import UserModel from '../models/User.js';
import { request, response } from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const register = async (request, response) => {
    try {
        const password = request.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const document = new UserModel({
            email: request.body.email,
            fullName: request.body.fullName,
            avatarUrl: request.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await document.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
            expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        response.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Registration unsuccessful!',
        });
    }
};

export const login = async (request, response) => {
    try {
        const user = await UserModel.findOne({email: request.body.email});
        if (!user) {
            return response.status(403).json({
                message: "User not found!"
            });
        }

        const isValidPass = await bcrypt.compare(request.body.password, user._doc.passwordHash);
        if(!isValidPass) {
            return response.status(403).json({
                message: "Wrong password!"
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
            expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        response.json({
            ...userData,
            token,
        });

    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Login unsuccessful!',
        });
    }
};

export const getMe = async (request, response) => {
    try {
        const user = await UserModel.findById(request.userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found!"
            });
        }

        const { passwordHash, ...userData } = user._doc;

        response.json(userData);
    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Server error!',
        });
    }
};

export  const editAvatar = async (request, response) => {
    try {
        const user = await UserModel.findById(request.userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found!"
            });
        }

        

        const avatarFile = request.files && request.files.avatar;
        
        if (!avatarFile) {
            return response.status(404).json({
                message: "Avatar file is required!"
            });
        }
        
        if (!avatarFile.mimetype.startsWith('image/')) {
            return response.status(404).json({
                message: "Only images are allowed!"
            });
        }

        
        const uniqueFilename = `avatar_${Date.now()}-${avatarFile.name}`;
        const targetPath = path.join(__dirname, '../uploads', uniqueFilename);

        avatarFile.mv(targetPath, (err) => {
            if (err) {
                return res.status(500).json({
                    error: 'Failed to upload file.'
                });
            }
        });
        const avatarPath = `http://localhost:4444/uploads/${uniqueFilename}`;

        try {
            user.avatarUrl = avatarPath;
            await user.save();

            const { passwordHash, ...userData } = user._doc;

            response.json(userData);
        } catch (err) {
            console.error(err);
            response.status(500).json({
                error: 'Failed to update user avatar!'
            });
        }
    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Server error!',
        });
    }
};