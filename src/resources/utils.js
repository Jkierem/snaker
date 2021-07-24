export const range = (start,end,step=1) => {
    const data = []
    for(let i = start; i < end ; i+=step){
        data.push(i)
    }
    return data
}