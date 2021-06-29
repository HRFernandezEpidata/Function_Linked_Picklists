export const envVariablesNames = [
    'StorageAccount',
    'StorageAccount.FileShare',
    'StorageAccount.SAS',
    'AzureDevops.Organization',
    'AzureDevops.PAT',
    'AzureDevops.Publisher'
];

// Storage Account
const storageAccount :string = process.env['StorageAccount'];
const fileShare :string = process.env['StorageAccount.FileShare'];
const sas = process.env['StorageAccount.SAS'];
const urlStorageAccount = `https://${storageAccount}.file.core.windows.net${sas}`;

export { fileShare, urlStorageAccount };

// Azure DevOps
const org = process.env['AzureDevops.Organization'];
const pat = Buffer.from(':'+process.env['AzureDevops.PAT']).toString('base64');
const publisher = process.env['AzureDevops.Publisher'];
const idDocument = 'linked-picklist.control-values';
const urlExtensionData = 'https://extmgmt.dev.azure.com/'+org+'/_apis/ExtensionManagement/InstalledExtensions/'+publisher+'/linked-picklists/Data/Scopes/User/Me/Collections/%24settings/Documents/';

export { pat, urlExtensionData, idDocument };