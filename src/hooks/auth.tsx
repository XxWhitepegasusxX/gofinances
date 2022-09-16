import React, { createContext, ReactNode, useContext, useState } from 'react'
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface User {
    id: string,
    name: string,
    email: string,
    photo?: string,
}

interface IAuthContextData{
    user: User;
    signInWithGoogle(): Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface AuthorizationResponse {
    params: {
        access_token: string;
    };
    type: string;
}

export const AuthContext = createContext({} as IAuthContextData );

function AuthProvider({children}: AuthProviderProps){
    const [user, setUser] = useState<User>({} as User)
    const [userStorageLoading, setUserStorageLoading] = useState(true)

    const userStorageKey = '@gofinances:user';

    async function signInWithGoogle(){
        try{
            const CLIENT_ID = '981205300483-mjiibiq241k54tbf62tm9ca24453u9g1.apps.googleusercontent.com'
            const REDIRECT_URI = 'https://auth.expo.io/@whitepegasus/gofinances'
            const SCOPE = encodeURI('profile email');
            const RESPONSE_TYPE = 'token';

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`

            const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;

            if(type === 'success'){
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`)
                const userInfo = await response.json();

                const userLogged = {
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.given_name,
                    photo: userInfo.picture
                };
                setUser(userLogged)
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
            }
        }catch(e){
            throw new Error(e)
        }
    }

    return(
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext)

    return context;
}

export { useAuth, AuthProvider}
