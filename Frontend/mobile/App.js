import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}