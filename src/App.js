/* eslint-disable no-undef */
// ref: https://hackernoon.com/tensorflow-js-real-time-object-detection-in-10-lines-of-code-baf15dfb95b2
import React, { Component } from 'react'
import './App.css'
import MagicDropzone from 'react-magic-dropzone'

import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'

class App extends Component {
  state = {
    model: null,
    preview: '',
    predictions: []
  }

  componentDidMount() {
    cocoSsd.load().then(model => {
      this.setState({
        model
      })
    })
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] })
  }

  cropToCanvas = (image, canvas, ctx) => {
    const { naturalWidth, naturalHeight } = image
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
    }
  }

  onImageChange = e => {
    const c = document.getElementById('canvas')
    const ctx = c.getContext('2d')
    const image = e.target
    c.width = image.width
    c.height = image.height
    this.cropToCanvas(image, c, ctx)
    this.state.model.detect(c).then(predictions => {
      // Font options.
      const font = '16px sans-serif'
      ctx.font = font
      ctx.textBaseline = 'top'

      predictions.forEach(prediction => {
        const x = prediction.bbox[0]
        const y = prediction.bbox[1]
        const width = prediction.bbox[2]
        const height = prediction.bbox[3]
        // Draw the bounding box.
        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 4
        ctx.strokeRect(x, y, width, height)
        // Draw the label background.
        ctx.fillStyle = '#00FFFF'
        const textWidth = ctx.measureText(prediction.class).width
        const textHeight = parseInt(font, 10) // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4)
      })

      predictions.forEach(prediction => {
        const x = prediction.bbox[0]
        const y = prediction.bbox[1]
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = '#000000'
        ctx.fillText(prediction.class, x, y)
      })
    })
  }

  render() {
    return (
      <div className="Dropzone-page">
        {this.state.model ? (
          <MagicDropzone
            className="Dropzone"
            accept="image/jpeg, image/png, .jpg, .jpeg, .png"
            multiple={false}
            onDrop={this.onDrop}
          >
            {this.state.preview ? (
              <img
                alt="upload preview"
                onLoad={this.onImageChange}
                className="Dropzone-img"
                src={this.state.preview}
              />
            ) : (
              'Choose or drop a file.'
            )}
            <canvas id="canvas" />
          </MagicDropzone>
        ) : (
          <div className="Dropzone">Loading model...</div>
        )}
      </div>
    )
  }
}

export default App
