import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Button, Alert } from 'react-native';

//import { createAppContainer } from 'react-navigation';
import { withNavigation } from 'react-navigation';
import {Actions} from 'react-native-router-flux';
import { createStackNavigator } from 'react-navigation-stack';


export default class Form extends Component {
    constructor(props){
        super(props);
        this.state={
            userid:'',
            userpw: ''
        }
    }
    funSignin = () =>{
        const { userid, userpw }  = this.state;
        //console.log('userid: '+userid);
        //console.log('userpw: '+userpw);
        fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/_login.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userid: userid,
                userpw: userpw
            })
        })
        .then((response) => response.json() )
        .then((responseData) => {
            if (responseData) {
                this.props.navigation.navigate('Home');
                //this.props.navigation.navigate('HomeScreen', { User: 'Ringo' });
                //this.props.navigation.navigate('MyProfile')
             }
        })
        .catch((error) => {
            console.warn(error);
        })
        .done();
    }

    render() {
        return(
            <View style={styles.container}>
                <TextInput style={styles.inputBox}
                onChangeText={(userid) => this.setState({userid})}
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Email"
                placeholderTextColor = "#002f6c"
                selectionColor="#fff"
                keyboardType="email-address"
                onSubmitEditing={()=> this.password.focus()}
                />

                <TextInput style={styles.inputBox}
                onChangeText={(userpw) => this.setState({userpw})}
                underlineColorAndroid='rgba(0,0,0,0)'
                placeholder="Password"
                secureTextEntry={true}
                placeholderTextColor = "#002f6c"
                ref={(input) => this.userpw = input}
                />
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={this.funSignin}>{this.props.type}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: 300,
        backgroundColor: '#eeeeee', 
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#002f6c',
        marginVertical: 10
    },
    button: {
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    }
});