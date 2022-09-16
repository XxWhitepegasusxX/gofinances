import React from "react";
import AppLoading from "expo-app-loading";
import { StatusBar } from 'react-native'
import { ThemeProvider } from "styled-components";
import { NavigationContainer } from '@react-navigation/native';
import {useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold} from '@expo-google-fonts/poppins'
import theme from './src/global/styles/theme'
import { AppRoutes } from "./src/routes/app.routes";
import { SignIn } from './src/screens/SignIn'

import { AuthProvider } from "./src/hooks/auth";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  })

  if(!fontsLoaded){
    return <AppLoading/>
  }

  return (
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <StatusBar backgroundColor={'transparent'} translucent={true} barStyle="light-content" />
          <AuthProvider>
            <SignIn />
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
  );
}