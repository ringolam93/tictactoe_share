import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Button, Alert, ToastAndroid } from 'react-native';

import {Actions} from 'react-native-router-flux';
import { withNavigation } from 'react-navigation';

export default class Signup extends Component {
    constructor(props){
        super(props)
        this.state = {
            userid: '',
            userpw: ''
        }
    }
    static navigationOptions = {
        title: 'Signup'
    };

    funSignup = () =>{
        const { userid, userpw }  = this.state;
        fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/reg.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                part: 'signup',
                userid: userid,
                userpw: userpw
            })
        })
        .then( (response) => response.json() )
        .then((responseData) => {
            if (responseData.flag+''=='success') {
                this.props.navigation.navigate('Login');
                ToastAndroid.show(responseData.msg, ToastAndroid.LONG);

            }else if (responseData.flag+''=='fail'){
                ToastAndroid.show(responseData.msg, ToastAndroid.LONG);
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
                <Text>{'\n'}</Text>
                <Text>{'\n'}</Text>
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
                    <Text style={styles.buttonText} onPress={this.funSignup}>Signup</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.signupTextCont}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={this.goBack}><Text style={styles.signupButton}>Sign in</Text></TouchableOpacity>
            </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
    },
    signupTextCont: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingVertical: 16,
      flexDirection: 'row'
    },
    signupText: {
      color: '#12799f',
      fontSize:16
    },
    signupButton: {
        color: '#12799f',
        fontSize:16,
        fontWeight: '500'
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