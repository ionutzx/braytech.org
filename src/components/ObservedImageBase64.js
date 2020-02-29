import React from 'react';
import cx from 'classnames';

class ObservedImageBase64Inner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      downloaded: false,
      styles: {}
    };
  }

  observe = () => {
    const { className = 'image', src, ratio = false, noConstraints } = this.props;

    if (this.state.downloaded) {
      return;
    }

    if (ratio) {
      this.setState({
        styles: {
          paddingBottom: ratio * 100 + '%'
        }
      });
    }

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const { isIntersecting } = entry;

        if (isIntersecting || noConstraints) {
          this.image = new window.Image();
          this.image.crossOrigin = 'Anonymous';
          this.image.onload = bmp => {
            const ratio = bmp.target.height / bmp.target.width;
            const src = bmp.target.src

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.height = bmp.target.height;
            canvas.width = bmp.target.width;
            ctx.drawImage(bmp.target, 0, 0);

            const encoded = canvas.toDataURL('image/png');

            if (className.includes('padding')) {
              this.setState({
                downloaded: true,
                styles: {
                  paddingBottom: ratio * 100 + '%',
                  backgroundImage: `url(${encoded})`
                }
              });
            } else {
              this.setState({
                downloaded: true,
                styles: {
                  backgroundImage: `url(${encoded})`
                }
              });
            }

            if (this.observer) {
              this.observer = this.observer.disconnect();
            }
          };

          this.image.src = src;
        }
      });
    });

    this.observer.observe(this.element);
  };

  componentDidMount() {
    this.observe();
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.image) {
      this.image.src = '';
    }
  }

  render() {
    const { className = 'image', noConstraints, ...attributes } = this.props;

    return (
      <div
        {...attributes}
        ref={el => (this.element = el)}
        className={cx(className, {
          dl: this.state.downloaded
        })}
        style={this.state.styles}
      />
    );
  }
}

// using Key here forces a full component remount when we are given a new
// src, avoiding weirdness where the src changes but the component is still
// downloading the old image
const ObservedImageBase64 = props => <ObservedImageBase64Inner {...props} key={props.src} />;

export default ObservedImageBase64;
