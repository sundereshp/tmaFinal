import { Client, ErrorFunction } from './Client.js'

export const GetDashboard = async () => {
    try {
        return {
            data: {
                status: 'success'
            }
        };
    } catch (error) {
        return ErrorFunction(error);
    }
};
