export class DataCSV {

    public static convertToArray(data :string, separator :string = ',', skipHeader :boolean = false) :Array<Array<string>>{
        const arr = 
        data.slice(skipHeader ? data.indexOf('\n') + 1 : 0)
        .split('\n')
        .map(row => row.split(separator)
                    .map(col => this.cleanValue(col))
        );
        arr.pop();
        return arr;
    }

    private static cleanValue(value: string) {
        let newValue: string = ""
        for (let index = 0; index < value.length; index++) {
            if (value.charCodeAt(index) != 13)
                newValue += value[index]
        }
        return newValue.trim();
    }

}