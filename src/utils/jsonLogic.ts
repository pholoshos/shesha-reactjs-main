type NodeCallback = (operator: string, args: object[]) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback) => {
    if (!jsonLogic)
        return;
    for (const operator in jsonLogic){
        const args = jsonLogic[operator];

        callback(operator, args);

        if (Array.isArray(args)){
            args.forEach(arg => {
                if (typeof(arg) === 'object')
                    processRecursive(arg, callback)
            });
        } else
            if (typeof(args) === 'object') // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
                processRecursive(args, callback)
    }
}

export const extractVars = (jsonLogic: object): string[] => {
    const result = [];

    if (jsonLogic)
        processRecursive(jsonLogic, (operator, args) => {
            if (operator === 'var'){
                if (result.indexOf(args) === -1)
                    result.push(args);
            }
        });

    return result;
}