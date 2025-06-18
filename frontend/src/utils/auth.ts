export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getAuthToken = (): string | null => {
    const token = localStorage.getItem('token');
    return token;
};