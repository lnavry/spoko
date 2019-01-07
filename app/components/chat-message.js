import React from 'react'
import { StyleSheet } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { Avatar } from 'react-native-elements'
import { Surface, Subheading, Colors, withTheme } from 'react-native-paper'
import PropTypes from 'prop-types'
import joAvatar from '../assets/images/jo-avatar.jpg'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  surface: {
    flex: 1,
    padding: 8,
    elevation: 4,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  text: {
    fontWeight: '500',
  },
})

function ChatMessage({ children, author, type, theme }) {
  return (
    <Animatable.View style={styles.container} animation="fadeIn" duration={200}>
      {author === 'jo' && <Avatar rounded source={joAvatar} />}
      <Surface
        style={[
          styles.surface,
          author === 'jo' && { marginLeft: 16 },
          author === 'me' && { marginRight: 16, backgroundColor: Colors.lightGreen50 },
        ]}
      >
        <Subheading style={[styles.text, type === 'error' && { color: theme.colors.error }]}>
          {children}
        </Subheading>
      </Surface>
      {author === 'me' && <Avatar rounded icon={{ name: 'person' }} />}
    </Animatable.View>
  )
}

ChatMessage.propTypes = {
  author: PropTypes.oneOf(['me', 'jo']).isRequired,
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      error: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  children: PropTypes.string.isRequired,
  type: PropTypes.string,
}

ChatMessage.defaultProps = {
  type: 'info',
}

export default withTheme(ChatMessage)
