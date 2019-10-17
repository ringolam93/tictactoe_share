import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import { GAME_RESULT_NO, GAME_RESULT_CIRCLE, GAME_RESULT_CROSS, GAME_RESULT_TIE } from '../constants/game'

export default class Header extends Component {
  generateResultText(result: number) {
    switch (result) {
      case GAME_RESULT_CROSS:
        return 'Cross won the game!'
      case GAME_RESULT_CIRCLE:
        return 'Circle won the game!'
      case GAME_RESULT_TIE:
        return 'Tie!'
      default:
        return ''
    }
  }



  render() {
    const { result, onRestart, userType } = this.props
    return (
      <View>
        <Text style={styles.text}>{ this.generateResultText(result) }</Text>
        {
          userType == 'holder' && result !== GAME_RESULT_NO && (
            <TouchableOpacity onPress={() => onRestart()}>
              <Text style={styles.instructions}>
                Touch here to play again
              </Text>
            </TouchableOpacity>
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  instructions: {
    marginTop: 20,
    color: 'grey',
    marginBottom: 5,
    textAlign: 'center',
  },
})
