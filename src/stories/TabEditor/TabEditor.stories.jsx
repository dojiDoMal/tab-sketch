import React, { useRef, useState } from 'react';
import { Section, TabEditor } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/TabEditor',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px', maxWidth: '640px' }}>
                <Story />
            </div>
        ),
    ],
};

const INITIAL = `e|-----------------0-------|
B|-------1-------1---1-----|
G|-----0---0---0-------0---|
D|---2-------2-------------|
A|-3-----------------------|
E|-------------------------|`;

export const TabEditorBasic = {
    render: () => (
        <Section>
            <TabEditor tab={INITIAL} />
        </Section>
    ),
};

export const TabEditorBlank = {
    render: () => (
        <Section>
            <TabEditor />
        </Section>
    ),
};

export const TabEditorControlled = {
    render: () => {
        const editorRef = useRef(null);
        const [current, setCurrent] = useState(INITIAL);

        return (
            <Section>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button onClick={() => editorRef.current?.clear()}>Limpar</button>
                    <button onClick={() => editorRef.current?.setTab(INITIAL)}>Restaurar riff</button>
                    <button onClick={() => editorRef.current?.undo()}>Desfazer</button>
                    <button onClick={() => editorRef.current?.redo()}>Refazer</button>
                </div>
                <TabEditor ref={editorRef} tab={INITIAL} onChange={setCurrent} />
                <p style={{ color: '#999', marginTop: '12px', fontSize: '0.75rem' }}>
                    {current.trim().split('\n').length} linhas
                </p>
            </Section>
        );
    },
};

export const TabEditorNoPreview = {
    render: () => (
        <Section>
            <TabEditor tab={INITIAL} showPreview={false} />
        </Section>
    ),
};

export const TabEditorColumnOps = {
    render: () => {
        const editorRef = useRef(null);
        const btn = { padding: '4px 10px', cursor: 'pointer' };

        return (
            <Section>
                <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.8rem' }}>
                    Posicione o cursor na tab e use os botões. A coluna de "-" é
                    adicionada/removida em todas as cordas ao mesmo tempo.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button style={btn} onClick={() => editorRef.current?.addColumnBefore()}>+ coluna antes</button>
                    <button style={btn} onClick={() => editorRef.current?.addColumnAfter()}>+ coluna depois</button>
                    <button style={btn} onClick={() => editorRef.current?.removeColumnBefore()}>− coluna antes</button>
                    <button style={btn} onClick={() => editorRef.current?.removeColumnAfter()}>− coluna depois</button>
                </div>
                <TabEditor ref={editorRef} tab={INITIAL} />
            </Section>
        );
    },
};
