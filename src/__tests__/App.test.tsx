import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the calculator inside a main landmark', () => {
    render(<App />);
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('app');
  });

  it('renders a visually hidden h1 with the calculator title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: 'Accessible Calculator' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('sr-only');
  });

  it('renders the Calculator component', () => {
    render(<App />);
    expect(screen.getByRole('application', { name: /calculator/i })).toBeInTheDocument();
  });
});
