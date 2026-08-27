import React, { useState } from 'react';
import { Section, ChordEditor, ChordLib } from '../../components/index.jsx';
import '../../styles.css';

export default {
  title: 'React/ChordLib',
  decorators: [
    (Story) => (
      <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const LibWithEditor = {
  render: () => {
    const [chords, setChords] = useState([
      { chord: 'G', shapeVariant: 0 },
      { chord: 'Am', shapeVariant: 0 },
    ]);

    return (
      <Section chordTitleColor="#35aabb">
        <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '8px' }}>
          Arraste um acorde da biblioteca para o editor, ou clique no botão "+" abaixo do acorde para adicioná-lo direto.
        </p>

        <ChordEditor
          chords={chords}
          onChange={setChords}
        />

        <div style={{ marginTop: '24px', borderTop: '1px solid #444', paddingTop: '16px' }}>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '12px' }}>
            Biblioteca de acordes
          </p>
          <ChordLib onAdd={(entry) => setChords((prev) => [...prev, entry])} />
        </div>

        <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '16px' }}>
          Editor: {chords.map((c) => c.chord).join(' - ') || '(vazio)'}
        </p>
      </Section>
    );
  },
};

export const LibFiltered = {
  render: () => (
    <Section chordTitleColor="#e8a838">
      <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '12px' }}>
        Biblioteca filtrada (apenas menores com sétima).
      </p>
      <ChordLib
        chordNames={['Am7', 'Bm7', 'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'F#m7', 'C#m7']}
      />
    </Section>
  ),
};

export const LibStandalone = {
  render: () => (
    <Section chordTitleColor="#88cc55">
      <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '12px' }}>
        Todos os acordes disponíveis (paginado, 6 por vez).
      </p>
      <ChordLib />
    </Section>
  ),
};
