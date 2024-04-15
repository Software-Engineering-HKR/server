import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

import deviceModel from '../Models/device.js';
import sensorModel from '../Models/sensor.js';
import lcdModel from '../Models/lcd.js';
import userModel from '../Models/user.js';

const saltRounds = 10;
let latestStates = {};

const dbController = {
    init: async () => {
        try {
            await mongoose.connect(process.env.uri);
            console.log("Database connected successfully");
        } catch (error) {
            console.error("Error connecting to database:", error);
        }
    },

    fetchData: async () => {
        try {
            const [devices, sensors, lcd] = await Promise.all([
                deviceModel.find(),
                sensorModel.find(),
                lcdModel.find()
            ]);
    
            return { devices, sensors, lcd };
        } catch (err) {
            throw new Error(`Error fetching data: ${err}`);
        }
    },

    saveData: async (data) => {
        try {
            //latest Data == data Then dont save to the database 
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
            throw new Error(`${error.message}`);
        }
    },

    setData: async (device, command) => {
        try {
            const key = device;
            const newStatus = command == 1 ? true : false;
            const existingDevice = await deviceModel.findOne({ name: key });
    
            if (existingDevice) {
                await deviceModel.findOneAndUpdate(
                    { name: key },
                    { $set: { status: newStatus } },
                    { new: true } // Return the updated document
                );
                return
            } else {
                throw new Error(`Device does not exists`);
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    insertMessage: async (message) => {
        try {
            const lcd = await lcdModel.findOne();

            if (lcd) {
                let updatedMessages;

                if (lcd.messages.length >= 10) {
                    updatedMessages = lcd.messages.slice(1); // Remove the first (oldest) message
                } else {
                    updatedMessages = lcd.messages; // Copy the existing messages
                }

                // Add the new message to the end of the messages array
                updatedMessages.push(message);

                // Update the LCD document with the new messages array
                await lcdModel.findOneAndUpdate({ name: lcd.name }, { messages: updatedMessages });

                console.log('LCD document updated with the new message.');
            } else {
                console.error('LCD document not found.');
            }
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    login: async (username, password) => {
        try {
            const data = await userModel.findOne({ username: username });
    
            if (!data) {
                throw new Error('Username does not exist');
            }
    
            const match = await bcrypt.compare(password, data.password);
    
            if (!match) {
                throw new Error('Wrong username or password');
            }
    
            const token = jwt.sign({ username: username }, process.env.secret_key, { expiresIn: '1h' });
    
            return token;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },

    register: async (username, password) => {
        try {
            const data = await userModel.findOne({ username: username });
    
            if (data) {
                throw new Error('User already exists');
            }
    
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            const newUser = {
                username: username,
                password: hashedPassword
            };
    
            await userModel.create(newUser);
            return newUser;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    },
};

export default dbController

