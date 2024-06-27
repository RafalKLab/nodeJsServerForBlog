import { request, response } from 'express';
import Post from '../models/Post.js';
import PostModel from '../models/Post.js';

import { validationResult } from 'express-validator';

export const index = async (request, response) => {
    try {
        const posts = await PostModel.find().populate('user', 'fullName email avatarUrl').exec();
      
        // response.json(posts);

        // Introduce a delay of 2 seconds before sending the response
        setTimeout(() => {
            response.json(posts);
        }, 2000);

    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Server error',
        });
    }
}

export const getLastTags = async (request, response) => {
    try {
        const posts = await PostModel.find().limit(5).exec();
        
        const tags = posts.map(obj => obj.tags).flat().slice(0,5);
        
        // response.json(tags);

        // Introduce a delay of 2 seconds before sending the response
        setTimeout(() => {
            response.json(tags);
        }, 1000);

    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Server error',
        });
    }
}

export const show = async (request, response) => {
    try {
        const postId = request.params.id;
        
        const Post = await PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { viewCount: 1 } },
            { returnDocument: 'after' }
        ).populate('user', 'email fullName avatarUrl').exec();
    
        if (!Post) {
            return response.status(404).json({ message: 'Post not found!' });
        }
    
        response.json(Post);
    } catch (err) {
        console.log(err);
        response.status(500).json({
            message: 'Server error',
        });
    }
}

export const create = async (request, response) => {
    const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json(errors.array());
        }

    try {
        const document = new PostModel({
            title: request.body.title,
            content: request.body.content,
            imageUrl: request.body.imageUrl,
            tags: request.body.tags,
            user: request.userId,
        });

        const post = await document.save();

        response.json(post);
    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Post creation unsuccessful!',
        });
    }
}

export const update = async (request, response) => {
    const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json(errors.array());
        }

    try {
        const postId = request.params.id;
        await PostModel.updateOne(
            {
                _id: postId,
            },
            {
                title: request.body.title,
                content: request.body.content,
                imageUrl: request.body.imageUrl,
                tags: request.body.tags,
                user: request.userId,
            },
        );

        response.json({
            success: true,
        });

    } catch (err) {
        console.log(err);
        response.status(500).json({
            'message': 'Post creation unsuccessful!',
        });
    }
}

export const remove = async (request, response) => {
    try {
        const postId = request.params.id;
        
        const post = await PostModel.findById(postId);
        if (!post) {
            return response.status(404).json({
                message: 'Post not found!',
            });
        }

        if (request.userId !== post.user.toString()) {
            return response.status(403).json({
                message: 'Access denied!',
            });
        }

        await post.deleteOne();

        response.json({ message: 'Post deleted successfully' });

    } catch (err) {
        console.log(err);
        response.status(500).json({
            message: 'Server error',
        });
    }
}