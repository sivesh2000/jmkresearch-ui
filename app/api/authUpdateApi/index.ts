import axiosInstance from '../axiosIntance';
import { Dispatch } from '@reduxjs/toolkit';
export const changePassword= async (dispatch: Dispatch,formData: any) => {
    try {
        const response= await axiosInstance.post('/auth/change-password', formData)
        // console.log("change password response:", response.data)
    } catch (error) {
        throw error
    }
}
export const updateProfile= async (dispatch: Dispatch,formData: any) => {
    try {
        const response= await axiosInstance.patch('/auth/profile', formData)
        return response.data 
    } catch (error) {
        throw error
    }
}
export const forgetPassword= async (dispatch: Dispatch,formData: any) => {
    try {
        const response= await axiosInstance.post('/auth/forgot-password', formData)
        return response.data 
    } catch (error) {
        throw error
    }
}