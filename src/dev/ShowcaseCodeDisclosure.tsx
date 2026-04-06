import { useState } from 'react';

interface ShowcaseCodeDisclosureProps {
  sectionId: string;
  code: string;
}

export function ShowcaseCodeDisclosure({ sectionId, code }: ShowcaseCodeDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const regionId = `${sectionId}-code-region`;

  return (
    <div className="cm-catalog__code-disclosure">
      <button
        type="button"
        className="cm-catalog__code-toggle"
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? 'Hide code' : 'Show code'}
      </button>
      <div id={regionId} className="cm-catalog__code-region" hidden={!isOpen}>
        <pre className="cm-catalog__code-block">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
