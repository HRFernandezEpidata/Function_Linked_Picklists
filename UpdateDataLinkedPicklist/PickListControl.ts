export interface ControlData {
    controlName :string
    valuesOrganization :OrganizationData,
    valuesProjects :Array<ProjectsData>
}

export interface OrganizationData {
    values :Array<Array<string>>;
    lastModified :Date;
}

export interface ProjectsData {
    projectName :string;
    values :Array<Array<string>>;
    lastModified :Date;
}

export class PickListValuesOrganization {

    private values :Array<Array<string>>;
    private lastModified :Date;

    constructor(values :Array<Array<string>>, lastModified :Date) {
        if(values == null || values == undefined || values.length == 0)
            throw new Error('Array of values ​​cannot be null, undefined or empty.');
            
        this.values = values;
        this.lastModified = lastModified;
    }

    public getValues() :Array<Array<string>> {
        return this.values;
    }

    public setValues(values :Array<Array<string>>) :void {
        this.values = values;
    }

    public getLastModified() :Date {
        return this.lastModified;
    }

    public setLastModified(lastModified :Date) :void {
        this.lastModified = lastModified;
    }

    public getDataObject() :OrganizationData {
        return {
            values: this.values,
            lastModified: this.lastModified
        };
    }

    public static createFromObject(OrganizationData :OrganizationData) :PickListValuesOrganization {
        if (OrganizationData == undefined)
            return undefined;
        const values = OrganizationData.values;
        const lastModified = new Date(OrganizationData.lastModified);
        return new PickListValuesOrganization(values, lastModified);
    }
}

export class PickListValuesProject {

    private projectName :string;
    private values :Array<Array<string>>;
    private lastModified :Date;

    constructor(projectName :string, values :Array<Array<string>>, lastModified :Date) {
        if (projectName == null || projectName == undefined || projectName.length == 0)
            throw new Error('Project name ​​cannot be null, undefined or empty.');
        if (values == null || values == undefined || values.length == 0)
            throw new Error('Array of values ​​cannot be null, undefined or empty.');

        this.projectName = projectName;
        this.values = values;
        this.lastModified = lastModified;
    }

    public getProjectName() :string {
        return this.projectName;
    }

    public setProjectName(projectName :string) :void {
        this.projectName = projectName;
    }

    public getValues() :Array<Array<string>> {
        return this.values;
    }

    public setValues(values :Array<Array<string>>) :void {
        this.values = values;
    }

    public getLastModified() :Date {
        return this.lastModified;
    }

    public setLastModified(lastModified :Date) :void {
        this.lastModified = lastModified;
    }

    public getDataObject() :ProjectsData {
        return {
            projectName: this.projectName,
            values: this.values,
            lastModified : this.lastModified
        };
    }

    public static createFromObject(projectData :ProjectsData) :PickListValuesProject {
        const projectName = projectData.projectName;
        const values = projectData.values;
        const lastModified = new Date(projectData.lastModified);
        return new PickListValuesProject(projectName, values, lastModified);
    }

}

export class PickListControl {

    private controlName :string;
    private valuesOrganization :PickListValuesOrganization;
    private valuesProjects :Array<PickListValuesProject>;

    constructor(controlName :string) {
        this.controlName = controlName;
        this.valuesOrganization = undefined;
        this.valuesProjects = new Array<PickListValuesProject>();
    }

    public add(valuesProject :PickListValuesProject) {
        const i = this.valuesProjects.findIndex(vp => vp.getProjectName() == valuesProject.getProjectName());
        
        if (i != -1) 
            this.valuesProjects[i] = valuesProject;
        else 
            this.valuesProjects.push(valuesProject);
    }

    public delete(projName :string) {
        const i = this.valuesProjects.findIndex(vp => vp.getProjectName() == projName);
        if (i != -1) 
            this.valuesProjects.splice(i,1);
    }

    public getValuesProject(projName :string) :PickListValuesProject {
        return this.valuesProjects.find(vp => vp.getProjectName() == projName);
    }

    public getName() :string {
        return this.controlName;
    }

    public setName(controlName :string) :void {
        this.controlName = controlName;
    }

    public getValuesOrganization() :PickListValuesOrganization {
        return this.valuesOrganization;
    }

    public setValuesOrganization(valuesOrganization :PickListValuesOrganization) :void {
        if (valuesOrganization == null)
            valuesOrganization = undefined;
        this.valuesOrganization = valuesOrganization;
    }

    public getValuesProjects() :Array<PickListValuesProject> {
        return this.valuesProjects;
    }

    public setValuesProjects(valuesProjects :Array<PickListValuesProject>) :void {
        if (valuesProjects == null || valuesProjects == undefined)
            valuesProjects = new Array<PickListValuesProject>();
        this.valuesProjects = valuesProjects;
    }

    public getDataObject() :ControlData {
        return {
            controlName: this.controlName,
            valuesOrganization: this.valuesOrganization == undefined ? undefined : this.valuesOrganization.getDataObject(),
            valuesProjects: this.valuesProjects == undefined ? undefined : this.valuesProjects.map(vp => vp.getDataObject())
        }
    }

    public static createFromObject(controlData :ControlData) :PickListControl {
        const controlName :string = controlData.controlName;
        const valuesOrganization :PickListValuesOrganization = PickListValuesOrganization.createFromObject(controlData.valuesOrganization);
        const valuesProjects :Array<PickListValuesProject> = controlData.valuesProjects
        .map(vp => PickListValuesProject.createFromObject(vp));

        const pickListControl :PickListControl = new PickListControl(controlName);
        pickListControl.setValuesOrganization(valuesOrganization);
        pickListControl.setValuesProjects(valuesProjects);

        return pickListControl
    }
}