import * as React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Button } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Login from './screens/Login';
import Signup from './screens/Signup';
import GameBoard from './screens/GameBoard';
import HomeScreen from './screens/Home';
import MyProfile from './screens/MyProfile';
//import LinksScreen from './screens/LinksScreen';
//import SettingScreen from './screens/SettingsScreen';

const RootStack = createStackNavigator(
  {
    Login: { screen: Login },
    Signup: Signup,
    Home: HomeScreen,
    GameBoard: GameBoard,
    MyProfile: MyProfile,
    //Links: LinksScreen,
    //Setting: SettingScreen
  },
  {
    initialRouteName: 'Login',
  }
);
const AppContainer = createAppContainer(RootStack);
export default AppContainer;

class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}