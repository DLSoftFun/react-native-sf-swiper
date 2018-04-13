/**
 * Created by Joker on 2018-04-12.
 * react-native-swiper
 */
import React, { Component } from 'react'
import {
    Text,
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ViewPagerAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native'
import PropTypes from 'prop-types'

const { width, height } = Dimensions.get('window')

const styles={
    container: {
        backgroundColor: 'transparent',
        position: 'relative'
    },
    slide: {
        backgroundColor: 'transparent'
    },
    pagination: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
}

export default class SFSwiper extends Component{
    static propTypes = {
        children: PropTypes.node.isRequired,
        loop: PropTypes.bool,
        autoplay: PropTypes.bool,
        autoplayTimeout: PropTypes.number,
        index: PropTypes.number,
        autoplayDirection: PropTypes.bool,
        showsPagination:PropTypes.bool,
    }
    static defaultProps = {
        loop:true,
        autoplay:false,
        autoplayTimeout:2.5,
        index:0,
        autoplayDirection:true,
        showsPagination:true
    }
    autoplayTimer = null
    loopJumpTimer = null
    state = this.initState(this.props, true)

    componentDidMount () {
        this.autoplay()
    }

    componentWillUnmount () {
        this.autoplayTimer && clearTimeout(this.autoplayTimer)
        this.loopJumpTimer && clearTimeout(this.loopJumpTimer)
    }
    initState (props, setOffsetInState) {
        const state = this.state || {}

        const initState = {
            autoplayEnd: false,
            loopJump: false
        }

        const newInternals = {
            isScrolling: false
        }

        initState.total = props.children ? props.children.length || 1 : 0

        if (state.total === initState.total) {
            initState.index = state.index
        } else {
            setOffsetInState = true // if the index is reset, go ahead and update the offset in state
            initState.index = initState.total > 1 ? Math.min(props.index, initState.total - 1) : 0
        }
        initState.dir = 'x'
        initState.width = props.width || width
        initState.height = props.height || height
        newInternals.offset = {}

        if (initState.total > 1) {
            let setup = initState.index
            if (props.loop) {
                setup++
            }
            newInternals.offset[initState.dir] = initState.dir === 'y'
                ? initState.height * setup
                : initState.width * setup
        }
        if (setOffsetInState) {
            initState.offset = newInternals.offset
        }

        this.internals = newInternals
        return initState
    }
    fullState () {
        return Object.assign({}, this.state, this.internals)
    }
    loopJump = () => {
        if (!this.state.loopJump) return
        const i = this.state.index + (this.props.loop ? 1 : 0)
        const scrollView = this.refs.scrollView
        this.loopJumpTimer = setTimeout(() => scrollView.setPageWithoutAnimation &&
        scrollView.setPageWithoutAnimation(i), 50)
    }
    autoplay = () => {
        if (!Array.isArray(this.props.children) ||
            !this.props.autoplay ||
            this.internals.isScrolling ||
            this.state.autoplayEnd) return

        this.autoplayTimer && clearTimeout(this.autoplayTimer)
        this.autoplayTimer = setTimeout(() => {
            if (!this.props.loop && (
                    this.props.autoplayDirection
                        ? this.state.index === this.state.total - 1
                        : this.state.index === 0
                )
            ) return this.setState({ autoplayEnd: true })

            this.scrollBy(this.props.autoplayDirection ? 1 : -1)
        }, this.props.autoplayTimeout * 1000)
    }
    onScrollBegin = e => {
        // update scroll state
        this.internals.isScrolling = true
        this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(e, this.fullState(), this)
    }
    onScrollEnd = e => {
        this.internals.isScrolling = false

        if (!e.nativeEvent.contentOffset) {
            if (this.state.dir === 'x') {
                e.nativeEvent.contentOffset = {x: e.nativeEvent.position * this.state.width}
            } else {
                e.nativeEvent.contentOffset = {y: e.nativeEvent.position * this.state.height}
            }
        }

        this.updateIndex(e.nativeEvent.contentOffset, this.state.dir, () => {
            this.autoplay()
            this.loopJump()

            this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd(e, this.fullState(), this)
        })
    }
    onScrollEndDrag = e => {
        const { contentOffset } = e.nativeEvent
        const { horizontal, children } = this.props
        const { index } = this.state
        const { offset } = this.internals
        const previousOffset = horizontal ? offset.x : offset.y
        const newOffset = horizontal ? contentOffset.x : contentOffset.y

        if (previousOffset === newOffset &&
            (index === 0 || index === children.length - 1)) {
            this.internals.isScrolling = false
        }
    }
    updateIndex = (offset, dir, cb) => {
        const state = this.state
        let index = state.index
        const diff = offset[dir] - this.internals.offset[dir]
        const step = dir === 'x' ? state.width : state.height
        let loopJump = false

        if (!diff) return

        index = parseInt(index + Math.round(diff / step))

        if (this.props.loop) {
            if (index <= -1) {
                index = state.total - 1
                offset[dir] = step * state.total
                loopJump = true
            } else if (index >= state.total) {
                index = 0
                offset[dir] = step
                loopJump = true
            }
        }

        const newState = {}
        newState.index = index
        newState.loopJump = loopJump

        this.internals.offset = offset

        if (loopJump) {
            if (offset[dir] === this.state.offset[dir]) {
                newState.offset = { x: 0, y: 0 }
                newState.offset[dir] = offset[dir] + 1
                this.setState(newState, () => {
                    this.setState({ offset: offset }, cb)
                })
            } else {
                newState.offset = offset
                this.setState(newState, cb)
            }
        } else {
            this.setState(newState, cb)
        }
    }
    scrollBy = (index, animated = true) => {
        if (this.internals.isScrolling || this.state.total < 2) return
        const state = this.state
        const diff = (this.props.loop ? 1 : 0) + index + this.state.index
        let x = 0
        let y = 0
        if (state.dir === 'x') x = diff * state.width
        if (state.dir === 'y') y = diff * state.height

        if (Platform.OS === 'android') {
            this.refs.scrollView && this.refs.scrollView[animated ? 'setPage' : 'setPageWithoutAnimation'](diff)
        } else {
            this.refs.scrollView && this.refs.scrollView.scrollTo({ x, y, animated })
        }
        this.internals.isScrolling = true
        this.setState({
            autoplayEnd: false
        })
        if (!animated || Platform.OS === 'android') {
            setImmediate(() => {
                this.onScrollEnd({
                    nativeEvent: {
                        position: diff
                    }
                })
            })
        }
    }

    scrollViewPropOverrides = () => {
        const props = this.props
        let overrides = {}

        for (let prop in props) {
            if (typeof props[prop] === 'function' &&
                prop !== 'onMomentumScrollEnd' &&
                prop !== 'renderPagination' &&
                prop !== 'onScrollBeginDrag'
            ) {
                let originResponder = props[prop]
                overrides[prop] = (e) => originResponder(e, this.fullState(), this)
            }
        }

        return overrides
    }
    renderScrollView = pages => {
        if (Platform.OS === 'ios') {
            return (
                <ScrollView ref='scrollView'
                            {...this.props}
                            {...this.scrollViewPropOverrides()}
                            contentContainerStyle={[styles.wrapper, this.props.style]}
                            contentOffset={this.state.offset}
                            onScrollBeginDrag={this.onScrollBegin}
                            onMomentumScrollEnd={this.onScrollEnd}
                            onScrollEndDrag={this.onScrollEndDrag}>
                    {pages}
                </ScrollView>
            )
        }
        return (
            <ViewPagerAndroid ref='scrollView'
                              {...this.props}
                              initialPage={this.props.loop ? this.state.index + 1 : this.state.index}
                              onPageSelected={this.onScrollEnd}
                              style={{flex: 1}}>
                {pages}
            </ViewPagerAndroid>
        )
    }
    renderPagination = () => {
        // By default, dots only show when `total` >= 2
        if (this.state.total <= 1) return null

        let dots = []
        const ActiveDot = <View style={[{
                backgroundColor: '#ffffff',
                width: 8,
                height: 8,
                borderRadius: 4,
                marginLeft: 3,
                marginRight: 3,
                marginTop: 3,
                marginBottom: 0
            }]} />
        const Dot = <View style={[{
                backgroundColor: 'rgba(0,0,0,.2)',
                width: 8,
                height: 8,
                borderRadius: 4,
                marginLeft: 3,
                marginRight: 3,
                marginTop: 3,
                marginBottom: 0
            }]} />
        for (let i = 0; i < this.state.total; i++) {
            dots.push(i === this.state.index
                ? React.cloneElement(ActiveDot, {key: i})
                : React.cloneElement(Dot, {key: i})
            )
        }

        return (
            <View pointerEvents='none' style={[styles['pagination']]}>
                {dots}
            </View>
        )
    }
    render () {
        const state = this.state
        const props = this.props
        const children = props.children
        const index = state.index
        const total = state.total
        const loop = props.loop

        let pages = []

        const pageStyle = [{width: state.width, height: state.height}, styles.slide]
        if (total > 1) {
            pages = Object.keys(children)
            if (loop) {
                pages.unshift(total - 1 + '')
                pages.push('0')
            }

            pages = pages.map((page, i) => {
                return <View style={pageStyle} key={i}>{children[page]}</View>
            })
        } else {
            pages = <View style={pageStyle} key={0}>{children}</View>
        }

        return (
            <View style={[styles.container, {
                width: state.width,
                height: state.height
            }]}>
                {this.renderScrollView(pages)}
                {props.showsPagination && (this.renderPagination())}
            </View>
        )
    }
}