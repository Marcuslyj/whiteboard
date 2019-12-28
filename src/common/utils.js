// 深冻结
export function deepFreeze(obj) {
    obj = isObject(obj) ? obj : {}

    let toFreeze = [obj];
    for (let i = 0; i < toFreeze.length; i++) {
        Object.freeze(toFreeze[i]);
        Object.keys(toFreeze[i]).map(key => {
            if (isObject(toFreeze[i][key])) toFreeze.push(toFreeze[i][key])
        })
    }
    return obj
}

// 简单判断是否对象
export function isObject(obj) {
    return typeof obj === 'object' && obj !== null
}

