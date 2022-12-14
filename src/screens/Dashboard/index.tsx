import React, {useCallback, useEffect, useState} from 'react';
import { ActivityIndicator } from 'react-native';

import HighlightCard from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import { Transactions, Title, HighlightCards, Icon, UserWrapper, Container, Header, UserInfo, Photo, User, UserGreeting, UserName, TransactionsList, LogoutButton, LoadContainer } from './styles';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HightlightProps {
  amount: string,
  lastTransaction: string
}

interface HighlightData {
  entries: HightlightProps;
  expensives : HightlightProps;
  total: HightlightProps,
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<DataListProps[]>([])
  const [highLightData, setHighLightData] = useState<HighlightData>({} as HighlightData)
  const { signOut, user } = useAuth()
  
  function getLastTransactionDate(collection: DataListProps[], type: 'positive' | 'negative'){
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const collectionFilttered = collection.filter(transaction => transaction.type === type)
    
    if(collectionFilttered.length === 0){
      return 0
    }
    const lastTransaction = new Date(Math.max.apply(Math, collectionFilttered.map((transaction) => new Date(transaction.date).getTime())))

    return  `${lastTransaction.getDate()} de ${months[lastTransaction.getMonth()]}`;
  }

  async function loadTransactions(){
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey)
    const transactions = response ? JSON.parse(response) : []

    let entriesTotal = 0
    let expensiveTotal = 0

    const formatNumber = (amount, decimalCount = 2, decimal = ",", thousands = ".") => {
      try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    
        const negativeSign = amount < 0 ? "-" : "";
    
        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
    
        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
      } catch (e) {
        console.log(e)
      }
    };
    const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
      
      if(item.type === 'positive'){
        entriesTotal += Number(item.amount)
      }else {
        expensiveTotal += Number(item.amount)
      }

      const amount = `R$${formatNumber(item.amount)}`
      
      const date = new Date(item.date).toLocaleDateString('pt-BR')
      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date,
      }
    })
    const entries = `R$${formatNumber(entriesTotal)}`
    const expensives = `R$${formatNumber(expensiveTotal)}`
    const total = entriesTotal - expensiveTotal
    const totalFormatted = `R$${formatNumber(total)}`

    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive')
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative')

    const totalInterval = lastTransactionExpensives === 0 ? 'Não há transações' : `01 à ${lastTransactionExpensives}`

    setTransactions(transactionsFormatted)
    setHighLightData({
      entries: {
        amount: entries,
        lastTransaction: lastTransactionEntries === 0 ? 'Não há entradas' : `Última entrada dia ${lastTransactionEntries}`
      },
      expensives: {
        amount: expensives,
        lastTransaction: lastTransactionExpensives === 0 ? 'Não há saídas' : `Última saída dia ${lastTransactionExpensives}`
      },
      total: {
        amount: totalFormatted,
        lastTransaction: totalInterval
      }
    })
    setIsLoading(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  useFocusEffect(useCallback(() => {
    loadTransactions()
  }, []));

  return (
    <Container>
      {
        
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator color="black" size="large" />
        </LoadContainer> :
      <>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo source={{ uri: user.photo}}/>
            <User>
              <UserGreeting>Olá, </UserGreeting>
              <UserName>{user.name}</UserName>
            </User>
          </UserInfo>
          <LogoutButton onPress={signOut}>
            <Icon name='power'/>
          </LogoutButton>
        </UserWrapper>
      </Header>
      <HighlightCards>
        <HighlightCard type="up" title={"Entradas"} amount={highLightData.entries.amount} lastTransaction={highLightData.entries.lastTransaction}/>
        <HighlightCard type="down" title={"Saídas"} amount={highLightData.expensives.amount} lastTransaction={highLightData.expensives.lastTransaction}/>
        <HighlightCard type="total" title={"Total"} amount={highLightData.total.amount} lastTransaction={highLightData.total.lastTransaction}/>
      </HighlightCards>
      <Transactions>
        <Title>Listagem</Title>
          <TransactionsList data={transactions} keyExtractor={ item => item.id} renderItem={({ item }) => <TransactionCard data={item} />} /> 
      </Transactions>
      </>}
    </Container>
  )
}
