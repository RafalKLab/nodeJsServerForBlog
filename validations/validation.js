import { body } from "express-validator";

export const loginValidation = [
    body('email', 'Wrong email format!').isEmail(),
    body('password', 'Password should have at least 5 characters').isLength({min:5}),
];

export const registerValidation = [
    body('email', 'Wrong email format!').isEmail(),
    body('password', 'Password should have at least 5 characters').isLength({min:5}),
    body('fullName', 'Fullname should have at least 3 characters').isLength({min:3}),
    body('avatarUrl', 'Wrong url format').optional().isURL(),
];

export const postCreateValidation = [
    body('title', 'Title should have 3 characters!').isLength({min:3}).isString(),
    body('content', 'Content should have 3 characters!').isLength({min:10}).isString(),
    body('tags', 'Wrong tag format! (Expected array)').optional().isArray(),
    body('imageUrl', 'Wrong url format').optional().isString(),
];
