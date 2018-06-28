import React, { Component, Fragment } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Camera, Permissions } from 'expo'

export default class App extends Component {
  state = {
    visionData: [],
    loader: false,
    error: null,
    hasCameraPermission: null
  }

  takePicture = async () => {
    this.setState({ loader: true })
    try {
      const options = { quality: 0.5, base64: true }  
      const data = await this.camera.takePictureAsync(options)
      console.log('image', data)
      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key="PUT YOUR API KEY HERE"', {
          method: 'POST',
          body: JSON.stringify({
            "requests": [
            {
              "image": {
                "content": data.base64
              },
              "features": {
                "type": "LABEL_DETECTION"
              }
            }]
          })
        })
      const visionData = await response.json()
      console.log(visionData.responses[0].labelAnnotations)
      this.setState({ visionData: visionData.responses[0].labelAnnotations })
    } catch(error) {
      console.log(error)
      this.setState({ error })
    } finally {
      this.setState({ loader: false })
    }

  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
            ref={ref => { this.camera = ref }}
            style = {styles.preview}
            type={Camera.Constants.Type.back}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
        >
          <View style={{
            flex: 1,
            margin: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            opacity: 0.7,
            backgroundColor: 'black'
          }}>
            {this.state.loader && <Text style={{ color: 'white' }}>GETTING INFO FROM GOOGLE VISION</Text>}
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', padding: 40 }}>
            {this.state.visionData.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.font}>DESCRIPTION</Text>
                <Text> </Text>
                <Text style={styles.font}>SCORE</Text>
              </View>
            )}
            {this.state.visionData.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.font}>{item.description}</Text>
                <Text style={styles.font}>{item.score}</Text>
              </View>
            ))}
            </View>
          </View>
          <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
            <Text style={{fontSize: 14}}>SHOOT</Text>
          </TouchableOpacity>
        </Camera>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  preview: {
    flex: 1,
  },
  capture: {
    flex: 0.1,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
  font: {
    fontSize: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    color: 'white'
  }
})