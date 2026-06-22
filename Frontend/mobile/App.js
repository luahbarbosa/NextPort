import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import SplashScreen from './src/screens/SplashScreen';
import ChamadaScreen from './src/screens/ChamadaScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/home.png')}
              style={{
                width: 26, height: 26,
                tintColor: focused ? '#343399' : '#968c8cff'
              }}
            />
          )
        }}
      />
      <Tab.Screen
        name="Historico"
        component={HistoricoScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/historico.png')}
              style={{
                width: 26, height: 26,
                tintColor: focused ? '#343399' : '#968c8cff'
              }}
            />
          )
        }}
      />
      <Tab.Screen
        name="Settings"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/settings.png')}
              style={{
                width: 26, height: 26,
                tintColor: focused ? '#343399' : '#968c8cff'
              }}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Chamada" component={ChamadaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}