import fs from 'fs';
import fetch from "node-fetch";
import Jimp = require('jimp');
import { NextFunction, Request, Response } from "express";
import { config } from "../config";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

// validate url
// helper function to check whether the url valid or not
export async function checkURL(url: string) {
    const endpoint = new URL(url);
    const response = await fetch(endpoint);
    const supportedFormat = ['jpg', 'jpeg', 'png'];
    const [type, format] = response.headers.get('content-type').split('/');
    const validType = supportedFormat.find(f => f === format);
    if (!response.ok) throw new Error("Invalid URL");
    if (!validType) throw new Error(`Only support file type: ${supportedFormat.join(', ')}.`)
    return true;
}

// Validate token
// helper function to verify JWT token
export async function verifyToken(token: string) {
    const endpoint = config.auth_verify_endpoint;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
    };
    const method = 'GET'
    const response = await fetch(endpoint, { method, headers });

    if (!response.ok) throw new Error('Failed to authenticate.');

    const data = await response.json();

    if(!data.auth) throw new Error('Failed to authenticate.');

    return true
}