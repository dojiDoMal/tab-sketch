import React, { useState } from 'react';
import { Section, RhythmEditor, RhythmDisplay } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/RhythmEditor',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

export const EmptyEditor = {
    render: () => (
        <Section bpm={72}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    Editor vazio — arraste itens da paleta para preencher os slots
                </p>
                <RhythmEditor
                    timeSignature={[4, 4]}
                    onPatternChange={(newPattern) => console.log('Pattern changed:', newPattern)}
                />
            </div>
        </Section>
    ),
};

export const PrePopulatedEditor = {
    render: () => (
        <Section bpm={72}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    Editor pré-populado — edite arrastando ou substitua arrastando da paleta
                </p>
                <RhythmEditor
                    pattern="D--UXUD--UDUXUDU"
                    timeSignature={[4, 4]}
                    onPatternChange={(newPattern) => console.log('Pattern changed:', newPattern)}
                />
            </div>
        </Section>
    ),
};

export const EditorWithCallback = {
    render: () => {
        const [pattern, setPattern] = useState('----------------');

        return (
            <Section bpm={90}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                            Arraste os elementos da paleta para substituir os slots
                        </p>
                        <RhythmEditor
                            pattern={pattern}
                            timeSignature={[4, 4]}
                            onPatternChange={setPattern}
                        />
                    </div>
                    <div>
                        <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                            Pattern atual: <code style={{ color: '#fff' }}>{pattern}</code>
                        </p>
                    </div>
                </div>
            </Section>
        );
    },
};

export const EditorAndDisplayComparison = {
    render: () => {
        const [pattern, setPattern] = useState('DD--UU--DD--XX--');

        return (
            <Section bpm={72}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                        <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                            RhythmEditor (editável)
                        </p>
                        <RhythmEditor
                            pattern={pattern}
                            timeSignature={[4, 4]}
                            onPatternChange={setPattern}
                        />
                    </div>
                    <div>
                        <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                            RhythmDisplay (somente leitura — reflete o editor acima)
                        </p>
                        <RhythmDisplay pattern={pattern} timeSignature={[4, 4]} />
                    </div>
                </div>
            </Section>
        );
    },
};

export const ThreeFourTime = {
    render: () => (
        <Section bpm={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    Compasso 3/4 — 12 slots (3 beats × 4 subdivisões)
                </p>
                <RhythmEditor
                    timeSignature={[3, 4]}
                    onPatternChange={(newPattern) => console.log('3/4 pattern:', newPattern)}
                />
            </div>
        </Section>
    ),
};

export const SixEightTime = {
    render: () => (
        <Section bpm={80}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    Compasso 6/8 — 18 slots (6 beats × 3 subdivisões)
                </p>
                <RhythmEditor
                    timeSignature={[6, 8]}
                    subdivisionsPerBeat={3}
                    onPatternChange={(newPattern) => console.log('6/8 pattern:', newPattern)}
                />
            </div>
        </Section>
    ),
};

export const EditorWithoutBpmLabel = {
    render: () => (
        <Section bpm={72}>
            <RhythmEditor timeSignature={[4, 4]} showBpmLabel={false} />
        </Section>
    ),
};

export const EditorWithoutPalette = {
    render: () => (
        <Section bpm={72}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    Sem paleta — apenas troca entre slots por drag and drop
                </p>
                <RhythmEditor pattern="D--UXUD--UDUXUDU" timeSignature={[4, 4]} showPalette={false} />
            </div>
        </Section>
    ),
};
