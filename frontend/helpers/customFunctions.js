export const get2FACookie = () => {
    let name = '2fa';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null; // Cookie not found
}

export const set2FACookie = () => {
    var currentDate = new Date();
    var expirationDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000));
    var expires = expirationDate.toUTCString();

    document.cookie = "2fa=verified; expires=" + expires + "; path=/";
}