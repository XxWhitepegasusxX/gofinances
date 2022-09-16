import React from 'react'
import { FooterWrapper, Container, Header, TitleWrapper, Title, SignInTitle, Footer } from './styles'
import AppleSvg from '../../assets/apple.svg'
import GoogleSvg from '../../assets/google.svg'
import LogoSvg from '../../assets/logo.svg'
import { RFValue } from 'react-native-responsive-fontsize'
import { SignInSocialButton } from '../../components/SigInSocialButton'

import { useAuth } from '../../hooks/auth'
import { Alert } from 'react-native'

export function SignIn(){
    const { user, signInWithGoogle, signInWithApple } = useAuth()
    
    async function handleSignInWithGoogle(){
        try{
            await signInWithGoogle();
        } catch(e){
            console.log(e)
            Alert.alert('Não foi possível conectar ao Google')
        }
    }
    async function handleSignInWithApple(){
        try{
            await signInWithApple();
        } catch(e){
            console.log(e)
            Alert.alert('Não foi possível conectar ao Apple ID')
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
                    <SignInSocialButton onPress={handleSignInWithApple} title='Entrar com Apple ID' svg={AppleSvg}/>
                </FooterWrapper>
            </Footer>
        </Container>
    )
}