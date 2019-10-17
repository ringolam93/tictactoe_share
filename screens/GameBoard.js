import React, { Component } from 'react'
import { TextInput, YellowBox, TouchableWithoutFeedback, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ToastAndroid, AppState } from 'react-native';
import io from "socket.io-client";

import Circle from './Circle'
import Cross from './Cross'
import { CENTER_POINTS, AREAS, CONDITIONS, GAME_RESULT_NO, GAME_RESULT_CIRCLE, GAME_RESULT_CROSS, GAME_RESULT_TIE } from '../constants/game'
import styles from './styles/custGameBoard'
import PromptArea from './PromptArea'

console.ignoredYellowBox = ['Remote debugger'];
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);

export default class GameBoard extends Component {
    static navigationOptions = {
      title: 'Gaming',
      headerLeft: null
    };
    constructor(props) {
        super(props)
        const { navigation } = this.props;
        this.state= {
          open: false, connected: false,
          result: GAME_RESULT_NO,
          round: 0, seconds: 0, numClients: 0,
          userID:JSON.stringify(navigation.getParam('userid', '')),
          circleInputs:[], crossInputs:[],
          userType: '', isYourTurn: false, gameMsg:'', isGameStart:false,
          checkWinner: false
        }
        this.socket = io("http://ringohome.asuscomm.com:9868");
        this.socket.onopen = () => {
            this.setState({connected:true})
        };
        this.emit = this.emit.bind(this);
    }
    emit() {
      if( this.state.connected ) {
        this.socket.send("It worked!")
        this.setState(prevState => ({ open: !prevState.open }))
      }
    }
    tick() { this.setState(prevState => ({ seconds: prevState.seconds + 1 })); }
    _handleAppStateChange = (nextAppState) => {
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

       this.socket.on("updateGameBoardCross", cross => {
           this.setState({ crossInputs: [...this.state.crossInputs, cross] });
           if (this.state.userType+'' != 'viewer'){
                this.setState({ isYourTurn:true, gameMsg: 'Your Turn!' });
           }

           setTimeout(() => { this.judgeWinner() }, 5)
       });
       this.socket.on("updateGameBoardCircle", circle => {

           this.setState({ circleInputs: [...this.state.circleInputs, circle] });
           if (this.state.userType+'' != 'viewer'){
                this.setState({ isYourTurn:true, gameMsg: 'Your Turn!' });
           }
           setTimeout(() => { this.judgeWinner() }, 5)
       });

       this.socket.on("numClients", num => {
            this.setState({ numClients:num });
       });

       this.socket.on("newUserLogin", data => {
            if (data.userType+'' != ''){ this.setState({ userType: data.userType }); }
            this.setState({ gameMsg: data.gameMsg });
       });

       this.socket.on("newGame", (gameIsStart) => {
            if (this.state.userType+'' == 'holder'){
                this.setState({ isGameStart: true, isYourTurn:true });
                this.setGameMsg();

            }else if (this.state.userType+'' == 'guest'){
                this.setState({ isGameStart: true, isYourTurn:false });
                this.setGameMsg();

            }else if (this.state.userType+'' == 'viewer'){
                this.setState({ isGameStart: true, isYourTurn:false, gameMsg: 'Viewer Mode' });

            }
       });

       this.socket.on("reStartGame", (gameIsStart) => {
             const { round } = this.state
             this.setState({
                 circleInputs: [],
                 crossInputs: [],
                 result: GAME_RESULT_NO,
                 round: round + 1,
                 isYourTurn:true
             })
            if (this.state.userType+'' == 'holder'){
                this.setState({ isGameStart: true, isYourTurn:true });
                this.setGameMsg();

            }else if (this.state.userType+'' == 'guest'){
                this.setState({ isGameStart: true, isYourTurn:false });
                this.setGameMsg();

            }else if (this.state.userType+'' == 'viewer'){
                this.setState({ isGameStart: true, isYourTurn:false, gameMsg: 'Viewer Mode' });

            }
       });
     }
    componentWillUnmount() {
         AppState.removeEventListener('change', this._handleAppStateChange);
         clearInterval(this.interval);
     }
    componentDidUpdate() {}
    restart() {
        const { round } = this.state
        this.setState({
            circleInputs: [],
            crossInputs: [],
            result: GAME_RESULT_NO,
            round: round + 1,
            isYourTurn:true
        })
        this.socket.emit("reStartGame", '');
     }
    isWinner(inputs: number[]) {
        console.log("isWinner()");
        return CONDITIONS.some(d => d.every(item => inputs.indexOf(item) !== -1))
    }
    judgeWinner() {
      const { circleInputs, crossInputs, result } = this.state
      const inputs = circleInputs.concat(crossInputs);
      if (inputs.length >= 5 ) {
        let res = this.isWinner(circleInputs)
        if (res && result !== GAME_RESULT_CIRCLE) {
          return this.setState({ result: GAME_RESULT_CIRCLE, gameMsg:'' })
        }
        res = this.isWinner(crossInputs)
        if (res && result !== GAME_RESULT_CROSS) {
          return this.setState({ result: GAME_RESULT_CROSS, gameMsg:'' })
        }
      }
      if (inputs.length === 9 && result === GAME_RESULT_NO && result !== GAME_RESULT_TIE) {
        this.setState({ result: GAME_RESULT_TIE, gameMsg:'' })
      }
    }
    setGameMsg(){
        if (this.state.isYourTurn){
            this.setState({ gameMsg: 'Your Turn!' })
        }else{
            this.setState({ gameMsg: 'Opponent Turn!' })
        }
    }
    boardClickHandler(e: Object) {
        const { locationX, locationY } = e.nativeEvent
        const { circleInputs, crossInputs, result, isYourTurn, isGameStart } = this.state
        const { navigation } = this.props;

        if (result !== -1 || !isYourTurn || !isGameStart) { return }

        const inputs = circleInputs.concat(crossInputs)
        const area = AREAS.find(d => (locationX >= d.startX && locationX <= d.endX) && (locationY >= d.startY && locationY <= d.endY))

        if (area && inputs.every(d => d !== area.id)) {
             if (inputs.length % 2 === 0){
              // Circle
              this.setState({ circleInputs: this.state.circleInputs.concat(area.id), isYourTurn:false, gameMsg: 'Opponent Turn!' });
              this.socket.emit("updateGameBoardCircle", {areaID:area.id, userID:this.state.userID});
            }else{
              // Cross
              this.setState({ crossInputs: this.state.crossInputs.concat(area.id), isYourTurn:false, gameMsg: 'Opponent Turn!' });
              this.socket.emit("updateGameBoardCross", {areaID:area.id, userID:this.state.userID});
            }
        }
        setTimeout(() => { this.judgeWinner() }, 5)
    }
    render() {
        return (
          <View style={styles.container}>
             <View style={styles.onlinePpt}>
              <Text>
                  Welcome {this.state.userID}.
                  Second(s): {this.state.seconds}.
                  Online user(s): {this.state.numClients}.
                  Your Type: {this.state.userType}.
              </Text>
              <Text>
                    Round {this.state.round}
              </Text>
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
             <Text style={styles.text}> { this.state.gameMsg } </Text>

          <PromptArea result={this.state.result} userType={this.state.userType} onRestart={() => this.restart()} />
         </View>
        )
    }
}