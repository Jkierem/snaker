export function makeId(length) {
    let result = '';
    const dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < length; i++ ) {
        result += dict.charAt(Math.floor(Math.random() * dict.length));
    }
    return result;
}