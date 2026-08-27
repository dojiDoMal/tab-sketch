import React, { useRef, useState } from 'react';
import { Section, ChordEditor } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/ChordEditor',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

// A tiny pool of chords the "add" button cycles through for the demos.
const DEMO_POOL = ['G', 'C', 'D', 'Am', 'Em', 'Bm'];
let poolIndex = 0;
const nextDemoChord = () => {
    const chord = DEMO_POOL[poolIndex % DEMO_POOL.length];
    poolIndex += 1;
    return chord;
};

export const ChordEditorBasic = {
    render: () => (
        <Section capo={3} tuning={-2} chordTitleColor="#35aabb">
            <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '8px' }}>
                Segure o grabber (abaixo de cada acorde) e arraste para reordenar.
            </p>
            <ChordEditor
                chords={[
                    { chord: 'G', shapeVariant: -1 },
                    { chord: 'C9', shapeVariant: 3 },
                    { chord: 'Am', shapeVariant: 0 },
                    { chord: 'Bm', shapeVariant: 1 },
                ]}
                onAddChord={nextDemoChord}
                onChange={(chords) => console.log('Chords:', chords)}
            />
        </Section>
    ),
};

export const ChordEditorEmpty = {
    render: () => (
        <ChordEditor onAddChord={nextDemoChord} onChange={(c) => console.log('Chords:', c)} />
    ),
};

export const ChordEditorWithValueReadout = {
    render: () => {
        const [chords, setChords] = useState([
            { chord: 'G', shapeVariant: -1 },
            { chord: 'Am', shapeVariant: 0 },
            { chord: 'D', shapeVariant: 2 },
        ]);

        return (
            <Section chordTitleColor="#35aabb">
                <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '8px' }}>
                    Reordene arrastando pelo grabber; o valor atual aparece abaixo.
                </p>
                <ChordEditor
                    chords={chords}
                    onChange={setChords}
                    onAddChord={nextDemoChord}
                />
                <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '16px' }}>
                    Valor atual:{' '}
                    <code style={{ color: '#fff' }}>
                        {chords.map((c) => c.chord).join(' - ') || '(vazio)'}
                    </code>
                </p>
            </Section>
        );
    },
};

export const ChordEditorImperativeRef = {
    render: () => {
        const editorRef = useRef(null);

        return (
            <Section chordTitleColor="#35aabb">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button onClick={() => console.log(editorRef.current?.getChords())}>
                        Log chords
                    </button>
                    <button onClick={() => editorRef.current?.addChord('Em')}>Add Em</button>
                    <button onClick={() => editorRef.current?.clear()}>Clear</button>
                    <button
                        onClick={() =>
                            editorRef.current?.setChords(['C', 'G', 'Am', 'F'])
                        }
                    >
                        Set C G Am F
                    </button>
                </div>
                <ChordEditor
                    ref={editorRef}
                    chords={['G', 'D', 'Em']}
                    onAddChord={nextDemoChord}
                    onChange={(c) => console.log('Chords:', c)}
                />
            </Section>
        );
    },
};
