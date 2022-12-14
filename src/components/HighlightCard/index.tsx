/* eslint-disable prettier/prettier */
import React from "react";
import { Container, Header, Title, Icon, Footer, Amount, LastTransaction } from "./styles";

interface Props {
    title: string,
    amount: string,
    lastTransaction: string,
    type: 'up' | 'down' | 'total';
}

export default function HighlightCard({type, title, amount, lastTransaction}: Props){
    
    const icon = {
        up: 'arrow-up-circle',
        down: 'arrow-down-circle',
        total: 'dollar-sign',
    }
    
    return(
        <Container type={type}>
            <Header>
                <Title type={type}>{title}</Title>
                <Icon type={type} name={icon[type]}/>
            </Header>
            <Footer>
                <Amount type={type}>{amount}</Amount>
                <LastTransaction type={type}>{lastTransaction}</LastTransaction>
            </Footer>
        </Container>
    )
}