import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShowcaseCodeDisclosure } from '../src/dev/ShowcaseCodeDisclosure';

describe('ShowcaseCodeDisclosure', () => {
  it('starts collapsed (isOpen = false)', () => {
    render(<ShowcaseCodeDisclosure sectionId="test-section" code="<div>Hello</div>" />);

    const button = screen.getByRole('button', { name: 'Show code' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens when button is clicked', () => {
    render(<ShowcaseCodeDisclosure sectionId="test-section" code="<div>Hello</div>" />);

    const button = screen.getByRole('button', { name: 'Show code' });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'Hide code' })).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes when button is clicked again', () => {
    render(<ShowcaseCodeDisclosure sectionId="test-section" code="<div>Hello</div>" />);

    const button = screen.getByRole('button', { name: 'Show code' });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'Hide code' }));

    expect(screen.getByRole('button', { name: 'Show code' })).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('wires aria-controls correctly', () => {
    render(<ShowcaseCodeDisclosure sectionId="my-section" code="some code" />);

    const button = screen.getByRole('button', { name: 'Show code' });

    expect(button).toHaveAttribute('aria-controls', 'my-section-code-region');
  });

  it('renders code content as literal text including angle brackets', () => {
    const codeWithAngleBrackets = '<div className="test">Content</div>';
    render(<ShowcaseCodeDisclosure sectionId="section" code={codeWithAngleBrackets} />);

    const button = screen.getByRole('button', { name: 'Show code' });
    fireEvent.click(button);

    const codeElement = screen.getByText(codeWithAngleBrackets);
    expect(codeElement).toBeInTheDocument();
  });

  it('hides code region when collapsed', () => {
    render(<ShowcaseCodeDisclosure sectionId="test-section" code="hidden code" />);

    const region = screen.getByText('hidden code').closest('.cm-catalog__code-region');
    expect(region).toHaveAttribute('hidden');
  });

  it('shows code region when expanded', () => {
    render(<ShowcaseCodeDisclosure sectionId="test-section" code="visible code" />);

    const button = screen.getByRole('button', { name: 'Show code' });
    fireEvent.click(button);

    const region = screen.getByText('visible code').closest('.cm-catalog__code-region');
    expect(region).not.toHaveAttribute('hidden');
  });
});
