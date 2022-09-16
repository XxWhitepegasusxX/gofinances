import React, { useState } from "react";
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from "react-native"
import { Button } from "../../components/Forms/Button";
import { useForm } from "react-hook-form";
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid'
import { useNavigation } from "@react-navigation/native";

import { TransactionsTypes, Fields, Form, Header, Title, Container } from "./styles";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";

import { CategorySelect } from "../CategorySelect"
import { InputForm } from "../../components/Forms/InputForm";
import { useAuth } from "../../hooks/auth";

interface FormData{
    name: string,
    amount: string,
}

const schema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    amount: Yup.number().typeError('Informe um valor numérico').positive('O valor deve ser positivo').required('Quantia Obrigatória'),
})

export function Register(){
    const { user } = useAuth()
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const [ category, setCategory] = useState({
        key: 'category',
        name: 'Categoria',
    })
    const [transactionType, setTransactionType] = useState('')
    const [ categoryModalOpen, setCategoryModalOpen] = useState(false)

    const navigation = useNavigation()

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    function handleTransactionsTypeSelect(type: 'positive' | 'negative'){
        setTransactionType(type)
    }
    function handleCloseSelectCategory(){
        setCategoryModalOpen(false)
    }
    function handleOpenSelectCategory(){
        setCategoryModalOpen(true)
    }
    async function handleRegister(form: FormData){
        if(!transactionType){
            return Alert.alert("Selecione o tipo da transação")
        }
        if(category.key === 'category'){
            return Alert.alert("Selecione a Categoria")
        }
        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date()
        }

        try{
            const data = await AsyncStorage.getItem(dataKey)
            const currentData = data ? JSON.parse(data): [];

            const dataFormatted = [
                ...currentData,
                newTransaction
            ]

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted))
            
            reset()
            setTransactionType('')
            setCategory({
                key: 'category',
                name: 'Categoria'
            })

            navigation.navigate('Listagem')

        }catch (error){
            console.log(error)
            Alert.alert("Não foi possível salvar")
        }
    }

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm error={errors.name && errors.name.message} autoCapitalize="sentences" autoCorrect={false} control={control} name="name" placeholder="Nome" />
                        <InputForm error={errors.amount && errors.amount.message} keyboardType="numeric" control={control} name="amount" placeholder="Preço" />
                    <TransactionsTypes>
                        <TransactionTypeButton isActive={transactionType === 'positive'} onPress={() => handleTransactionsTypeSelect('positive')} title="Entrada" type="up" />
                        <TransactionTypeButton isActive={transactionType === 'negative'} onPress={() => handleTransactionsTypeSelect('negative')} title="Saída" type="down" />
                    </TransactionsTypes>
                    <CategorySelectButton title={category.name} onPress={handleOpenSelectCategory}/>
                    </Fields>

                    <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
                </Form>
                <Modal visible={categoryModalOpen}>
                    <CategorySelect category={category} setCategory={setCategory} closeSelectCategory={handleCloseSelectCategory} />
                </Modal>

            </Container>
        </TouchableWithoutFeedback>
    )
}