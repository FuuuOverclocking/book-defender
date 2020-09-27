import React from 'react';
import './Section.scss';

export const Section: React.FC = (props) => (
    <div className="section">{props.children}</div>
);
