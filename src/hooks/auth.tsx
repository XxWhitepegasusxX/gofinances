import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication'
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
    signInWithApple(): Promise<void>;
    signOut(): Promise<void>;
    userStorageLoading: boolean;
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
            console.log(type, params)
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
                console.log(user)
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
            }
        }catch(e){
            throw new Error(e)
        }
    }
    async function signInWithApple(){
        try{
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ]
            })
            if(credential){
                const userLogged = {
                    id: String(credential.user),
                    email: credential.email!,
                    name: credential.fullName!.givenName!,
                    photo: `https://ui-avatars.com/api/?name=${credential.fullName!.givenName}&length=1`,
                };
                setUser(userLogged)
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
            }
        }catch(e){
            throw new Error(e)
        }
    }

    async function signOut(){
        setUser({} as User);
        await AsyncStorage.removeItem(userStorageKey)
    }

    useEffect(() => {
        async function loadUserStorageData(){
            const userStoraged = await AsyncStorage.getItem(userStorageKey)

            if(userStoraged){
                const userLogged = JSON.parse(userStoraged) as User;
                setUser(userLogged)
            }
            setUserStorageLoading(false)
        }

        loadUserStorageData()
    }, [])

    return(
        <AuthContext.Provider value={{ user, signInWithGoogle, signInWithApple, signOut, userStorageLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext)

    return context;
}

export { useAuth, AuthProvider}
