import React from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Button } from 'react-native';
// import { ExpoLinksView } from '@expo/samples';

export default function LinksScreen() {
  return (
    <Text>Links Screen</Text>
  );
}

LinksScreen.navigationOptions = {
  title: 'Links',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
