import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from '../screens/Dashboard';
import { Register } from '../screens/Register';
import { useTheme } from 'styled-components';
import { MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native';
import { Resume } from '../screens/Resume';
const { Navigator, Screen} = createBottomTabNavigator()

export function AppRoutes(){
    const theme = useTheme()
    return(
        <Navigator initialRouteName='Listagem' screenOptions={{headerShown: false, tabBarActiveTintColor: theme.colors.secondary, tabBarInactiveTintColor: theme.colors.text, tabBarLabelPosition: 'beside-icon', tabBarStyle: {paddingVertical: Platform.OS === 'ios' ? 20 : 0, height: 66}}}>
            <Screen options={{tabBarIcon: (({ size, color }) => (<MaterialIcons size={size} color={color} name='format-list-bulleted'/>))}} name="Listagem" component={Dashboard}/>
            <Screen options={{tabBarIcon: (({ size, color }) => (<MaterialIcons size={size} color={color} name='attach-money'/>))}} name="Cadastrar" component={Register}/>
            <Screen options={{tabBarIcon: (({ size, color }) => (<MaterialIcons size={size} color={color} name='pie-chart'/>))}} name="Resumo" component={Resume}/>
        </Navigator>
    )
}