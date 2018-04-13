# react-native-sf-swiper

# react-native 轮播图

![show](./demo.gif)

# 安装
* npm i react-native-sf-swiper --save

# Props
|  parameter  |  type  |  required  |   description  |  default  |
|:-----|:-----|:-----|:-----|:-----|
|loop|boolean|no|是否循环轮播|true|
|autoplay|boolean|no|是否自动轮播|true|
|autoplayTimeout|number|no|自动轮播间隔|2.5|
|showsPagination|boolean|no|是否显示页|true|
|width|number|no|轮播图宽|0|
|height|number|no|轮播图高|0|


# Demo
```

import React, { Component } from 'react';
import Swiper from 'react-native-sf-swiper'
import {
  Platform,
  StyleSheet,
  Image,
  View, Dimensions
} from 'react-native';
var width = Dimensions.get('window').width;

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
