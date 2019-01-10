import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import PropTypes from 'prop-types'

const FILTERS = {
  sport: {
    icon: 'directions-run',
  },
  datetime: {
    icon: 'schedule',
  },
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    marginHorizontal: 4,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#FFF',
  },
})

export default function FilterButton({ filter }) {
  return (
    <View style={styles.container}>
      <Icon color="#FFF" size={24} name={FILTERS[filter].icon} />
      <Text style={styles.text}>All</Text>
      <Icon color="#FFF" size={24} name="arrow-drop-down" />
    </View>
  )
}

FilterButton.propTypes = {
  filter: PropTypes.oneOf(Object.keys(FILTERS)).isRequired,
}
