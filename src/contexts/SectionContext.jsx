import { createContext, useContext } from 'react';

const SectionContext = createContext({
  capo: undefined,
  tuning: undefined,
  bpm: undefined,
  chordTitleColor: undefined,
});

export function useSectionContext() {
  return useContext(SectionContext);
}

export default SectionContext;
