import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, View, ScrollView, Alert, InteractionManager } from 'react-native'
import { withTheme, FAB, Button, Colors } from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import { Avatar } from 'react-native-elements'
import firebase from 'react-native-firebase'
import PropTypes from 'prop-types'
import toastState from '../store/toast'
import { cancelGame } from '../services/firestore'
import { InfoRow, Loader } from '../components'
import sports from '../assets/sports'

const showConfirmation = ({ title, message, onSuccess }) => () =>
  InteractionManager.runAfterInteractions(() => {
    Alert.alert(title, message, [
      { text: 'Yes', onPress: onSuccess },
      { text: 'No', style: 'cancel' },
    ])
  })

const INITIAL_LATITUDE_DELTA = 0.01
const INITIAL_LONGITUDE_DELTA = 0.005

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#FFF',
  },
  buttonMargin: {
    margin: 16,
  },
  button: {
    paddingVertical: 8,
  },
  stack: {
    marginTop: 16,
  },
})

class ViewGame extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func.isRequired,
      navigate: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    theme: PropTypes.shape({
      colors: PropTypes.shape({
        background: PropTypes.string.isRequired,
        error: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    onAddToast: PropTypes.func.isRequired,
  }

  state = {
    loading: false,
  }

  constructor(props) {
    super(props)

    this.game = props.navigation.getParam('game')
  }

  handleCancelGame = async () => {
    const { onAddToast, navigation } = this.props

    this.setState({ loading: true })
    await cancelGame(this.game.id)
    onAddToast('Game cancelled!')
    this.setState({ loading: false }, () => navigation.goBack())
  }

  handleEditGame = () => {
    this.props.navigation.navigate('EditGame', { game: this.game })
  }

  render() {
    const { theme } = this.props
    const { loading } = this.state

    const { ownerId, sport, place, datetime, players } = this.game
    const {
      location: { latitude, longitude },
    } = place
    const owned = ownerId === firebase.auth().currentUser.uid
    const played = players.some(player => player.id === firebase.auth().currentUser.uid)

    return (
      <React.Fragment>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <MapView
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: INITIAL_LATITUDE_DELTA,
              longitudeDelta: INITIAL_LONGITUDE_DELTA,
            }}
            style={styles.map}
          >
            <Marker coordinate={{ latitude, longitude }}>
              <Avatar rounded medium source={sports[sport].icon} avatarStyle={styles.avatar} />
            </Marker>
          </MapView>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <InfoRow large type="sport" value={sport} />
            <InfoRow large type="place" value={place} />
            <InfoRow large type="datetime" value={datetime} />
          </ScrollView>
          {!(owned || played) && (
            <FAB label="Join" onPress={() => {}} style={styles.buttonMargin} />
          )}
          {played && (
            <Button
              mode="outlined"
              onPress={() => {}}
              style={[styles.buttonMargin, styles.button]}
              color={theme.colors.error}
            >
              Exit game
            </Button>
          )}
          {owned && (
            <View style={styles.buttonMargin}>
              <Button
                mode="contained"
                style={styles.button}
                onPress={this.handleEditGame}
                color={Colors.blue500}
              >
                Edit game
              </Button>
              <Button
                mode="contained"
                style={[styles.button, styles.stack]}
                onPress={showConfirmation({
                  title: 'Cancel game?',
                  message: 'Are you sure you want to cancel this game?',
                  onSuccess: this.handleCancelGame,
                })}
                color={theme.colors.error}
              >
                Cancel game
              </Button>
            </View>
          )}
        </View>
        {loading && <Loader />}
      </React.Fragment>
    )
  }
}

export default connect(
  null,
  { onAddToast: toastState.actions.addToast }
)(withTheme(ViewGame))
