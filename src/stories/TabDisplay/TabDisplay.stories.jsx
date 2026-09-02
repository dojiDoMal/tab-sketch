import React from 'react';
import { Section, TabDisplay } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/TabDisplay',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

const RIFF = `
e|-----------------0-------|-----------------0-------|
B|-------1-------1---1-----|-------1-------1---1-----|
G|-----0---0---0-------0---|-----0---0---0-------0---|
D|---2-------2-------------|---2-------2-------------|
A|-3-----------------------|-3-----------------------|
E|-------------------------|-------------------------|
`;

const SOLO = `
e|-----------------------------------------|
B|-----------------------------------------|
G|-------------------------7b9r7-----------|
D|-----5h7p5-------5h7p5-------------7-5----|
A|-7-7---------7-7-------------------------|
E|-----------------------------------------|
`;

export const TabDisplayBasic = {
    render: () => (
        <Section>
            <TabDisplay tab={RIFF} />
        </Section>
    ),
};

export const TabDisplayWithTechniques = {
    render: () => (
        <Section>
            <TabDisplay tab={SOLO} />
        </Section>
    ),
};

export const TabDisplayChildren = {
    render: () => (
        <Section>
            <TabDisplay>{RIFF}</TabDisplay>
        </Section>
    ),
};

export const TabDisplayNarrowWrapping = {
    render: () => (
        <Section>
            <div style={{ width: '260px', border: '1px dashed #444', padding: '8px' }}>
                <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                    container estreito (260px) — quebra automática por compasso
                </p>
                <TabDisplay tab={RIFF} />
            </div>
        </Section>
    ),
};

export const TabDisplayNoWrap = {
    render: () => (
        <Section>
            <div style={{ overflowX: 'auto', border: '1px dashed #444', padding: '8px' }}>
                <TabDisplay tab={RIFF} wrap={false} />
            </div>
        </Section>
    ),
};
