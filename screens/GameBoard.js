import React, { Component } from 'react'
import { TextInput, YellowBox, TouchableWithoutFeedback, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ToastAndroid, AppState } from 'react-native';
import io from "socket.io-client";

import Circle from './Circle'
import Cross from './Cross'
import { CENTER_POINTS, AREAS, CONDITIONS, GAME_RESULT_NO, GAME_RESULT_CIRCLE, GAME_RESULT_CROSS, GAME_RESULT_TIE } from '../constants/game'
import styles from './styles/custGameBoard'
import PromptArea from './PromptArea'

YellowBox.ignoreWarnings(['Remote debugger']);

export default class GameBoard extends Component {
    static navigationOptions = {
      title: 'Gaming',
      headerLeft: null
    };
    constructor(props) {
        super(props)
        const { navigation } = this.props;
        this.state= {
          result: GAME_RESULT_NO,
          round: 0,
          seconds: 0,
          onlinePpt: 0,
          userID:JSON.stringify(navigation.getParam('userid', '')),
          circleInputs:[],
          crossInputs:[],
          isYourTurn: false,
          checkWinner: false,
          chatMessage: "",
          chatMessages: []
        }
    }
    tick() { this.setState(prevState => ({ seconds: prevState.seconds + 1 })); }
    _handleAppStateChange = (nextAppState) => {
                 //this.setState({userid: this.props.navigation.getParam('userid', '')});
                 if ( nextAppState === 'background' ) {
                     fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/reg.php', {
                         method: 'POST',
                         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                         body: JSON.stringify({
                             part: 'logout',
                             userid: this.state.userID,
                         })
                     })
                     .then((response) => response.json() )
                     .then((responseData) => { if (responseData.flag+''=='fail') { console.log(responseData); } })
                     .catch((error) => { console.warn(error); })
                     .done();
                  }else{
                     fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/reg.php', {
                         method: 'POST',
                         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                         body: JSON.stringify({
                             part: 'relogin',
                             userid: this.state.userID,
                         })
                     })
                     .then((response) => response.json() )
                     .then((responseData) => { if (responseData.flag+''=='fail') { console.log(responseData); } })
                     .catch((error) => { console.warn(error); })
                     .done();
                  }
                  this.setState({appState: nextAppState});
                 };
    componentDidMount() {
       this.socket = io("http://ringohome.asuscomm.com:9868",{
           agent:'-',
           perMessageDeflate:'-',
           pfx:'-',
           cert:'-',
           ca:'-',
           ciphers:'-',
           rejectUnauthorized:'-'
       });
       this.socket.on("chat message", msg => {
         this.setState({ chatMessages: [...this.state.chatMessages, msg] });
       });

       this.socket.on("updateGameBoardCross", circle => {
        this.setState({ circleInputs: [...this.state.circleInputs, circle] });
       });
       this.socket.on("updateGameBoardCircle", cross => {
        this.setState({ crossInputs: [...this.state.crossInputs, cross] });
       });
     }
    componentWillUnmount() {
         AppState.removeEventListener('change', this._handleAppStateChange);
         clearInterval(this.interval);
     }
    componentDidUpdate() {
       this.getNumOfOnlinePerson();
    }

    gameEnd(){
        fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/process.php', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    part: 'end',
                    roomID: '1'
                })
            })
            .then((response) => response.json() )
            .then((responseData) => {
                if (responseData.flag+''=='fail') { console.log(responseData); }
            })
            .catch((error) => { console.warn(error); })
            .done();
        }

    getNumOfOnlinePerson(){
                fetch('http://ringohome.asuscomm.com:6158/tictactoe_db/process.php', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        part: 'countOnline'
                    })
                })
                .then((response) => response.json() )
                .then((responseData) => {
                    if (responseData.flag+''=='success') {
                        this.setState({onlinePpt: responseData.res});
                    }else if (responseData.flag+''=='fail'){
                        console.log(responseData);
                    }
                })
                .catch((error) => {
                    console.warn(error);
                })
                .done();
              }

    restart() {
        const { round } = this.state
        this.setState({
            circleInputs: [],
            crossInputs: [],
            result: GAME_RESULT_NO,
            round: round + 1
        })
     }

    boardClickHandler(e: Object) {
        const { locationX, locationY } = e.nativeEvent
        const { circleInputs, crossInputs, result, isYourTurn } = this.state
        const { navigation } = this.props;

        if (result !== -1) { return }

        const inputs = circleInputs.concat(crossInputs)
        const area = AREAS.find(d => (locationX >= d.startX && locationX <= d.endX) && (locationY >= d.startY && locationY <= d.endY))

        if (area && inputs.every(d => d !== area.id)) {
             if (inputs.length % 2 === 0){
              // Cross
              this.setState({ crossInputs: this.state.crossInputs.concat(area.id) });
              //this.socket.emit("updateGameBoardCross", this.state.crossInputs.concat(area.id));
              this.socket.emit("updateGameBoardCross", {areaID:area.id, userID:JSON.stringify(navigation.getParam('userid', ''))});

            }else{
              // Circle
              this.setState({ circleInputs: this.state.circleInputs.concat(area.id) });
              //this.socket.emit("updateGameBoardCircle", this.state.circleInputs.concat(area.id));
              this.socket.emit("updateGameBoardCircle", {areaID:area.id, userID:JSON.stringify(navigation.getParam('userid', ''))});
            }
        }
    }

    isWinner(inputs: number[]) {
       return CONDITIONS.some(d => d.every(item => inputs.indexOf(item) !== -1))
    }

    judgeWinner() {
      const { circleInputs, crossInputs, result } = this.state
      const inputs = circleInputs.concat(crossInputs);
      if (inputs.length >= 5 ) {
        let res = this.isWinner(circleInputs)
        if (res && result !== GAME_RESULT_CIRCLE) {
          return this.setState({ result: GAME_RESULT_CIRCLE })
        }
        res = this.isWinner(crossInputs)
        if (res && result !== GAME_RESULT_CROSS) {
          return this.setState({ result: GAME_RESULT_CROSS })
        }
      }
      if (inputs.length === 9 && result === GAME_RESULT_NO && result !== GAME_RESULT_TIE) {
        //this.setState({ result: GAME_RESULT_TIE })
        console.log("Tie");
      }
    }

    submitChatMessage() {
        this.socket.emit("chat message", this.state.chatMessage);
        this.setState({ chatMessage: "" });
    }

  render() {
    const { result } = this.state
//     const circleInputs = this.state.circleInputs.map(circleInput => (
//        <Circle key={circleInput}>{circleInput}</Circle>
//     ));
//     const crossInputs = this.state.crossInputs.map(crossInput => (
//        <Cross key={crossInput}>{crossInput}</Cross>
//     ));
    return (
      <View style={styles.container}>
                 <View style={styles.onlinePpt}>
                  <Text>Welcome {this.state.userID}.
                  Online people: {this.state.onlinePpt}.
                  Second(s): {this.state.seconds}</Text>
                 </View>
                 <View style={styles.gameBoard_container}>
                  <TouchableWithoutFeedback onPress={e => this.boardClickHandler(e)} >
                    <View style={styles.board}>
                      <View style={styles.line} />
                      <View style={[styles.line, { width: 3, height: 306, transform: [{translateX: 200}]}]} />
                      <View style={[styles.line, { width: 306, height: 3, transform: [{translateY: 100}]}]} />
                      <View style={[styles.line, { width: 306, height: 3, transform: [{translateY: 200}]}]} />
                      {
                          this.state.circleInputs.map((d, i) => (
                              <Circle key={i} xTranslate={CENTER_POINTS[d].x} yTranslate={CENTER_POINTS[d].y} color='deepskyblue' />
                          ))
                      }
                      {
                          this.state.crossInputs.map((d, i) => (
                              <Cross key={i} xTranslate={CENTER_POINTS[d].x} yTranslate={CENTER_POINTS[d].y} color='red' />
                          ))
                      }
                    </View>
                  </TouchableWithoutFeedback>
                 </View>
              <PromptArea result={result} onRestart={() => this.restart()} />
            </View>


    )
  }
}