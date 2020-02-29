import React from 'react';
import { Link } from 'react-router-dom';

export const markdown_linkHelper = props => {
  const url = new URL(props.href);

  if (url.hostname === window.location.hostname) {
    return <Link className='hyperlink' to={url.pathname} onClick={e => { window.scrollTo(0, 0) }}>{props.children}</Link>;
  } else {
    return <a className='hyperlink' href={props.href} target='_blank' rel='noopener noreferrer'>{props.children}</a>;
  }
};