import fetch from 'cross-fetch';
import { ControlData, PickListControl } from './PickListControl';
import { pat, urlExtensionData, idDocument } from './vars';

export class ExtensionDataError extends Error {

    private status :number;
    private statusText :string;

    constructor(status :number, statusText :string, message :string) {
        super(message);
        this.name = 'ExtensionDataError';
        this.status = status;
        this.statusText = statusText;
    }

}

export class ExtensionData {

    public static async getControls() :Promise<Array<PickListControl>> {

        const response = await fetch(urlExtensionData, {
            method: 'GET',
            headers: {
            'Authorization': 'Basic ' + pat
            }
        });
        
        const controls :Array<PickListControl> = new Array<PickListControl>();
        
        if (response.status == 203) 
            throw new ExtensionDataError(203, response.statusText, "Error updating extension data in azure devops. Verify that the PAT is valid.");

        if (response.status == 200) {
            const documents = await response.json();

            const document = documents.value.find(d => d.id == idDocument);
        
            if (document != undefined) {
                const controlsData :Array<ControlData> = document.value;
                controlsData.forEach(data => controls.push(PickListControl.createFromObject(data)));
            }
        }
    
        return controls;
    }

    public static async saveControls(controls :Array<PickListControl>) {
        const body = {
            id: idDocument,
            __etag: -1,
            value: controls
        }

        const response = await fetch(urlExtensionData, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + pat,
                'Accept': 'application/json;api-version=3.1-preview.1;excludeUrls=true',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        return {
            status: response.status,
            statusText: response.statusText
        };
    }

}