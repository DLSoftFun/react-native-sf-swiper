/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Swiper from 'react-native-sf-swiper'
import {
  Platform,
  StyleSheet,
  Image,
  View, Dimensions
} from 'react-native';
var width = Dimensions.get('window').width;

type Props = {};
export default class App extends Component<Props> {
  componentWillMount() {
      this.dataSource = [
          {
            img:'http://img2.imgtn.bdimg.com/it/u=2610705528,1626175376&fm=200&gp=0.jpg'
          },
          {
              img:'http://img3.imgtn.bdimg.com/it/u=594996916,636240317&fm=200&gp=0.jpg'
          },
          {
              img:'http://img3.imgtn.bdimg.com/it/u=594996916,636240317&fm=200&gp=0.jpg'
          }
      ]
  }
  render() {
    return (
      <View style={styles.container}>
        <Swiper width={width} height={200} loop={true} showsPagination={true} autoplay={true} autoplayTimeout={2.5} autoplayDirection={true}>
            {this.renderImage()}
        </Swiper>
      </View>
    );
  }
  renderImage=()=>{
    var imgs = []
      for(var i=0;i<this.dataSource.length;i++)
      imgs.push(
          <Image key={'image'+i} resizeMode={"cover"} style={{width:width,height:200}} source={{uri:this.dataSource[i].img}}></Image>
      )
      return imgs
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
});
