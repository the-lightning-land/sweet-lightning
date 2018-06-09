import React, { Component } from 'react'

export default class Return extends Component {
  seconds = null
  timeout = null

  constructor(props) {
    super()
    this.state = {
      seconds: props.seconds,
    }
  }

  componentDidMount() {
    this.timeout = setTimeout(() => this.tick(), 1000)
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  tick() {
    if (this.state.seconds > 0) {
      this.setState({
        seconds: this.state.seconds - 1,
      })

      this.timeout = setTimeout(() => this.tick(), 1000)
    } else {
      this.props.onReturn()
    }
  }

  render() {
    return this.props.children(this.state.seconds)
  }
}
