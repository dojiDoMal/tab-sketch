import React from 'react';
import { Section, RhythmDisplay } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/RhythmDisplay',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

export const RhythmDisplayBasic = {
    render: () => (
        <Section bpm={72}>
            <RhythmDisplay pattern="D--UXUD--UDUXUDU" timeSignature={[4, 4]} />
        </Section>
    ),
};

export const RhythmDisplayVariations = {
    render: () => (
        <Section bpm={90}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <RhythmDisplay pattern="D--UXUD--UDUXUDU" />
                <RhythmDisplay pattern="D00UXUD00UDUXUDU" />
                <RhythmDisplay pattern="B--CXCB--CBCXCBC" />
            </div>
        </Section>
    ),
};
