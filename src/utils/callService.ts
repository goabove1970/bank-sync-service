import { ServiceConfig } from '@root/app.config';
import * as http from 'http';
import logger from '../logger';
import { inspect } from 'util';
import { RequestBase, ResponseBase } from '../models/RequestBase';


export const callService = (config: ServiceConfig,  routerName: string, rqst: RequestBase): Promise<ResponseBase> => {
    const bodyString = JSON.stringify(rqst);
      const httpOptions = {
        method: 'GET',
        hostname: config.url,
        port: config.port,
        path: routerName,
        headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
        },
    };
  
    let res = new Promise<ResponseBase>((resolve, reject) => {
      const req = http.request(httpOptions, (res) => {
        let buffer: Buffer;
        res.on('data', (chunk: Buffer) => {
          if (!buffer) {
            buffer = chunk;
          } else {
            buffer = Buffer.concat([buffer, chunk]);
          }
        });
  
        res.on('end', () => {
          if (!buffer) {
            return reject(`No data was received from ${routerName}`)
          }
          const results = buffer.toString();
          let data: ResponseBase = {};
          try {
            data = JSON.parse(results) as ResponseBase;
          } catch (err) {
            const message = `Can't process the ${routerName} response.\Response: ${inspect(results)}. \nRequest: ${inspect(rqst)}.\nHHTP Options:${inspect(httpOptions)}`
            console.error(message);
            logger.error(message);
          }
          if (data && data.error) {
            return reject(`Error received from ${routerName}: ${data.error}`)
          }
          resolve(data);
        });
      });
  
      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });
  
      const message = `Sending request to router ${routerName} response.\nRequest: ${bodyString}.\nHHTP Options:${inspect(httpOptions)}`
      console.info(message);
      logger.info(message);
      req.write(bodyString);
      req.end();
    });
    return res;
  }
  