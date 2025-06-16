import { Client } from './Client.js'
import { useDispatch, useSelector } from 'react-redux';
import themeConfig from '../src/theme.config';


export const RegisterUser = async (data) => {
    try {
        const apiURL = themeConfig?.apiURL;
        return await Client.post(themeConfig?.apiURL+"auth/register", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const LoginUser = async (data) => {
    try {
        const apiURL = themeConfig?.apiURL;
        return await Client.post(themeConfig?.apiURL+"auth/login", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const LoginOTPUser = async (data) => {
    try {
        const apiURL = themeConfig?.apiURL;
        return await Client.post(themeConfig?.apiURL+"auth/otp_login_verify", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}


export const OtpLoginUser = async (data) => {
    try {
        const apiURL = themeConfig?.apiURL;
        return await Client.post(themeConfig?.apiURL+"auth/otp_login_verify", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const LoginPatient = async (data) => {
    try {
        return await Client.post(themeConfig?.apiURL+"auth/patient_login", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const PasswordForgot = async (data) => {
    try {
        return await Client.post(themeConfig?.apiURL+"auth/forgot_password", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const PasswordReset = async (data, token) => {
    try {
        return await Client.post(themeConfig?.apiURL+"auth/reset_password/"+token, data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const Dashboard = async (data) => {
    try {
        return await Client.get('/api/dashboard/'+data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const PatientCreate = async (data) => {
    try {
        return await Client.post(themeConfig?.apiURL+"create_patient", data)
    } catch (e) {
        console.error(e);
        return e;
    }
}

export const LoginWithID = async (data) => {
    try {
        return await Client.post(themeConfig?.apiURL+"emr_user_login", data)
    } catch (e) {
        console.error(e);
        return e;
    }
}


export const GetOldEMRroute = async (data) => {
    try {
        return await Client.post("/api/emrv3_auth", data);
    } catch (e) {
        console.error(e);
        return e;
    }
}

