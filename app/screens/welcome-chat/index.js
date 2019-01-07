import React, { Component } from 'react'
import { connect } from 'react-redux'
import Permissions from 'react-native-permissions'
import firebase from 'react-native-firebase'
import PropTypes from 'prop-types'
import regionState from '../../store/region'
import { getCurrentRegion, getCurrentCountry } from '../../services/geolocation'
import { Loader, Container, JoChat, ActionPanel } from '../../components'
import chatMessages from './chat-messages.json'
import countries from '../../assets/countries.json'

class WelcomeChat extends Component {
  static propTypes = {
    onSetInitialRegion: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.locationActionPanel = {
      FABLabel: 'Sure!',
      FABAction: this.handleLocationPermissionRequest,
      negativeLabel: 'Nah... Ask me later!',
      negativeAction: this.handleLocationPermissionPostponed,
    }
    this.phoneInputActionPanel = {
      showPhoneInput: true,
      onPhoneChange: phone => this.setState({ phoneNumber: phone }),
      onCountryChange: country => this.setState({ selectedCountry: country }),
      FABLabel: 'Verify',
      FABAction: this.handleVerifyPhoneNumber,
    }
    this.verificationCodeActionPanel = {
      FABLabel: 'Confirm code',
      FABAction: () => {},
      negativeLabel: 'Change phone number',
      negativeAction: () => this.setStage('changePhoneNumber'),
    }

    this.actions = {
      locationPermissionRequest: { ...this.locationActionPanel },
      phoneInput: { ...this.phoneInputActionPanel },
      phoneVerificationError: { ...this.phoneInputActionPanel },
      changePhoneNumber: { ...this.phoneInputActionPanel },
      verificationCode: { ...this.verificationCodeActionPanel },
    }

    this.state = {
      currentStage: 'greeting',
      messages: [...chatMessages.greeting],
      selectedCountry: 'GB',
      phoneNumber: '',
      verificationCode: '',
      loading: false,
    }
  }

  async componentDidMount() {
    const permission = await Permissions.check('location')
    if (permission === 'undetermined') {
      this.setStage('locationPermissionRequest')
      return
    }
    await this.setRegionAndCountry()
    this.setStage('phoneInput')
  }

  setRegionAndCountry = async () => {
    this.setState({ loading: true })
    try {
      const currentRegion = await getCurrentRegion()
      const currentCountry = await getCurrentCountry(currentRegion)
      this.props.onSetInitialRegion(currentRegion)
      await this.setState({ selectedCountry: currentCountry, loading: false })
    } catch (error) {
      console.error(error)
      this.setState({ loading: false })
    }
  }

  handleLocationPermissionRequest = async () => {
    await Permissions.request('location')
    await this.setRegionAndCountry()
    await this.setStage('locationPermissionGranted')
    this.setStage('phoneInput')
  }

  handleLocationPermissionPostponed = async () => {
    this.setState({ selectedCountry: 'US' })
    await this.setStage('locationPermissionPostponed')
    this.setStage('phoneInput')
  }

  handleChangePhoneNumber = () => {}

  handleVerifyPhoneNumber = () => {
    const { selectedCountry, phoneNumber } = this.state
    const phone = `${countries[selectedCountry].callingCode}${phoneNumber}`
    this.setStage('phoneVerification')
    this.setState({ loading: true })
    firebase
      .auth()
      .verifyPhoneNumber(phone)
      .on('state_changed', phoneAuthSnapshot => {
        console.log('phoneAUthSnapshot', phoneAuthSnapshot)
        switch (phoneAuthSnapshot.state) {
          case firebase.auth.PhoneAuthState.CODE_SENT:
          case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT:
            this.setStage('verificationCode')
            break
          case firebase.auth.PhoneAuthState.AUTO_VERIFIED:
            const { verificationId, code } = phoneAuthSnapshot
            const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code)
            firebase.auth().signInWithCredential(credential)
            break
          case firebase.auth.PhoneAuthState.ERROR:
          default:
            this.setStage('phoneVerificationError')
        }
        this.setState({ loading: false })
      })
  }

  setStage = async stage =>
    this.setState(prevState => ({
      messages: [...prevState.messages, ...chatMessages[stage]],
      currentStage: stage,
    }))

  render() {
    const {
      currentStage,
      messages,
      phoneNumber,
      verificationCode,
      selectedCountry,
      loading,
    } = this.state

    if (currentStage === 'greeting') return <Loader />
    return (
      <Container>
        <JoChat messages={messages} />
        <ActionPanel
          loading={loading}
          phoneNumber={phoneNumber}
          verificationCode={verificationCode}
          selectedCountry={selectedCountry}
          {...this.actions[currentStage]}
        />
      </Container>
    )
  }
}

export default connect(
  null,
  { onSetInitialRegion: regionState.actions.setInitialRegion }
)(WelcomeChat)
