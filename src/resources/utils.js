export const range = (start,end,step=1) => {
    const data = []
    for(let i = start; i < end ; i+=step){
        data.push(i)
    }
    return data
}

export const extract = (fn) => typeof fn === "function" ? fn() : fn

export const rangeOf = (n,value=0) => range(0,n).map(() => extract(value));