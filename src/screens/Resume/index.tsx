import React, { useCallback, useEffect, useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { ChartContainer, Container, Content, Header, Month, MonthSelect, MonthSelectButton, MonthSelectIcon, Title } from './styles'
import { HistoryCard } from '../../components/HistoryCard'
import { categories } from '../../utils/categories';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'
import { useFocusEffect } from '@react-navigation/native';

interface TransactionData {
    type: 'positive' | 'negative';
    name: string,
    amount: string,
    category: string;
    date: string;
}
interface CategoryData{
    key: string,
    name: string,
    total: string,
    color: string,
    percentFormatted: string,
    percent: number;
}

export function Resume(){
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])
    
    function handleDateChange(action: 'next' | 'prev'){
        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1))
        }else{
            setSelectedDate(subMonths(selectedDate, 1))
        }
    }

    async function loadData(){
        const dataKey = "@gofinances:transactions";
        const response = await AsyncStorage.getItem(dataKey)
        const responseFormatted = response ? JSON.parse(response): [];

        const expensives = responseFormatted.filter((expensive: TransactionData) => expensive.type === 'negative' && new Date(expensive.date).getMonth() === selectedDate.getMonth() && new Date(expensive.date).getFullYear() === selectedDate.getFullYear())

        const expensivesTotal = expensives.reduce((accumulator: number, expensive: TransactionData)=> {
            return accumulator + Number(expensive.amount);
        }, 0);

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

        const totalByCategory: CategoryData[] = [];

        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach((expensive: TransactionData) => {
                if(expensive.category === category.key){
                    categorySum += Number(expensive.amount);
                }
            })
            if(categorySum > 0){

                const percent = (categorySum / expensivesTotal * 100)
                const percentFormatted = `${percent.toFixed(0)}%`

                const total = `R$ ${formatNumber(categorySum)}`
                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total,
                    percent,
                    percentFormatted
                })
            }
        })
        console.log(totalByCategory)
        setTotalByCategories(totalByCategory)
    }
    useFocusEffect(useCallback(() => {
        loadData();
    }, [selectedDate]))
    return(
        <Container>
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>
            <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: useBottomTabBarHeight()}}>
                
                <MonthSelect>
                    <MonthSelectButton onPress={() => handleDateChange('prev')}>
                        <MonthSelectIcon name="chevron-left"/>
                    </MonthSelectButton>

                    <Month>{format(selectedDate, "MMMM, yyyy", {locale: ptBR})}</Month>

                    <MonthSelectButton onPress={() => handleDateChange('next')}>
                        <MonthSelectIcon name="chevron-right" />
                    </MonthSelectButton>
                </MonthSelect>

                <ChartContainer>
                    <VictoryPie data={totalByCategories} colorScale={totalByCategories.map(item => item.color)} x="percentFormatted" y="percent"
                    style={{
                        labels: {
                            fontSize: RFValue(18),
                            fontWeight: 'bold',
                            fill: 'white'
                        }
                    }}
                    labelRadius={65}
                    />

                </ChartContainer>
            {
                totalByCategories.map(item => (
                    <HistoryCard key={item.key} color={item.color} title={item.name} amount={item.total}/>
                ))
            }
            </Content>
        </Container>
    )
}