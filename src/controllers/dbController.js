import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

import deviceModel from '../Models/device.js';
import sensorModel from '../Models/sensor.js';
import lcdModel from '../Models/lcd.js';
import userModel from '../Models/user.js';

const salt = 10

const dbController = {
    async init() {
        try {
            await mongoose.connect(process.env.uri);
            console.log("Database connected successfully");
        } catch (error) {
            console.error("Error connecting to database:", error);
        }
    },

    async fetchData() {
        const devices = await deviceModel.find();
        const sensors = await sensorModel.find();
        const lcd = await lcdModel.find();
        return { devices, sensors, lcd };
    },

    async saveData(data) {
        try {
            for (const key in data.devices) {
                let value = data.devices[key];
                // Directly await each update with upsert
                await deviceModel.findOneAndUpdate(
                    { name: key },
                    { $set: { status: value } },
                    { upsert: true }
                );
            }

            for (const key in data.sensors) {
                let value = data.sensors[key];
                // Directly await each update with upsert
                await sensorModel.findOneAndUpdate(
                    { name: key },
                    { $set: { value: value } },
                    { upsert: true }
                );
            }

            console.log('Arduino data updated in the database.');
        } catch (error) {
            console.error('Error updating Arduino data:', error);
        }
    },

    test: asyncHandler(async (req, res, next) => {
        const data = await deviceModel.find();
        res.send(data);
    }),

    setData: asyncHandler(async (req, res, next) => {
        const key = req.params.device;
        const newStatus = req.body.command == 1 ? true : false;
        const existingDevice = await deviceModel.findOne({ name: key });

        if (existingDevice) {
            const updatedDevice = await deviceModel.findOneAndUpdate(
                { name: key },
                { $set: { status: newStatus } },
                { new: true } // Return the updated document
            );
            next();
        } else {
            // res.status(404).json({ error: 'Device not found.' });
        }
    }),

    insertMessage: asyncHandler(async (req, res, next) => {
        // Find the LCD document
        const lcd = await lcdModel.findOne();

        // If the LCD document exists
        if (lcd) {
            let updatedMessages;

            // If the messages array already has 10 messages, remove the oldest one
            if (lcd.messages.length >= 10) {
                updatedMessages = lcd.messages.slice(1); // Remove the first (oldest) message
            } else {
                updatedMessages = lcd.messages; // Copy the existing messages
            }

            // Add the new message to the end of the messages array
            updatedMessages.push(req.body.message);

            // Update the LCD document with the new messages array
            await lcdModel.findOneAndUpdate({ name: lcd.name }, { messages: updatedMessages });

            console.log('LCD document updated with the new message.');
        } else {
            console.error('LCD document not found.');
        }
        next();
    }),

    login: asyncHandler(async (req, res) => {
        const data = await userModel.findOne({ username: req.body.username})

        if (data == null) {
            return res.status(401).json({ message: 'username doesnt exist' });
        }
        const match = await bcrypt.compare(req.body.password, data.password)

        if (!match) {
            return res.status(401).json({ message: 'Wrong username of password' });
        }

        const token = jwt.sign({username: req.body.username}, process.env.secret_key, {expiresIn: '1h'})

        res.json({token}) // send the token the client
    }),


    register: asyncHandler(async (req, res) => {
        try {
            const data = await userModel.findOne({ username: req.body.username })
            if (data) {
                return res.status(400).json({ message: 'user already exists' });
            }
            
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            
            const newUser = {
                "username": req.body.username,
                "password": hashedPassword
            }
            
            console.log(newUser);
            await userModel.create(newUser)
                .then((data) => {
                    res.status(200).json(data)
                }).catch((err) => {
                    console.log(err)
                    res.status(401).json({ message: err });
                })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }),
};

export default dbController

