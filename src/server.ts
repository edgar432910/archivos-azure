import { CronService } from './cron.service';
import { BlobServiceClient } from '@azure/storage-blob';
import * as fs from 'fs';
import * as path from 'path';
import { getCredentials } from './credentials';

const setFiles = async (files: string[], pathUrl: string) => {
    const { azureKey, containerName } = getCredentials()
    const blobService: BlobServiceClient = BlobServiceClient.fromConnectionString(
        azureKey
    );
    const containerClient = blobService.getContainerClient(containerName);
    for (const file of files) {
        const filePath = path.join(pathUrl, file);

        const blockBlobClient = containerClient.getBlockBlobClient(file);

        try {
            const data = fs.readFileSync(filePath);
            console.log({ data })
            await blockBlobClient.upload(data, data.length);
            console.log(`Archivo ${file} subido con éxito.`);
            fs.unlinkSync(filePath); // Eliminar el archivo local después de subirlo
            console.log(`Archivo ${file} eliminado localmente.`);
        } catch (error) {
            console.error(`Error al subir el archivo ${file}: ${error}`);
        }
    }
}

const getFiles = (pathUrl: string) => {
    return fs.readdirSync(pathUrl);


}

export class Server {

    public static async start() {
        try{
            console.log('Server started...');
         
            CronService.createJob(
              '*/9 * * * * *',
              () => {
                console.log('Start to upload to Azure')
                const relativeFolderPath = '../file-server';
                const absoluteFolderPath = path.resolve(__dirname, relativeFolderPath);
                const files = getFiles(absoluteFolderPath);
                setFiles(files, absoluteFolderPath);
              }
            );
        }
       
        catch(error){
            console.log({error})
        }


    }


}