import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard } from 'react-native';

import {Actions} from 'react-native-router-flux';
import { withNavigation } from 'react-navigation';

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userid: '',
            userpw: ''
         }
    }

    static navigationOptions = {
        title: 'Home',
    };

    render() {
        return(
            <View style={styles.container}>
                <Text>Home Screen</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    signupTextCont: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingVertical: 16,
      flexDirection: 'row',
    },
    signupText: {
      color: '#12799f',
      fontSize:16,
    },
    signupButton: {
        color: '#12799f',
        fontSize:16,
        fontWeight: '500',
    }
});