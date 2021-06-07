import { AzureFunction, Context } from '@azure/functions'
import { RestError, ShareServiceClient } from '@azure/storage-file-share'
import { DataCSV } from './DataCSV';
import { EnviromentVarNotFound } from './EnviromentVarNotFound';
import { ExtensionData, ExtensionDataError } from './ExtensionData';
import { PickListControl, PickListValuesOrganization, PickListValuesProject } from './PickListControl';
import { envVariablesNames, urlStorageAccount, fileShare } from './vars';

const serviceClient = new ShareServiceClient(urlStorageAccount);

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    
    try {
        await checkEnviromentVars();

        const controls :Array<PickListControl> = await ExtensionData.getControls();

        const directoryNames = await getDirectoryNames();

        for (const directory of directoryNames) {
        
            let control: PickListControl = controls.find(c => c.getName() === directory);
            if (control == undefined) {
                control = new PickListControl(directory);
                controls.push(control);
            }

            const fileNames = await getFileNames(directory);

            for (const file of fileNames) {
                
                const fileContent = await getFileContent(directory, file);
                const arrData = DataCSV.convertToArray(fileContent, '¬', false);

                if (file == '__general.csv') {
                    const valuesOrg: PickListValuesOrganization = new PickListValuesOrganization(arrData, new Date(Date.now()));
                    control.setValuesOrganization(valuesOrg);
                }
                else {
                    const projName: string = file.split('.csv')[0];
                    const valuesProj = new PickListValuesProject(projName, arrData, new Date(Date.now()));
                    control.add(valuesProj);
                }
            }
        }

        const response = await ExtensionData.saveControls(controls);
        
        if (response.status == 200) 
            context.log('Extension data updated correctly.');
        else {
            context.log('ExtensionDataResponse: ' + response.status);
            context.log('ExtensionDataResponse: ' + response.statusText);
        }
    } 
    catch (error) {
        if(error instanceof RestError) {
            if (error.code === 'REQUEST_SEND_ERROR') 
                context.log(error.name + ': ' + 'The storage account you are trying to access does not exist or does not have read permissions.');
            else if (error.statusCode == 403 && error.code === 'AuthenticationFailed') 
                context.log(error.name + ': ' + 'The Shared Access Signature is invalid or has expired.');
            else if (error.statusCode == 404 && error.code === 'ShareNotFound') 
                context.log(error.name + ': ' + 'The file share "' + fileShare + '" not exist.');
            else 
                context.log(error.name + ': ' + error.message);
        }
        else if (error instanceof EnviromentVarNotFound) 
            context.log(error.name + ': ' + error.message);
        else if (error instanceof ExtensionDataError) 
            context.log(error.name + ': ' + error.message);
        else 
            context.log('ERROR: ' + error.message);
    }
};

async function checkEnviromentVars() :Promise<void> {
    for (const varName of envVariablesNames) {
        const value = process.env[varName];
        if (value === '' || value == undefined)
            throw new EnviromentVarNotFound('Environment variable "'+varName+'" not found.');
    }
}

async function getDirectoryNames() :Promise<Array<string>> {
    const directoryClient = serviceClient.getShareClient(fileShare).getDirectoryClient('')
    let filesAndDirectories = directoryClient.listFilesAndDirectories();

    const directoryNames :Array<string> = new Array<string>();
    
    for await (const item of filesAndDirectories) {
        if (item.kind === 'directory')
            directoryNames.push(item.name);
    }

    return directoryNames;
}

async function getFileNames(directory :string) :Promise<Array<string>> {
    const directoryClient = serviceClient.getShareClient(fileShare).getDirectoryClient(directory)
    let filesAndDirectories = directoryClient.listFilesAndDirectories();

    const fileNames :Array<string> = new Array<string>();
    
    for await (const item of filesAndDirectories) {
        if (item.kind === 'file')
            fileNames.push(item.name);
    }

    return fileNames;
}

async function getFileContent(directory :string, file :string) :Promise<string> {
    const fileClient = serviceClient.getShareClient(fileShare)
    .rootDirectoryClient.getFileClient(directory + '/' + file);

    const downloadFileResponse = await fileClient.download();

    const fileContent = (await streamToBuffer(downloadFileResponse.readableStreamBody)).toString();
    console.log(fileContent)
    return fileContent;
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

export default timerTrigger;
