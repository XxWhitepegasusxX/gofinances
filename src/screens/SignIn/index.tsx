import React, { useState } from 'react'
import { FooterWrapper, Container, Header, TitleWrapper, Title, SignInTitle, Footer } from './styles'
import AppleSvg from '../../assets/apple.svg'
import GoogleSvg from '../../assets/google.svg'
import LogoSvg from '../../assets/logo.svg'
import { RFValue } from 'react-native-responsive-fontsize'
import { SignInSocialButton } from '../../components/SigInSocialButton'
import { useTheme } from 'styled-components'
import { useAuth } from '../../hooks/auth'
import { ActivityIndicator, Alert, Platform } from 'react-native'

export function SignIn(){
    const [isLoading, setIsLoading] = useState(false)
    const { signInWithGoogle, signInWithApple } = useAuth()
    const theme = useTheme()

    async function handleSignInWithGoogle(){
        try{
            setIsLoading(true)
            return await signInWithGoogle();
        } catch(e){
            console.log(e)
            Alert.alert('Não foi possível conectar ao Google')
            setIsLoading(false)
        }
    }
    async function handleSignInWithApple(){
        try{
            setIsLoading(true)
            return await signInWithApple();
        } catch(e){
            console.log(e)
            Alert.alert('Não foi possível conectar ao Apple ID')
            setIsLoading(false)
        }
    }

    return(
        <Container>
            <Header>
                <TitleWrapper>
                    <LogoSvg width={RFValue(120)} height={RFValue(68)}/>
                    <Title>Controle suas{'\n'} finanças de forma{'\n'} muito simples</Title>
                </TitleWrapper>
                <SignInTitle>
                    Faça seu login com{'\n'} uma das contas abaixo
                </SignInTitle>
            </Header>
            <Footer>
                <FooterWrapper>
                    <SignInSocialButton onPress={handleSignInWithGoogle} title='Entrar com Google' svg={GoogleSvg}/>
                    { Platform.OS === 'ios' && <SignInSocialButton onPress={handleSignInWithApple} title='Entrar com Apple ID' svg={AppleSvg}/>}
                </FooterWrapper>
                {isLoading && <ActivityIndicator color={theme.colors.shape} style={{marginTop: 20}} size={40}/>}
            </Footer>
        </Container>
    )
}